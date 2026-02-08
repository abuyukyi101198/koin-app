use crate::types::issuers::PaginatedIssuersResponse;
use crate::{commands, types};
use commands::utils::get_db_connection;
use types::issuers::Issuer;

#[tauri::command]
pub fn list_issuers(
    app_handle: tauri::AppHandle,
    offset: Option<i64>,
    limit: Option<i64>,
    search: Option<String>,
) -> Result<PaginatedIssuersResponse, String> {
    let conn = get_db_connection(&app_handle)?;

    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(50);
    let search_pattern = search.map(|s| format!("%{}%", s));

    // Validate pagination parameters
    if offset < 0 {
        return Err("offset must be non-negative".to_string());
    }
    if limit <= 0 {
        return Err("limit must be positive".to_string());
    }

    // Step 1: Identify base-level issuers that match the search criteria
    // This includes:
    // A) Base-level issuers whose name matches the search
    // B) Base-level issuers that have at least one predecessor matching the search
    let matching_base_ids: Vec<i32> = if let Some(ref pattern) = &search_pattern {
        // Query base-level issuers that either match directly or have matching predecessors
        let mut stmt = conn
            .prepare(
                "SELECT DISTINCT i1.id
                 FROM issuers i1
                 WHERE i1.parent_id IS NULL
                 AND (
                   i1.name LIKE ?1
                   OR EXISTS (
                     SELECT 1 FROM issuers i2
                     WHERE i2.parent_id = i1.id AND i2.name LIKE ?1
                   )
                 )
                 ORDER BY i1.id",
            )
            .map_err(|e| format!("Failed to prepare matching IDs statement: {}", e))?;

        let ids = stmt
            .query_map(rusqlite::params![pattern], |row| row.get::<_, i32>(0))
            .map_err(|e| format!("Failed to query matching base-level IDs: {}", e))?
            .collect::<Result<Vec<i32>, _>>()
            .map_err(|e| format!("Failed to collect matching IDs: {}", e))?;

        ids
    } else {
        // No search: get all base-level issuers
        let mut stmt = conn
            .prepare("SELECT id FROM issuers WHERE parent_id IS NULL ORDER BY id")
            .map_err(|e| format!("Failed to prepare all IDs statement: {}", e))?;

        let ids = stmt
            .query_map([], |row| row.get::<_, i32>(0))
            .map_err(|e| format!("Failed to query all base-level IDs: {}", e))?
            .collect::<Result<Vec<i32>, _>>()
            .map_err(|e| format!("Failed to collect all IDs: {}", e))?;

        ids
    };

    // Total count of matching base-level issuers
    let total: i64 = matching_base_ids.len() as i64;

    // Step 2: Apply pagination to the matching base-level issuers
    let paginated_base_ids: Vec<i32> = matching_base_ids
        .iter()
        .skip(offset as usize)
        .take(limit as usize)
        .copied()
        .collect();

    let mut items: Vec<Issuer> = Vec::new();

    // Step 3: Fetch all base-level issuers for the paginated set (in order)
    // Build a SQL list of IDs for efficient batch fetching
    if !paginated_base_ids.is_empty() {
        let id_placeholders = (0..paginated_base_ids.len())
            .map(|i| format!("?{}", i + 1))
            .collect::<Vec<_>>()
            .join(",");

        let base_query = format!(
            "SELECT id, name, continent, start_year, end_year, flag, created_at
             FROM issuers
             WHERE id IN ({})
             ORDER BY id",
            id_placeholders
        );

        let mut base_stmt = conn
            .prepare(&base_query)
            .map_err(|e| format!("Failed to prepare batch base issuer statement: {}", e))?;

        // Build params for the batch query
        let params: Vec<&dyn rusqlite::ToSql> = paginated_base_ids
            .iter()
            .map(|id| id as &dyn rusqlite::ToSql)
            .collect();

        let base_issuers = base_stmt
            .query_map(params.as_slice(), |row| {
                Ok(Issuer {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    continent: row.get(2)?,
                    start_year: row.get(3)?,
                    end_year: row.get(4)?,
                    flag: row.get(5)?,
                    created_at: row.get(6)?,
                    predecessors: None,
                })
            })
            .map_err(|e| format!("Failed to query batch base issuers: {}", e))?;

        // Step 4: Fetch and attach relevant predecessors for each base-level issuer
        for issuer_result in base_issuers {
            let mut issuer =
                issuer_result.map_err(|e| format!("Failed to map issuer row: {}", e))?;

            // Fetch predecessors: if search is active, only fetch matching predecessors
            // Otherwise, fetch all predecessors
            let pred_query = if let Some(_pattern) = &search_pattern {
                "SELECT id, name, continent, start_year, end_year, flag, created_at
                 FROM issuers
                 WHERE parent_id = ?1 AND name LIKE ?2
                 ORDER BY start_year DESC, end_year DESC"
            } else {
                "SELECT id, name, continent, start_year, end_year, flag, created_at
                 FROM issuers
                 WHERE parent_id = ?1
                 ORDER BY start_year DESC, end_year DESC"
            };

            let mut pred_stmt = conn
                .prepare(pred_query)
                .map_err(|e| format!("Failed to prepare predecessor statement: {}", e))?;

            let predecessors: Box<dyn Iterator<Item = rusqlite::Result<Issuer>>> =
                if let Some(ref pattern) = &search_pattern {
                    Box::new(
                        pred_stmt
                            .query_map(rusqlite::params![issuer.id, pattern], |row| {
                                Ok(Issuer {
                                    id: row.get(0)?,
                                    name: row.get(1)?,
                                    continent: row.get(2)?,
                                    start_year: row.get(3)?,
                                    end_year: row.get(4)?,
                                    flag: row.get(5)?,
                                    created_at: row.get(6)?,
                                    predecessors: None,
                                })
                            })
                            .map_err(|e| format!("Failed to query matching predecessors: {}", e))?,
                    )
                } else {
                    Box::new(
                        pred_stmt
                            .query_map(rusqlite::params![issuer.id], |row| {
                                Ok(Issuer {
                                    id: row.get(0)?,
                                    name: row.get(1)?,
                                    continent: row.get(2)?,
                                    start_year: row.get(3)?,
                                    end_year: row.get(4)?,
                                    flag: row.get(5)?,
                                    created_at: row.get(6)?,
                                    predecessors: None,
                                })
                            })
                            .map_err(|e| format!("Failed to query all predecessors: {}", e))?,
                    )
                };

            let pred_list: Vec<Issuer> = predecessors
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| format!("Failed to collect predecessors: {}", e))?;

            if !pred_list.is_empty() {
                issuer.predecessors = Some(pred_list);
            }

            items.push(issuer);
        }
    }

    Ok(PaginatedIssuersResponse { items, total })
}
