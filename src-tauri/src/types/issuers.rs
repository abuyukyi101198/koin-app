use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Issuer {
    pub id: i32,
    pub name: String,
    pub continent: Option<String>,
    pub start_year: Option<i32>,
    pub end_year: Option<i32>,
    pub flag: String,
    #[serde(default)]
    pub predecessors: Option<Vec<Issuer>>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IssuerDisplay {
    pub id: i32,
    pub name: String,
    pub start_year: Option<i32>,
    pub end_year: Option<i32>,
    pub flag: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedIssuersResponse {
    pub items: Vec<Issuer>,
    pub total: i64,
}
