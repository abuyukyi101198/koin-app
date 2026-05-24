use rusqlite::Connection;
use std::path::PathBuf;
use tauri::Manager;

pub fn get_db_connection(app_handle: &tauri::AppHandle) -> Result<Connection, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let db_path = app_dir.join("koin-app.db");
    let conn = Connection::open(db_path).map_err(|e| format!("Failed to open database: {}", e))?;
    conn.execute("PRAGMA foreign_keys = ON", [])
        .map_err(|e| format!("Failed to enable foreign keys: {}", e))?;
    Ok(conn)
}

pub fn get_images_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let images_dir = app_dir.join("coin_images");
    std::fs::create_dir_all(&images_dir)
        .map_err(|e| format!("Failed to create coin_images directory: {}", e))?;
    Ok(images_dir)
}
