use crate::commands::utils::get_db_connection;
use crate::types::coins::{Coin, CreateCoinRequest, PaginatedCoinsResponse, UpdateCoinRequest};

fn build_coin_from_row(row: &rusqlite::Row) -> Result<Coin, rusqlite::Error> {
    use crate::types::issuers::Issuer;

    Ok(Coin {
        id: row.get(0)?,
        title: row.get(1)?,
        value: row.get(2)?,
        currency: row.get(3)?,
        year: row.get(4)?,
        issuer: Issuer {
            id: row.get(5)?,
            name: row.get(6)?,
            flag: row.get(7)?,
            created_at: row.get(8)?,
        },
        obverse_image: row.get(9)?,
        reverse_image: row.get(10)?,
        quantity: row.get(11)?,
        sale_value: row.get(12)?,
        notes: row.get(13)?,
        created_at: row.get(14)?,
    })
}

#[tauri::command]
pub fn list_coins(
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
        "currency",
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
            "WHERE c.title LIKE '{}' OR i.name LIKE '{}' OR c.currency LIKE '{}' OR c.notes LIKE '{}'",
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
        "SELECT COUNT(*) FROM coins c LEFT JOIN issuers i ON c.issuer_id = i.id {}",
        where_clause
    );

    let total: i64 = conn
        .query_row(&count_query, [], |row| row.get(0))
        .map_err(|e| format!("Failed to count coins: {}", e))?;

    // Get paginated coins
    let query = format!(
        "SELECT c.id, c.title, c.value, c.currency, c.year, i.id, i.name, i.flag, i.created_at, c.obverse_image, c.reverse_image, c.quantity, c.sale_value, c.notes, c.created_at
         FROM coins c
         LEFT JOIN issuers i ON c.issuer_id = i.id
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
pub fn get_coin(app_handle: tauri::AppHandle, id: i32) -> Result<Coin, String> {
    let conn = get_db_connection(&app_handle)?;

    let query = "SELECT c.id, c.title, c.value, c.currency, c.year, i.id, i.name, i.flag, i.created_at, c.obverse_image, c.reverse_image, c.quantity, c.sale_value, c.notes, c.created_at
                FROM coins c
                LEFT JOIN issuers i ON c.issuer_id = i.id 
                WHERE c.id = ?1";

    let mut stmt = conn
        .prepare(query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    stmt.query_row([id], |row| build_coin_from_row(row))
        .map_err(|e| format!("Failed to get coin: {}", e))
}

#[tauri::command]
pub fn create_coin(app_handle: tauri::AppHandle, coin: CreateCoinRequest) -> Result<Coin, String> {
    let conn = get_db_connection(&app_handle)?;

    const INSERT_QUERY: &str = "INSERT INTO coins (title, value, currency, year, issuer_id, obverse_image, reverse_image, quantity, sale_value, notes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)";

    conn.execute(
        INSERT_QUERY,
        rusqlite::params![
            coin.title,
            coin.value,
            coin.currency,
            coin.year,
            coin.issuer_id,
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
pub fn update_coin(
    app_handle: tauri::AppHandle,
    request: UpdateCoinRequest,
) -> Result<Coin, String> {
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
    if let Some(issuer_id) = request.issuer_id {
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
pub fn delete_coin(app_handle: tauri::AppHandle, id: i32) -> Result<(), String> {
    let conn = get_db_connection(&app_handle)?;

    conn.execute("DELETE FROM coins WHERE id = ?1", [id])
        .map_err(|e| format!("Failed to delete coin: {}", e))?;

    Ok(())
}
