import {
  filterVersions,
  getLogger,
  sortVersionsDescending,
  VersionFetcher,
  type VersionFetcherOptions,
  type VersionInfo,
} from './version-fetcher';

interface RubyGemsVersion {
  number: string;
  created_at: string;
}

export class RubyGemsVersionFetcher extends VersionFetcher {
  async fetchVersions(
    packageName: string,
    options?: VersionFetcherOptions,
  ): Promise<VersionInfo[]> {
    const logger = getLogger(options);
    const url = `https://rubygems.org/api/v1/versions/${encodeURIComponent(packageName)}.json`;

    logger.debug(`Fetching RubyGems versions from: ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'changelog-fetcher',
      },
    });

    logger.debug(
      `RubyGems registry response: ${response.status} ${response.statusText}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch RubyGems package "${packageName}": ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as RubyGemsVersion[];
    const versions: VersionInfo[] = data.map((v) => ({
      version: v.number,
      publishedAt: new Date(v.created_at),
    }));

    logger.debug(
      `Found ${versions.length} total versions from RubyGems registry`,
    );

    return sortVersionsDescending(filterVersions(versions, options), options);
  }
}
