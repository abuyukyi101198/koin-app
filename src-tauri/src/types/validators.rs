use chrono::{Datelike, Local};
use url::Url;
use validator::ValidationError;

pub fn validate_float_range(value: f64, min: f64, max: f64) -> Result<(), ValidationError> {
    if !value.is_finite() {
        return Err(ValidationError::new("invalid_number"));
    }
    if value < min {
        return Err(ValidationError::new("below_minimum"));
    }
    if value > max {
        return Err(ValidationError::new("above_maximum"));
    }
    Ok(())
}

pub fn validate_int_range(value: i32, min: i32, max: i32) -> Result<(), ValidationError> {
    if value < min {
        return Err(ValidationError::new("below_minimum"));
    }
    if value > max {
        return Err(ValidationError::new("above_maximum"));
    }
    Ok(())
}

pub fn validate_numeric_non_negative(value: f64) -> Result<(), ValidationError> {
    validate_float_range(value, 0.0, f64::MAX)
}

pub fn validate_year(year: i32) -> Result<(), ValidationError> {
    let current_year = Local::now().year();
    validate_int_range(year, 0, current_year)
}

pub fn validate_quantity(quantity: i32) -> Result<(), ValidationError> {
    validate_int_range(quantity, 1, 99)
}

pub fn validate_sale_value_positive(value: f64) -> Result<(), ValidationError> {
    validate_float_range(value, 0.0_f64.next_up(), f64::MAX)
}

pub fn validate_notebook_grid_dimension(value: i32) -> Result<(), ValidationError> {
    validate_int_range(value, 1, 50)
}

pub fn validate_url_or_data(url_str: &str) -> Result<(), ValidationError> {
    if url_str.is_empty() {
        return Ok(());
    }
    if url_str.starts_with("data:") {
        return Ok(());
    }
    // Accept absolute file paths (e.g. /Users/.../image.jpg or C:\...\image.jpg).
    // Commands that call this validator apply a stricter follow-up check to ensure
    // any local path is actually inside the app's managed images directory.
    if url_str.starts_with('/') {
        return Ok(());
    }
    if url_str.len() >= 3 {
        let mut chars = url_str.chars();
        let drive = chars.next().unwrap_or_default();
        let colon = chars.next().unwrap_or_default();
        let sep = chars.next().unwrap_or_default();
        if drive.is_ascii_alphabetic() && colon == ':' && (sep == '\\' || sep == '/') {
            return Ok(());
        }
    }
    Url::parse(url_str)
        .map(|_| ())
        .map_err(|_| ValidationError::new("invalid_url"))
}
