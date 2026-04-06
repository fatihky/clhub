import { type Logger, silentLogger } from '../logger';
import { createVersionComparator } from './version-comparator';

export interface VersionInfo {
  version: string;
  publishedAt?: Date;
}

export interface VersionFetcherOptions {
  /** Patterns to exclude from version list (regex or string) */
  readonly versionPattern?: RegExp;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Custom logger instance */
  logger?: Logger;
}

export abstract class VersionFetcher {
  abstract fetchVersions(
    packageName: string,
    options?: VersionFetcherOptions,
  ): Promise<VersionInfo[]>;
}

export const versionFetcherOptionPresets = {
  onlySemver: {
    versionPattern: /^\d+\.\d+\.\d+$/,
  },
} as const;

/**
 * Gets a logger from options, defaulting to silent logger.
 *
 * TODO: move to another file.
 */
export function getLogger(options?: VersionFetcherOptions): Logger {
  return options?.logger ?? silentLogger;
}

/**
 * Filters versions based on exclude patterns.
 */
export function filterVersions(
  versions: VersionInfo[],
  options?: VersionFetcherOptions,
): VersionInfo[] {
  const logger = getLogger(options);

  const versionPattern = options?.versionPattern;

  if (!versionPattern) {
    logger.debug('No exclude patterns specified, returning all versions');
    return versions;
  }

  logger.debug(
    `Filtering ${versions.length} versions with version pattern: ${versionPattern.source}`,
  );

  const filtered = versions.filter((v) => {
    if (versionPattern.test(v.version)) {
      logger.debug(
        `Including version "${v.version}" (matches pattern: ${versionPattern.source})`,
      );

      return true;
    }

    return false;
  });

  logger.debug(`Filtered to ${filtered.length} versions`);

  return filtered;
}

/**
 * Sorts versions in descending order using semver.
 * Invalid semver versions are placed at the end.
 */
export function sortVersionsDescending(
  versions: VersionInfo[],
  options?: VersionFetcherOptions,
): VersionInfo[] {
  const logger = getLogger(options);
  logger.debug(`Sorting ${versions.length} versions in descending order`);

  const invalidVersions: string[] = [];
  const sorted = versions.sort(createVersionComparator(invalidVersions));

  if (invalidVersions.length > 0) {
    logger.debug(
      `Found ${invalidVersions.length} non-semver version(s): ${invalidVersions.slice(0, 5).join(', ')}${invalidVersions.length > 5 ? '...' : ''}`,
    );
  }

  return sorted;
}
