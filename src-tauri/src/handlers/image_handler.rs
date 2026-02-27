use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use std::io::Cursor;

const MAX_IMAGE_DIMENSION: u32 = 512;

pub async fn process_image(image_source: Option<String>) -> Result<Option<String>, String> {
    let Some(source) = image_source else {
        return Ok(None);
    };

    let image_bytes = if source.starts_with("data:") {
        // Extract base64 data from data URL
        extract_base64_from_data_url(&source)?
    } else {
        // Download image from URL
        download_image(&source).await?
    };

    // Compress and optimize the image
    let compressed = compress_image(image_bytes)?;

    // Convert to data URL
    let data_url = create_data_url(&compressed);
    Ok(Some(data_url))
}

fn extract_base64_from_data_url(data_url: &str) -> Result<Vec<u8>, String> {
    // Format: data:image/jpeg;base64,<base64_data>
    let parts: Vec<&str> = data_url.split(',').collect();
    if parts.len() != 2 {
        return Err("Invalid data URL format".to_string());
    }

    STANDARD
        .decode(parts[1])
        .map_err(|e| format!("Failed to decode base64: {}", e))
}

async fn download_image(url: &str) -> Result<Vec<u8>, String> {
    let response = reqwest::get(url)
        .await
        .map_err(|e| format!("Failed to download image: {}", e))?;

    response
        .bytes()
        .await
        .map(|b| b.to_vec())
        .map_err(|e| format!("Failed to read image bytes: {}", e))
}

fn compress_image(image_bytes: Vec<u8>) -> Result<Vec<u8>, String> {
    // Try to detect and decode the image
    let img = if let Ok(i) = image::load(Cursor::new(&image_bytes), image::ImageFormat::Jpeg) {
        i
    } else if let Ok(i) = image::load(Cursor::new(&image_bytes), image::ImageFormat::Png) {
        i
    } else if let Ok(i) = image::load(Cursor::new(&image_bytes), image::ImageFormat::WebP) {
        i
    } else if let Ok(i) = image::load(Cursor::new(&image_bytes), image::ImageFormat::Gif) {
        i
    } else {
        return Err("Failed to decode image: unsupported format".to_string());
    };

    // Resize if necessary
    let resized = if img.width() > MAX_IMAGE_DIMENSION || img.height() > MAX_IMAGE_DIMENSION {
        img.thumbnail(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION)
    } else {
        img
    };

    // Encode as JPEG with quality setting
    let mut cursor = Cursor::new(Vec::new());
    resized
        .write_to(&mut cursor, image::ImageFormat::Jpeg)
        .map_err(|e| format!("Failed to encode image: {}", e))?;

    Ok(cursor.into_inner())
}

fn create_data_url(image_bytes: &[u8]) -> String {
    let encoded = STANDARD.encode(image_bytes);
    format!("data:image/jpeg;base64,{}", encoded)
}
