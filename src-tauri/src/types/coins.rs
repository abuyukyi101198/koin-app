use crate::types::issuers::IssuerDisplay;
use crate::types::validators::{
    validate_numeric_non_negative, validate_quantity, validate_sale_value_positive,
    validate_url_or_data, validate_year,
};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Coin {
    pub id: i32,
    pub title: String,
    pub value: f64,
    pub currency: String,
    pub year: i32,
    pub issuer: IssuerDisplay,
    pub description: Option<String>,
    pub obverse_image: Option<String>,
    pub reverse_image: Option<String>,
    pub quantity: i32,
    pub sale_value: Option<f64>,
    pub notes: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct CreateCoinRequest {
    #[validate(custom = "validate_numeric_non_negative")]
    pub value: f64,

    #[validate(length(max = 50, message = "Currency cannot exceed 50 characters"))]
    pub currency: String,

    #[validate(custom = "validate_year")]
    pub year: i32,

    pub issuer_id: i32,

    #[validate(length(max = 100, message = "Description cannot exceed 100 characters"))]
    pub description: Option<String>,

    #[validate(custom = "validate_url_or_data")]
    pub obverse_image: Option<String>,

    #[validate(custom = "validate_url_or_data")]
    pub reverse_image: Option<String>,

    #[validate(custom = "validate_quantity")]
    pub quantity: Option<i32>,

    #[validate(custom = "validate_sale_value_positive")]
    pub sale_value: Option<f64>,

    #[validate(length(max = 1000, message = "Notes cannot exceed 1000 characters"))]
    pub notes: Option<String>,

    /// Download and store images locally as data URLs
    pub download_images: Option<bool>,
    // Note: title is generated internally as "{value} {currency} {year}"
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct UpdateCoinRequest {
    pub id: i32,

    #[validate(custom = "validate_numeric_non_negative")]
    pub value: Option<f64>,

    #[validate(length(max = 50, message = "Currency cannot exceed 50 characters"))]
    pub currency: Option<String>,

    #[validate(custom = "validate_year")]
    pub year: Option<i32>,

    pub issuer_id: Option<i32>,

    #[validate(length(max = 100, message = "Description cannot exceed 100 characters"))]
    pub description: Option<String>,

    #[validate(custom = "validate_url_or_data")]
    pub obverse_image: Option<String>,

    #[validate(custom = "validate_url_or_data")]
    pub reverse_image: Option<String>,

    #[validate(custom = "validate_quantity")]
    pub quantity: Option<i32>,

    #[validate(custom = "validate_sale_value_positive")]
    pub sale_value: Option<f64>,

    #[validate(length(max = 1000, message = "Notes cannot exceed 1000 characters"))]
    pub notes: Option<String>,

    /// Download and store images locally as data URLs
    pub download_images: Option<bool>,
    // Note: title is generated internally as "{value} {currency} {year}"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedCoinsResponse {
    pub items: Vec<Coin>,
    pub total: i64,
}

