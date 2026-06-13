use crate::commands::coins::build_coin_from_row;
use crate::commands::utils::{get_db_connection, get_default_export_dir, get_images_dir};
use crate::types::export::{ExportFormat, ExportResponse};
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use tauri::{Emitter, Manager};

static EXPORT_ID: AtomicU64 = AtomicU64::new(0);

fn get_export_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let conn = get_db_connection(app_handle)?;

    // Try to get the export_directory from settings
    let export_dir_str: Option<String> = conn
        .query_row(
            "SELECT export_directory FROM settings WHERE id = 1",
            [],
            |row| row.get(0),
        )
        .map_err(|_| "Failed to read export directory from settings".to_string())?;

    let export_dir_str = export_dir_str.unwrap_or_else(get_default_export_dir);
    let export_dir = PathBuf::from(&export_dir_str);

    fs::create_dir_all(&export_dir)
        .map_err(|e| format!("Failed to create export directory: {}", e))?;
    Ok(export_dir)
}

#[tauri::command]
pub async fn export_coins(
    app_handle: tauri::AppHandle,
    format: ExportFormat,
) -> Result<ExportResponse, String> {
    match format {
        ExportFormat::Csv => {
            let conn = get_db_connection(&app_handle)?;
            let export_dir = get_export_dir(&app_handle)?;

            let query = "
                SELECT c.id, c.title, c.value, c.currency, c.year,
                       i.id, i.name, i.start_year, i.end_year, i.flag,
                       c.description, c.obverse_image, c.reverse_image, c.quantity,
                       c.sale_value, c.notes, c.created_at, c.notebook_id, c.notebook_position
                FROM coins c
                LEFT JOIN issuers i ON c.issuer_id = i.id
                ORDER BY c.year DESC
            ";

            let mut stmt = conn
                .prepare(query)
                .map_err(|e| format!("Failed to prepare statement: {}", e))?;

            let coins = stmt
                .query_map([], |row| build_coin_from_row(row))
                .map_err(|e| format!("Failed to query coins: {}", e))?;

            let coin_list: Vec<_> = coins
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| format!("Failed to collect coins: {}", e))?;

            export_as_csv(&coin_list, &export_dir)
        }
        ExportFormat::Json => {
            let conn = get_db_connection(&app_handle)?;
            let export_dir = get_export_dir(&app_handle)?;

            let query = "
                SELECT c.id, c.title, c.value, c.currency, c.year,
                       i.id, i.name, i.start_year, i.end_year, i.flag,
                       c.description, c.obverse_image, c.reverse_image, c.quantity,
                       c.sale_value, c.notes, c.created_at, c.notebook_id, c.notebook_position
                FROM coins c
                LEFT JOIN issuers i ON c.issuer_id = i.id
                ORDER BY c.year DESC
            ";

            let mut stmt = conn
                .prepare(query)
                .map_err(|e| format!("Failed to prepare statement: {}", e))?;

            let coins = stmt
                .query_map([], |row| build_coin_from_row(row))
                .map_err(|e| format!("Failed to query coins: {}", e))?;

            let coin_list: Vec<_> = coins
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| format!("Failed to collect coins: {}", e))?;

            export_as_json(&coin_list, &export_dir)
        }
        ExportFormat::Image => {
            // Generate unique operation ID
            let op_id = EXPORT_ID.fetch_add(1, Ordering::SeqCst);

            // Run image export in background thread with event notification
            let app_handle_clone = app_handle.clone();
            let export_dir = get_export_dir(&app_handle)?;

            tokio::task::spawn_blocking(move || {
                // Emit progress indicator with operation ID
                if let Some(window) = app_handle_clone.get_webview_window("main") {
                    let _ = window.emit("image_export_started", serde_json::json!({ "op_id": op_id }));
                }

                // Perform export
                let export_result = export_as_images(&app_handle_clone, &export_dir);

                // Emit result exactly once with operation ID
                if let Some(window) = app_handle_clone.get_webview_window("main") {
                    match export_result {
                        Ok(response) => {
                            let _ = window.emit("image_export_completed",
                                serde_json::json!({
                                    "op_id": op_id,
                                    "message": response.message,
                                    "file_path": response.file_path
                                })
                            );
                        }
                        Err(e) => {
                            let _ = window.emit(
                                "image_export_error",
                                serde_json::json!({ "op_id": op_id, "error": e }),
                            );
                        }
                    }
                }
            });

            // Return immediately while background task runs
            Ok(ExportResponse {
                success: true,
                message: "Image export started in background".to_string(),
                file_path: None,
            })
        }
    }
}

