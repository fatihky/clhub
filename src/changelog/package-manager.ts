import type { VersionFetcherOptions, VersionInfo } from './version-fetchers';

export abstract class PackageManager {
  constructor(
    readonly name: string,
    readonly dirname: string,
    readonly homeUrl: string,
  ) {}

  abstract packageUrl(packageName: string): string;

  /** @deprecated Use packageUrl instead */
  packageLink(packageName: string): string {
    return this.packageUrl(packageName);
  }

  /**
   * Check if a package exists on the registry.
   * Returns true if the package exists, false otherwise.
   */
  abstract packageExists(packageName: string): Promise<boolean>;

  abstract getVersions(
    packageName: string,
    options?: VersionFetcherOptions,
    limit?: number,
  ): Promise<VersionInfo[]>;

  protected applyLimit(versions: VersionInfo[], limit?: number): VersionInfo[] {
    if (limit === undefined || limit === Number.POSITIVE_INFINITY) {
      return versions;
    }
    return versions.slice(0, limit);
  }
}
