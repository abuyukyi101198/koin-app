use chrono::{Datelike, Local};
use url::Url;
use validator::ValidationError;

pub fn validate_numeric_non_negative(value: f64) -> Result<(), ValidationError> {
    if !value.is_finite() {
        return Err(ValidationError::new("invalid_number"));
    }
    if value < 0.0 {
        return Err(ValidationError::new("negative_value"));
    }
    Ok(())
}

pub fn validate_year(year: i32) -> Result<(), ValidationError> {
    if year < 0 {
        return Err(ValidationError::new("negative_year"));
    }
    let current_year = Local::now().year();
    if year > current_year {
        return Err(ValidationError::new("future_year"));
    }
    Ok(())
}

pub fn validate_quantity(quantity: i32) -> Result<(), ValidationError> {
    if quantity < 1 || quantity > 99 {
        return Err(ValidationError::new("quantity_out_of_range"));
    }
    Ok(())
}

pub fn validate_sale_value_positive(value: f64) -> Result<(), ValidationError> {
    if !value.is_finite() {
        return Err(ValidationError::new("invalid_number"));
    }
    if value <= 0.0 {
        return Err(ValidationError::new("non_positive_value"));
    }
    Ok(())
}

pub fn validate_url_or_data(url_str: &str) -> Result<(), ValidationError> {
    if url_str.is_empty() {
        return Ok(());
    }
    if url_str.starts_with("data:") {
        return Ok(());
    }
    Url::parse(url_str)
        .map(|_| ())
        .map_err(|_| ValidationError::new("invalid_url"))
}

pub fn validate_non_negative_integer(value: i32) -> Result<(), ValidationError> {
    if value < 0 {
        return Err(ValidationError::new("negative_value"));
    }
    Ok(())
}
