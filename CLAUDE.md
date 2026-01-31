# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
npm run changelog fetch <source> <package> <version>  # Fetch single changelog
npm run changelog list                                 # List configured packages
npm run changelog versions <source> <package>          # List all versions
npm run changelog fetch-all <source> <package>         # Batch fetch all versions
npm run changelog fetch-source -m <source>             # Fetch all packages from source
```

## Architecture

### Core Abstractions

The codebase uses abstract base classes with concrete implementations:

- **PackageManager** (`src/changelog/package-manager.ts`): Abstract base with 5 implementations in `src/changelog/package-managers/`
- **ChangelogFetcher** (`src/changelog/changelog-fetcher.ts`): Abstract base with 3 strategies in `src/changelog/fetchers/` (GitHub Releases, Changelog File, Wiki)
- **VersionFetcher** (`src/changelog/version-fetchers/version-fetcher.ts`): Abstract base with 5 implementations

### Key Directories

- `src/changelog/packages/`: Package configurations per registry (npm.ts, pypi.ts, etc.)
- `src/pages/changelogs/`: Dynamic Astro routes for changelog display
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

- Regular packages: `/changelogs/[source]/[pkg]/`
- Scoped packages: `/changelogs/[source]/@[org]/[pkg]/`
- GitHub repos: `/changelogs/github/[owner]/[repo]/`

### Content Collection

Markdown changelog files in `changelogs/` are auto-loaded as Astro content collection entries. Maintain the path structure: `{source}/{package}/{version}.md`

Files named `_not_found.md` track versions where changelogs couldn't be fetched.

## Environment

Requires `.env` with `GITHUB_PAT` for GitHub API access to avoid rate limits.
