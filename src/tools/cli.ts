import 'dotenv/config';

import { Command } from '@commander-js/extra-typings';
import { getChangelogFetcher } from '../changelog/fetchers';
import { createLogger, type Logger } from '../changelog/logger';
import {
  getPackageManager,
  PACKAGE_MANAGERS,
  Package,
} from '../changelog/package';
import type { PackageManager } from '../changelog/package-manager';
import { allPackages } from '../changelog/packages';
import {
  changelogExists,
  insertChangelog,
  isVersionNotFound,
  markVersionNotFound,
} from '../db/changelog-repository';
import { closeDatabase } from '../db/database';

const program = new Command();

program
  .name('changelog')
  .description('Fetch changelogs for packages')
  .version('0.0.1');

function requirePackageManager(manager: string) {
  const pm = getPackageManager(manager);
  if (!pm) {
    console.error(
      `Unknown package manager: ${manager}. Available: ${Object.keys(PACKAGE_MANAGERS).join(', ')}`,
    );
    process.exit(1);
  }
  return pm;
}

function parseLimit(limit?: string): number | undefined {
  return limit ? Number.parseInt(limit, 10) : undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolvePackage(
  pm: PackageManager,
  packageName: string,
  manager: string,
  repo?: string,
): Package {
  const found = allPackages.find(
    (p) => p.name === packageName && p.packageManager.dirname === pm.dirname,
  );

  if (repo) {
    return new Package(
      pm,
      packageName,
      repo,
      found?.versionFetcherOptions,
      found?.changelogFetcherOptions,
      found?.groupByMajorVersion,
    );
  }

  if (!found) {
    console.error(
      `Package "${packageName}" not found for manager "${manager}".`,
    );
    console.error('Use --repo to specify the repository URL manually.');
    console.error('\nAvailable packages:');
    for (const p of allPackages) {
      console.error(`  - ${p.packageManager.name}: ${p.name}`);
    }
    process.exit(1);
  }

  return found;
}

function printFinalSummary(
  packageCount: number,
  fetched: number,
  skipped: number,
  notFound: number,
): void {
  console.log('\n--- Final Summary ---');
  console.log(`Total packages processed: ${packageCount}`);
  console.log(`Total fetched: ${fetched}`);
  console.log(`Total skipped: ${skipped}`);
  console.log(`Total not found: ${notFound}`);
  console.log('\nDone!');
}

interface FetchPackageOptions {
  save: boolean;
  verbose: boolean;
  limit?: number;
  logger: Logger;
}

async function fetchAllVersionsForPackage(
  pkg: Package,
  options: FetchPackageOptions,
): Promise<{ fetched: number; skipped: number; notFound: number }> {
  const { save, verbose, limit, logger } = options;
  const pm = pkg.packageManager;

  const versions = await pm
    .getVersions(
      pkg.name,
      { ...pkg.versionFetcherOptions, verbose, logger },
      limit,
    )
    .catch((error: unknown) => {
      console.error(
        `Failed to fetch versions: ${error instanceof Error ? error.message : error}`,
      );
      return [];
    });

  if (versions.length === 0) {
    return { fetched: 0, skipped: 0, notFound: 0 };
  }

  const fetcher = getChangelogFetcher(pkg.changelogFetcherOptions?.type);
  const dir = pm.dirname;

  let skippedCount = 0;
  let fetchedCount = 0;
  let notFoundCount = 0;

  for (let i = 0; i < versions.length; i++) {
    const version = versions[i].version;

    if (changelogExists(dir, pkg.name, version)) {
      if (verbose) {
        console.log(
          `  [${i + 1}/${versions.length}] Skipping ${version} (already exists)`,
        );
      }
      skippedCount++;
      continue;
    }

    if (isVersionNotFound(dir, pkg.name, version)) {
      if (verbose) {
        console.log(
          `  [${i + 1}/${versions.length}] Skipping ${version} (marked as not found)`,
        );
      }
      skippedCount++;
      continue;
    }

    console.log(`  [${i + 1}/${versions.length}] Fetching ${version}...`);

    try {
      const changelog = await fetcher.fetch(pkg, version, { verbose, logger });

      if (!changelog) {
        console.log(`    ⚠ No release found for ${version}`);
        if (save) {
          markVersionNotFound(dir, pkg.name, version);
          notFoundCount++;
        }
        continue;
      }

      fetchedCount++;

      if (save) {
        try {
          insertChangelog(dir, pkg.name, version, changelog.text);
          console.log(`    ✓ Saved to database`);
        } catch (saveError) {
          console.error(
            `    ✗ Failed to save: ${saveError instanceof Error ? saveError.message : saveError}`,
          );
        }
      } else {
        console.log(`    ✓ Found changelog (${changelog.text.length} chars)`);
      }
    } catch (error) {
      console.log(
        `    ⚠ Error: ${error instanceof Error ? error.message : error}`,
      );
    }

    if (i < versions.length - 1) {
      await sleep(1000);
    }
  }

  return { fetched: fetchedCount, skipped: skippedCount, notFound: notFoundCount };
}

async function processPackageList(
  packages: Package[],
  options: FetchPackageOptions,
): Promise<{ fetched: number; skipped: number; notFound: number }> {
  let totalFetched = 0;
  let totalSkipped = 0;
  let totalNotFound = 0;

  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    console.log(`\n[${i + 1}/${packages.length}] Processing ${pkg.name}...`);
    console.log(`  Repository: ${pkg.repositoryUrl}`);

    const result = await fetchAllVersionsForPackage(pkg, options);

    totalFetched += result.fetched;
    totalSkipped += result.skipped;
    totalNotFound += result.notFound;

    console.log(
      `  Summary: ${result.fetched} fetched, ${result.skipped} skipped, ${result.notFound} not found`,
    );

    if (i < packages.length - 1) {
      await sleep(2000);
    }
  }

  return { fetched: totalFetched, skipped: totalSkipped, notFound: totalNotFound };
}