fn export_as_csv(
    coins: &[crate::types::coins::Coin],
    export_dir: &std::path::Path,
) -> Result<ExportResponse, String> {
    use std::io::Write;

    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let file_path = export_dir.join(format!("coins_export_{}.csv", timestamp));

    let mut file =
        fs::File::create(&file_path).map_err(|e| format!("Failed to create CSV file: {}", e))?;

    // Write CSV header
    writeln!(
        file,
        "ID,Title,Value,Currency,Year,Issuer,Description,Quantity,Sale Value,Notes,Created At"
    )
    .map_err(|e| format!("Failed to write CSV header: {}", e))?;

    // Write CSV rows
    for coin in coins {
        let issuer_name = &coin.issuer.name;
        let description = coin.description.as_deref().unwrap_or("");
        let notes = coin.notes.as_deref().unwrap_or("");
        let sale_value = coin.sale_value.map(|v| v.to_string()).unwrap_or_default();

        writeln!(
            file,
            "\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\"",
            coin.id,
            coin.title.replace("\"", "\"\""),
            coin.value,
            coin.currency,
            coin.year,
            issuer_name.replace("\"", "\"\""),
            description.replace("\"", "\"\""),
            coin.quantity,
            sale_value,
            notes.replace("\"", "\"\""),
            coin.created_at
        )
        .map_err(|e| format!("Failed to write CSV row: {}", e))?;
    }

    Ok(ExportResponse {
        success: true,
        message: format!("Successfully exported {} coins to CSV", coins.len()),
        file_path: Some(file_path.to_string_lossy().to_string()),
    })
}

fn export_as_json(
    coins: &[crate::types::coins::Coin],
    export_dir: &std::path::Path,
) -> Result<ExportResponse, String> {
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let file_path = export_dir.join(format!("coins_export_{}.json", timestamp));

    let json = serde_json::to_string_pretty(&coins)
        .map_err(|e| format!("Failed to serialize coins to JSON: {}", e))?;

    fs::write(&file_path, json).map_err(|e| format!("Failed to write JSON file: {}", e))?;

    Ok(ExportResponse {
        success: true,
        message: format!("Successfully exported {} coins to JSON", coins.len()),
        file_path: Some(file_path.to_string_lossy().to_string()),
    })
}

fn zip_directory(
    dir_path: &std::path::Path,
    zip_writer: &mut zip::ZipWriter<fs::File>,
    prefix: &str,
) -> Result<usize, String> {
    let mut count = 0;
    let entries = fs::read_dir(dir_path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;

    let options = zip::write::FileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();

        if path.is_file() {
            let file_name = path
                .file_name()
                .and_then(|n| n.to_str())
                .ok_or_else(|| "Invalid file name".to_string())?;
            let zip_path = format!("{}{}", prefix, file_name);

            let file_data =
                fs::read(&path).map_err(|e| format!("Failed to read file: {}", e))?;

            zip_writer
                .start_file(&zip_path, options)
                .map_err(|e| format!("Failed to start zip file: {}", e))?;
            zip_writer
                .write_all(&file_data)
                .map_err(|e| format!("Failed to write to zip: {}", e))?;

            count += 1;
        }
    }

    Ok(count)
}

fn export_as_images(
    app_handle: &tauri::AppHandle,
    export_dir: &std::path::Path,
) -> Result<ExportResponse, String> {
    // Get the coin_images directory
    let images_dir = get_images_dir(app_handle)?;

    // Check if images directory has files
    let entries = fs::read_dir(&images_dir)
        .map_err(|e| format!("Failed to read images directory: {}", e))?;
    let has_images = entries.count() > 0;

    if !has_images {
        return Err("No coin images found to export".to_string());
    }

    // Create zip file in export directory
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let zip_filename = format!("coin_images_{}.zip", timestamp);
    let zip_path = export_dir.join(&zip_filename);

    let zip_file = fs::File::create(&zip_path)
        .map_err(|e| format!("Failed to create zip file: {}", e))?;
    let mut zip = zip::ZipWriter::new(zip_file);

    // Zip the entire images directory
    let exported_count = zip_directory(&images_dir, &mut zip, "")?;

    zip.finish()
        .map_err(|e| format!("Failed to finalize zip file: {}", e))?;

    Ok(ExportResponse {
        success: true,
        message: format!(
            "Successfully exported {} coin images to archive",
            exported_count
        ),
        file_path: Some(zip_path.to_string_lossy().to_string()),
    })
}
