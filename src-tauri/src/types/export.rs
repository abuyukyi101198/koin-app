use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum ExportFormat {
    Csv,
    Json,
    Image,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct ExportCoinsRequest {
    pub format: ExportFormat,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportResponse {
    pub success: bool,
    pub message: String,
    pub file_path: Option<String>,
}


