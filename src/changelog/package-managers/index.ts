export { CratesPackageManager } from './crates-package-manager';
export { GitHubPackageManager } from './github-package-manager';
export { NpmPackageManager } from './npm-package-manager';
export { PyPIPackageManager } from './pypi-package-manager';
export { RubyGemsPackageManager } from './rubygems-package-manager';

import type { PackageManager } from '../package-manager';
import { CratesPackageManager } from './crates-package-manager';
import { GitHubPackageManager } from './github-package-manager';
import { NpmPackageManager } from './npm-package-manager';
import { PyPIPackageManager } from './pypi-package-manager';
import { RubyGemsPackageManager } from './rubygems-package-manager';

export const PACKAGE_MANAGERS = {
  npm: new NpmPackageManager(),
  pypi: new PyPIPackageManager(),
  crates: new CratesPackageManager(),
  rubygems: new RubyGemsPackageManager(),
  github: new GitHubPackageManager(),
} as const satisfies Record<string, PackageManager>;

export type PackageManagerKey = keyof typeof PACKAGE_MANAGERS;

export function getPackageManager(key: string): PackageManager | null {
  return PACKAGE_MANAGERS[key as PackageManagerKey] ?? null;
}
