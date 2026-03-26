import {
  getAllChangelogs,
  getChangelog,
  getChangelogs,
  getDistinctPackages,
} from './changelog-repository';

/**
 * Changelog entry shaped for Astro pages.
 */
export interface ChangelogEntry {
  source: string;
  package: string;
  version: string;
  markdown: string;
  size: number; // byte length of markdown
}

/**
 * Gets all changelog entries for a specific package.
 */
export function getChangelogsForPackage(
  source: string,
  pkg: string,
): ChangelogEntry[] {
  const rows = getChangelogs(source, pkg);
  return rows.map((row) => ({
    source: row.source,
    package: row.package,
    version: row.version,
    markdown: row.markdown,
    size: Buffer.byteLength(row.markdown, 'utf8'),
  }));
}

/**
 * Gets a single changelog entry.
 */
export function getChangelogEntry(
  source: string,
  pkg: string,
  version: string,
): ChangelogEntry | undefined {
  const row = getChangelog(source, pkg, version);
  if (!row) return undefined;

  return {
    source: row.source,
    package: row.package,
    version: row.version,
    markdown: row.markdown,
    size: Buffer.byteLength(row.markdown, 'utf8'),
  };
}

/**
 * Gets all changelog entries from the database.
 */
export function getAllChangelogEntries(): ChangelogEntry[] {
  const rows = getAllChangelogs();
  return rows.map((row) => ({
    source: row.source,
    package: row.package,
    version: row.version,
    markdown: row.markdown,
    size: Buffer.byteLength(row.markdown, 'utf8'),
  }));
}

/**
 * Gets all packages with their versions.
 * Returns a Map keyed by "source/package" for easy lookup.
 */
export function getAllPackagesWithVersions(): Map<string, ChangelogEntry[]> {
  const packages = getDistinctPackages();
  const result = new Map<string, ChangelogEntry[]>();

  for (const { source, package: pkg } of packages) {
    const entries = getChangelogsForPackage(source, pkg);
    result.set(`${source}/${pkg}`, entries);
  }

  return result;
}
