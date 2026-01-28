import type { Changelog } from './changelog';
import {
  type FetchOptions,
  type GitHubRepo,
  parseGitHubUrl,
} from './fetchers/github';
import { type Logger, silentLogger } from './logger';
import type { Package } from './package';

export interface ChangelogFetchOptions {
  /** Enable verbose logging */
  verbose?: boolean;
  /** Custom logger instance */
  logger?: Logger;
}

export abstract class ChangelogFetcher {
  /**
   * Fetches the changelog for a package at a specific version.
   */
  async fetch(
    pkg: Package,
    version: string,
    options?: ChangelogFetchOptions,
  ): Promise<Changelog | null> {
    const logger = options?.logger ?? silentLogger;

    logger.debug(`Fetching changelog for ${pkg.name}@${version}`);

    const repo = parseGitHubUrl(pkg.repositoryUrl);
    if (!repo) {
      logger.debug(`Failed to parse GitHub URL: ${pkg.repositoryUrl}`);
      return null;
    }

    logger.debug(`Parsed repo: ${repo.owner}/${repo.repo}`);

    const fetchOptions: FetchOptions = {
      verbose: options?.verbose,
      logger: options?.logger,
      tagPrefix: pkg.changelogFetcherOptions?.tagPrefix,
      tagSuffix: pkg.changelogFetcherOptions?.tagSuffix,
      changelogFilename: pkg.changelogFetcherOptions?.changelogFilename,
    };

    const changelogText = await this.fetchChangelogText(
      repo,
      version,
      fetchOptions,
    );
    if (!changelogText) {
      logger.debug(`No changelog text found for ${pkg.name}@${version}`);
      return null;
    }

    logger.debug(
      `Successfully fetched changelog (${changelogText.length} chars)`,
    );

    return {
      package: pkg.name,
      packageManager: pkg.packageManager,
      version,
      text: changelogText,
    };
  }

  /**
   * Fetches the changelog text for a specific version.
   */
  protected abstract fetchChangelogText(
    repo: GitHubRepo,
    version: string,
    options?: FetchOptions,
  ): Promise<string | null>;
}