const fetchCommand = new Command('get')
  .description('Fetch changelog for a package')
  .requiredOption('-p, --package <name>', 'Package name')
  .requiredOption('-v, --version <version>', 'Package version')
  .option(
    '-m, --manager <manager>',
    'Package manager (npm, pypi, crates, rubygems)',
    'npm',
  )
  .option('-r, --repo <url>', 'Repository URL (optional, overrides lookup)')
  .option('-s, --save', 'Save changelog to database')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options) => {
    const { package: packageName, version, manager, repo, save, verbose = false } = options;
    const logger = createLogger(verbose);
    const pm = requirePackageManager(manager);
    const pkg = resolvePackage(pm, packageName, manager, repo);

    if (isVersionNotFound(pm.dirname, pkg.name, version)) {
      console.error(
        `Version ${version} is marked as not found in the database`,
      );
      process.exit(1);
    }

    console.log(
      `Fetching changelog for ${pkg.name}@${version} from ${pkg.repositoryUrl}...`,
    );

    const fetcher = getChangelogFetcher(pkg.changelogFetcherOptions?.type);
    const changelog = await fetcher.fetch(pkg, version, { verbose, logger });

    if (!changelog) {
      console.error('Failed to fetch changelog. No release found.');

      if (save) {
        markVersionNotFound(pm.dirname, pkg.name, version);
        console.error(`Version marked as not found in database`);
      }

      process.exit(1);
    }

    console.log('\n--- Changelog ---\n');
    console.log(changelog.text);

    if (save) {
      insertChangelog(pm.dirname, pkg.name, version, changelog.text);
      closeDatabase();
      console.log(`\nChangelog saved to database`);
    }
  });

const listCommand = new Command('packages')
  .description('List all available packages')
  .option(
    '-m, --manager <manager>',
    'Filter by package manager (npm, pypi, crates, rubygems)',
  )
  .action((options) => {
    const { manager } = options;

    if (manager) {
      const pm = requirePackageManager(manager);
      const filtered = allPackages.filter(
        (p) => p.packageManager.dirname === pm.dirname,
      );

      if (filtered.length === 0) {
        console.log(`No packages configured for ${pm.name}.`);
        return;
      }

      console.log(`${pm.name} packages:\n`);
      for (const pkg of filtered) {
        console.log(`  - ${pkg.name}`);
      }
      return;
    }

    console.log('Available packages:\n');

    const byManager = new Map<string, Package[]>();
    for (const pkg of allPackages) {
      const managerName = pkg.packageManager.name;
      const packages = byManager.get(managerName) ?? [];
      packages.push(pkg);
      byManager.set(managerName, packages);
    }

    for (const [managerName, packages] of byManager) {
      console.log(`${managerName}:`);
      for (const pkg of packages) {
        console.log(`  - ${pkg.name}`);
      }
      console.log();
    }
  });

const versionsCommand = new Command('list-versions')
  .description('List all versions of a package from the registry')
  .requiredOption('-p, --package <name>', 'Package name')
  .option(
    '-m, --manager <manager>',
    'Package manager (npm, pypi, crates, rubygems)',
    'npm',
  )
  .option('-l, --limit <number>', 'Maximum number of versions to show')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options) => {
    const { package: packageName, manager, limit, verbose = false } = options;
    const logger = createLogger(verbose);
    const pm = requirePackageManager(manager);

    const pkg = allPackages.find(
      (p) => p.name === packageName && p.packageManager.dirname === pm.dirname,
    );

    console.log(`Fetching versions for ${packageName} from ${pm.name}...`);

    const versions = await pm
      .getVersions(
        packageName,
        { ...pkg?.versionFetcherOptions, verbose, logger },
        parseLimit(limit),
      )
      .catch((error: unknown) => {
        console.error(
          `Failed to fetch versions: ${error instanceof Error ? error.message : error}`,
        );
        process.exit(1);
      });

    if (versions.length === 0) {
      console.error('No versions found.');
      process.exit(1);
    }

    console.log(`\nFound ${versions.length} versions:\n`);
    for (const v of versions) {
      console.log(`  ${v.version}`);
    }
  });

