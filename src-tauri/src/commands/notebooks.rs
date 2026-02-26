use crate::commands::coins::build_coin_from_row;
use crate::commands::utils::get_db_connection;
use crate::types::coins::Coin;
use crate::types::notebooks::{
    CreateNotebookRequest, Notebook, NotebookPage, PaginatedNotebooksResponse,
};

fn build_notebook_from_row(row: &rusqlite::Row) -> Result<Notebook, rusqlite::Error> {
    Ok(Notebook {
        id: row.get(0)?,
        title: row.get(1)?,
        description: row.get(2)?,
        rows_per_page: row.get(3)?,
        columns_per_page: row.get(4)?,
        number_of_pages: row.get(5)?,
        created_at: row.get(6)?,
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
        "SELECT id, title, description, rows_per_page, columns_per_page, number_of_pages, created_at
         FROM notebooks
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

    // Fetch the notebook metadata
    let notebook_query = "SELECT id, title, description, rows_per_page, columns_per_page, number_of_pages, created_at
                         FROM notebooks
                         WHERE id = ?1";

    let mut notebook_stmt = conn
        .prepare(notebook_query)
        .map_err(|e| format!("Failed to prepare notebook statement: {}", e))?;

    notebook_stmt
        .query_row([id], |row| build_notebook_from_row(row))
        .map_err(|e| format!("Failed to get notebook: {}", e))
}

#[tauri::command]
pub fn get_notebook_page(
    app_handle: tauri::AppHandle,
    id: i32,
    page: i32,
) -> Result<NotebookPage, String> {
    let conn = get_db_connection(&app_handle)?;

    // First, get notebook metadata to know grid dimensions
    let notebook_query = "SELECT rows_per_page, columns_per_page FROM notebooks WHERE id = ?1";
    let (rows, cols): (i32, i32) = conn
        .query_row(notebook_query, [id], |row| {
            Ok((row.get(0)?, row.get(1)?))
        })
        .map_err(|e| format!("Failed to get notebook dimensions: {}", e))?;

    // Initialize empty grid
    let mut grid: Vec<Vec<Option<Coin>>> = vec![vec![None; cols as usize]; rows as usize];

    // Fetch all coins for this notebook page
    let coins_query = "SELECT c.id, c.title, c.value, c.currency, c.year, i.id, i.name, i.start_year, i.end_year, i.flag, c.description, c.obverse_image, c.reverse_image, c.quantity, c.sale_value, c.notes, c.created_at, nc.position
                      FROM coins c
                      LEFT JOIN issuers i ON c.issuer_id = i.id
                      INNER JOIN notebook_coins nc ON c.id = nc.coin_id
                      WHERE nc.notebook_id = ?1
                      ORDER BY nc.position ASC";

    let mut coins_stmt = conn
        .prepare(coins_query)
        .map_err(|e| format!("Failed to prepare coins statement: {}", e))?;

    let coins_iter = coins_stmt
        .query_map([id], |row| {
            let position: i32 = row.get(17)?;
            let coin = build_coin_from_row(row)?;
            Ok((coin, position))
        })
        .map_err(|e| format!("Failed to query coins: {}", e))?;

    // Place coins in grid based on position
    for result in coins_iter {
        let (coin, position) = result.map_err(|e| format!("Failed to collect coin: {}", e))?;

        // Calculate row and column from position (accounting for page)
        let cols_usize = cols as usize;
        let row_idx = ((position as usize) / cols_usize) % (rows as usize);
        let col_idx = (position as usize) % cols_usize;

        // Only add if it's on the current page
        if (position as usize) / (cols_usize * rows as usize) == page as usize {
            if row_idx < rows as usize && col_idx < cols as usize {
                grid[row_idx][col_idx] = Some(coin);
            }
        }
    }

    Ok(NotebookPage {
        index: page,
        cells: grid,
    })
}

#[tauri::command]
pub fn create_notebook(
    app_handle: tauri::AppHandle,
    notebook: CreateNotebookRequest,
) -> Result<Notebook, String> {
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
