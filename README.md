# Changelog Hub

## Goals
1. Easy to use, up-to-date changelog mirror of the popular packages.
2. Allow to list changelogs.
3. Allow to compare changelogs of projects.

## Non-Goals
1. Proxy any package manager. This project does not aim to replace any package manager functionality. Even the package reamd's are not managed by us.
2. Serve package READMEs. This is a error prone job and needs more careful work.
3. Serve package statistics (downloads, issues, pending prs etc.).

## Adding a Package

Want to add a new package? Here's how:

1. **Identify the details:**
   - Registry: npm, PyPI, Crates.io, RubyGems, or GitHub
   - Package name
   - GitHub repository URL
   - Changelog location (GitHub Releases, file, or wiki)

2. **Edit the package file** at `src/changelog/packages/{registry}.ts`

3. **Add your package** (maintaining alphabetical order by package name):
   ```typescript
   'package-name': {
     repositoryUrl: 'https://github.com/owner/repo',
     changelogFetcherOptions: {
       type: 'githubReleases',  // or 'githubChangelogFile', 'githubWiki'
       tagPrefix: 'v'           // adjust based on your tag format
     }
   }
   ```

4. **Test it:**
   ```bash
   npm run changelog list-versions <registry> <package>
   npm run changelog get <registry> <package> <version>
   ```

5. **Submit a PR**

See [AGENTS.md](./AGENTS.md#adding-a-new-package) for detailed guidance.
