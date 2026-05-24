use rusqlite::{Connection, Result as SqliteResult};
use std::fs;
use std::path::Path;

pub fn init_database(db_path: &Path, images_dir: &Path) -> Result<(), String> {
    fs::create_dir_all(images_dir)
        .map_err(|e| format!("Failed to create coin_images directory: {}", e))?;

    let conn = Connection::open(db_path)
        .map_err(|e| format!("Failed to open database: {}", e))?;

    conn.execute("PRAGMA foreign_keys = ON", [])
        .map_err(|e| format!("Failed to enable foreign keys: {}", e))?;

    run_migrations(&conn).map_err(|e| format!("SQL migration failed: {}", e))?;

    if is_issuers_table_empty(&conn)
        .map_err(|e| format!("Failed to check issuers table: {}", e))?
    {
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
                name TEXT NOT NULL,
                continent TEXT,
                start_year INTEGER,
                end_year INTEGER,
                flag TEXT NOT NULL,
                parent_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES issuers(id) ON DELETE CASCADE
            );

            CREATE INDEX idx_issuers_name ON issuers(name);
            CREATE INDEX idx_issuers_temporal ON issuers(name, start_year, end_year, flag);
            CREATE INDEX idx_issuers_parent_id ON issuers(parent_id);
        "#,
    )?;

    // Migration 2: Create coins table
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
                description TEXT,
                obverse_image TEXT,
                reverse_image TEXT,
                quantity INTEGER DEFAULT 1,
                sale_value REAL,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                notebook_id INTEGER,
                notebook_position INTEGER,
                FOREIGN KEY (issuer_id) REFERENCES issuers(id) ON DELETE RESTRICT,
                FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE SET NULL
            );

            CREATE INDEX idx_coins_issuer_id ON coins(issuer_id);
            CREATE INDEX idx_coins_year ON coins(year);
            CREATE INDEX idx_coins_currency ON coins(currency);
            CREATE INDEX idx_coins_notebook_id ON coins(notebook_id);
            CREATE INDEX idx_coins_notebook_position ON coins(notebook_id, notebook_position);
        "#,
    )?;

    // Migration 3: Create notebooks table
    apply_migration(
        conn,
        "003_create_notebooks_table",
        r#"
            CREATE TABLE notebooks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                rows_per_page INTEGER NOT NULL DEFAULT 5,
                columns_per_page INTEGER NOT NULL DEFAULT 4,
                number_of_pages INTEGER NOT NULL DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX idx_notebooks_title ON notebooks(title);
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
    // Predecessor struct: no predecessors of its own (one-level-only nesting)
    #[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
    struct PredecessorIssuer {
        name: String,
        continent: Option<String>,
        start_year: Option<i32>,
        end_year: Option<i32>,
        flag: String,
    }

    // Root issuer struct: can have predecessors, but they cannot have their own predecessors
    #[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
    struct Issuer {
        name: String,
        continent: Option<String>,
        start_year: Option<i32>,
        end_year: Option<i32>,
        flag: String,
        #[serde(default)]
        predecessors: Vec<PredecessorIssuer>,
    }

    // Load issuers as a top-level array (new format)
    let json_path = find_issuers_json()?;

    if !json_path.exists() {
        eprintln!("Warning: issuers.json not found at {}", json_path.display());
        println!("Continuing with empty issuers table");
        return Ok(());
    }

    println!("Loading issuers from: {}", json_path.display());

    let json_content = fs::read_to_string(&json_path)?;
    let data: Vec<Issuer> = serde_json::from_str(&json_content)?;

    // Helper function to check if an issuer already exists by composite key
    // Conflict is based on (name, start_year, end_year, flag) equality
    fn issuer_exists(
        conn: &Connection,
        name: &str,
        start_year: Option<i32>,
        end_year: Option<i32>,
        flag: &str,
    ) -> Result<bool, rusqlite::Error> {
        let mut stmt = conn.prepare(
            "SELECT COUNT(*) FROM issuers WHERE name = ?1 AND start_year IS ?2 AND end_year IS ?3 AND flag IS ?4"
        )?;
        let count: i64 = stmt
            .query_row(rusqlite::params![name, start_year, end_year, flag], |row| {
                row.get(0)
            })?;
        Ok(count > 0)
    }

    // Insert issuers and their predecessors (one level only)
    let mut count = 0;
    let mut skipped = 0;

    for issuer in &data {
        // Check if modern issuer already exists by composite key
        if !issuer_exists(
            conn,
            &issuer.name,
            issuer.start_year,
            issuer.end_year,
            &issuer.flag,
        )? {
            // Insert the modern issuer first (parent_id = NULL for base-level issuers)
            conn.execute(
                "INSERT INTO issuers (name, continent, start_year, end_year, flag, parent_id) VALUES (?1, ?2, ?3, ?4, ?5, NULL)",
                rusqlite::params![
                    &issuer.name,
                    &issuer.continent,
                    &issuer.start_year,
                    &issuer.end_year,
                    &issuer.flag
                ],
            )
            .map_err(|e| format!("Failed to insert issuer: {}", e))?;

            let parent_id = conn.last_insert_rowid();
            count += 1;

            // Then iterate predecessors in order (recent → old)
            // Predecessors are linked to the modern issuer via parent_id
            for predecessor in &issuer.predecessors {
                // Check if predecessor already exists by composite key
                if !issuer_exists(
                    conn,
                    &predecessor.name,
                    predecessor.start_year,
                    predecessor.end_year,
                    &predecessor.flag,
                )? {
                    conn.execute(
                        "INSERT INTO issuers (name, continent, start_year, end_year, flag, parent_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                        rusqlite::params![
                            &predecessor.name,
                            &predecessor.continent,
                            &predecessor.start_year,
                            &predecessor.end_year,
                            &predecessor.flag,
                            parent_id
                        ],
                    )
                    .map_err(|e| format!("Failed to insert predecessor: {}", e))?;
                    count += 1;
                } else {
                    skipped += 1;
                }
            }
        } else {
            skipped += 1;
        }
    }

    println!(
        "✓ Populated {} issuers from JSON (skipped {} duplicates)",
        count, skipped
    );

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
