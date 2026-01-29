import { compareVersionsDescending } from './version-fetchers/version-comparator';

interface ChangelogEntry {
  id: string;
  filePath?: string;
}

/**
 * Extracts the version name from a filepath.
 * Gets the filename and removes the .md extension.
 *
 * @example
 * extractVersionFromPath('crates/ripgrep/0.1.1.md') // '0.1.1'
 * extractVersionFromPath('crates/ripgrep/0.1.1') // '0.1.1'
 * extractVersionFromPath('github/owner/repo/v1.0.0.md') // 'v1.0.0'
 */
export function extractVersionFromPath(filepath: string): string {
  const filename = filepath.split('/').pop() ?? '';
  return filename.replace(/\.md$/, '');
}

/**
 * Extracts the version from a changelog entry, preferring filePath over id
 * to preserve original casing from the filesystem.
 */
export function extractVersionFromEntry(entry: ChangelogEntry): string {
  return extractVersionFromPath(entry.filePath ?? entry.id);
}

/**
 * Sorts changelog entries by version in descending order.
 * Extracts version from filePath or id, then uses semver comparison.
 */
export function sortChangelogEntriesByVersion<T extends ChangelogEntry>(
  entries: T[],
): T[] {
  return entries.sort((a, b) => {
    const versionA = extractVersionFromPath(a.filePath ?? a.id);
    const versionB = extractVersionFromPath(b.filePath ?? b.id);

    return compareVersionsDescending({ version: versionA }, { version: versionB });
  });
}
