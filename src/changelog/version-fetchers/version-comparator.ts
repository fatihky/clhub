import { rcompare, valid } from 'semver';
import type { VersionInfo } from './version-fetcher';

export const compareVersionsDescending = createVersionComparator();

/**
 * Creates a version comparator for sorting in descending order.
 * Valid semver versions come first, invalid versions go to the end.
 * Optionally tracks invalid versions in the provided array.
 */
export function createVersionComparator(invalidVersions?: string[]) {
  return (a: VersionInfo, b: VersionInfo): number => {
    const aValid = valid(a.version);
    const bValid = valid(b.version);

    // Both valid: use semver comparison
    if (aValid && bValid) {
      return rcompare(a.version, b.version);
    }

    // Track invalid versions for logging
    if (invalidVersions) {
      if (!aValid && !invalidVersions.includes(a.version)) {
        invalidVersions.push(a.version);
      }
      if (!bValid && !invalidVersions.includes(b.version)) {
        invalidVersions.push(b.version);
      }
    }

    // Invalid versions go to the end
    if (aValid && !bValid) return -1;
    if (!aValid && bValid) return 1;

    // Both invalid: sort alphabetically descending
    return b.version.localeCompare(a.version);
  };
}
