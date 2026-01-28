import {
  filterVersions,
  getLogger,
  sortVersionsDescending,
  VersionFetcher,
  type VersionFetcherOptions,
  type VersionInfo,
} from './version-fetcher';

interface NpmRegistryResponse {
  versions: Record<string, unknown>;
  time: Record<string, string>;
}

/**
 * Encodes an npm package name for use in registry URLs.
 * For scoped packages like `@scope/name`, only the `/` is encoded: `@scope%2Fname`
 */
function encodeNpmPackageName(packageName: string): string {
  if (packageName.startsWith('@')) {
    const slashIndex = packageName.indexOf('/');
    if (slashIndex !== -1) {
      const scope = packageName.slice(0, slashIndex);
      const name = packageName.slice(slashIndex + 1);
      return `${scope}%2F${encodeURIComponent(name)}`;
    }
  }
  return encodeURIComponent(packageName);
}

export class NpmVersionFetcher extends VersionFetcher {
  async fetchVersions(
    packageName: string,
    options?: VersionFetcherOptions,
  ): Promise<VersionInfo[]> {
    const logger = getLogger(options);
    const url = `https://registry.npmjs.org/${encodeNpmPackageName(packageName)}`;

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

    return sortVersionsDescending(filterVersions(versions, options), options);
  }
}
