import {
  filterVersions,
  getLogger,
  sortVersionsDescending,
  VersionFetcher,
  type VersionFetcherOptions,
  type VersionInfo,
} from './version-fetcher';

interface PyPIRelease {
  upload_time_iso_8601?: string;
}

interface PyPIRegistryResponse {
  releases: Record<string, PyPIRelease[]>;
}

export class PyPIVersionFetcher extends VersionFetcher {
  async fetchVersions(
    packageName: string,
    options?: VersionFetcherOptions,
  ): Promise<VersionInfo[]> {
    const logger = getLogger(options);
    const url = `https://pypi.org/pypi/${encodeURIComponent(packageName)}/json`;

    logger.debug(`Fetching PyPI versions from: ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'changelog-fetcher',
      },
    });

    logger.debug(
      `PyPI registry response: ${response.status} ${response.statusText}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch PyPI package "${packageName}": ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as PyPIRegistryResponse;
    const versions: VersionInfo[] = [];

    for (const [version, releases] of Object.entries(data.releases)) {
      // Get the earliest upload time from the release files
      const uploadTime = releases[0]?.upload_time_iso_8601;
      const publishedAt = uploadTime ? new Date(uploadTime) : undefined;
      versions.push({ version, publishedAt });
    }

    logger.debug(`Found ${versions.length} total versions from PyPI registry`);

    return sortVersionsDescending(filterVersions(versions, options), options);
  }
}
