mod db;
use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Coin {
    pub id: i32,
    pub title: String,
    pub value: f64,
    pub currency: String,
    pub year: i32,
    pub issuer: String,
    pub obverse_image: Option<String>,
    pub reverse_image: Option<String>,
    pub quantity: i32,
    pub sale_value: Option<f64>,
    pub notes: Option<String>,
    pub created_at: String,
}

#[tauri::command]
fn get_coins(app_handle: tauri::AppHandle) -> Result<Vec<Coin>, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let db_path = app_dir.join("koin-app.db");
    let conn = rusqlite::Connection::open(db_path)
        .map_err(|e| format!("Failed to open database: {}", e))?;
    let mut stmt = conn.prepare(
        "SELECT id, title, value, currency, year, issuer, obverse_image, reverse_image, quantity, sale_value, notes, created_at FROM coins ORDER BY year DESC, issuer ASC"
    ).map_err(|e| format!("Failed to prepare statement: {}", e))?;
    let coins = stmt
        .query_map([], |row| {
            Ok(Coin {
                id: row.get(0)?,
                title: row.get(1)?,
                value: row.get(2)?,
                currency: row.get(3)?,
                year: row.get(4)?,
                issuer: row.get(5)?,
                obverse_image: row.get(6)?,
                reverse_image: row.get(7)?,
                quantity: row.get(8)?,
                sale_value: row.get(9)?,
                notes: row.get(10)?,
                created_at: row.get(11)?,
            })
        })
        .map_err(|e| format!("Failed to query coins: {}", e))?;
    coins
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect coins: {}", e))
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_coins])
        .setup(|app| {
            // Initialize database on app startup
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("failed to get app data directory");
            // Create app data directory if it doesn't exist
            std::fs::create_dir_all(&app_dir).expect("failed to create app data directory");
            let db_path = app_dir.join("koin-app.db");
            // Initialize database with migrations
            db::init_database(&db_path).expect("failed to initialize database");
            println!("Database initialized at: {}", db_path.display());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
