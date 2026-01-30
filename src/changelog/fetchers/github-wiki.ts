import { ChangelogFetcher } from '../changelog-fetcher';
import {
  extractVersionChangelog,
  type FetchOptions,
  type GitHubRepo,
} from './github';
import { type Logger, silentLogger } from '../logger';

function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'changelog-fetcher',
  };

  const token = process.env.GITHUB_PAT;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getLogger(options?: FetchOptions): Logger {
  return options?.logger ?? silentLogger;
}

/**
 * Fetches a changelog from a GitHub wiki page.
 */
export async function fetchGitHubWiki(
  repo: GitHubRepo,
  wikiPage: string,
  options?: FetchOptions,
): Promise<string | null> {
  const logger = getLogger(options);

  logger.debug(`Fetching wiki page from ${repo.owner}/${repo.repo}`);

  const url = `https://raw.githubusercontent.com/wiki/${repo.owner}/${repo.repo}/${wikiPage}.md`;
  logger.debug(`Fetching wiki page: ${url}`);

  try {
    const response = await fetch(url, {
      headers: getGitHubHeaders(),
    });
    logger.debug(
      `Response for wiki page "${wikiPage}": ${response.status} ${response.statusText}`,
    );

    if (response.ok) {
      const text = await response.text();
      logger.debug(`Found wiki page "${wikiPage}" (${text.length} chars)`);
      return text;
    }

    if (response.status === 403) {
      const responseBody = await response.text();
      logger.info(
        `GitHub returned 403 for ${repo.owner}/${repo.repo}/wiki/${wikiPage}: ${responseBody}`,
      );
      throw new Error(
        `GitHub rate limit or auth error (403) for ${repo.owner}/${repo.repo}/wiki/${wikiPage}: ${responseBody}`,
      );
    }
  } catch (error) {
    logger.debug(
      `Error fetching wiki page "${wikiPage}": ${error instanceof Error ? error.message : error}`,
    );
    throw error;
  }

  logger.debug(`Wiki page "${wikiPage}" not found in repository`);
  return null;
}

export class GitHubWikiChangelogFetcher extends ChangelogFetcher {
  private cache = new Map<string, string>();

  protected async fetchChangelogText(
    repo: GitHubRepo,
    version: string,
    options?: FetchOptions,
  ): Promise<string | null> {
    const wikiPage = options?.changelogFilename ?? 'Changelog';
    const cacheKey = `${repo.owner}/${repo.repo}/wiki/${wikiPage}`;

    let wikiContent = this.cache.get(cacheKey);
    if (!wikiContent) {
      const fetched = await fetchGitHubWiki(repo, wikiPage, options);
      if (!fetched) {
        return null;
      }
      wikiContent = fetched;
      this.cache.set(cacheKey, wikiContent);
    }

    return extractVersionChangelog(wikiContent, version, options);
  }

  clearCache(): void {
    this.cache.clear();
  }
}
