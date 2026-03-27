use crate::commands::coins::build_coin_from_row;
use crate::commands::utils::get_db_connection;
use crate::types::coins::Coin;
use crate::types::notebooks::{
    CreateNotebookRequest, Notebook, PaginatedNotebooksResponse,
};
use validator::Validate;

fn build_notebook_from_row(row: &rusqlite::Row) -> Result<Notebook, rusqlite::Error> {
    Ok(Notebook {
        id: row.get(0)?,
        title: row.get(1)?,
        description: row.get(2)?,
        rows_per_page: row.get(3)?,
        columns_per_page: row.get(4)?,
        number_of_pages: row.get(5)?,
        created_at: row.get(6)?,
        coin_count: row.get(7)?,
        cells: vec![],
    })
}

#[tauri::command]
pub fn list_notebooks(
    app_handle: tauri::AppHandle,
    offset: Option<i64>,
    limit: Option<i64>,
    search: Option<String>,
    sort_field: Option<String>,
    sort_direction: Option<String>,
) -> Result<PaginatedNotebooksResponse, String> {
    let conn = get_db_connection(&app_handle)?;
    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(10);
    let sort_direction = sort_direction
        .unwrap_or_else(|| "DESC".to_string())
        .to_uppercase();
    let mut sort_field = sort_field.unwrap_or_else(|| "created_at".to_string());

    // Validate sort direction
    if sort_direction != "ASC" && sort_direction != "DESC" {
        return Err("Invalid sort direction".to_string());
    }

    // Validate and map sort field
    let valid_fields = vec![
        "id",
        "title",
        "description",
        "rows_per_page",
        "columns_per_page",
        "number_of_pages",
        "created_at",
    ];
    if !valid_fields.contains(&sort_field.as_str()) {
        sort_field = "created_at".to_string();
    }

    // Build WHERE clause for search
    let where_clause = if let Some(ref query) = search {
        let search_term = format!("%{}%", query);
        format!(
            "WHERE title LIKE '{}' OR description LIKE '{}'",
            search_term.replace("'", "''"),
            search_term.replace("'", "''")
        )
    } else {
        String::new()
    };

    // Get total count
    let count_query = format!("SELECT COUNT(*) FROM notebooks {}", where_clause);

    let total: i64 = conn
        .query_row(&count_query, [], |row| row.get(0))
        .map_err(|e| format!("Failed to count notebooks: {}", e))?;

    // Get paginated notebooks
    let query = format!(
        "SELECT n.id, n.title, n.description, n.rows_per_page, n.columns_per_page, n.number_of_pages, n.created_at,
                (SELECT COUNT(*) FROM coins c WHERE c.notebook_id = n.id) AS coin_count
         FROM notebooks n
         {} ORDER BY {} {} LIMIT ?1 OFFSET ?2",
        where_clause, sort_field, sort_direction
    );

    let mut stmt = conn
        .prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    let notebooks = stmt
        .query_map([limit, offset], |row| build_notebook_from_row(row))
        .map_err(|e| format!("Failed to query notebooks: {}", e))?;
    let items = notebooks
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect notebooks: {}", e))?;

    Ok(PaginatedNotebooksResponse { items, total })
}

