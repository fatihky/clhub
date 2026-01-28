import { PackageManager } from '../package-manager';
import {
  filterVersions,
  getLogger,
  sortVersionsDescending,
  type VersionFetcherOptions,
  type VersionInfo,
} from '../version-fetchers';

interface PyPIRelease {
  upload_time_iso_8601?: string;
}

interface PyPIRegistryResponse {
  releases: Record<string, PyPIRelease[]>;
}

export class PyPIPackageManager extends PackageManager {
  constructor() {
    super('PyPI', 'pypi', 'https://pypi.org');
  }

  packageUrl(packageName: string): string {
    return `https://pypi.org/project/${packageName}`;
  }

  async getVersions(
    packageName: string,
    options?: VersionFetcherOptions,
    limit?: number,
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
      const uploadTime = releases[0]?.upload_time_iso_8601;
      const publishedAt = uploadTime ? new Date(uploadTime) : undefined;
      versions.push({ version, publishedAt });
    }

    logger.debug(`Found ${versions.length} total versions from PyPI registry`);

    const sorted = sortVersionsDescending(
      filterVersions(versions, options),
      options,
    );
    return this.applyLimit(sorted, limit);
  }
}
