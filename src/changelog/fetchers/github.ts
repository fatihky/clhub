import { type Logger, silentLogger } from '../logger';

export interface GitHubRepo {
  owner: string;
  repo: string;
}

export interface FetchOptions {
  /** Enable verbose logging */
  verbose?: boolean;
  /** Custom logger instance */
  logger?: Logger;
  /** Tag prefix (e.g., 'v' for tags like 'v1.0.0') */
  tagPrefix?: string;
  /** Tag suffix (e.g., '.0' for tags like '1.0.0.0') */
  tagSuffix?: string;
  /** Changelog filename (default: CHANGELOG.md) */
  changelogFilename?: string;
}

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
 * Extracts GitHub repository owner and name from a repository URL.
 */
export function parseGitHubUrl(url: string): GitHubRepo | null {
  const patterns = [
    /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/,
    /github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
  }
  return null;
}

/**
 * Fetches GitHub release notes for a specific version.
 */
export async function fetchGitHubRelease(
  repo: GitHubRepo,
  version: string,
  options?: FetchOptions,
): Promise<string | null> {
  const logger = getLogger(options);
  const prefix = options?.tagPrefix ?? '';
  const suffix = options?.tagSuffix ?? '';
  const tag = `${prefix}${version}${suffix}`;

  logger.debug(
    `Fetching GitHub release for ${repo.owner}/${repo.repo}@${version}`,
  );
  logger.debug(`Using tag: ${tag}`);

  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases/tags/${tag}`;
  logger.debug(`Fetching: ${url}`);

  try {
    const response = await fetch(url, {
      headers: getGitHubHeaders(),
    });

    logger.debug(
      `GitHub API response for tag "${tag}": ${response.status} ${response.statusText}`,
    );

    if (response.ok) {
      const data = await response.json();
      const bodyLength = data.body?.length ?? 0;
      logger.debug(
        `Found release for tag "${tag}" (body: ${bodyLength} chars)`,
      );
      return data.body || null;
    }

    // 403 indicates rate limiting or auth issues - should be retried later
    if (response.status === 403) {
      const responseBody = await response.text();
      logger.info(
        `GitHub API returned 403 for ${repo.owner}/${repo.repo}@${version}: ${responseBody}`,
      );
      throw new Error(
        `GitHub API rate limit or auth error (403) for ${repo.owner}/${repo.repo}@${version}: ${responseBody}`,
      );
    }
  } catch (error) {
    logger.debug(
      `Error fetching tag "${tag}": ${error instanceof Error ? error.message : error}`,
    );
    throw error;
  }

  logger.debug(`No release found for tag "${tag}"`);
  return null;
}

/**
 * Fetches a changelog file from a GitHub repository.
 */
export async function fetchGitHubChangelog(
  repo: GitHubRepo,
  options?: FetchOptions,
): Promise<string | null> {
  const logger = getLogger(options);
  const filename = options?.changelogFilename ?? 'CHANGELOG.md';

  logger.debug(`Fetching changelog from ${repo.owner}/${repo.repo}`);

  const url = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/HEAD/${filename}`;
  logger.debug(`Fetching "${filename}": ${url}`);

  try {
    const response = await fetch(url, {
      headers: getGitHubHeaders(),
    });
    logger.debug(
      `Response for "${filename}": ${response.status} ${response.statusText}`,
    );

    if (response.ok) {
      const text = await response.text();
      logger.debug(`Found changelog "${filename}" (${text.length} chars)`);
      return text;
    }

    if (response.status === 403) {
      const responseBody = await response.text();
      logger.info(
        `GitHub returned 403 for ${repo.owner}/${repo.repo}/${filename}: ${responseBody}`,
      );
      throw new Error(
        `GitHub rate limit or auth error (403) for ${repo.owner}/${repo.repo}/${filename}: ${responseBody}`,
      );
    }
  } catch (error) {
    logger.debug(
      `Error fetching "${filename}": ${error instanceof Error ? error.message : error}`,
    );
    throw error;
  }

  logger.debug(`Changelog file "${filename}" not found in repository`);
  return null;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts the changelog section for a specific version from a full changelog file.
 */
export function extractVersionChangelog(
  changelog: string,
  version: string,
  options?: FetchOptions,
): string | null {
  const logger = getLogger(options);
  const versionPatterns = [
    new RegExp(`^#+\\s*\\[?v?${escapeRegex(version)}\\]?`, 'im'),
    new RegExp(`^#+\\s*${escapeRegex(version)}`, 'im'),
    new RegExp(`^##?\\s*\\[?v?${escapeRegex(version)}\\]?[^\\n]*\\n`, 'im'),
  ];

  logger.debug(`Extracting changelog section for version "${version}"`);
  logger.debug(`Trying ${versionPatterns.length} version patterns`);

  for (let i = 0; i < versionPatterns.length; i++) {
    const pattern = versionPatterns[i];
    logger.debug(`Trying pattern ${i + 1}: ${pattern.source}`);

    const match = changelog.match(pattern);
    if (match?.index !== undefined) {
      logger.debug(`Pattern ${i + 1} matched at index ${match.index}`);

      const startIndex = match.index;
      const afterHeader = changelog.slice(startIndex + match[0].length);
      const nextVersionMatch = afterHeader.match(/^#+\s*\[?v?\d+\.\d+/m);
      const endIndex = nextVersionMatch?.index
        ? startIndex + match[0].length + nextVersionMatch.index
        : undefined;

      const extracted = changelog.slice(startIndex, endIndex).trim();
      logger.debug(`Extracted changelog section (${extracted.length} chars)`);
      return extracted;
    }
  }

  logger.debug(`No version section found for "${version}"`);
  return null;
}
