use serde::{Deserialize, Serialize};
use crate::types::issuers::Issuer;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Coin {
    pub id: i32,
    pub title: String,
    pub value: f64,
    pub currency: String,
    pub year: i32,
    pub issuer: Issuer,
    pub obverse_image: Option<String>,
    pub reverse_image: Option<String>,
    pub quantity: i32,
    pub sale_value: Option<f64>,
    pub notes: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCoinRequest {
    pub title: String,
    pub value: f64,
    pub currency: String,
    pub year: i32,
    pub issuer_id: i32,
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
    pub currency: Option<String>,
    pub year: Option<i32>,
    pub issuer_id: Option<i32>,
    pub obverse_image: Option<String>,
    pub reverse_image: Option<String>,
    pub quantity: Option<i32>,
    pub sale_value: Option<f64>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedCoinsResponse {
    pub data: Vec<Coin>,
    pub total: i64,
}