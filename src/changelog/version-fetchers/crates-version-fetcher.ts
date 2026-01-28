import {
  filterVersions,
  getLogger,
  sortVersionsDescending,
  VersionFetcher,
  type VersionFetcherOptions,
  type VersionInfo,
} from './version-fetcher';

interface CratesVersion {
  num: string;
  created_at: string;
}

interface CratesRegistryResponse {
  versions: CratesVersion[];
}

export class CratesVersionFetcher extends VersionFetcher {
  async fetchVersions(
    packageName: string,
    options?: VersionFetcherOptions,
  ): Promise<VersionInfo[]> {
    const logger = getLogger(options);
    const url = `https://crates.io/api/v1/crates/${encodeURIComponent(packageName)}`;

    logger.debug(`Fetching crates.io versions from: ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        // crates.io requires a User-Agent header
        'User-Agent':
          'changelog-fetcher (https://github.com/changelog-fetcher)',
      },
    });

    logger.debug(
      `crates.io registry response: ${response.status} ${response.statusText}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch crates.io package "${packageName}": ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as CratesRegistryResponse;
    const versions: VersionInfo[] = data.versions.map((v) => ({
      version: v.num,
      publishedAt: new Date(v.created_at),
    }));

    logger.debug(
      `Found ${versions.length} total versions from crates.io registry`,
    );

    return sortVersionsDescending(filterVersions(versions, options), options);
  }
}
