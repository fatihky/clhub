import { PackageManager } from '../package-manager';
import {
  filterVersions,
  getLogger,
  sortVersionsDescending,
  type VersionFetcherOptions,
  type VersionInfo,
} from '../version-fetchers';

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
}

/**
 * Using Github as a package manager.
 */
export class GitHubPackageManager extends PackageManager {
  constructor() {
    super('GitHub', 'github', 'https://github.com');
  }

  packageUrl(packageName: string): string {
    return `https://github.com/${packageName}`;
  }

  private parseNextLink(linkHeader: string | null): string | null {
    if (!linkHeader) return null;

    const links = linkHeader.split(',');
    for (const link of links) {
      const match = link.match(/<([^>]+)>;\s*rel="next"/);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  async getVersions(
    packageName: string,
    options?: VersionFetcherOptions,
    limit?: number,
  ): Promise<VersionInfo[]> {
    const logger = getLogger(options);
    let url: string | null =
      `https://api.github.com/repos/${packageName}/releases?per_page=100`;
    const versions: VersionInfo[] = [];

    logger.debug(`Fetching GitHub releases from: ${url}`);

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'changelog-fetcher',
    };

    const githubPat = process.env.GITHUB_PAT;
    if (githubPat) {
      headers.Authorization = `Bearer ${githubPat}`;
      logger.debug('Using GitHub PAT for authentication');
    } else {
      logger.debug('No GITHUB_PAT found, making unauthenticated request');
    }

    let pageCount = 0;

    while (url) {
      pageCount++;
      logger.debug(`Fetching page ${pageCount}: ${url}`);

      const response = await fetch(url, { headers });

      logger.debug(
        `GitHub API response: ${response.status} ${response.statusText}`,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch GitHub releases for "${packageName}": ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as GitHubRelease[];
      logger.debug(`Page ${pageCount} returned ${data.length} releases`);

      for (const release of data) {
        if (release.draft) {
          logger.debug(`Skipping draft release: ${release.tag_name}`);
          continue;
        }

        if (release.prerelease) {
          logger.debug(`Skipping prerelease: ${release.tag_name}`);
          continue;
        }

        const publishedAt = release.published_at
          ? new Date(release.published_at)
          : undefined;

        versions.push({
          version: release.tag_name,
          publishedAt,
        });
      }

      const linkHeader = response.headers.get('link');
      url = this.parseNextLink(linkHeader);

      if (url) {
        logger.debug(`Found next page: ${url}`);
      } else {
        logger.debug('No more pages');
      }
    }

    logger.debug(
      `Found ${versions.length} published releases from GitHub API across ${pageCount} page(s)`,
    );

    const sorted = sortVersionsDescending(
      filterVersions(versions, options),
      options,
    );
    return this.applyLimit(sorted, limit);
  }
}
