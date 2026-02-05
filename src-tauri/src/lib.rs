mod db;
use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Currency {
    pub id: i32,
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Issuer {
    pub id: i32,
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Coin {
    pub id: i32,
    pub title: String,
    pub value: f64,
    pub currency: Currency,
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
pub enum CurrencyInput {
    ById { id: i32 },
    ByName { name: String },
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
    pub currency: CurrencyInput,
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
    pub currency: Option<CurrencyInput>,
    pub year: Option<i32>,
    pub issuer: Option<IssuerInput>,
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

fn get_or_create_currency(
    conn: &rusqlite::Connection,
    input: &CurrencyInput,
) -> Result<i32, String> {
    match input {
        CurrencyInput::ById { id } => Ok(*id),
        CurrencyInput::ByName { name } => {
            let trimmed_name = name.trim();

            // Try to find existing currency
            let mut stmt = conn
                .prepare("SELECT id FROM currencies WHERE name = ?1")
                .map_err(|e| format!("Failed to prepare statement: {}", e))?;

            if let Ok(id) = stmt.query_row([trimmed_name], |row| row.get::<_, i32>(0)) {
                return Ok(id);
            }

            // Create new currency
            conn.execute(
                "INSERT INTO currencies (name) VALUES (?1)",
                rusqlite::params![trimmed_name],
            )
            .map_err(|e| format!("Failed to insert currency: {}", e))?;

            Ok(conn.last_insert_rowid() as i32)
        }
    }
}

fn get_or_create_issuer(conn: &rusqlite::Connection, input: &IssuerInput) -> Result<i32, String> {
    match input {
        IssuerInput::ById { id } => Ok(*id),
        IssuerInput::ByName { name } => {
            let trimmed_name = name.trim();

            // Try to find existing issuer
            let mut stmt = conn
                .prepare("SELECT id FROM issuers WHERE name = ?1")
                .map_err(|e| format!("Failed to prepare statement: {}", e))?;

            if let Ok(id) = stmt.query_row([trimmed_name], |row| row.get::<_, i32>(0)) {
                return Ok(id);
            }

            // Create new issuer
            conn.execute(
                "INSERT INTO issuers (name) VALUES (?1)",
                rusqlite::params![trimmed_name],
            )
            .map_err(|e| format!("Failed to insert issuer: {}", e))?;

            Ok(conn.last_insert_rowid() as i32)
        }
    }
}

fn build_coin_from_row(row: &rusqlite::Row) -> Result<Coin, rusqlite::Error> {
    Ok(Coin {
        id: row.get(0)?,
        title: row.get(1)?,
        value: row.get(2)?,
        currency: Currency {
            id: row.get(3)?,
            name: row.get(4)?,
            created_at: row.get(5)?,
        },
        year: row.get(6)?,
        issuer: Issuer {
            id: row.get(7)?,
            name: row.get(8)?,
            created_at: row.get(9)?,
        },
        obverse_image: row.get(10)?,
        reverse_image: row.get(11)?,
        quantity: row.get(12)?,
        sale_value: row.get(13)?,
        notes: row.get(14)?,
        created_at: row.get(15)?,
    })
}

#[tauri::command]
fn list_currencies(app_handle: tauri::AppHandle) -> Result<Vec<Currency>, String> {
    let conn = get_db_connection(&app_handle)?;
    let mut stmt = conn
        .prepare("SELECT id, name, created_at FROM currencies ORDER BY name ASC")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    let currencies = stmt
        .query_map([], |row| {
            Ok(Currency {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
            })
        })
        .map_err(|e| format!("Failed to query currencies: {}", e))?;
    currencies
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect currencies: {}", e))
}

#[tauri::command]
fn list_issuers(app_handle: tauri::AppHandle) -> Result<Vec<Issuer>, String> {
    let conn = get_db_connection(&app_handle)?;
    let mut stmt = conn
        .prepare("SELECT id, name, created_at FROM issuers ORDER BY name ASC")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    let issuers = stmt
        .query_map([], |row| {
            Ok(Issuer {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
            })
        })
        .map_err(|e| format!("Failed to query issuers: {}", e))?;
    issuers
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect issuers: {}", e))
}

#[tauri::command]
fn create_currency(app_handle: tauri::AppHandle, name: String) -> Result<Currency, String> {
    let conn = get_db_connection(&app_handle)?;

    conn.execute(
        "INSERT INTO currencies (name) VALUES (?1)",
        rusqlite::params![name.trim()],
    )
    .map_err(|e| format!("Failed to insert currency: {}", e))?;

    let id = conn.last_insert_rowid() as i32;

    let mut stmt = conn
        .prepare("SELECT id, name, created_at FROM currencies WHERE id = ?1")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    stmt.query_row([id], |row| {
        Ok(Currency {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
        })
    })
    .map_err(|e| format!("Failed to fetch created currency: {}", e))
}

#[tauri::command]
fn create_issuer(app_handle: tauri::AppHandle, name: String) -> Result<Issuer, String> {
    let conn = get_db_connection(&app_handle)?;

    conn.execute(
        "INSERT INTO issuers (name) VALUES (?1)",
        rusqlite::params![name.trim()],
    )
    .map_err(|e| format!("Failed to insert issuer: {}", e))?;

    let id = conn.last_insert_rowid() as i32;

    let mut stmt = conn
        .prepare("SELECT id, name, created_at FROM issuers WHERE id = ?1")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    stmt.query_row([id], |row| {
        Ok(Issuer {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
        })
    })
    .map_err(|e| format!("Failed to fetch created issuer: {}", e))
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
    let sort_direction = sort_direction
        .unwrap_or_else(|| "DESC".to_string())
        .to_uppercase();
    let mut sort_field = sort_field.unwrap_or_else(|| "year".to_string());

    // Validate sort direction
    if sort_direction != "ASC" && sort_direction != "DESC" {
        return Err("Invalid sort direction".to_string());
    }

    // Validate and map sort field
    let valid_fields = vec![
        "id",
        "title",
        "value",
        "currency_id",
        "year",
        "issuer_id",
        "quantity",
        "sale_value",
        "created_at",
    ];
    if !valid_fields.contains(&sort_field.as_str()) {
        sort_field = "year".to_string();
    }

    // Build WHERE clause for search
    let where_clause = if let Some(ref query) = search {
        let search_term = format!("%{}%", query);
        format!(
            "WHERE c.title LIKE '{}' OR i.name LIKE '{}' OR cu.name LIKE '{}' OR c.notes LIKE '{}'",
            search_term.replace("'", "''"),
            search_term.replace("'", "''"),
            search_term.replace("'", "''"),
            search_term.replace("'", "''")
        )
    } else {
        String::new()
    };

    // Get total count
    let count_query = format!(
        "SELECT COUNT(*) FROM coins c LEFT JOIN issuers i ON c.issuer_id = i.id LEFT JOIN currencies cu ON c.currency_id = cu.id {}",
        where_clause
    );

    let total: i64 = conn
        .query_row(&count_query, [], |row| row.get(0))
        .map_err(|e| format!("Failed to count coins: {}", e))?;

    // Get paginated coins
    let query = format!(
        "SELECT c.id, c.title, c.value, cu.id, cu.name, cu.created_at, c.year, i.id, i.name, i.created_at, c.obverse_image, c.reverse_image, c.quantity, c.sale_value, c.notes, c.created_at
         FROM coins c
         LEFT JOIN issuers i ON c.issuer_id = i.id
         LEFT JOIN currencies cu ON c.currency_id = cu.id
         {} ORDER BY c.{} {} LIMIT ?1 OFFSET ?2",
        where_clause, sort_field, sort_direction
    );

    let mut stmt = conn
        .prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    let coins = stmt
        .query_map([limit, offset], |row| build_coin_from_row(row))
        .map_err(|e| format!("Failed to query coins: {}", e))?;
    let data = coins
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect coins: {}", e))?;

    Ok(PaginatedCoinsResponse { data, total })
}

#[tauri::command]
fn get_coin(app_handle: tauri::AppHandle, id: i32) -> Result<Coin, String> {
    let conn = get_db_connection(&app_handle)?;

    let query = "SELECT c.id, c.title, c.value, cu.id, cu.name, cu.created_at, c.year, i.id, i.name, i.created_at, c.obverse_image, c.reverse_image, c.quantity, c.sale_value, c.notes, c.created_at 
                FROM coins c 
                LEFT JOIN issuers i ON c.issuer_id = i.id 
                LEFT JOIN currencies cu ON c.currency_id = cu.id 
                WHERE c.id = ?1";

    let mut stmt = conn
        .prepare(query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    stmt.query_row([id], |row| build_coin_from_row(row))
        .map_err(|e| format!("Failed to get coin: {}", e))
}

#[tauri::command]
fn create_coin(app_handle: tauri::AppHandle, coin: CreateCoinRequest) -> Result<Coin, String> {
    let conn = get_db_connection(&app_handle)?;

    // Get or create currency and issuer
    let currency_id = get_or_create_currency(&conn, &coin.currency)?;
    let issuer_id = get_or_create_issuer(&conn, &coin.issuer)?;

    const INSERT_QUERY: &str = "INSERT INTO coins (title, value, currency_id, year, issuer_id, obverse_image, reverse_image, quantity, sale_value, notes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)";

    conn.execute(
        INSERT_QUERY,
        rusqlite::params![
            coin.title,
            coin.value,
            currency_id,
            coin.year,
            issuer_id,
            coin.obverse_image,
            coin.reverse_image,
            coin.quantity.unwrap_or(1),
            coin.sale_value,
            coin.notes,
        ],
    )
    .map_err(|e| format!("Failed to insert coin: {}", e))?;

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
    if let Some(currency) = &request.currency {
        let currency_id = get_or_create_currency(&conn, currency)?;
        updates.push("currency_id = ?");
        params.push(Box::new(currency_id));
    }
    if let Some(year) = request.year {
        updates.push("year = ?");
        params.push(Box::new(year));
    }
    if let Some(issuer) = &request.issuer {
        let issuer_id = get_or_create_issuer(&conn, issuer)?;
        updates.push("issuer_id = ?");
        params.push(Box::new(issuer_id));
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
            delete_coin,
            list_currencies,
            list_issuers,
            create_currency,
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
