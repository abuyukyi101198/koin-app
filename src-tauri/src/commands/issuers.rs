use crate::types::issuers::PaginatedIssuersResponse;
use crate::{commands, types};
use commands::utils::get_db_connection;
use types::issuers::Issuer;

#[tauri::command]
pub fn list_issuers(
    app_handle: tauri::AppHandle,
) -> Result<PaginatedIssuersResponse, String> {
    let conn = get_db_connection(&app_handle)?;

    // Get total count
    let count_query = "SELECT COUNT(*) FROM issuers".to_string();

    let total: i64 = conn
        .query_row(&count_query, [], |row| row.get(0))
        .map_err(|e| format!("Failed to count issuers: {}", e))?;

    // Get limited issuers
    let query = "SELECT id, name, flag, created_at
         FROM issuers".to_string();

    let mut stmt = conn
        .prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    let issuers = stmt
        .query_map([], |row| {
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
