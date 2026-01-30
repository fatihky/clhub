import type { FetchOptions } from './fetchers/github';
import type { PackageManager } from './package-manager';
import type { VersionFetcherOptions } from './version-fetchers';

export type ChangelogFetcherType =
  | 'githubReleases'
  | 'githubChangelogFile'
  | 'githubWiki';

export interface ChangelogFetcherOptions
  extends Pick<FetchOptions, 'tagPrefix' | 'tagSuffix' | 'changelogFilename'> {
  /** Fetcher type (default: 'githubReleases') */
  type?: ChangelogFetcherType;
}

export class Package {
  constructor(
    readonly packageManager: PackageManager,
    readonly name: string,
    readonly repositoryUrl: string,
    readonly versionFetcherOptions?: VersionFetcherOptions,
    readonly changelogFetcherOptions?: ChangelogFetcherOptions,
  ) {}
}

export {
  getPackageManager,
  PACKAGE_MANAGERS,
  type PackageManagerKey,
} from './package-managers';