const fetchAllCommand = new Command('sync')
  .description('Fetch changelogs for all versions of a package')
  .requiredOption('-p, --package <name>', 'Package name')
  .option(
    '-m, --manager <manager>',
    'Package manager (npm, pypi, crates, rubygems)',
    'npm',
  )
  .option('-r, --repo <url>', 'Repository URL (optional, overrides lookup)')
  .option('-l, --limit <number>', 'Maximum number of versions to fetch')
  .option('-s, --save', 'Save changelogs to database')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options) => {
    const { package: packageName, manager, repo, limit, save, verbose = false } = options;
    const logger = createLogger(verbose);
    const pm = requirePackageManager(manager);
    const pkg = resolvePackage(pm, packageName, manager, repo);

    const result = await fetchAllVersionsForPackage(pkg, {
      save: save ?? false,
      verbose,
      limit: parseLimit(limit),
      logger,
    });

    if (save) {
      closeDatabase();
    }

    if (result.skipped > 0) {
      console.log(
        `\nSkipped ${result.skipped} version(s) (already downloaded).`,
      );
    }

    console.log('\nDone!');
  });

const fetchSourceCommand = new Command('sync-registry')
  .description('Fetch changelogs for all packages from a source')
  .requiredOption(
    '-m, --manager <manager>',
    'Package manager (npm, pypi, crates, rubygems, github)',
  )
  .option('-l, --limit <number>', 'Maximum number of versions per package')
  .option('-s, --save', 'Save changelogs to database')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options) => {
    const { manager, limit, save, verbose = false } = options;
    const logger = createLogger(verbose);
    const pm = requirePackageManager(manager);

    const packages = allPackages.filter(
      (p) => p.packageManager.dirname === pm.dirname,
    );

    if (packages.length === 0) {
      console.error(`No packages configured for ${pm.name}.`);
      process.exit(1);
    }

    console.log(
      `Fetching changelogs for ${packages.length} packages from ${pm.name}...\n`,
    );

    const result = await processPackageList(packages, {
      save: save ?? false,
      verbose,
      limit: parseLimit(limit),
      logger,
    });

    if (save) {
      closeDatabase();
    }

    printFinalSummary(packages.length, result.fetched, result.skipped, result.notFound);
  });

const fetchProvidersCommand = new Command('sync-all')
  .description('Fetch changelogs for all packages from all providers')
  .option('-l, --limit <number>', 'Maximum number of versions per package')
  .option('-s, --save', 'Save changelogs to database')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options) => {
    const { limit, save, verbose = false } = options;
    const logger = createLogger(verbose);

    console.log('Fetching changelogs for all packages from all providers...\n');

    const maxVersions = parseLimit(limit);

    const packagesByManager = new Map<string, Package[]>();
    for (const pkg of allPackages) {
      const dir = pkg.packageManager.dirname;
      const list = packagesByManager.get(dir) ?? [];
      list.push(pkg);
      packagesByManager.set(dir, list);
    }

    let totalFetched = 0;
    let totalSkipped = 0;
    let totalNotFound = 0;
    let totalPackages = 0;

    for (const [, pm] of Object.entries(PACKAGE_MANAGERS)) {
      const packages = packagesByManager.get(pm.dirname) ?? [];

      if (packages.length === 0) {
        console.log(`No packages configured for ${pm.name}. Skipping...\n`);
        continue;
      }

      console.log(`Processing ${pm.name} (${packages.length} packages)...\n`);

      const result = await processPackageList(packages, {
        save: save ?? false,
        verbose,
        limit: maxVersions,
        logger,
      });

      totalFetched += result.fetched;
      totalSkipped += result.skipped;
      totalNotFound += result.notFound;
      totalPackages += packages.length;
    }

    if (save) {
      closeDatabase();
    }

    printFinalSummary(totalPackages, totalFetched, totalSkipped, totalNotFound);
  });

program.addCommand(fetchCommand);
program.addCommand(listCommand);
program.addCommand(versionsCommand);
program.addCommand(fetchAllCommand);
program.addCommand(fetchSourceCommand);
program.addCommand(fetchProvidersCommand);

program.parse();
