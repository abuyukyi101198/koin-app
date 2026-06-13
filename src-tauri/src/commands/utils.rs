use crate::types::coins::ImageProcessingMode;
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

pub fn get_image_processing_default(conn: &Connection) -> ImageProcessingMode {
    conn.query_row(
        "SELECT image_processing_default FROM settings WHERE id = 1",
        [],
        |row| row.get::<_, String>(0),
    )
    .ok()
    .map(|v| match v.as_str() {
        "download" => ImageProcessingMode::Download,
        "download_and_remove_bg" => ImageProcessingMode::DownloadAndRemoveBg,
        _ => ImageProcessingMode::None,
    })
    .unwrap_or(ImageProcessingMode::None)
}

pub fn get_default_export_dir() -> String {
    #[cfg(target_os = "macos")]
    {
        if let Some(home) = std::env::var("HOME").ok() {
            return format!("{}/Downloads", home);
        }
    }

    #[cfg(target_os = "windows")]
    {
        if let Some(user_profile) = std::env::var("USERPROFILE").ok() {
            return format!("{}\\Downloads", user_profile);
        }
    }

    #[cfg(target_os = "linux")]
    {
        if let Some(home) = std::env::var("HOME").ok() {
            return format!("{}/Downloads", home);
        }
    }

    // Fallback
    std::env::temp_dir().to_string_lossy().to_string()
}
