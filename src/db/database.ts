import Database from 'better-sqlite3';
import { join } from 'node:path';

let db: Database.Database | null = null;

/**
 * Gets the singleton database connection.
 * Creates the database and tables if they don't exist.
 */
export function getDatabase(): Database.Database {
	if (!db) {
		const dbPath = join(process.cwd(), 'data', 'changelogs.db');
		db = new Database(dbPath);

		// Enable WAL mode for better performance
		db.pragma('journal_mode = WAL');

		ensureSchema(db);
	}

	return db;
}

/**
 * Ensures the database schema is created.
 */
function ensureSchema(db: Database.Database): void {
	// Create changelogs table
	db.exec(`
    CREATE TABLE IF NOT EXISTS changelogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      package TEXT NOT NULL,
      version TEXT NOT NULL,
      markdown TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(source, package, version)
    );
  `);

	// Create index for faster lookups by source and package
	db.exec(`
    CREATE INDEX IF NOT EXISTS idx_changelogs_source_package
    ON changelogs(source, package);
  `);

	// Create not_found_versions table
	db.exec(`
    CREATE TABLE IF NOT EXISTS not_found_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      package TEXT NOT NULL,
      version TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(source, package, version)
    );
  `);
}

/**
 * Closes the database connection.
 * Should be called when the application is shutting down.
 */
export function closeDatabase(): void {
	if (db) {
		db.close();
		db = null;
	}
}
