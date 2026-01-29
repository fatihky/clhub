import { cratesPackages } from './crates';
import { githubPackages } from './github';
import { npmPackages } from './npm';
import { pypiPackages } from './pypi';
import { rubygemsPackages } from './rubygems';
import { getPackageManager } from '../package-managers';

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

export interface PackageLinks {
  homepage: string;
}

/**
 * Get homepage URL for a package by checking the actual package registry.
 * Returns undefined if the package does not exist on the registry.
 */
export async function getPackageLinks(source: string, packageName: string): Promise<PackageLinks | undefined> {
  const packageManager = getPackageManager(source);
  if (!packageManager) return undefined;

  const exists = await packageManager.packageExists(packageName);
  if (!exists) return undefined;

  return {
    homepage: packageManager.packageUrl(packageName),
  };
}
