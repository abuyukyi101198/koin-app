use crate::commands::utils::{get_db_connection, get_image_processing_default, get_images_dir};
use crate::handlers::image_handler;
use crate::types::coins::{
    Coin, CreateCoinRequest, ImageProcessingMode, PaginatedCoinsResponse, UpdateCoinRequest,
};
use validator::Validate;

fn resolve_image_value(stored: Option<String>) -> Option<String> {
    match stored {
        None => None,
        Some(ref val) if val.starts_with("http") => stored,
        Some(ref path) => {
            if std::path::Path::new(path).exists() {
                stored
            } else {
                None
            }
        }
    }
}

fn delete_image_file_if_local(val: &Option<String>) {
    if let Some(ref path) = val {
        if !path.starts_with("http") {
            let _ = std::fs::remove_file(path);
        }
    }
}

pub fn build_coin_from_row(row: &rusqlite::Row) -> Result<Coin, rusqlite::Error> {
    use crate::types::issuers::IssuerDisplay;

    let coin = Coin {
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
    };

    Ok(Coin {
        obverse_image: resolve_image_value(coin.obverse_image),
        reverse_image: resolve_image_value(coin.reverse_image),
        ..coin
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
        "SELECT c.id, c.title, c.value, c.currency, c.year, i.id, i.name, i.start_year, i.end_year, i.flag, \
                c.description, c.obverse_image, c.reverse_image, c.quantity, c.sale_value, c.notes, c.created_at, \
                c.notebook_id, c.notebook_position
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

    let query = "SELECT c.id, c.title, c.value, c.currency, c.year, i.id, i.name, i.start_year, i.end_year, i.flag, \
                        c.description, c.obverse_image, c.reverse_image, c.quantity, c.sale_value, c.notes, c.created_at, \
                        c.notebook_id, c.notebook_position
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
pub async fn create_coin(
    app_handle: tauri::AppHandle,
    coin: CreateCoinRequest,
) -> Result<Coin, String> {
    coin.validate()
        .map_err(|e| format!("Validation failed: {}", e))?;

    let conn = get_db_connection(&app_handle)?;
    let images_dir = get_images_dir(&app_handle)?;

    let processing_mode = coin
        .image_processing
        .clone()
        .unwrap_or_else(|| get_image_processing_default(&conn));

    let remove_bg = matches!(processing_mode, ImageProcessingMode::DownloadAndRemoveBg);
    let download = remove_bg || matches!(processing_mode, ImageProcessingMode::Download);

    // Data URLs (uploaded from disk) are always saved to a file even when download=false.
    // Remote http URLs are only downloaded when download=true.
    let obverse_is_data_url = coin.obverse_image.as_ref().map_or(false, |v| v.starts_with("data:"));
    let reverse_is_data_url = coin.reverse_image.as_ref().map_or(false, |v| v.starts_with("data:"));
    let save_obverse = download || obverse_is_data_url;
    let save_reverse = download || reverse_is_data_url;

    // remove_bg only applies in explicit download mode, not for plain data-URL saves.
    let apply_bg = remove_bg && download;
    let ext = if apply_bg { "png" } else { "jpg" };

    let obverse_bytes = if save_obverse {
        image_handler::download_and_process(coin.obverse_image.clone(), apply_bg).await?
    } else {
        None
    };
    let reverse_bytes = if save_reverse {
        image_handler::download_and_process(coin.reverse_image.clone(), apply_bg).await?
    } else {
        None
    };

    let title = format!("{} {} {}", coin.value, coin.currency, coin.year);

    // Insert with NULL for images that will be saved as files (id unknown yet),
    // or with the remote URL for images that are kept as-is.
    let initial_obverse = if save_obverse { None } else { coin.obverse_image.clone() };
    let initial_reverse = if save_reverse { None } else { coin.reverse_image.clone() };

    conn.execute(
        "INSERT INTO coins (title, value, currency, year, issuer_id, description, \
                            obverse_image, reverse_image, quantity, sale_value, notes)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            title,
            coin.value,
            coin.currency,
            coin.year,
            coin.issuer_id,
            coin.description,
            initial_obverse,
            initial_reverse,
            coin.quantity.unwrap_or(1),
            coin.sale_value,
            coin.notes,
        ],
    )
    .map_err(|e| format!("Failed to insert coin: {}", e))?;

    let id = conn.last_insert_rowid() as i32;

    // Now that we have the coin id, save image files and update the row.
    if save_obverse || save_reverse {
        let new_obverse = if let Some(bytes) = obverse_bytes {
            let file_path = images_dir.join(format!("{}_obverse.{}", id, ext));
            image_handler::save_to_file(&bytes, &file_path)?;
            Some(file_path.to_string_lossy().to_string())
        } else {
            None
        };

        let new_reverse = if let Some(bytes) = reverse_bytes {
            let file_path = images_dir.join(format!("{}_reverse.{}", id, ext));
            image_handler::save_to_file(&bytes, &file_path)?;
            Some(file_path.to_string_lossy().to_string())
        } else {
            None
        };

        conn.execute(
            "UPDATE coins SET obverse_image = ?1, reverse_image = ?2 WHERE id = ?3",
            rusqlite::params![new_obverse, new_reverse, id],
        )
        .map_err(|e| format!("Failed to update coin images after insert: {}", e))?;
    }

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
    let images_dir = get_images_dir(&app_handle)?;

    let processing_mode = coin
        .image_processing
        .clone()
        .unwrap_or_else(|| get_image_processing_default(&conn));

    let remove_bg = matches!(processing_mode, ImageProcessingMode::DownloadAndRemoveBg);
    let download = remove_bg || matches!(processing_mode, ImageProcessingMode::Download);

    // Always fetch the current coin – needed for old-file cleanup and title regeneration.
    let current_coin = get_coin(app_handle.clone(), coin.id)?;

    // Data URLs (uploaded from disk) are always saved to a file even when download=false.
    // Remote http URLs are only downloaded when download=true.
    let obverse_is_data_url = coin.obverse_image.as_ref().map_or(false, |v| v.starts_with("data:"));
    let reverse_is_data_url = coin.reverse_image.as_ref().map_or(false, |v| v.starts_with("data:"));
    let save_obverse = download || obverse_is_data_url;
    let save_reverse = download || reverse_is_data_url;

    // remove_bg only applies in explicit download mode, not for plain data-URL saves.
    let apply_bg = remove_bg && download;
    let ext = if apply_bg { "png" } else { "jpg" };

    let obverse_bytes = if save_obverse {
        image_handler::download_and_process(coin.obverse_image.clone(), apply_bg).await?
    } else {
        None
    };
    let reverse_bytes = if save_reverse {
        image_handler::download_and_process(coin.reverse_image.clone(), apply_bg).await?
    } else {
        None
    };

    // Delete old image files (safe – ignores missing files).
    delete_image_file_if_local(&current_coin.obverse_image);
    delete_image_file_if_local(&current_coin.reverse_image);

    // Determine new stored values: file path if we saved a file, remote URL otherwise, None if cleared.
    let new_obverse = if save_obverse {
        if let Some(bytes) = obverse_bytes {
            let file_path = images_dir.join(format!("{}_obverse.{}", coin.id, ext));
            image_handler::save_to_file(&bytes, &file_path)?;
            Some(file_path.to_string_lossy().to_string())
        } else {
            None
        }
    } else {
        coin.obverse_image.clone() // remote URL or None
    };

    let new_reverse = if save_reverse {
        if let Some(bytes) = reverse_bytes {
            let file_path = images_dir.join(format!("{}_reverse.{}", coin.id, ext));
            image_handler::save_to_file(&bytes, &file_path)?;
            Some(file_path.to_string_lossy().to_string())
        } else {
            None
        }
    } else {
        coin.reverse_image.clone() // remote URL or None
    };

    // Build dynamic update query.
    let mut updates = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    // Check if any of value, currency, year are being updated to regenerate title
    let should_update_title =
        coin.value.is_some() || coin.currency.is_some() || coin.year.is_some();

    if should_update_title {
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

    // Images are always included (frontend sends the complete form).
    updates.push("obverse_image = ?");
    params.push(Box::new(new_obverse));
    updates.push("reverse_image = ?");
    params.push(Box::new(new_reverse));

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
    let coin = get_coin(app_handle.clone(), id)?;

    let conn = get_db_connection(&app_handle)?;
    conn.execute("DELETE FROM coins WHERE id = ?1", [id])
        .map_err(|e| format!("Failed to delete coin: {}", e))?;

    delete_image_file_if_local(&coin.obverse_image);
    delete_image_file_if_local(&coin.reverse_image);

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

    let query = "SELECT c.id, c.title, c.value, c.currency, c.year, i.id, i.name, i.start_year, i.end_year, i.flag, \
                        c.description, c.obverse_image, c.reverse_image, c.quantity, c.sale_value, c.notes, c.created_at, \
                        c.notebook_id, c.notebook_position
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
                let issuer_score = 30 - issuer_distance.min(30);
                score += issuer_score;

                // Currency exact match
                if coin.currency == target_coin.currency {
                    score += 25;
                }

                // Year proximity scoring - closer years are more similar
                let year_distance = (coin.year - target_coin.year).abs();
                let year_score = 25 - year_distance.min(25);
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

    Ok(PaginatedCoinsResponse {
        items,
        total: limit,
    })
}
