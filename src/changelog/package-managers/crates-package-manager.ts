import { PackageManager } from '../package-manager';
import {
  filterVersions,
  getLogger,
  sortVersionsDescending,
  type VersionFetcherOptions,
  type VersionInfo,
} from '../version-fetchers';

interface CratesVersion {
  num: string;
  created_at: string;
}

interface CratesRegistryResponse {
  versions: CratesVersion[];
}

export class CratesPackageManager extends PackageManager {
  constructor() {
    super('crates.io', 'crates', 'https://crates.io');
  }

  packageUrl(packageName: string): string {
    return `https://crates.io/crates/${packageName}`;
  }

  async getVersions(
    packageName: string,
    options?: VersionFetcherOptions,
    limit?: number,
  ): Promise<VersionInfo[]> {
    const logger = getLogger(options);
    const url = `https://crates.io/api/v1/crates/${encodeURIComponent(packageName)}`;

    logger.debug(`Fetching crates.io versions from: ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
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

    const sorted = sortVersionsDescending(
      filterVersions(versions, options),
      options,
    );
    return this.applyLimit(sorted, limit);
  }
}
