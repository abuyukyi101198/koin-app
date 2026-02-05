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

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCoinRequest {
    pub title: String,
    pub value: f64,
    pub currency: String,
    pub year: i32,
    pub issuer: String,
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
    pub issuer: Option<String>,
    pub obverse_image: Option<String>,
    pub reverse_image: Option<String>,
    pub quantity: Option<i32>,
    pub sale_value: Option<f64>,
    pub notes: Option<String>,
}

fn get_db_connection(app_handle: &tauri::AppHandle) -> Result<rusqlite::Connection, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    let db_path = app_dir.join("koin-app.db");
    rusqlite::Connection::open(db_path).map_err(|e| format!("Failed to open database: {}", e))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedCoinsResponse {
    pub data: Vec<Coin>,
    pub total: i64,
}

#[tauri::command]
fn list_coins(
    app_handle: tauri::AppHandle,
    offset: Option<i64>,
    limit: Option<i64>,
    search: Option<String>,
    sort_field: Option<String>,
    sort_direction: Option<String>,
) -> Result<PaginatedCoinsResponse, String> {
    let conn = get_db_connection(&app_handle)?;
    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(10);
    let sort_direction = sort_direction.unwrap_or_else(|| "DESC".to_string()).to_uppercase();
    let sort_field = sort_field.unwrap_or_else(|| "year".to_string());

    // Validate sort direction
    if sort_direction != "ASC" && sort_direction != "DESC" {
        return Err("Invalid sort direction".to_string());
    }

    // Validate sort field
    let valid_fields = vec!["id", "title", "value", "currency", "year", "issuer", "quantity", "sale_value", "created_at"];
    if !valid_fields.contains(&sort_field.as_str()) {
        return Err("Invalid sort field".to_string());
    }

    // Build WHERE clause for search
    let where_clause = if let Some(ref query) = search {
        let search_term = format!("%{}%", query);
        // Search across title, issuer, currency, and notes
        format!(
            "WHERE title LIKE '{}' OR issuer LIKE '{}' OR currency LIKE '{}' OR notes LIKE '{}'",
            search_term.replace("'", "''"),
            search_term.replace("'", "''"),
            search_term.replace("'", "''"),
            search_term.replace("'", "''")
        )
    } else {
        String::new()
    };

    // Get total count
    let count_query = format!("SELECT COUNT(*) FROM coins {}", where_clause);
    let total: i64 = conn
        .query_row(&count_query, [], |row| row.get(0))
        .map_err(|e| format!("Failed to count coins: {}", e))?;

    // Get paginated coins
    let query = format!(
        "SELECT id, title, value, currency, year, issuer, obverse_image, reverse_image, quantity, sale_value, notes, created_at 
         FROM coins {} ORDER BY {} {} LIMIT ?1 OFFSET ?2",
        where_clause, sort_field, sort_direction
    );

    let mut stmt = conn.prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    let coins = stmt
        .query_map([limit, offset], |row| {
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
    let data = coins
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect coins: {}", e))?;

    Ok(PaginatedCoinsResponse { data, total })
}

#[tauri::command]
fn get_coin(app_handle: tauri::AppHandle, id: i32) -> Result<Coin, String> {
    let conn = get_db_connection(&app_handle)?;
    let mut stmt = conn.prepare(
        "SELECT id, title, value, currency, year, issuer, obverse_image, reverse_image, quantity, sale_value, notes, created_at FROM coins WHERE id = ?1"
    ).map_err(|e| format!("Failed to prepare statement: {}", e))?;

    stmt.query_row([id], |row| {
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
    .map_err(|e| format!("Failed to get coin: {}", e))
}

#[tauri::command]
fn create_coin(app_handle: tauri::AppHandle, coin: CreateCoinRequest) -> Result<Coin, String> {
    let conn = get_db_connection(&app_handle)?;

    conn.execute(
        "INSERT INTO coins (title, value, currency, year, issuer, obverse_image, reverse_image, quantity, sale_value, notes) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            coin.title,
            coin.value,
            coin.currency,
            coin.year,
            coin.issuer,
            coin.obverse_image,
            coin.reverse_image,
            coin.quantity.unwrap_or(1),
            coin.sale_value,
            coin.notes,
        ],
    ).map_err(|e| format!("Failed to insert coin: {}", e))?;

    let id = conn.last_insert_rowid() as i32;

    // Fetch and return the created coin
    get_coin(app_handle, id)
}

#[tauri::command]
fn update_coin(app_handle: tauri::AppHandle, request: UpdateCoinRequest) -> Result<Coin, String> {
    let conn = get_db_connection(&app_handle)?;

    // Build dynamic update query
    let mut updates = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(title) = request.title {
        updates.push("title = ?");
        params.push(Box::new(title));
    }
    if let Some(value) = request.value {
        updates.push("value = ?");
        params.push(Box::new(value));
    }
    if let Some(currency) = request.currency {
        updates.push("currency = ?");
        params.push(Box::new(currency));
    }
    if let Some(year) = request.year {
        updates.push("year = ?");
        params.push(Box::new(year));
    }
    if let Some(issuer) = request.issuer {
        updates.push("issuer = ?");
        params.push(Box::new(issuer));
    }
    if let Some(obverse_image) = request.obverse_image {
        updates.push("obverse_image = ?");
        params.push(Box::new(obverse_image));
    }
    if let Some(reverse_image) = request.reverse_image {
        updates.push("reverse_image = ?");
        params.push(Box::new(reverse_image));
    }
    if let Some(quantity) = request.quantity {
        updates.push("quantity = ?");
        params.push(Box::new(quantity));
    }
    if let Some(sale_value) = request.sale_value {
        updates.push("sale_value = ?");
        params.push(Box::new(sale_value));
    }
    if let Some(notes) = request.notes {
        updates.push("notes = ?");
        params.push(Box::new(notes));
    }

    if updates.is_empty() {
        return Err("No fields to update".to_string());
    }

    params.push(Box::new(request.id));

    let query = format!("UPDATE coins SET {} WHERE id = ?", updates.join(", "));

    conn.execute(&query, rusqlite::params_from_iter(params))
        .map_err(|e| format!("Failed to update coin: {}", e))?;

    // Fetch and return the updated coin
    get_coin(app_handle, request.id)
}

#[tauri::command]
fn delete_coin(app_handle: tauri::AppHandle, id: i32) -> Result<(), String> {
    let conn = get_db_connection(&app_handle)?;

    conn.execute("DELETE FROM coins WHERE id = ?1", [id])
        .map_err(|e| format!("Failed to delete coin: {}", e))?;

    Ok(())
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
            delete_coin
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
