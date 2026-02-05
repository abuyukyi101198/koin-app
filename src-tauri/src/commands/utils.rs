use rusqlite::Connection;
use tauri::Manager;

pub fn get_db_connection(app_handle: &tauri::AppHandle) -> Result<Connection, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let db_path = app_dir.join("koin-app.db");
    Connection::open(db_path).map_err(|e| format!("Failed to open database: {}", e))
}
