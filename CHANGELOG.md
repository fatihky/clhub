## [unreleased]

### 🚀 Features

- Add changelog source links with improved layout
- Set framer-motion and tailwind-merge to semverOnly mode
- Add new npm packages: @biomejs/biome, @clickhouse/client, date-fns, dompurify, framer-motion, jose, lru-cache, uuid
- Simplify version fetchers for playwright, react, and tailwindcss

### 🐛 Bug Fixes

- Use GitHub releases for tailwind-merge instead of changelog file

### 📝 Documentation

- Add package registration guide
- Update package registration instructions to maintain alphabetical order
- Correct changelog CLI command usage in AGENTS.md
- Rename claude.md to AGENTS.md

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
