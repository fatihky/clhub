import 'dotenv/config';

import { Command } from '@commander-js/extra-typings';
import { getChangelogFetcher } from '../changelog/fetchers';
import { createLogger, type Logger } from '../changelog/logger';
import { PACKAGE_MANAGERS, Package } from '../changelog/package';
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

const fetchCommand = new Command('fetch')
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
    const {
      package: packageName,
      version,
      manager,
      repo,
      save,
      verbose = false,
    } = options;
    const logger = createLogger(verbose);

    const pm = PACKAGE_MANAGERS[manager as keyof typeof PACKAGE_MANAGERS];
    if (!pm) {
      console.error(
        `Unknown package manager: ${manager}. Available: ${Object.keys(PACKAGE_MANAGERS).join(', ')}`,
      );
      process.exit(1);
    }

    // Look up package to get options even when using --repo
    const found = allPackages.find(
      (p) => p.name === packageName && p.packageManager.dirname === pm.dirname,
    );

    let pkg: Package;

    if (repo) {
      pkg = new Package(
        pm,
        packageName,
        repo,
        found?.versionFetcherOptions,
        found?.changelogFetcherOptions,
      );
    } else {
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
      pkg = found;
    }

    const fetcher = getChangelogFetcher(pkg.changelogFetcherOptions?.type);
    const dir = pkg.packageManager.dirname;

    // Check if version is already marked as not found
    if (isVersionNotFound(dir, pkg.name, version)) {
      console.error(
        `Version ${version} is marked as not found in the database`,
      );
      process.exit(1);
    }

    console.log(
      `Fetching changelog for ${pkg.name}@${version} from ${pkg.repositoryUrl}...`,
    );

    const changelog = await fetcher.fetch(pkg, version, { verbose, logger });

    if (!changelog) {
      console.error('Failed to fetch changelog. No release found.');

      if (save) {
        markVersionNotFound(dir, pkg.name, version);
        console.error(`Version marked as not found in database`);
      }

      process.exit(1);
    }

    console.log('\n--- Changelog ---\n');
    console.log(changelog.text);

    if (save) {
      insertChangelog(dir, pkg.name, version, changelog.text);
      closeDatabase();
      console.log(`\nChangelog saved to database`);
    }
  });

