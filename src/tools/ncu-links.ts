import { Command } from '@commander-js/extra-typings';

export const ncuLinksCommand = new Command('ncu-links')
  .description(
    'Parse `ncu --format diff` output from stdin and print changelog comparison URLs',
  )
  .option(
    '--base-url <url>',
    'Base URL for the changelog site',
    'https://fatihky.github.io/clhub',
  )
  .action(async (options) => {
    const { baseUrl } = options;

    if (process.stdin.isTTY) {
      console.error(
        'No piped input detected. Usage: ncu --format diff | npm run changelog -- ncu-links',
      );
      process.exit(1);
    }

    let input = '';
    process.stdin.setEncoding('utf-8');
    for await (const chunk of process.stdin) {
      input += chunk;
    }

    let found = false;
    for (const line of input.split('\n')) {
      // Match: " package-name   ^from  →  ^to   ..."
      const match = line.match(/^\s+(\S+)\s+[\^~]?(\S+)\s+→\s+[\^~]?(\S+)/);
      if (!match) continue;

      const [, packageName, fromVersion, toVersion] = match;
      console.log(
        `${packageName}: ${baseUrl}/npm/${packageName}/compare/?from=${fromVersion}&to=${toVersion}`,
      );
      found = true;
    }

    if (!found) {
      console.error('No package updates found in input.');
      process.exit(1);
    }
  });
