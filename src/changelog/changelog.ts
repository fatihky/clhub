import type { PackageManager } from './package-manager';

export interface Changelog {
  package: string;
  packageManager: PackageManager;
  text: string;
  version: string;
}
