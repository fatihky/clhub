import {
  filterVersions,
  getLogger,
  sortVersionsDescending,
  VersionFetcher,
  type VersionFetcherOptions,
  type VersionInfo,
} from './version-fetcher';

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
}

export class GitHubVersionFetcher extends VersionFetcher {
  /**
   * Parses the Link header to extract the next page URL.
   */
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

  async fetchVersions(
    packageName: string,
    options?: VersionFetcherOptions,
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

    // Add authentication if GITHUB_PAT is available
    const githubPat = process.env.GITHUB_PAT;
    if (githubPat) {
      headers.Authorization = `Bearer ${githubPat}`;
      logger.debug('Using GitHub PAT for authentication');
    } else {
      logger.debug('No GITHUB_PAT found, making unauthenticated request');
    }

    let pageCount = 0;

    // Fetch all pages
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
        // Skip draft releases
        if (release.draft) {
          logger.debug(`Skipping draft release: ${release.tag_name}`);
          continue;
        }

        // Skip prerelease versions
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

      // Check for next page in Link header
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

    return sortVersionsDescending(filterVersions(versions, options), options);
  }
}
