import { gt, lte, prerelease, valid } from 'semver';
import { compareVersionsDescending } from './version-fetchers/version-comparator';

interface ChangelogEntry {
  version: string;
}

/**
 * Extracts the version from a changelog entry.
 */
export function extractVersionFromEntry(entry: ChangelogEntry): string {
  return entry.version;
}

/**
 * Sorts changelog entries by version in descending order.
 */
export function sortChangelogEntriesByVersion<T extends ChangelogEntry>(
  entries: T[],
): T[] {
  return entries.sort((a, b) => {
    return compareVersionsDescending(
      { version: a.version },
      { version: b.version },
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
 * Gets the formatted file size for changelog markdown.
 * Takes byte size directly instead of reading from file.
 */
export function getChangelogSize(bytes: number): string {
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

/**
 * Extracts the major version from a semver version string.
 * Handles versions with or without 'v' prefix.
 *
 * @example
 * extractMajorVersion('16.1.1') // '16'
 * extractMajorVersion('v16.1.1') // '16'
 * extractMajorVersion('0.1.0') // '0'
 * extractMajorVersion('invalid') // '0'
 */
export function extractMajorVersion(version: string): string {
  const cleaned = version.replace(/^v/, '');
  const major = cleaned.split('.')[0];
  // Return the major version, or '0' if not parseable
  return /^\d+$/.test(major ?? '') ? major : '0';
}

/**
 * Parsed changelog path components.
 */
export interface ParsedChangelogPath {
  source: string;
  pkg: string;
  version: string;
}

/**
 * Parses a changelog entry ID or file path to extract source, package, and version.
 * Handles both regular and major-version-grouped paths.
 *
 * Path formats:
 * - Regular: {source}/{pkg}/{version}.md
 * - Grouped: {source}/{pkg}/{major}/{version}.md
 * - Scoped: {source}/@{org}/{pkg}/{version}.md
 * - Scoped grouped: {source}/@{org}/{pkg}/{major}/{version}.md
 * - GitHub: github/{owner}/{repo}/{version}.md
 * - GitHub grouped: github/{owner}/{repo}/{major}/{version}.md
 *
 * @example
 * parseChangelogPath('npm/next/16.1.1') // { source: 'npm', pkg: 'next', version: '16.1.1' }
 * parseChangelogPath('npm/next/16/16.1.1') // { source: 'npm', pkg: 'next', version: '16.1.1' }
 */
export function parseChangelogPath(pathOrId: string): ParsedChangelogPath {
  // Remove 'changelogs/' prefix if present and .md extension
  const cleaned = pathOrId.replace(/^changelogs\//, '').replace(/\.md$/, '');

  const parts = cleaned.split('/');

  // Handle GitHub: github/owner/repo/[major/]version
  if (parts[0] === 'github' && parts.length >= 4) {
    const owner = parts[1];
    const repo = parts[2];
    // If 5+ parts, assume major version grouping: github/owner/repo/major/version
    const version = parts.length >= 5 ? parts[parts.length - 1] : parts[3];
    return {
      source: 'github',
      pkg: `${owner}/${repo}`,
      version,
    };
  }

  // Handle scoped packages: source/@org/pkg/[major/]version
  if (parts.length >= 4 && parts[1].startsWith('@')) {
    const source = parts[0];
    const org = parts[1].replace(/^@/, '');
    const pkg = parts[2];
    // If 5+ parts, assume major version grouping: source/@org/pkg/major/version
    const version = parts.length >= 5 ? parts[parts.length - 1] : parts[3];
    return {
      source,
      pkg: `@${org}/${pkg}`,
      version,
    };
  }

  // Handle regular packages: source/pkg/[major/]version
  if (parts.length >= 3) {
    const source = parts[0];
    const pkg = parts[1];
    // If 4+ parts, assume major version grouping: source/pkg/major/version
    // But we need to check if parts[2] looks like a major version (numeric only)
    if (parts.length >= 4 && /^\d+$/.test(parts[2])) {
      return {
        source,
        pkg,
        version: parts[parts.length - 1],
      };
    }
    return {
      source,
      pkg,
      version: parts[2],
    };
  }

  // Fallback for malformed paths
  return {
    source: parts[0] ?? '',
    pkg: parts[1] ?? '',
    version: parts[2] ?? '',
  };
}

/**
 * Builds a changelog file path with optional major version grouping.
 *
 * @example
 * buildChangelogPath('npm', 'next', '16.1.1', false) // 'changelogs/npm/next/16.1.1.md'
 * buildChangelogPath('npm', 'next', '16.1.1', true) // 'changelogs/npm/next/16/16.1.1.md'
 * buildChangelogPath('npm', '@types/node', '16.1.1', true) // 'changelogs/npm/@types/node/16/16.1.1.md'
 */
export function buildChangelogPath(
  source: string,
  pkg: string,
  version: string,
  groupByMajor: boolean,
): string {
  const basePath = `changelogs/${source}/${pkg}`;

  if (groupByMajor) {
    const major = extractMajorVersion(version);
    return `${basePath}/${major}/${version}.md`;
  }

  return `${basePath}/${version}.md`;
}
