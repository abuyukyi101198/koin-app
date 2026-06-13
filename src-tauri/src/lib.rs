mod commands;
mod db;
mod handlers;
mod types;
use crate::commands::coins::{
    create_coin, delete_coin, get_coin, get_similar_coins, list_coins, update_coin,
};
use crate::commands::export::export_coins;
use crate::commands::issuers::{get_issuer, list_issuers};
use crate::commands::notebooks::{
    create_notebook, delete_notebook, get_notebook, list_notebooks, reorder_coins, update_notebook,
};
use crate::commands::settings::{get_settings, update_settings};
use tauri::Manager;

#[tauri::command]
async fn close_splashscreen(app: tauri::AppHandle) {
    // Close the splashscreen window if it exists
    if let Some(splash) = app.get_webview_window("splashscreen") {
        splash.close().expect("failed to close splashscreen window");
    }
    // Show and focus the main window
    if let Some(main) = app.get_webview_window("main") {
        main.show().expect("failed to show main window");
        main.set_focus().expect("failed to focus main window");
    }
}

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
            export_coins,
            list_issuers,
            get_issuer,
            list_notebooks,
            get_notebook,
            create_notebook,
            update_notebook,
            delete_notebook,
            reorder_coins,
            get_settings,
            update_settings,
            close_splashscreen,
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