const listCommand = new Command('list')
  .description('List all available packages')
  .option(
    '-m, --manager <manager>',
    'Filter by package manager (npm, pypi, crates, rubygems)',
  )
  .action((options) => {
    const { manager } = options;

    if (manager) {
      const pm = PACKAGE_MANAGERS[manager as keyof typeof PACKAGE_MANAGERS];
      if (!pm) {
        console.error(
          `Unknown package manager: ${manager}. Available: ${Object.keys(PACKAGE_MANAGERS).join(', ')}`,
        );
        process.exit(1);
      }

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

    for (const [manager, packages] of byManager) {
      console.log(`${manager}:`);
      for (const pkg of packages) {
        console.log(`  - ${pkg.name}`);
      }
      console.log();
    }
  });

const versionsCommand = new Command('versions')
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

    const pm = PACKAGE_MANAGERS[manager as keyof typeof PACKAGE_MANAGERS];
    if (!pm) {
      console.error(
        `Unknown package manager: ${manager}. Available: ${Object.keys(PACKAGE_MANAGERS).join(', ')}`,
      );
      process.exit(1);
    }

    // Look up package to get version fetcher options
    const pkg = allPackages.find(
      (p) => p.name === packageName && p.packageManager.dirname === pm.dirname,
    );

    console.log(`Fetching versions for ${packageName} from ${pm.name}...`);

    const versionFetcherOptions = {
      ...pkg?.versionFetcherOptions,
      verbose,
      logger,
    };

    const maxVersions = limit ? Number.parseInt(limit, 10) : undefined;

    const versions = await pm
      .getVersions(packageName, versionFetcherOptions, maxVersions)
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

const fetchAllCommand = new Command('fetch-all')
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
    const {
      package: packageName,
      manager,
      repo,
      limit,
      save,
      verbose = false,
    } = options;
    const logger = createLogger(verbose);

    // Validate package manager
    const pm = PACKAGE_MANAGERS[manager as keyof typeof PACKAGE_MANAGERS];
    if (!pm) {
      console.error(
        `Unknown package manager: ${manager}. Available: ${Object.keys(PACKAGE_MANAGERS).join(', ')}`,
      );
      process.exit(1);
    }

    // Look up package to get repository URL and version fetcher options
    const found = allPackages.find(
      (p) => p.name === packageName && p.packageManager.dirname === pm.dirname,
    );

    // Determine repository URL
    let repositoryUrl: string;
    if (repo) {
      repositoryUrl = repo;
    } else {
      if (!found) {
        console.error(
          `Package "${packageName}" not found for manager "${manager}".`,
        );
        console.error('Use --repo to specify the repository URL manually.');
        process.exit(1);
      }
      repositoryUrl = found.repositoryUrl;
    }

    const pkg = new Package(
      pm,
      packageName,
      repositoryUrl,
      found?.versionFetcherOptions,
      found?.changelogFetcherOptions,
      found?.groupByMajorVersion,
    );

    // Fetch versions from registry
    console.log(`Fetching versions for ${packageName} from ${pm.name}...`);

    const versionFetcherOptions = {
      ...pkg.versionFetcherOptions,
      verbose,
      logger,
    };

    const maxVersions = limit ? Number.parseInt(limit, 10) : undefined;

    const versions = await pm
      .getVersions(packageName, versionFetcherOptions, maxVersions)
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

    console.log(
      `Found ${versions.length} versions. Fetching changelogs for ${versions.length} versions...\n`,
    );

    const fetcher = getChangelogFetcher(pkg.changelogFetcherOptions?.type);

    const dir = pm.dirname;

    // Process versions sequentially with delay to avoid rate limiting
    let skippedCount = 0;
    const newNotFoundVersions: string[] = [];

    for (let i = 0; i < versions.length; i++) {
      const versionInfo = versions[i];
      const version = versionInfo.version;

      // Skip if changelog already exists in database
      if (changelogExists(dir, packageName, version)) {
        console.log(
          `[${i + 1}/${versions.length}] Skipping ${version} (already exists)`,
        );
        skippedCount++;
        continue;
      }

      // Skip if already marked as not found
      if (isVersionNotFound(dir, packageName, version)) {
        console.log(
          `[${i + 1}/${versions.length}] Skipping ${version} (marked as not found)`,
        );
        skippedCount++;
        continue;
      }

      console.log(`[${i + 1}/${versions.length}] Fetching ${version}...`);

      try {
        const changelog = await fetcher.fetch(pkg, version, {
          verbose,
          logger,
        });

        if (!changelog) {
          console.log(`  ⚠ No release found for ${version}`);
          if (save) {
            newNotFoundVersions.push(version);
          }
          continue;
        }

        if (save) {
          try {
            insertChangelog(dir, packageName, version, changelog.text);
            console.log(`  ✓ Saved to database`);
          } catch (saveError) {
            console.error(
              `  ✗ Failed to save: ${saveError instanceof Error ? saveError.message : saveError}`,
            );
          }
        } else {
          console.log(`  ✓ Found changelog (${changelog.text.length} chars)`);
        }
      } catch (error) {
        console.log(
          `  ⚠ Error: ${error instanceof Error ? error.message : error}`,
        );
      }

      // Add delay between requests to avoid rate limiting (except for the last one)
      if (i < versions.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Save not-found versions
    if (save && newNotFoundVersions.length > 0) {
      for (const version of newNotFoundVersions) {
        markVersionNotFound(dir, packageName, version);
      }
      console.log(
        `\nMarked ${newNotFoundVersions.length} version(s) as not found in database`,
      );
    }

    if (save) {
      closeDatabase();
    }

    if (skippedCount > 0) {
      console.log(`\nSkipped ${skippedCount} version(s) (already downloaded).`);
    }

    console.log('\nDone!');
  });

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

  const versionFetcherOptions = {
    ...pkg.versionFetcherOptions,
    verbose,
    logger,
  };

  const maxVersions = limit;

  const versions = await pm
    .getVersions(pkg.name, versionFetcherOptions, maxVersions)
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
  const newNotFoundVersions: string[] = [];

  for (let i = 0; i < versions.length; i++) {
    const versionInfo = versions[i];
    const version = versionInfo.version;

    // Skip if changelog already exists in database
    if (changelogExists(dir, pkg.name, version)) {
      if (verbose) {
        console.log(
          `  [${i + 1}/${versions.length}] Skipping ${version} (already exists)`,
        );
      }
      skippedCount++;
      continue;
    }

    // Skip if already marked as not found
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
      const changelog = await fetcher.fetch(pkg, version, {
        verbose,
        logger,
      });

      if (!changelog) {
        console.log(`    ⚠ No release found for ${version}`);
        if (save) {
          newNotFoundVersions.push(version);
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

    // Add delay between requests to avoid rate limiting (except for the last one)
    if (i < versions.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Save not-found versions
  if (save && newNotFoundVersions.length > 0) {
    for (const version of newNotFoundVersions) {
      markVersionNotFound(dir, pkg.name, version);
    }
  }

  return {
    fetched: fetchedCount,
    skipped: skippedCount,
    notFound: newNotFoundVersions.length,
  };
}

const fetchSourceCommand = new Command('fetch-source')
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

    // Validate package manager
    const pm = PACKAGE_MANAGERS[manager as keyof typeof PACKAGE_MANAGERS];
    if (!pm) {
      console.error(
        `Unknown package manager: ${manager}. Available: ${Object.keys(PACKAGE_MANAGERS).join(', ')}`,
      );
      process.exit(1);
    }

    // Get all packages for this manager
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

    const maxVersions = limit ? Number.parseInt(limit, 10) : undefined;

    let totalFetched = 0;
    let totalSkipped = 0;
    let totalNotFound = 0;

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      console.log(`\n[${i + 1}/${packages.length}] Processing ${pkg.name}...`);
      console.log(`  Repository: ${pkg.repositoryUrl}`);

      const result = await fetchAllVersionsForPackage(pkg, {
        save: save ?? false,
        verbose,
        limit: maxVersions,
        logger,
      });

      totalFetched += result.fetched;
      totalSkipped += result.skipped;
      totalNotFound += result.notFound;

      console.log(
        `  Summary: ${result.fetched} fetched, ${result.skipped} skipped, ${result.notFound} not found`,
      );

      // Add delay between packages to avoid rate limiting
      if (i < packages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    if (save) {
      closeDatabase();
    }

    console.log('\n--- Final Summary ---');
    console.log(`Packages processed: ${packages.length}`);
    console.log(`Total fetched: ${totalFetched}`);
    console.log(`Total skipped: ${totalSkipped}`);
    console.log(`Total not found: ${totalNotFound}`);
    console.log('\nDone!');
  });

const fetchProvidersCommand = new Command('fetch-providers')
  .description('Fetch changelogs for all packages from all providers')
  .option('-l, --limit <number>', 'Maximum number of versions per package')
  .option('-s, --save', 'Save changelogs to database')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options) => {
    const { limit, save, verbose = false } = options;
    const logger = createLogger(verbose);

    console.log('Fetching changelogs for all packages from all providers...\n');

    const maxVersions = limit ? Number.parseInt(limit, 10) : undefined;

    let totalFetched = 0;
    let totalSkipped = 0;
    let totalNotFound = 0;
    let totalPackages = 0;

    // Process each package manager
    for (const [managerKey, pm] of Object.entries(PACKAGE_MANAGERS)) {
      const packages = allPackages.filter(
        (p) => p.packageManager.dirname === pm.dirname,
      );

      if (packages.length === 0) {
        console.log(`No packages configured for ${pm.name}. Skipping...\n`);
        continue;
      }

      console.log(`Processing ${pm.name} (${packages.length} packages)...\n`);

      // Process each package for this manager
      for (let i = 0; i < packages.length; i++) {
        const pkg = packages[i];
        totalPackages++;
        console.log(
          `[${totalPackages}] Processing ${pkg.name} from ${pm.name}...`,
        );
        console.log(`  Repository: ${pkg.repositoryUrl}`);

        const result = await fetchAllVersionsForPackage(pkg, {
          save: save ?? false,
          verbose,
          limit: maxVersions,
          logger,
        });

        totalFetched += result.fetched;
        totalSkipped += result.skipped;
        totalNotFound += result.notFound;

        console.log(
          `  Summary: ${result.fetched} fetched, ${result.skipped} skipped, ${result.notFound} not found\n`,
        );

        // Add delay between packages to avoid rate limiting
        if (i < packages.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Add delay between package managers to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    if (save) {
      closeDatabase();
    }

    console.log('\n--- Final Summary ---');
    console.log(`Total packages processed: ${totalPackages}`);
    console.log(`Total fetched: ${totalFetched}`);
    console.log(`Total skipped: ${totalSkipped}`);
    console.log(`Total not found: ${totalNotFound}`);
    console.log('\nDone!');
  });

program.addCommand(fetchCommand);
program.addCommand(listCommand);
program.addCommand(versionsCommand);
program.addCommand(fetchAllCommand);
program.addCommand(fetchSourceCommand);
program.addCommand(fetchProvidersCommand);

program.parse();
