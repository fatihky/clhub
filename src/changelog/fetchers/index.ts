import type { ChangelogFetcher } from '../changelog-fetcher';
import type { ChangelogFetcherType } from '../package';
import { GitHubChangelogFileFetcher } from './github-changelog-file';
import { GitHubReleasesChangelogFetcher } from './github-releases';

export {
  extractVersionChangelog,
  type FetchOptions,
  fetchGitHubChangelog,
  fetchGitHubRelease,
  type GitHubRepo,
  parseGitHubUrl,
} from './github';
export { GitHubChangelogFileFetcher } from './github-changelog-file';
export { GitHubReleasesChangelogFetcher } from './github-releases';

const fetchers: Record<ChangelogFetcherType, ChangelogFetcher> = {
  githubReleases: new GitHubReleasesChangelogFetcher(),
  githubChangelogFile: new GitHubChangelogFileFetcher(),
};

export function getChangelogFetcher(
  type: ChangelogFetcherType = 'githubReleases',
): ChangelogFetcher {
  return fetchers[type];
}
