import { getPackageManager } from '../package-managers';
import { cratesPackages } from './crates';
import { githubPackages } from './github';
import { npmPackages } from './npm';
import { pypiPackages } from './pypi';
import { rubygemsPackages } from './rubygems';

export const allPackages = [
  ...npmPackages,
  ...pypiPackages,
  ...cratesPackages,
  ...rubygemsPackages,
  ...githubPackages,
];

export {
  cratesPackages,
  githubPackages,
  npmPackages,
  pypiPackages,
  rubygemsPackages,
};

const packagesBySource: Record<string, typeof allPackages> = {
  npm: npmPackages,
  crates: cratesPackages,
  pypi: pypiPackages,
  rubygems: rubygemsPackages,
  github: githubPackages,
};

/**
 * Find a package by source and name to get its repository URL.
 * Returns undefined if the package is not found in the configuration.
 */
export function getPackageRepositoryUrl(
  source: string,
  packageName: string,
): string | undefined {
  const packages = packagesBySource[source];
  if (!packages) return undefined;

  return packages.find((pkg) => pkg.name === packageName)?.repositoryUrl;
}

/**
 * Find a package by source and name to get its full configuration.
 * Returns undefined if the package is not found in the configuration.
 */
export function getPackageConfig(
  source: string,
  packageName: string,
):
  | {
      repositoryUrl: string;
      changelogFetcherOptions?: {
        type?: 'githubReleases' | 'githubChangelogFile' | 'githubWiki';
        tagPrefix?: string;
        changelogFilename?: string;
      };
    }
  | undefined {
  const packages = packagesBySource[source];
  if (!packages) return undefined;

  const pkg = packages.find((p) => p.name === packageName);
  if (!pkg) return undefined;

  return {
    repositoryUrl: pkg.repositoryUrl,
    changelogFetcherOptions: pkg.changelogFetcherOptions,
  };
}

export interface PackageLinks {
  homepage: string;
}

/**
 * Generate a changelog-specific URL based on package configuration and version.
 * Returns undefined if the package is not found or URL cannot be generated.
 */
export function getChangelogUrl(
  source: string,
  packageName: string,
  version: string,
): string | undefined {
  const config = getPackageConfig(source, packageName);
  if (!config || !config.repositoryUrl) return undefined;

  // Only handle GitHub repositories for now
  if (source !== 'github' && !config.repositoryUrl.includes('github.com')) {
    return undefined;
  }

  const repoUrl = config.repositoryUrl;
  const repoMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!repoMatch) return undefined;

  const owner = repoMatch[1];
  const repo = repoMatch[2];
  const tagPrefix = config.changelogFetcherOptions?.tagPrefix ?? '';
  const tagSuffix = config.changelogFetcherOptions?.tagSuffix ?? '';
  const changelogType =
    config.changelogFetcherOptions?.type ?? 'githubReleases';

  const fullTag = `${tagPrefix}${version}${tagSuffix}`;

  switch (changelogType) {
    case 'githubReleases':
      return `https://github.com/${owner}/${repo}/releases/tag/${fullTag}`;
    case 'githubChangelogFile': {
      const filename =
        config.changelogFetcherOptions?.changelogFilename ?? 'CHANGELOG.md';
      // For changelog files, just link to the file itself, not a specific version
      return `https://github.com/${owner}/${repo}/blob/HEAD/${filename}`;
    }
    case 'githubWiki':
      // For wiki changelogs, we can't link to a specific version easily
      return `https://github.com/${owner}/${repo}/wiki`;
    default:
      // Default to releases if type is not specified
      return `https://github.com/${owner}/${repo}/releases/tag/${fullTag}`;
  }
}

/**
 * Get homepage URL for a package by checking the actual package registry.
 * Returns undefined if the package does not exist on the registry.
 */
export async function getPackageLinks(
  source: string,
  packageName: string,
): Promise<PackageLinks | undefined> {
  const packageManager = getPackageManager(source);
  if (!packageManager) return undefined;

  const exists = await packageManager.packageExists(packageName);
  if (!exists) return undefined;

  return {
    homepage: packageManager.packageUrl(packageName),
  };
}
