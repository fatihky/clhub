import { type ChangelogFetcherOptions, Package } from '../package';
import type { PackageManager } from '../package-manager';
import type { VersionFetcherOptions } from '../version-fetchers';

export type PackageMap = Record<
  string,
  {
    readonly repositoryUrl: string;
    readonly versionFetcherOptions?: VersionFetcherOptions;
    readonly changelogFetcherOptions?: ChangelogFetcherOptions;
  }
>;

export function packageMapToArray(
  pm: PackageManager,
  map: PackageMap,
): Package[] {
  return Object.keys(map)
    .map((pkg) => {
      const conf = map[pkg];

      if (!conf) return null;

      return new Package(
        pm,
        pkg,
        conf.repositoryUrl,
        conf.versionFetcherOptions,
        conf.changelogFetcherOptions,
      );
    })
    .filter((pkg) => pkg !== null);
}
