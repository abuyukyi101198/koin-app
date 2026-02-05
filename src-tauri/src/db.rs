use rusqlite::{Connection, Result as SqliteResult};
use std::path::Path;

pub fn init_database(db_path: &Path) -> SqliteResult<()> {
    let conn = Connection::open(db_path)?;

    // Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON", [])?;

    // Run migrations
    run_migrations(&conn)?;

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

    // Migration 1: Create currencies table
    apply_migration(
        conn,
        "001_create_currencies_table",
        r#"
            CREATE TABLE currencies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX idx_currencies_name ON currencies(name);
        "#,
    )?;

    // Migration 2: Create issuers table
    apply_migration(
        conn,
        "002_create_issuers_table",
        r#"
            CREATE TABLE issuers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX idx_issuers_name ON issuers(name);
        "#,
    )?;

    // Migration 3: Create coins table with foreign keys
    apply_migration(
        conn,
        "003_create_coins_table",
        r#"
            CREATE TABLE coins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                value REAL NOT NULL,
                currency_id INTEGER NOT NULL,
                year INTEGER NOT NULL,
                issuer_id INTEGER NOT NULL,
                obverse_image TEXT,
                reverse_image TEXT,
                quantity INTEGER DEFAULT 1,
                sale_value REAL,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE RESTRICT,
                FOREIGN KEY (issuer_id) REFERENCES issuers(id) ON DELETE RESTRICT
            );

            CREATE INDEX idx_coins_issuer_id ON coins(issuer_id);
            CREATE INDEX idx_coins_year ON coins(year);
            CREATE INDEX idx_coins_currency_id ON coins(currency_id);
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
