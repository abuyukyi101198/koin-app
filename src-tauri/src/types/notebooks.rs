use crate::types::coins::Coin;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Notebook {
    pub id: i32,
    pub title: String,
    pub description: Option<String>,
    pub rows_per_page: i32,
    pub columns_per_page: i32,
    pub number_of_pages: i32,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NotebookPage {
    pub index: i32,
    pub cells: Vec<Vec<Option<Coin>>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NotebookCoin {
    pub id: i32,
    pub notebook_id: i32,
    pub coin_id: i32,
    pub position: i32,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateNotebookRequest {
    pub title: String,
    pub description: Option<String>,
    pub rows_per_page: i32,
    pub columns_per_page: i32,
    pub number_of_pages: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateNotebookRequest {
    pub id: i32,
    pub title: Option<String>,
    pub description: Option<String>,
    pub rows_per_page: Option<i32>,
    pub columns_per_page: Option<i32>,
    pub number_of_pages: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddCoinToNotebookRequest {
    pub notebook_id: i32,
    pub coin_id: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddCoinsToNotebookRequest {
    pub notebook_id: i32,
    pub coin_ids: Vec<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RemoveCoinFromNotebookRequest {
    pub notebook_id: i32,
    pub coin_id: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RemoveCoinsFromNotebookRequest {
    pub notebook_id: i32,
    pub coin_ids: Vec<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CoinPosition {
    pub coin_id: i32,
    pub position: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReorderCoinsRequest {
    pub notebook_id: i32,
    pub coin_id: i32,
    pub new_position: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReorderCoinsInBulkRequest {
    pub notebook_id: i32,
    pub coins: Vec<CoinPosition>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedNotebooksResponse {
    pub items: Vec<Notebook>,
    pub total: i64,
}

