use crate::{commands, Issuer};
use commands::utils::get_db_connection;

#[tauri::command]
pub fn list_issuers(app_handle: tauri::AppHandle) -> Result<Vec<Issuer>, String> {
    let conn = get_db_connection(&app_handle)?;
    let mut stmt = conn
        .prepare("SELECT id, name, flag, created_at FROM issuers ORDER BY name ASC")
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
    issuers
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect issuers: {}", e))
}

#[tauri::command]
pub fn create_issuer(
    app_handle: tauri::AppHandle,
    name: String,
    flag: Option<String>,
) -> Result<Issuer, String> {
    let conn = get_db_connection(&app_handle)?;

    conn.execute(
        "INSERT INTO issuers (name, flag) VALUES (?1, ?2)",
        rusqlite::params![name.trim(), flag],
    )
    .map_err(|e| format!("Failed to insert issuer: {}", e))?;

    let id = conn.last_insert_rowid() as i32;

    let mut stmt = conn
        .prepare("SELECT id, name, flag, created_at FROM issuers WHERE id = ?1")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    stmt.query_row([id], |row| {
        Ok(Issuer {
            id: row.get(0)?,
            name: row.get(1)?,
            flag: row.get(2)?,
            created_at: row.get(3)?,
        })
    })
    .map_err(|e| format!("Failed to fetch created issuer: {}", e))
}
