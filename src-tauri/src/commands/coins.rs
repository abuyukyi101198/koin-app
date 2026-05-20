use crate::commands::utils::get_db_connection;
use crate::types::coins::{
    Coin, CreateCoinRequest, ImageProcessingMode, PaginatedCoinsResponse, UpdateCoinRequest,
};
use crate::handlers::image_handler;
use validator::Validate;

pub fn build_coin_from_row(row: &rusqlite::Row) -> Result<Coin, rusqlite::Error> {
    use crate::types::issuers::IssuerDisplay;

    Ok(Coin {
        id: row.get(0)?,
        title: row.get(1)?,
        value: row.get(2)?,
        currency: row.get(3)?,
        year: row.get(4)?,
        issuer: IssuerDisplay {
            id: row.get(5)?,
            name: row.get(6)?,
            start_year: row.get(7)?,
            end_year: row.get(8)?,
            flag: row.get(9)?,
        },
        description: row.get(10)?,
        obverse_image: row.get(11)?,
        reverse_image: row.get(12)?,
        quantity: row.get(13)?,
        sale_value: row.get(14)?,
        notes: row.get(15)?,
        created_at: row.get(16)?,
        notebook_id: row.get(17)?,
        notebook_position: row.get(18)?,
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
        "issuer",
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
            "WHERE c.title LIKE '{}' OR i.name LIKE '{}' OR c.description LIKE '{}'",
            search_term.replace("'", "''"),
            search_term.replace("'", "''"),
            search_term.replace("'", "''")
        )
    } else {
        String::new()
    };

    let order_by_field = if sort_field == "issuer" {
        "i.id".to_string()
    } else {
        format!("c.{}", sort_field)
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
        "SELECT c.id, c.title, c.value, c.currency, c.year, i.id, i.name, i.start_year, i.end_year, i.flag, c.description, c.obverse_image, c.reverse_image, c.quantity, c.sale_value, c.notes, c.created_at, c.notebook_id, c.notebook_position
         FROM coins c
         LEFT JOIN issuers i ON c.issuer_id = i.id
         {} ORDER BY {} {}, c.year {}, c.value {} LIMIT ?1 OFFSET ?2",
        where_clause, order_by_field, sort_direction, sort_direction, sort_direction
    );

    let mut stmt = conn
        .prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    let coins = stmt
        .query_map([limit, offset], |row| build_coin_from_row(row))
        .map_err(|e| format!("Failed to query coins: {}", e))?;
    let items = coins
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("Failed to collect coins: {}", e))?;

    Ok(PaginatedCoinsResponse { items, total })
}

