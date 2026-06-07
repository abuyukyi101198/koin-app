mod commands;
mod db;
mod handlers;
mod types;
use crate::commands::coins::{
    create_coin, delete_coin, get_coin, get_similar_coins, list_coins, update_coin,
};
use crate::commands::issuers::{get_issuer, list_issuers};
use crate::commands::notebooks::{
    create_notebook, delete_notebook, get_notebook, list_notebooks, reorder_coins, update_notebook,
};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            list_coins,
            get_coin,
            get_similar_coins,
            create_coin,
            update_coin,
            delete_coin,
            list_issuers,
            get_issuer,
            list_notebooks,
            get_notebook,
            create_notebook,
            update_notebook,
            delete_notebook,
            reorder_coins,
        ])
        .setup(|app| {
            // Initialize database on app startup
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("failed to get app data directory");
            // Create app data directory if it doesn't exist
            std::fs::create_dir_all(&app_dir).expect("failed to create app data directory");
            let db_path = app_dir.join("koin-app.db");
            let images_dir = app_dir.join("coin_images");
            // Initialize database (runs pending migrations, including image-to-file migration)
            db::init_database(&db_path, &images_dir)
                .expect("failed to initialize database");
            println!("Database initialized at: {}", db_path.display());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
