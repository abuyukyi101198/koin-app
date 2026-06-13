use crate::commands::utils::{get_db_connection, get_default_export_dir};
use crate::types::coins::ImageProcessingMode;
use crate::types::settings::{Settings, ThemeMode, ThemeName, UpdateSettingsRequest};

fn parse_image_processing_mode(value: &str) -> ImageProcessingMode {
    match value {
        "download" => ImageProcessingMode::Download,
        "download_and_remove_bg" => ImageProcessingMode::DownloadAndRemoveBg,
        _ => ImageProcessingMode::None,
    }
}

fn image_processing_mode_to_str(mode: &ImageProcessingMode) -> &'static str {
    match mode {
        ImageProcessingMode::Download => "download",
        ImageProcessingMode::DownloadAndRemoveBg => "download_and_remove_bg",
        ImageProcessingMode::None => "none",
    }
}

fn parse_theme_name(value: &str) -> ThemeName {
    match value {
        "quarter" => ThemeName::Quarter,
        "mark" => ThemeName::Mark,
        "peso" => ThemeName::Peso,
        "franc" => ThemeName::Franc,
        "dinar" => ThemeName::Dinar,
        _ => ThemeName::Lira,
    }
}

fn theme_name_to_str(name: &ThemeName) -> &'static str {
    match name {
        ThemeName::Lira => "lira",
        ThemeName::Quarter => "quarter",
        ThemeName::Mark => "mark",
        ThemeName::Peso => "peso",
        ThemeName::Franc => "franc",
        ThemeName::Dinar => "dinar",
    }
}

fn parse_theme_mode(value: &str) -> ThemeMode {
    match value {
        "light" => ThemeMode::Light,
        _ => ThemeMode::Dark,
    }
}

fn theme_mode_to_str(mode: &ThemeMode) -> &'static str {
    match mode {
        ThemeMode::Light => "light",
        ThemeMode::Dark => "dark",
    }
}

#[tauri::command]
pub fn get_settings(app_handle: tauri::AppHandle) -> Result<Settings, String> {
    let conn = get_db_connection(&app_handle)?;

    let (image_processing_default, theme_name, theme_mode, export_directory): (String, String, String, Option<String>) = conn
        .query_row(
            "SELECT image_processing_default, theme_name, theme_mode, export_directory FROM settings WHERE id = 1",
            [],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
        )
        .map_err(|e| format!("Failed to load settings: {}", e))?;

    Ok(Settings {
        image_processing_default: parse_image_processing_mode(&image_processing_default),
        theme_name: parse_theme_name(&theme_name),
        theme_mode: parse_theme_mode(&theme_mode),
        export_directory: export_directory.or_else(|| Some(get_default_export_dir())),
    })
}

#[tauri::command]
pub fn update_settings(
    app_handle: tauri::AppHandle,
    settings: UpdateSettingsRequest,
) -> Result<Settings, String> {
    let conn = get_db_connection(&app_handle)?;

    let mut updates: Vec<&str> = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(ref mode) = settings.image_processing_default {
        updates.push("image_processing_default = ?");
        params.push(Box::new(image_processing_mode_to_str(mode).to_string()));
    }
    if let Some(ref name) = settings.theme_name {
        updates.push("theme_name = ?");
        params.push(Box::new(theme_name_to_str(name).to_string()));
    }
    if let Some(ref mode) = settings.theme_mode {
        updates.push("theme_mode = ?");
        params.push(Box::new(theme_mode_to_str(mode).to_string()));
    }
    if let Some(ref dir) = settings.export_directory {
        updates.push("export_directory = ?");
        params.push(Box::new(dir.clone()));
    }

    if !updates.is_empty() {
        let query = format!("UPDATE settings SET {} WHERE id = 1", updates.join(", "));
        conn.execute(&query, rusqlite::params_from_iter(params))
            .map_err(|e| format!("Failed to update settings: {}", e))?;
    }

    get_settings(app_handle)
}
