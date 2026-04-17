## [unreleased]

## [0.3.0]

# Changelog

## 🚀 Features

- Add changelog source links with improved layout
- Set framer-motion and tailwind-merge to semverOnly mode
- Add new npm packages: @biomejs/biome, @clickhouse/client, date-fns, dompurify, framer-motion, gitnexus, jose, lru-cache, uuid
- Simplify version fetchers for playwright, react, and tailwindcss
- **Changelog URL Generation**: Added `getChangelogUrl()` function to generate direct links to package changelogs based on source and configuration
- **Package Configuration Utilities**: Added `getPackageConfig()` and `getPackageRepositoryUrl()` helper functions for package lookup
- **CLI Command Restructuring**: Renamed commands for clarity:
  - `fetch` → `get` (fetch single version)
  - `list` → `packages` (list available packages)
  - `versions` → `list-versions` (list package versions)
  - `fetch-all` → `sync` (sync all versions of a package)
  - `fetch-source` → `sync-registry` (sync packages from a source)
  - `fetch-providers` → `sync-all` (sync all packages)
- **Version Filtering**: Changed from exclusion-based patterns to inclusion-based `versionPattern` matching for cleaner version filtering logic
- **Code Organization**: Extracted reusable CLI utilities (`requirePackageManager()`, `resolvePackage()`, `parseLimit()`, `sleep()`)

## 🐛 Bug Fixes

- Use GitHub releases for tailwind-merge instead of changelog file
- Fixed version fetcher options for several packages (Playwright, React, Tailwind CSS, Zod) to use consistent `onlySemver` preset

## 📝 Documentation

- Add package registration guide
- Update package registration instructions to maintain alphabetical order
- Correct changelog CLI command usage in AGENTS.md
- Rename claude.md to AGENTS.md

## 🎨 Improvements

- Updated many npm packages to use `githubChangelogFile` type instead of tag prefixes for more accurate changelog sourcing
- Normalized indentation and import ordering across multiple files

## [0.2.0] - 2026-03-15

- added `fetch-providers` command

### 🚀 Features

- Add hide pre-releases toggle with localStorage persistence
- _(packages/npm)_ Added pm2
- _(cli)_ Add fetch-source command to fetch all packages from a source

## [0.1.0] - 2026-01-31

### 🚀 Features

- _(changelog)_ Add mise package to github packages list
- _(changelog)_ Add GitHub wiki fetcher and update npm package changelogs
- Add GitHub Pages deployment and npm package changelogs
- _(changelog)_ Display file size for changelog entries
- _(ci)_ Add GitHub Pages deployment workflow
- _(config)_ Update site URL and base path for deployment
- _(routing)_ Add route utility for base path handling
- _(packages/npm)_ Added vike-react family of packages

### 🐛 Bug Fixes

- Update GitHub social link to correct repository URL
