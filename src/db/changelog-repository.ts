import type Database from 'better-sqlite3';
import { getDatabase } from './database';

export interface ChangelogRow {
	id: number;
	source: string;
	package: string;
	version: string;
	markdown: string;
	created_at: string;
}

/**
 * Gets all changelogs from the database.
 */
export function getAllChangelogs(): ChangelogRow[] {
	const db = getDatabase();
	const stmt = db.prepare<[], ChangelogRow>(
		'SELECT * FROM changelogs ORDER BY source, package, version',
	);
	return stmt.all();
}

/**
 * Gets all changelogs for a specific source and package.
 */
export function getChangelogs(source: string, pkg: string): ChangelogRow[] {
	const db = getDatabase();
	const stmt = db.prepare<[string, string], ChangelogRow>(
		'SELECT * FROM changelogs WHERE source = ? AND package = ? ORDER BY version',
	);
	return stmt.all(source, pkg);
}

/**
 * Gets a single changelog entry.
 */
export function getChangelog(
	source: string,
	pkg: string,
	version: string,
): ChangelogRow | undefined {
	const db = getDatabase();
	const stmt = db.prepare<[string, string, string], ChangelogRow>(
		'SELECT * FROM changelogs WHERE source = ? AND package = ? AND version = ?',
	);
	return stmt.get(source, pkg, version);
}

/**
 * Inserts a changelog entry. Ignores if it already exists.
 * Returns true if inserted, false if already exists.
 */
export function insertChangelog(
	source: string,
	pkg: string,
	version: string,
	markdown: string,
): boolean {
	const db = getDatabase();
	const stmt = db.prepare(
		'INSERT OR IGNORE INTO changelogs (source, package, version, markdown) VALUES (?, ?, ?, ?)',
	);
	const result = stmt.run(source, pkg, version, markdown);
	return result.changes > 0;
}

/**
 * Checks if a changelog exists.
 */
export function changelogExists(
	source: string,
	pkg: string,
	version: string,
): boolean {
	const db = getDatabase();
	const stmt = db.prepare<[string, string, string], { count: number }>(
		'SELECT COUNT(*) as count FROM changelogs WHERE source = ? AND package = ? AND version = ?',
	);
	const result = stmt.get(source, pkg, version);
	return (result?.count ?? 0) > 0;
}

/**
 * Marks a version as not found.
 */
export function markVersionNotFound(
	source: string,
	pkg: string,
	version: string,
): void {
	const db = getDatabase();
	const stmt = db.prepare(
		'INSERT OR IGNORE INTO not_found_versions (source, package, version) VALUES (?, ?, ?)',
	);
	stmt.run(source, pkg, version);
}

/**
 * Checks if a version is marked as not found.
 */
export function isVersionNotFound(
	source: string,
	pkg: string,
	version: string,
): boolean {
	const db = getDatabase();
	const stmt = db.prepare<[string, string, string], { count: number }>(
		'SELECT COUNT(*) as count FROM not_found_versions WHERE source = ? AND package = ? AND version = ?',
	);
	const result = stmt.get(source, pkg, version);
	return (result?.count ?? 0) > 0;
}

/**
 * Gets all distinct packages (source + package combinations).
 * Used for generating static paths.
 */
export function getDistinctPackages(): Array<{
	source: string;
	package: string;
}> {
	const db = getDatabase();
	const stmt = db.prepare<
		[],
		{ source: string; package: string }
	>('SELECT DISTINCT source, package FROM changelogs ORDER BY source, package');
	return stmt.all();
}

/**
 * Begins a transaction for batch operations.
 */
export function beginTransaction(): void {
	const db = getDatabase();
	db.prepare('BEGIN TRANSACTION').run();
}

/**
 * Commits the current transaction.
 */
export function commitTransaction(): void {
	const db = getDatabase();
	db.prepare('COMMIT').run();
}

/**
 * Rolls back the current transaction.
 */
export function rollbackTransaction(): void {
	const db = getDatabase();
	db.prepare('ROLLBACK').run();
}
