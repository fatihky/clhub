import { ChangelogFetcher } from '../changelog-fetcher';
import {
  type FetchOptions,
  fetchGitHubRelease,
  type GitHubRepo,
} from './github';

export class GitHubReleasesChangelogFetcher extends ChangelogFetcher {
  protected async fetchChangelogText(
    repo: GitHubRepo,
    version: string,
    options?: FetchOptions,
  ): Promise<string | null> {
    return fetchGitHubRelease(repo, version, options);
  }
}
