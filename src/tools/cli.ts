import 'dotenv/config';

import fs from 'node:fs';
import path from 'node:path';
import { Command } from '@commander-js/extra-typings';
import { getChangelogFetcher } from '../changelog/fetchers';
import { createLogger } from '../changelog/logger';
import { PACKAGE_MANAGERS, Package } from '../changelog/package';
import { allPackages } from '../changelog/packages';

const program = new Command();

program
  .name('changelog')
  .description('Fetch changelogs for packages')
  .version('0.0.1');

const notFoundFileHeader = `<!--
These versions' release notes could not be found.
They are listed here to prevent excessive checks.
-->`;

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
  .option('-s, --save', 'Save changelog to [manager]/[package]/[version].md')
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
    const notFoundPath = path.join(
      'changelogs',
      dir,
      pkg.name,
      '_not_found.md',
    );

    // Check if version is already marked as not found
    if (fs.existsSync(notFoundPath)) {
      const content = fs.readFileSync(notFoundPath, 'utf-8');
      const notFoundVersions = new Set(
        content
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#')),
      );
      if (notFoundVersions.has(version)) {
        console.error(
          `Version ${version} is marked as not found in ${notFoundPath}`,
        );
        process.exit(1);
      }
    }

    console.log(
      `Fetching changelog for ${pkg.name}@${version} from ${pkg.repositoryUrl}...`,
    );

    const changelog = await fetcher.fetch(pkg, version, { verbose, logger });

    if (!changelog) {
      console.error('Failed to fetch changelog. No release found.');

      if (save) {
        const dir = path.dirname(notFoundPath);
        fs.mkdirSync(dir, { recursive: true });

        let content: string;
        if (fs.existsSync(notFoundPath)) {
          content =
            fs.readFileSync(notFoundPath, 'utf-8').trimEnd() +
            '\n' +
            version +
            '\n';
        } else {
          content = `${notFoundFileHeader}\n\n${version}\n`;
        }

        fs.writeFileSync(notFoundPath, content);
        console.error(`Version added to ${notFoundPath}`);
      }

      process.exit(1);
    }

    console.log('\n--- Changelog ---\n');
    console.log(changelog.text);

    if (save) {
      const filePath = path.join('changelogs', dir, pkg.name, `${version}.md`);
      const fileDir = path.dirname(filePath);

      fs.mkdirSync(fileDir, { recursive: true });
      fs.writeFileSync(filePath, changelog.text);

      console.log(`\nChangelog saved to ${filePath}`);
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
  .option(
    '-s, --save',
    'Save changelogs to changelogs/{manager}/{package}/{version}.md',
  )
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
    const notFoundPath = path.join(
      'changelogs',
      dir,
      packageName,
      '_not_found.md',
    );

    // Load existing not-found versions
    const notFoundVersions = new Set<string>();
    if (fs.existsSync(notFoundPath)) {
      const content = fs.readFileSync(notFoundPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          notFoundVersions.add(trimmed);
        }
      }
    }

    // Process versions sequentially with delay to avoid rate limiting
    let skippedCount = 0;
    const newNotFoundVersions: string[] = [];

    for (let i = 0; i < versions.length; i++) {
      const versionInfo = versions[i];
      const version = versionInfo.version;

      const filePath = path.join(
        'changelogs',
        dir,
        packageName,
        `${version}.md`,
      );

      // Skip if file already exists
      if (fs.existsSync(filePath)) {
        console.log(
          `[${i + 1}/${versions.length}] Skipping ${version} (already exists)`,
        );
        skippedCount++;
        continue;
      }

      // Skip if already marked as not found
      if (notFoundVersions.has(version)) {
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
          const dir = path.dirname(filePath);

          try {
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(filePath, changelog.text);
            console.log(`  ✓ Saved to ${filePath}`);
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
      const dir = path.dirname(notFoundPath);
      fs.mkdirSync(dir, { recursive: true });

      let content: string;
      if (fs.existsSync(notFoundPath)) {
        // Append to existing file
        content =
          fs.readFileSync(notFoundPath, 'utf-8').trimEnd() +
          '\n' +
          newNotFoundVersions.join('\n') +
          '\n';
      } else {
        // Create new file with header
        content = `${notFoundFileHeader}\n\n${newNotFoundVersions.join('\n')}\n`;
      }

      fs.writeFileSync(notFoundPath, content);
      console.log(
        `\nAdded ${newNotFoundVersions.length} version(s) to ${notFoundPath}`,
      );
    }

    if (skippedCount > 0) {
      console.log(`\nSkipped ${skippedCount} version(s) (already downloaded).`);
    }

    console.log('\nDone!');
  });

program.addCommand(fetchCommand);
program.addCommand(listCommand);
program.addCommand(versionsCommand);
program.addCommand(fetchAllCommand);

program.parse();
