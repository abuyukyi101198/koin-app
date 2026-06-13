use crate::types::coins::ImageProcessingMode;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ThemeName {
    Lira,
    Quarter,
    Mark,
    Peso,
    Franc,
    Dinar,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ThemeMode {
    Light,
    Dark,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    /// Default image processing mode applied when adding or editing a coin.
    /// Mirrors `ImageProcessingMode`: "none" | "download" | "download_and_remove_bg"
    pub image_processing_default: ImageProcessingMode,
    /// The named colour palette to apply to the UI.
    pub theme_name: ThemeName,
    /// Whether the UI is shown in light or dark mode.
    pub theme_mode: ThemeMode,
    /// Directory path where exports should be saved. Defaults to Downloads folder.
    pub export_directory: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateSettingsRequest {
    pub image_processing_default: Option<ImageProcessingMode>,
    pub theme_name: Option<ThemeName>,
    pub theme_mode: Option<ThemeMode>,
    pub export_directory: Option<String>,
}
