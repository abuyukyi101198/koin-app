use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use image::{ImageBuffer, ImageFormat, Luma, RgbaImage};
use std::collections::VecDeque;
use std::io::Cursor;
use std::time::{SystemTime, UNIX_EPOCH};

const MAX_IMAGE_DIMENSION: u32 = 512;

pub async fn process_image(
    image_source: Option<String>,
    remove_bg: bool,
) -> Result<Option<String>, String> {
    let Some(source) = image_source else {
        return Ok(None);
    };

    let image_bytes = if source.starts_with("data:") {
        extract_base64_from_data_url(&source)?
    } else {
        download_image(&source).await?
    };

    let mut compressed = compress_image(image_bytes)?;

    if remove_bg {
        compressed = remove_background_from_bytes(&compressed)?;
    }

    Ok(Some(create_data_url(
        &compressed,
        if remove_bg {
            ImageFormat::Png
        } else {
            ImageFormat::Jpeg
        },
    )))
}

fn extract_base64_from_data_url(data_url: &str) -> Result<Vec<u8>, String> {
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
    let img = image::load_from_memory(&image_bytes)
        .map_err(|e| format!("Failed to decode image: {}", e))?;

    let resized = if img.width() > MAX_IMAGE_DIMENSION || img.height() > MAX_IMAGE_DIMENSION {
        img.thumbnail(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION)
    } else {
        img
    };

    let mut cursor = Cursor::new(Vec::new());
    resized
        .write_to(&mut cursor, ImageFormat::Jpeg)
        .map_err(|e| format!("Failed to encode image: {}", e))?;
    Ok(cursor.into_inner())
}

fn create_data_url(image_bytes: &[u8], format: ImageFormat) -> String {
    let mime = match format {
        ImageFormat::Png => "image/png",
        _ => "image/jpeg",
    };
    let encoded = STANDARD.encode(image_bytes);
    format!("data:{};base64,{}", mime, encoded)
}

fn remove_background_from_bytes(image_bytes: &[u8]) -> Result<Vec<u8>, String> {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    let temp_path = std::env::temp_dir().join(format!("koin_rmbg_{}.jpg", nanos));

    std::fs::write(&temp_path, image_bytes)
        .map_err(|e| format!("Failed to write temporary image: {}", e))?;

    let mut img = image::open(&temp_path)
        .map_err(|e| format!("Failed to open base image: {}", e))?
        .to_rgba8();

    let (width, height) = img.dimensions();

    let mut true_background: ImageBuffer<Luma<u8>, Vec<u8>> =
        ImageBuffer::from_pixel(width, height, Luma([0u8]));
    let mut bg_queue = VecDeque::new();

    inward_flood_fill(&img, width, height, &mut true_background, &mut bg_queue);
    let mut coin_mask: ImageBuffer<Luma<u8>, Vec<u8>> =
        coin_area_layout_pass(width, height, &true_background);
    centrality_validation_pass(&img, width, height, &true_background, &mut coin_mask);
    coin_mask = erode_mask(&coin_mask, width, height);
    edge_anti_aliasing(&mut img, width, height, &mut coin_mask);

    let mut buf = Cursor::new(Vec::new());
    image::DynamicImage::ImageRgba8(img)
        .write_to(&mut buf, ImageFormat::Png)
        .map_err(|e| format!("Failed to encode PNG: {}", e))?;

    let _ = std::fs::remove_file(&temp_path);

    Ok(buf.into_inner())
}

fn is_white_pixel(x: u32, y: u32, image: &RgbaImage) -> bool {
    let bg_threshold = 242;
    let p = image.get_pixel(x, y);
    ((p[0] as u32 + p[1] as u32 + p[2] as u32) / 3) >= bg_threshold
}

