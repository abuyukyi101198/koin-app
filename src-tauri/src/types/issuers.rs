use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Issuer {
    pub id: i32,
    pub name: String,
    pub flag: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedIssuersResponse {
    pub data: Vec<Issuer>,
    pub total: i64,
}