#[tauri::command]
pub fn get_notebook(app_handle: tauri::AppHandle, id: i32) -> Result<Notebook, String> {
    let conn = get_db_connection(&app_handle)?;

    let mut notebook = conn
        .prepare(
            "SELECT n.id, n.title, n.description, n.rows_per_page, n.columns_per_page, n.number_of_pages, n.created_at,
                    (SELECT COUNT(*) FROM coins c WHERE c.notebook_id = n.id) AS coin_count
             FROM notebooks n WHERE n.id = ?1",
        )
        .map_err(|e| format!("Failed to prepare notebook statement: {}", e))?
        .query_row([id], |row| build_notebook_from_row(row))
        .map_err(|e| format!("Failed to get notebook: {}", e))?;

    let rows = notebook.rows_per_page as usize;
    let cols = notebook.columns_per_page as usize;
    let pages = notebook.number_of_pages as usize;
    let cells_per_page = rows * cols;

    let mut cells: Vec<Vec<Vec<Option<Coin>>>> =
        vec![vec![vec![None; cols]; rows]; pages];

    let mut stmt = conn
        .prepare(
            "SELECT c.id, c.title, c.value, c.currency, c.year,
                    i.id, i.name, i.start_year, i.end_year, i.flag,
                    c.description, c.obverse_image, c.reverse_image,
                    c.quantity, c.sale_value, c.notes, c.created_at,
                    c.notebook_id, c.notebook_position
             FROM coins c
             LEFT JOIN issuers i ON i.id = c.issuer_id
             WHERE c.notebook_id = ?1
             ORDER BY c.notebook_position ASC",
        )
        .map_err(|e| format!("Failed to prepare coins statement: {}", e))?;

    let coins_iter = stmt
        .query_map([id], |row| build_coin_from_row(row))
        .map_err(|e| format!("Failed to query coins: {}", e))?;

    for result in coins_iter {
        let coin = result.map_err(|e| format!("Failed to collect coin: {}", e))?;
        if let Some(pos) = coin.notebook_position {
            let pos = pos as usize;
            let page_idx = pos / cells_per_page;
            let local_pos = pos % cells_per_page;
            let row_idx = local_pos / cols;
            let col_idx = local_pos % cols;
            if page_idx < pages && row_idx < rows && col_idx < cols {
                cells[page_idx][row_idx][col_idx] = Some(coin);
            }
        }
    }

    notebook.cells = cells;
    Ok(notebook)
}

#[tauri::command]
pub fn reorder_coins(
    app_handle: tauri::AppHandle,
    notebook_id: i32,
    coins: Vec<crate::types::notebooks::CoinPosition>,
    unassign_coin_ids: Option<Vec<i32>>,
) -> Result<Notebook, String> {
    let conn = get_db_connection(&app_handle)?;

    conn.execute("BEGIN", [])
        .map_err(|e| format!("Failed to begin transaction: {}", e))?;

    for entry in &coins {
        conn.execute(
            "UPDATE coins SET notebook_id = ?1, notebook_position = ?2 WHERE id = ?3",
            rusqlite::params![notebook_id, entry.position, entry.coin_id],
        )
        .map_err(|e| {
            let _ = conn.execute("ROLLBACK", []);
            format!("Failed to update position for coin {}: {}", entry.coin_id, e)
        })?;
    }

    if let Some(ids) = unassign_coin_ids {
        for coin_id in &ids {
            conn.execute(
                "UPDATE coins SET notebook_id = NULL, notebook_position = NULL WHERE id = ?1",
                rusqlite::params![coin_id],
            )
            .map_err(|e| {
                let _ = conn.execute("ROLLBACK", []);
                format!("Failed to unassign coin {}: {}", coin_id, e)
            })?;
        }
    }

    conn.execute("COMMIT", [])
        .map_err(|e| format!("Failed to commit transaction: {}", e))?;

    get_notebook(app_handle, notebook_id)
}

#[tauri::command]
pub fn create_notebook(
    app_handle: tauri::AppHandle,
    notebook: CreateNotebookRequest,
) -> Result<Notebook, String> {
    notebook
        .validate()
        .map_err(|e| format!("Validation failed: {}", e))?;

    let conn = get_db_connection(&app_handle)?;

    const INSERT_QUERY: &str = "INSERT INTO notebooks (title, description, rows_per_page, columns_per_page, number_of_pages)
         VALUES (?1, ?2, ?3, ?4, ?5)";

    conn.execute(
        INSERT_QUERY,
        rusqlite::params![
            notebook.title,
            notebook.description,
            notebook.rows_per_page,
            notebook.columns_per_page,
            notebook.number_of_pages,
        ],
    )
    .map_err(|e| format!("Failed to insert notebook: {}", e))?;

    let id = conn.last_insert_rowid() as i32;

    // Fetch and return the created notebook
    get_notebook(app_handle, id)
}
