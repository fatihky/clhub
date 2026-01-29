import { PackageManager } from '../package-manager';
import {
  filterVersions,
  getLogger,
  sortVersionsDescending,
  type VersionFetcherOptions,
  type VersionInfo,
} from '../version-fetchers';

interface NpmRegistryResponse {
  versions: Record<string, unknown>;
  time: Record<string, string>;
}

export class NpmPackageManager extends PackageManager {
  constructor() {
    super('npm', 'npm', 'https://www.npmjs.com');
  }

  packageUrl(packageName: string): string {
    return `https://www.npmjs.com/package/${packageName}`;
  }

  async packageExists(packageName: string): Promise<boolean> {
    const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'changelog-fetcher',
      },
    });
    return response.ok;
  }

  async getVersions(
    packageName: string,
    options?: VersionFetcherOptions,
    limit?: number,
  ): Promise<VersionInfo[]> {
    const logger = getLogger(options);
    const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;

    logger.debug(`Fetching npm versions from: ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'changelog-fetcher',
      },
    });

    logger.debug(
      `npm registry response: ${response.status} ${response.statusText}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch npm package "${packageName}": ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as NpmRegistryResponse;
    const versions: VersionInfo[] = [];

    for (const version of Object.keys(data.versions)) {
      const publishedAt = data.time[version]
        ? new Date(data.time[version])
        : undefined;
      versions.push({ version, publishedAt });
    }

    logger.debug(`Found ${versions.length} total versions from npm registry`);

    const sorted = sortVersionsDescending(
      filterVersions(versions, options),
      options,
    );
    return this.applyLimit(sorted, limit);
  }
}
