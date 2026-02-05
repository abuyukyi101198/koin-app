use rusqlite::{Connection, Result as SqliteResult};
use std::fs;
use std::path::Path;

pub fn init_database(db_path: &Path) -> SqliteResult<()> {
    // Check if database already exists at the target location
    if db_path.exists() {
        println!("Database already exists at: {}", db_path.display());
        return Ok(());
    }

    // Fallback: Create database from scratch with migrations and data seeding
    println!("Creating fresh database with migrations and seeding...");
    let conn = Connection::open(db_path)?;

    // Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON", [])?;

    // Run migrations
    run_migrations(&conn)?;

    // Populate issuers from JSON if the table is empty
    if is_issuers_table_empty(&conn)? {
        populate_issuers_from_json(&conn).ok();
    }

    Ok(())
}

fn run_migrations(conn: &Connection) -> SqliteResult<()> {
    // Create migration tracking table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Migration 1: Create issuers table
    apply_migration(
        conn,
        "001_create_issuers_table",
        r#"
            CREATE TABLE issuers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                flag TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX idx_issuers_name ON issuers(name);
        "#,
    )?;

    // Migration 2: Create coins table with issuer foreign key
    apply_migration(
        conn,
        "002_create_coins_table",
        r#"
            CREATE TABLE coins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                value REAL NOT NULL,
                currency TEXT NOT NULL,
                year INTEGER NOT NULL,
                issuer_id INTEGER NOT NULL,
                obverse_image TEXT,
                reverse_image TEXT,
                quantity INTEGER DEFAULT 1,
                sale_value REAL,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (issuer_id) REFERENCES issuers(id) ON DELETE RESTRICT
            );

            CREATE INDEX idx_coins_issuer_id ON coins(issuer_id);
            CREATE INDEX idx_coins_year ON coins(year);
            CREATE INDEX idx_coins_currency ON coins(currency);
        "#,
    )?;

    Ok(())
}

fn apply_migration(conn: &Connection, name: &str, sql: &str) -> SqliteResult<()> {
    // Check if migration has already been applied
    let mut stmt = conn.prepare("SELECT COUNT(*) as count FROM migrations WHERE name = ?1")?;

    let already_applied: i32 = stmt.query_row([name], |row| row.get(0))?;

    if already_applied > 0 {
        println!("Migration '{}' already applied, skipping.", name);
        return Ok(());
    }

    // Execute migration
    conn.execute_batch(sql)?;

    // Record migration
    conn.execute("INSERT INTO migrations (name) VALUES (?1)", [name])?;

    println!("Applied migration: {}", name);
    Ok(())
}

fn is_issuers_table_empty(conn: &Connection) -> SqliteResult<bool> {
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM issuers")?;
    let count: i64 = stmt.query_row([], |row| row.get(0))?;
    Ok(count == 0)
}

fn populate_issuers_from_json(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    #[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
    struct IssuerData {
        name: String,
        flag: Option<String>,
    }

    #[derive(Debug, serde::Serialize, serde::Deserialize)]
    struct IssuersJson {
        count: i32,
        issuers: Vec<IssuerData>,
    }

    // Try multiple paths to locate issuers.json
    let json_path = find_issuers_json()?;

    if !json_path.exists() {
        eprintln!("Warning: issuers.json not found at {}", json_path.display());
        println!("Continuing with empty issuers table");
        return Ok(());
    }

    println!("Loading issuers from: {}", json_path.display());

    let json_content = fs::read_to_string(&json_path)?;
    let data: IssuersJson = serde_json::from_str(&json_content)?;

    // Insert issuers
    let mut stmt = conn.prepare("INSERT INTO issuers (name, flag) VALUES (?1, ?2)")?;

    let mut count = 0;
    for issuer in &data.issuers {
        stmt.execute(rusqlite::params![&issuer.name, &issuer.flag])?;
        count += 1;
    }

    println!("✓ Populated {} issuers from JSON", count);

    Ok(())
}

fn find_issuers_json() -> Result<std::path::PathBuf, Box<dyn std::error::Error>> {
    // List of paths to check in order of preference
    let possible_paths = vec![
        // Development: current working directory (from project root)
        std::env::current_dir()?.join("../resources/issuers.json"),
        // Development: relative to executable in target/debug or target/release
        std::env::current_exe()?
            .parent()
            .ok_or("Could not get executable directory")?
            .join("../../resources/issuers.json"),
        // macOS app bundle: Contents/Resources/issuers.json
        std::env::current_exe()?
            .parent()
            .and_then(|p| p.parent())
            .and_then(|p| p.parent())
            .ok_or("Could not traverse to app bundle")?
            .join("Resources/issuers.json"),
    ];

    // Return the first path that exists, or the first one tried if none exist
    for path in possible_paths.iter() {
        if path.exists() {
            return Ok(path.clone());
        }
    }

    // Return the first path anyway (for error messaging)
    Ok(possible_paths.into_iter().next().unwrap())
}
