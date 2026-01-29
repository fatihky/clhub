import { PackageManager } from '../package-manager';
import {
  filterVersions,
  getLogger,
  sortVersionsDescending,
  type VersionFetcherOptions,
  type VersionInfo,
} from '../version-fetchers';

interface RubyGemsVersion {
  number: string;
  created_at: string;
}

export class RubyGemsPackageManager extends PackageManager {
  constructor() {
    super('RubyGems', 'rubygems', 'https://rubygems.org');
  }

  packageUrl(packageName: string): string {
    return `https://rubygems.org/gems/${packageName}`;
  }

  async packageExists(packageName: string): Promise<boolean> {
    const url = `https://rubygems.org/api/v1/gems/${encodeURIComponent(packageName)}.json`;
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

    const sorted = sortVersionsDescending(
      filterVersions(versions, options),
      options,
    );
    return this.applyLimit(sorted, limit);
  }
}
