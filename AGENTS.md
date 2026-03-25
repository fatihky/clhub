# AGENTS.md

This file provides guidance to Coding Agents (claude, opencode) when working with code in this repository.

## Project Overview

Changelog Hub (clhub-astro) is a static documentation site built with Astro and Starlight that aggregates changelogs from 5 package registries: npm, PyPI, Crates.io, RubyGems, and GitHub.

**Deployed at:** https://fatihky.github.io/clhub

## Commands

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview built site
npm run lint         # Lint with Biomejs
npm run format       # Auto-format code
npm run changelog    # CLI for changelog management (tsx src/tools/cli.ts)
```

**CLI commands:**
```bash
npm run changelog -- list                                                      # List all configured packages
npm run changelog -- versions -m <manager> -p <package>                        # List all versions (manager: npm, pypi, crates, rubygems)
npm run changelog -- fetch -m <manager> -p <package> -v <version>             # Fetch single changelog
npm run changelog -- fetch-all -m <manager> -p <package>                       # Batch fetch all versions
npm run changelog -- fetch-source -m <manager>                                 # Fetch all packages from a source
npm run changelog -- fetch-providers                                           # Fetch all packages from all sources
```

## Architecture

### Core Abstractions

The codebase uses abstract base classes with concrete implementations:

- **PackageManager** (`src/changelog/package-manager.ts`): Abstract base with 5 implementations in `src/changelog/package-managers/`
- **ChangelogFetcher** (`src/changelog/changelog-fetcher.ts`): Abstract base with 3 strategies in `src/changelog/fetchers/` (GitHub Releases, Changelog File, Wiki)
- **VersionFetcher** (`src/changelog/version-fetchers/version-fetcher.ts`): Abstract base with 5 implementations

### Key Directories

- `src/changelog/packages/`: Package configurations per registry (npm.ts, pypi.ts, etc.)
- `src/pages/[source]/`: Dynamic Astro routes for changelog display
- `src/pages/github/`: GitHub-specific routes for repository changelogs
- `src/tools/`: CLI tools for changelog management
- `changelogs/`: Generated markdown files organized as `{source}/{package}/{version}.md`

### Package Configuration Pattern

```typescript
export const npmPackages = packageMapToArray(pm, {
  'package-name': {
    repositoryUrl: 'https://github.com/owner/repo',
    changelogFetcherOptions: {
      type: 'githubReleases' | 'githubChangelogFile' | 'githubWiki',
      tagPrefix: 'v',
      changelogFilename: 'CHANGELOG.md'
    }
  }
});
```

### Base Path Handling

The site deploys to a GitHub Pages subpath (`/clhub`). Use the `route()` utility from `src/utils/route.ts` for all internal links - it handles path prefixing in production.

### Dynamic Routing

- Regular packages: `/[source]/[pkg]/`
- Scoped packages: `/[source]/@[org]/[pkg]/`
- GitHub repos: `/github/[owner]/[repo]/`

### Content Collection

Markdown changelog files in `changelogs/` are auto-loaded as Astro content collection entries. Maintain the path structure: `{source}/{package}/{version}.md`

Files named `_not_found.md` track versions where changelogs couldn't be fetched.

## Adding a New Package

When a user wants to register a new package, **ask these questions** before proceeding:

1. **Which registry?** (npm, PyPI, Crates.io, RubyGems, or GitHub repo)
2. **Package name?** (e.g., `react`, `django`, `serde`, `rails`, `owner/repo`)
3. **Repository URL?** (GitHub URL where the changelog lives)
4. **Where is the changelog?**
   - GitHub Releases (tag-based)
   - Changelog file in repo (e.g., `CHANGELOG.md`)
   - GitHub Wiki page
5. **Any special parsing needed?** (e.g., tag prefix like `v1.0.0` vs `1.0.0`)

### Implementation Steps

1. **Locate the package file** in `src/changelog/packages/{source}.ts` (e.g., `npm.ts`, `pypi.ts`)
2. **Add package entry** to the configuration object with:
   - `repositoryUrl`: GitHub URL
   - `changelogFetcherOptions.type`: Fetcher strategy
   - `changelogFetcherOptions.tagPrefix`: If needed (default: empty string)
   - `changelogFetcherOptions.changelogFilename`: If using file strategy (e.g., `CHANGELOG.md`)
   - **Maintain alphabetical order** by package name in the configuration object
3. **Test the configuration:**
   ```bash
   npm run changelog list                              # Verify package appears
   npm run changelog versions <source> <package>       # Check version detection
   npm run changelog fetch <source> <package> <ver>    # Fetch a single changelog
   ```
4. **Commit** and push changes

### Example: Adding npm Package

```typescript
// src/changelog/packages/npm.ts
export const npmPackages = packageMapToArray(pm, {
  // ... existing packages
  'new-package': {
    repositoryUrl: 'https://github.com/owner/new-package',
    changelogFetcherOptions: {
      type: 'githubReleases',
      tagPrefix: 'v'
    }
  }
});
```

## Environment

Requires `.env` with `GITHUB_PAT` for GitHub API access to avoid rate limits.
