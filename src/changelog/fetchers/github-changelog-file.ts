import { ChangelogFetcher } from '../changelog-fetcher';
import {
  extractVersionChangelog,
  type FetchOptions,
  fetchGitHubChangelog,
  type GitHubRepo,
} from './github';

export class GitHubChangelogFileFetcher extends ChangelogFetcher {
  private cache = new Map<string, string>();

  protected async fetchChangelogText(
    repo: GitHubRepo,
    version: string,
    options?: FetchOptions,
  ): Promise<string | null> {
    const filename = options?.changelogFilename ?? 'CHANGELOG.md';
    const cacheKey = `${repo.owner}/${repo.repo}/${filename}`;

    let changelog = this.cache.get(cacheKey);
    if (!changelog) {
      const fetched = await fetchGitHubChangelog(repo, options);
      if (!fetched) {
        return null;
      }
      changelog = fetched;
      this.cache.set(cacheKey, changelog);
    }

    return extractVersionChangelog(changelog, version, options);
  }

  clearCache(): void {
    this.cache.clear();
  }
}
