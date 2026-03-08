use crate::types::coins::Coin;
use crate::types::validators::validate_notebook_grid_dimension;
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Notebook {
    pub id: i32,
    pub title: String,
    pub description: Option<String>,
    pub rows_per_page: i32,
    pub columns_per_page: i32,
    pub number_of_pages: i32,
    pub created_at: String,
    /// All pages: cells[page][row][col]
    pub cells: Vec<Vec<Vec<Option<Coin>>>>,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct CreateNotebookRequest {
    #[validate(length(max = 100, message = "Title cannot exceed 100 characters"))]
    pub title: String,

    #[validate(length(max = 100, message = "Description cannot exceed 100 characters"))]
    pub description: Option<String>,

    #[validate(custom = "validate_notebook_grid_dimension")]
    pub rows_per_page: i32,

    #[validate(custom = "validate_notebook_grid_dimension")]
    pub columns_per_page: i32,

    #[validate(custom = "validate_notebook_grid_dimension")]
    pub number_of_pages: i32,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct UpdateNotebookRequest {
    pub id: i32,

    #[validate(length(max = 100, message = "Title cannot exceed 100 characters"))]
    pub title: Option<String>,

    #[validate(length(max = 100, message = "Description cannot exceed 100 characters"))]
    pub description: Option<String>,

    #[validate(custom = "validate_notebook_grid_dimension")]
    pub rows_per_page: Option<i32>,

    #[validate(custom = "validate_notebook_grid_dimension")]
    pub columns_per_page: Option<i32>,

    #[validate(custom = "validate_notebook_grid_dimension")]
    pub number_of_pages: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CoinPosition {
    pub coin_id: i32,
    pub position: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReorderCoinsRequest {
    pub notebook_id: i32,
    pub coins: Vec<CoinPosition>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedNotebooksResponse {
    pub items: Vec<Notebook>,
    pub total: i64,
}
