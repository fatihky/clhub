import fs from 'node:fs';
import path from 'node:path';
import { parseChangelogPath } from '../changelog/utils';
import {
  beginTransaction,
  commitTransaction,
  insertChangelog,
  markVersionNotFound,
  rollbackTransaction,
} from '../db/changelog-repository';

const CHANGELOGS_DIR = path.join(process.cwd(), 'changelogs');

interface Stats {
  changelogs: number;
  notFound: number;
  errors: number;
}

/**
 * Recursively walks a directory and returns all file paths.
 */
function* walkDirectory(dir: string): Generator<string> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* walkDirectory(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

/**
 * Parses a _not_found.md file and returns the list of versions.
 */
function parseNotFoundFile(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !line.startsWith('<'));
}

/**
 * Migrates all changelog files to the database.
 */
async function migrate(): Promise<void> {
  if (!fs.existsSync(CHANGELOGS_DIR)) {
    console.error(`Changelogs directory not found: ${CHANGELOGS_DIR}`);
    process.exit(1);
  }

  const stats: Stats = {
    changelogs: 0,
    notFound: 0,
    errors: 0,
  };

  console.log('Starting migration...\n');

  try {
    beginTransaction();

    for (const filePath of walkDirectory(CHANGELOGS_DIR)) {
      const relativePath = path.relative(CHANGELOGS_DIR, filePath);

      // Handle _not_found.md files
      if (path.basename(filePath) === '_not_found.md') {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const versions = parseNotFoundFile(content);
          const parsed = parseChangelogPath(relativePath);

          for (const version of versions) {
            markVersionNotFound(parsed.source, parsed.pkg, version);
            stats.notFound++;
          }

          console.log(
            `  ✓ Imported ${versions.length} not-found versions from ${relativePath}`,
          );
        } catch (error) {
          console.error(`  ✗ Error processing ${relativePath}:`, error);
          stats.errors++;
        }
        continue;
      }

      // Handle regular changelog files
      if (!filePath.endsWith('.md')) {
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = parseChangelogPath(relativePath);

        insertChangelog(parsed.source, parsed.pkg, parsed.version, content);
        stats.changelogs++;

        if (stats.changelogs % 100 === 0) {
          console.log(`  Imported ${stats.changelogs} changelogs...`);
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${relativePath}:`, error);
        stats.errors++;
      }
    }

    commitTransaction();

    console.log('\n--- Migration Summary ---');
    console.log(`Changelogs imported: ${stats.changelogs}`);
    console.log(`Not-found versions imported: ${stats.notFound}`);
    console.log(`Errors: ${stats.errors}`);
    console.log('\nMigration completed successfully!');
  } catch (error) {
    rollbackTransaction();
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
