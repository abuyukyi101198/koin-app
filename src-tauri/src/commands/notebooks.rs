use crate::commands::coins::build_coin_from_row;
use crate::commands::utils::get_db_connection;
use crate::types::notebooks::{Notebook, PaginatedNotebooksResponse, CreateNotebookRequest};

fn build_notebook_from_row(row: &rusqlite::Row) -> Result<Notebook, rusqlite::Error> {
    Ok(Notebook {
        id: row.get(0)?,
        title: row.get(1)?,
        description: row.get(2)?,
        rows_per_page: row.get(3)?,
        columns_per_page: row.get(4)?,
        number_of_pages: row.get(5)?,
        coins: None,
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

    // First, fetch the notebook metadata
    let notebook_query = "SELECT id, title, description, rows_per_page, columns_per_page, number_of_pages, created_at
                         FROM notebooks
                         WHERE id = ?1";

    let mut notebook_stmt = conn
        .prepare(notebook_query)
        .map_err(|e| format!("Failed to prepare notebook statement: {}", e))?;

    let (
        notebook_id,
        title,
        description,
        rows_per_page,
        columns_per_page,
        number_of_pages,
        created_at,
    ): (i32, String, Option<String>, i32, i32, i32, String) = notebook_stmt
        .query_row([id], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
            ))
        })
        .map_err(|e| format!("Failed to get notebook: {}", e))?;

    // Then, fetch all coins in this notebook ordered by position
    let coins_query = "SELECT c.id, c.title, c.value, c.currency, c.year, i.id, i.name, i.start_year, i.end_year, i.flag, c.description, c.obverse_image, c.reverse_image, c.quantity, c.sale_value, c.notes, c.created_at
                      FROM coins c
                      LEFT JOIN issuers i ON c.issuer_id = i.id
                      INNER JOIN notebook_coins nc ON c.id = nc.coin_id
                      WHERE nc.notebook_id = ?1
                      ORDER BY nc.position ASC";

    let mut coins_stmt = conn
        .prepare(coins_query)
        .map_err(|e| format!("Failed to prepare coins statement: {}", e))?;

    let coins = coins_stmt
        .query_map([id], |row| build_coin_from_row(row))
        .map_err(|e| format!("Failed to query coins: {}", e))?;

    let coin_list = coins
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect coins: {}", e))?;

    Ok(Notebook {
        id: notebook_id,
        title,
        description,
        rows_per_page,
        columns_per_page,
        number_of_pages,
        coins: Some(coin_list),
        created_at,
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
