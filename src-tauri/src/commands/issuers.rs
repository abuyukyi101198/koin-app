use crate::types::issuers::PaginatedIssuersResponse;
use crate::{commands, types};
use commands::utils::get_db_connection;
use types::issuers::Issuer;

#[tauri::command]
pub fn list_issuers(
    app_handle: tauri::AppHandle,
    limit: Option<i64>,
    search: Option<String>,
) -> Result<PaginatedIssuersResponse, String> {
    let conn = get_db_connection(&app_handle)?;
    let limit = limit.unwrap_or(10);

    // Build WHERE clause for search
    let where_clause = if let Some(ref query) = search {
        let search_term = format!("%{}%", query);
        format!("WHERE name LIKE '{}'", search_term.replace("'", "''"),)
    } else {
        String::new()
    };

    // Get total count
    let count_query = format!("SELECT COUNT(*) FROM issuers {}", where_clause);

    let total: i64 = conn
        .query_row(&count_query, [], |row| row.get(0))
        .map_err(|e| format!("Failed to count issuers: {}", e))?;

    // Get limited issuers
    let query = format!(
        "SELECT id, name, flag, created_at
         FROM issuers
         {}",
        where_clause
    );

    let mut stmt = conn
        .prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    let issuers = stmt
        .query_map([limit], |row| {
            Ok(Issuer {
                id: row.get(0)?,
                name: row.get(1)?,
                flag: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| format!("Failed to query issuers: {}", e))?;
    let data = issuers
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect issuers: {}", e))?;

    Ok(PaginatedIssuersResponse { data, total })
}