fn inward_flood_fill(
    img: &RgbaImage,
    width: u32,
    height: u32,
    true_background: &mut ImageBuffer<Luma<u8>, Vec<u8>>,
    bg_queue: &mut VecDeque<(u32, u32)>,
) {
    for x in 0..width {
        if is_white_pixel(x, 0, &img) {
            true_background.put_pixel(x, 0, Luma([1u8]));
            bg_queue.push_back((x, 0));
        }
        if is_white_pixel(x, height - 1, &img) {
            true_background.put_pixel(x, height - 1, Luma([1u8]));
            bg_queue.push_back((x, height - 1));
        }
    }
    for y in 0..height {
        if is_white_pixel(0, y, &img) {
            true_background.put_pixel(0, y, Luma([1u8]));
            bg_queue.push_back((0, y));
        }
        if is_white_pixel(width - 1, y, &img) {
            true_background.put_pixel(width - 1, y, Luma([1u8]));
            bg_queue.push_back((width - 1, y));
        }
    }

    while let Some((x, y)) = bg_queue.pop_front() {
        for &(dx, dy) in &[(-1, 0), (1, 0), (0, -1), (0, 1)] {
            let nx = x as i32 + dx;
            let ny = y as i32 + dy;

            if nx >= 0 && nx < width as i32 && ny >= 0 && ny < height as i32 {
                let nx = nx as u32;
                let ny = ny as u32;

                if true_background.get_pixel(nx, ny)[0] == 0 && is_white_pixel(nx, ny, &img) {
                    true_background.put_pixel(nx, ny, Luma([1u8]));
                    bg_queue.push_back((nx, ny));
                }
            }
        }
    }
}

fn coin_area_layout_pass(
    width: u32,
    height: u32,
    true_background: &ImageBuffer<Luma<u8>, Vec<u8>>,
) -> ImageBuffer<Luma<u8>, Vec<u8>> {
    let mut coin_mask: ImageBuffer<Luma<u8>, Vec<u8>> =
        ImageBuffer::from_pixel(width, height, Luma([0u8]));

    for x in 0..width {
        for y in 0..height {
            if true_background.get_pixel(x, y)[0] == 0 {
                coin_mask.put_pixel(x, y, Luma([1u8]));
            }
        }
    }

    coin_mask
}

fn centrality_validation_pass(
    img: &RgbaImage,
    width: u32,
    height: u32,
    true_background: &ImageBuffer<Luma<u8>, Vec<u8>>,
    coin_mask: &mut ImageBuffer<Luma<u8>, Vec<u8>>,
) {
    let mut verified_hole: ImageBuffer<Luma<u8>, Vec<u8>> =
        ImageBuffer::from_pixel(width, height, Luma([0u8]));

    for x in 0..width {
        for y in 0..height {
            if is_white_pixel(x, y, &img)
                && true_background.get_pixel(x, y)[0] == 0
                && verified_hole.get_pixel(x, y)[0] == 0
            {
                let mut hole_queue = VecDeque::new();
                let mut component_pixels = Vec::new();

                hole_queue.push_back((x, y));
                verified_hole.put_pixel(x, y, Luma([1u8]));

                while let Some((hx, hy)) = hole_queue.pop_front() {
                    component_pixels.push((hx, hy));

                    for &(dx, dy) in &[(-1, 0), (1, 0), (0, -1), (0, 1)] {
                        let nhx = hx as i32 + dx;
                        let nhy = hy as i32 + dy;

                        if nhx >= 0 && nhx < width as i32 && nhy >= 0 && nhy < height as i32 {
                            let nhx = nhx as u32;
                            let nhy = nhy as u32;

                            if verified_hole.get_pixel(nhx, nhy)[0] == 0
                                && true_background.get_pixel(nhx, nhy)[0] == 0
                                && is_white_pixel(nhx, nhy, &img)
                            {
                                verified_hole.put_pixel(nhx, nhy, Luma([1u8]));
                                hole_queue.push_back((nhx, nhy));
                            }
                        }
                    }
                }

                let area = component_pixels.len() as f32;
                let mut sum_x: u64 = 0;
                let mut sum_y: u64 = 0;

                let mut min_cluster_x = width;
                let mut max_cluster_x = 0;
                let mut min_cluster_y = height;
                let mut max_cluster_y = 0;

                for &(cx, cy) in &component_pixels {
                    sum_x += cx as u64;
                    sum_y += cy as u64;

                    if cx < min_cluster_x {
                        min_cluster_x = cx;
                    }
                    if cx > max_cluster_x {
                        max_cluster_x = cx;
                    }
                    if cy < min_cluster_y {
                        min_cluster_y = cy;
                    }
                    if cy > max_cluster_y {
                        max_cluster_y = cy;
                    }
                }

                if area > 75.0 {
                    let cluster_cx = (sum_x as f32) / area;
                    let cluster_cy = (sum_y as f32) / area;

                    let dx = cluster_cx - (width as f32 / 2.0);
                    let dy = cluster_cy - (height as f32 / 2.0);
                    let center_deviation = (dx * dx + dy * dy).sqrt();

                    let short_side = if width < height { width } else { height } as f32;
                    let max_allowed_deviation = short_side * 0.05;

                    if center_deviation <= max_allowed_deviation {
                        for &(cx, cy) in &component_pixels {
                            coin_mask.put_pixel(cx, cy, Luma([0u8]));
                        }
                    }
                }
            }
        }
    }
}