#[tauri::command]
pub fn get_coin(app_handle: tauri::AppHandle, id: i32) -> Result<Coin, String> {
    let conn = get_db_connection(&app_handle)?;

    let query = "SELECT c.id, c.title, c.value, c.currency, c.year, i.id, i.name, i.start_year, i.end_year, i.flag, c.description, c.obverse_image, c.reverse_image, c.quantity, c.sale_value, c.notes, c.created_at, c.notebook_id, c.notebook_position
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
pub async fn create_coin(app_handle: tauri::AppHandle, coin: CreateCoinRequest) -> Result<Coin, String> {
    coin.validate()
        .map_err(|e| format!("Validation failed: {}", e))?;

    let conn = get_db_connection(&app_handle)?;

    let remove_bg = matches!(coin.image_processing, Some(ImageProcessingMode::DownloadAndRemoveBg));
    let download   = remove_bg || matches!(coin.image_processing, Some(ImageProcessingMode::Download));

    let obverse_image = if download {
        image_handler::process_image(coin.obverse_image.clone(), remove_bg).await?
    } else {
        coin.obverse_image.clone()
    };

    let reverse_image = if download {
        image_handler::process_image(coin.reverse_image.clone(), remove_bg).await?
    } else {
        coin.reverse_image.clone()
    };

    // Generate title from value, currency, and year
    let title = format!("{} {} {}", coin.value, coin.currency, coin.year);

    const INSERT_QUERY: &str = "INSERT INTO coins (title, value, currency, year, issuer_id, description, obverse_image, reverse_image, quantity, sale_value, notes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)";

    conn.execute(
        INSERT_QUERY,
        rusqlite::params![
            title,
            coin.value,
            coin.currency,
            coin.year,
            coin.issuer_id,
            coin.description,
            obverse_image,
            reverse_image,
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
pub async fn update_coin(
    app_handle: tauri::AppHandle,
    coin: UpdateCoinRequest,
) -> Result<Coin, String> {
    coin.validate()
        .map_err(|e| format!("Validation failed: {}", e))?;

    let conn = get_db_connection(&app_handle)?;

    let remove_bg = matches!(coin.image_processing, Some(ImageProcessingMode::DownloadAndRemoveBg));
    let download   = remove_bg || matches!(coin.image_processing, Some(ImageProcessingMode::Download));

    let obverse_image = if download {
        image_handler::process_image(coin.obverse_image.clone(), remove_bg).await?
    } else {
        coin.obverse_image.clone()
    };

    let reverse_image = if download {
        image_handler::process_image(coin.reverse_image.clone(), remove_bg).await?
    } else {
        coin.reverse_image.clone()
    };

    // Build dynamic update query
    let mut updates = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    // Check if any of value, currency, year are being updated to regenerate title
    let should_update_title =
        coin.value.is_some() || coin.currency.is_some() || coin.year.is_some();

    if should_update_title {
        // Fetch current coin to get missing fields
        let current_coin = get_coin(app_handle.clone(), coin.id)?;
        let value = coin.value.unwrap_or(current_coin.value);
        let currency = coin.currency.clone().unwrap_or(current_coin.currency);
        let year = coin.year.unwrap_or(current_coin.year);
        let new_title = format!("{} {} {}", value, currency, year);

        updates.push("title = ?");
        params.push(Box::new(new_title));
    }
    if let Some(value) = coin.value {
        updates.push("value = ?");
        params.push(Box::new(value));
    }
    if let Some(currency) = coin.currency {
        updates.push("currency = ?");
        params.push(Box::new(currency));
    }
    if let Some(year) = coin.year {
        updates.push("year = ?");
        params.push(Box::new(year));
    }
    if let Some(issuer_id) = coin.issuer_id {
        updates.push("issuer_id = ?");
        params.push(Box::new(issuer_id));
    }
    if let Some(description) = coin.description {
        updates.push("description = ?");
        params.push(Box::new(description));
    }

    // Always update images if they are part of the request (frontend sends complete form)
    // None/undefined means explicit removal (set to NULL)
    // Some(value) means update with the value
    updates.push("obverse_image = ?");
    params.push(Box::new(obverse_image));
    updates.push("reverse_image = ?");
    params.push(Box::new(reverse_image));

    if let Some(quantity) = coin.quantity {
        updates.push("quantity = ?");
        params.push(Box::new(quantity));
    }
    if let Some(sale_value) = coin.sale_value {
        updates.push("sale_value = ?");
        params.push(Box::new(sale_value));
    }
    if let Some(notes) = coin.notes {
        updates.push("notes = ?");
        params.push(Box::new(notes));
    }

    if updates.is_empty() {
        return Err("No fields to update".to_string());
    }

    params.push(Box::new(coin.id));

    let query = format!("UPDATE coins SET {} WHERE id = ?", updates.join(", "));

    conn.execute(&query, rusqlite::params_from_iter(params))
        .map_err(|e| format!("Failed to update coin: {}", e))?;

    // Fetch and return the updated coin
    get_coin(app_handle, coin.id)
}

#[tauri::command]
pub fn delete_coin(app_handle: tauri::AppHandle, id: i32) -> Result<(), String> {
    let conn = get_db_connection(&app_handle)?;

    conn.execute("DELETE FROM coins WHERE id = ?1", [id])
        .map_err(|e| format!("Failed to delete coin: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn get_similar_coins(
    app_handle: tauri::AppHandle,
    id: i32,
    limit: Option<i64>,
) -> Result<PaginatedCoinsResponse, String> {
    let conn = get_db_connection(&app_handle)?;
    let limit = limit.unwrap_or(10);
    const SIMILARITY_THRESHOLD: i32 = 25;

    // Fetch the target coin to compare against
    let target_coin = get_coin(app_handle.clone(), id)?;

    // Query all coins except the target
    let query = "SELECT c.id, c.title, c.value, c.currency, c.year, i.id, i.name, i.start_year, i.end_year, i.flag, c.description, c.obverse_image, c.reverse_image, c.quantity, c.sale_value, c.notes, c.created_at, c.notebook_id, c.notebook_position
                 FROM coins c
                 LEFT JOIN issuers i ON c.issuer_id = i.id
                 WHERE c.id != ?1";

    let mut stmt = conn
        .prepare(query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let coins_iter = stmt
        .query_map([id], |row| build_coin_from_row(row))
        .map_err(|e| format!("Failed to query coins: {}", e))?;

    // Score and collect coins
    let mut scored_coins: Vec<(Coin, i32)> = coins_iter
        .filter_map(|result| {
            if let Ok(coin) = result {
                let mut score = 0;

                // Issuer proximity scoring - closer issuer_ids are more similar
                let issuer_distance = (coin.issuer.id - target_coin.issuer.id).abs();
                let issuer_score = (30 - issuer_distance.min(30)) as i32;
                score += issuer_score;

                // Currency exact match
                if coin.currency == target_coin.currency {
                    score += 25;
                }

                // Year proximity scoring - closer years are more similar
                let year_distance = (coin.year - target_coin.year).abs();
                let year_score = (25 - year_distance.min(25)) as i32;
                score += year_score;

                // Only include coins that meet the similarity threshold
                if score >= SIMILARITY_THRESHOLD {
                    Some((coin, score))
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect();

    // Sort by score descending, then by created_at descending
    scored_coins.sort_by(|a, b| {
        b.1.cmp(&a.1)
            .then_with(|| b.0.created_at.cmp(&a.0.created_at))
    });

    // Extract coins and limit results
    let items: Vec<Coin> = scored_coins
        .into_iter()
        .take(limit as usize)
        .map(|(coin, _)| coin)
        .collect();

    Ok(PaginatedCoinsResponse { items, total: limit })
}

