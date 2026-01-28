import type { Changelog } from '../changelog/changelog';
import { GitHubReleasesChangelogFetcher } from '../changelog/fetchers';
import type { Package } from '../changelog/package';

const fetcher = new GitHubReleasesChangelogFetcher();

/**
 * Fetches the changelog for a package at a specific version.
 */
export async function fetchChangelog(
  pkg: Package,
  version: string,
): Promise<Changelog | null> {
  return fetcher.fetch(pkg, version);
}

export { fetcher };