fn erode_mask(
    mask: &ImageBuffer<Luma<u8>, Vec<u8>>,
    width: u32,
    height: u32,
) -> ImageBuffer<Luma<u8>, Vec<u8>> {
    let radius: i32 = 3;
    let r2 = radius * radius;
    let mut eroded = ImageBuffer::from_pixel(width, height, Luma([0u8]));
    for y in 0..height {
        for x in 0..width {
            if mask.get_pixel(x, y)[0] == 0 {
                continue;
            }
            let mut keep = true;
            'check: for dy in -radius..=radius {
                for dx in -radius..=radius {
                    if dx * dx + dy * dy > r2 {
                        continue;
                    }
                    let nx = x as i32 + dx;
                    let ny = y as i32 + dy;
                    if nx < 0 || nx >= width as i32 || ny < 0 || ny >= height as i32 {
                        keep = false;
                        break 'check;
                    }
                    if mask.get_pixel(nx as u32, ny as u32)[0] == 0 {
                        keep = false;
                        break 'check;
                    }
                }
            }
            if keep {
                eroded.put_pixel(x, y, Luma([1u8]));
            }
        }
    }
    eroded
}

fn edge_anti_aliasing(
    img: &mut RgbaImage,
    width: u32,
    height: u32,
    coin_mask: &ImageBuffer<Luma<u8>, Vec<u8>>,
) {
    const FEATHER_RADIUS: f32 = 2.0;

    for y in 0..height {
        for x in 0..width {
            let is_coin = coin_mask.get_pixel(x, y)[0] != 0;

            let search_r = FEATHER_RADIUS.ceil() as i32 + 1;
            let mut min_dist = f32::MAX;

            'outer: for dy in -search_r..=search_r {
                for dx in -search_r..=search_r {
                    let nx = x as i32 + dx;
                    let ny = y as i32 + dy;
                    if nx < 0 || nx >= width as i32 || ny < 0 || ny >= height as i32 {
                        if is_coin {
                            let d = ((dx * dx + dy * dy) as f32).sqrt();
                            if d < min_dist {
                                min_dist = d;
                            }
                        }
                        continue;
                    }
                    let neighbour_is_coin = coin_mask.get_pixel(nx as u32, ny as u32)[0] != 0;
                    if neighbour_is_coin != is_coin {
                        let d = ((dx * dx + dy * dy) as f32).sqrt();
                        if d < min_dist {
                            min_dist = d;
                            if min_dist <= 1.0 {
                                break 'outer;
                            }
                        }
                    }
                }
            }

            let alpha = if min_dist == f32::MAX {
                if is_coin {
                    255u8
                } else {
                    0u8
                }
            } else {
                if is_coin {
                    let t = (min_dist / FEATHER_RADIUS).min(1.0);
                    let smooth = t * t * (3.0 - 2.0 * t);
                    (smooth * 255.0).round() as u8
                } else {
                    0u8
                }
            };

            let mut p = *img.get_pixel(x, y);
            p[3] = alpha;
            img.put_pixel(x, y, p);
        }
    }
}
