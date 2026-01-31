import { statSync } from 'node:fs';
import { gt, lte, prerelease, valid } from 'semver';
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

    return compareVersionsDescending(
      { version: versionA },
      { version: versionB },
    );
  });
}

/**
 * Gets changelog entries within a version range (from < version <= to).
 * Auto-swaps versions if from > to.
 * Falls back to string comparison for non-semver versions.
 */
export function getVersionsInRange<T extends ChangelogEntry>(
  entries: T[],
  fromVersion: string,
  toVersion: string,
): T[] {
  let from = fromVersion;
  let to = toVersion;

  // Auto-swap if from > to
  if (valid(from) && valid(to) && gt(from, to)) {
    [from, to] = [to, from];
  } else if (!valid(from) || !valid(to)) {
    // For non-semver, use string comparison
    if (from > to) {
      [from, to] = [to, from];
    }
  }

  const sorted = sortChangelogEntriesByVersion([...entries]);

  return sorted.filter((entry) => {
    const v = extractVersionFromEntry(entry);

    if (valid(v) && valid(from) && valid(to)) {
      // Semver comparison: from < v <= to
      return gt(v, from) && lte(v, to);
    }

    // String fallback: from < v <= to
    return v > from && v <= to;
  });
}

/**
 * Gets the file size in bytes for a given file path.
 * Returns 0 if the file doesn't exist or can't be read.
 */
export function getFileSizeBytes(filePath: string): number {
  try {
    const stats = statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Formats a file size in bytes to a human-readable string.
 * Uses bytes for sizes < 1KB, KB for sizes >= 1KB.
 *
 * @example
 * formatFileSize(500) // '500 B'
 * formatFileSize(1024) // '1.0 KB'
 * formatFileSize(2560) // '2.5 KB'
 * formatFileSize(10240) // '10.0 KB'
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
}

/**
 * Gets the formatted file size for a changelog entry.
 * Combines getFileSizeBytes and formatFileSize.
 */
export function getChangelogSize(filePath: string | undefined): string {
  if (!filePath) return '';
  const bytes = getFileSizeBytes(filePath);
  return formatFileSize(bytes);
}

/**
 * Checks if a version string represents a pre-release version.
 * Uses semver's prerelease detection first, then falls back to regex
 * for non-semver versions.
 *
 * @example
 * isPreRelease('1.0.0-alpha') // true
 * isPreRelease('2.0.0-beta.1') // true
 * isPreRelease('3.0.0-rc.2') // true
 * isPreRelease('1.0.0') // false
 * isPreRelease('v2.0.0') // false
 */
export function isPreRelease(version: string): boolean {
  const cleanVersion = version.replace(/^v/, '');
  const prereleaseInfo = prerelease(cleanVersion);
  if (prereleaseInfo !== null) return true;

  // Fallback regex for non-semver versions
  return /[-.]?(alpha|beta|canary|next|rc|dev|preview|snapshot|nightly|pre)/i.test(
    cleanVersion,
  );
}
