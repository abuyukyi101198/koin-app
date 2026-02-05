mod commands;
mod db;
use crate::commands::coins::{create_coin, delete_coin, get_coin, list_coins, update_coin};
use crate::commands::issuers::{create_issuer, list_issuers};
use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Issuer {
    pub id: i32,
    pub name: String,
    pub flag: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Coin {
    pub id: i32,
    pub title: String,
    pub value: f64,
    pub currency: String,
    pub year: i32,
    pub issuer: Issuer,
    pub obverse_image: Option<String>,
    pub reverse_image: Option<String>,
    pub quantity: i32,
    pub sale_value: Option<f64>,
    pub notes: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum IssuerInput {
    ById { id: i32 },
    ByName { name: String },
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCoinRequest {
    pub title: String,
    pub value: f64,
    pub currency: String,
    pub year: i32,
    pub issuer: IssuerInput,
    pub obverse_image: Option<String>,
    pub reverse_image: Option<String>,
    pub quantity: Option<i32>,
    pub sale_value: Option<f64>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateCoinRequest {
    pub id: i32,
    pub title: Option<String>,
    pub value: Option<f64>,
    pub currency: Option<String>,
    pub year: Option<i32>,
    pub issuer: Option<IssuerInput>,
    pub obverse_image: Option<String>,
    pub reverse_image: Option<String>,
    pub quantity: Option<i32>,
    pub sale_value: Option<f64>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedCoinsResponse {
    pub data: Vec<Coin>,
    pub total: i64,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            list_coins,
            get_coin,
            create_coin,
            update_coin,
            delete_coin,
            list_issuers,
            create_issuer
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
            // Initialize database with migrations
            db::init_database(&db_path).expect("failed to initialize database");
            println!("Database initialized at: {}", db_path.display());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
