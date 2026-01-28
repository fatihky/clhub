import { CratesVersionFetcher } from './crates-version-fetcher';
import { GitHubVersionFetcher } from './github-version-fetcher';
import { NpmVersionFetcher } from './npm-version-fetcher';
import { PyPIVersionFetcher } from './pypi-version-fetcher';
import { RubyGemsVersionFetcher } from './rubygems-version-fetcher';
import type { VersionFetcher } from './version-fetcher';

export { CratesVersionFetcher } from './crates-version-fetcher';
export { GitHubVersionFetcher } from './github-version-fetcher';
export { NpmVersionFetcher } from './npm-version-fetcher';
export { PyPIVersionFetcher } from './pypi-version-fetcher';
export { RubyGemsVersionFetcher } from './rubygems-version-fetcher';
export { createVersionComparator } from './version-comparator';
export {
  filterVersions,
  getLogger,
  sortVersionsDescending,
  VersionFetcher,
  type VersionFetcherOptions,
  type VersionInfo,
} from './version-fetcher';

const versionFetchers: Record<string, VersionFetcher> = {
  npm: new NpmVersionFetcher(),
  pypi: new PyPIVersionFetcher(),
  crates: new CratesVersionFetcher(),
  rubygems: new RubyGemsVersionFetcher(),
  github: new GitHubVersionFetcher(),
};

export function getVersionFetcher(managerKey: string): VersionFetcher | null {
  return versionFetchers[managerKey] ?? null;
}
