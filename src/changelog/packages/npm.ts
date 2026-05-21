import { PACKAGE_MANAGERS } from '../package';
import { versionFetcherOptionPresets } from '../version-fetchers/version-fetcher';
import { packageMapToArray } from './package-map-to-array';

const pm = PACKAGE_MANAGERS.npm;

export const npmPackages = packageMapToArray(pm, {
  '@astrojs/starlight': {
    repositoryUrl: 'https://github.com/withastro/starlight',
    changelogFetcherOptions: { tagPrefix: '@astrojs/starlight@' },
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
  },
  '@biomejs/biome': {
    repositoryUrl: 'https://github.com/biomejs/biome',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { tagPrefix: '@biomejs/biome@' },
  },
  '@clickhouse/client': {
    repositoryUrl: 'https://github.com/ClickHouse/clickhouse-js',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
  },
  '@fingerprintjs/fingerprintjs': {
    repositoryUrl: 'https://github.com/fingerprintjs/fingerprintjs',
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  '@formatjs/intl-localematcher': {
    repositoryUrl: 'https://github.com/formatjs/formatjs',
    changelogFetcherOptions: { tagPrefix: '@formatjs/intl-localematcher@' },
  },
  '@fumadocs/cli': {
    repositoryUrl: 'https://github.com/fuma-nama/fumadocs',
    changelogFetcherOptions: { tagPrefix: '@fumadocs/cli@' },
  },
  '@inquirer/prompts': {
    repositoryUrl: 'https://github.com/SBoudrias/Inquirer.js',
    changelogFetcherOptions: { tagPrefix: '@inquirer/prompts@' },
  },
  '@linear/sdk': {
    repositoryUrl: 'https://github.com/linear/linear',
    changelogFetcherOptions: { tagPrefix: '@linear/sdk@' },
  },
  '@orama/orama': {
    repositoryUrl: 'https://github.com/oramasearch/orama',
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  '@standard-schema/spec': {
    repositoryUrl: 'https://github.com/standard-schema/standard-schema',
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  antd: {
    repositoryUrl: 'https://github.com/ant-design/ant-design',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
  },
  astro: {
    repositoryUrl: 'https://github.com/withastro/astro',
    changelogFetcherOptions: { tagPrefix: 'astro@' },
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
  },
  'better-sqlite3': {
    repositoryUrl: 'https://github.com/WiseLibs/better-sqlite3',
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  chai: {
    repositoryUrl: 'https://github.com/chaijs/chai',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  chokidar: {
    repositoryUrl: 'https://github.com/paulmillr/chokidar',
  },
  commander: {
    repositoryUrl: 'https://github.com/tj/commander.js',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  corepack: {
    repositoryUrl: 'https://github.com/nodejs/corepack',
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  'create-fumadocs-app': {
    repositoryUrl: 'https://github.com/fuma-nama/fumadocs',
    changelogFetcherOptions: { tagPrefix: 'create-fumadocs-app@' },
  },
  'date-fns': {
    repositoryUrl: 'https://github.com/date-fns/date-fns',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubReleases',
      tagPrefix: 'v',
    },
  },
  dompurify: {
    repositoryUrl: 'https://github.com/cure53/DOMPurify',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubReleases' },
  },
  domhandler: {
    repositoryUrl: 'https://github.com/fb55/domhandler',
    changelogFetcherOptions: { type: 'githubReleases', tagPrefix: 'v' },
  },
  dotenv: {
    repositoryUrl: 'https://github.com/motdotla/dotenv',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  'echarts-for-react': {
    repositoryUrl: 'https://github.com/hustcc/echarts-for-react',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  enquirer: {
    repositoryUrl: 'https://github.com/enquirer/enquirer',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  esbuild: {
    repositoryUrl: 'https://github.com/evanw/esbuild',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  express: {
    repositoryUrl: 'https://github.com/expressjs/express',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  'fast-deep-equal': {
    repositoryUrl: 'https://github.com/epoberezkin/fast-deep-equal',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  'framer-motion': {
    repositoryUrl: 'https://github.com/motiondivision/motion',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  'fumadocs-core': {
    repositoryUrl: 'https://github.com/fuma-nama/fumadocs',
    changelogFetcherOptions: { tagPrefix: 'fumadocs-core@' },
  },
  'fumadocs-mdx': {
    repositoryUrl: 'https://github.com/fuma-nama/fumadocs',
    changelogFetcherOptions: { tagPrefix: 'fumadocs-mdx@' },
  },
  'fumadocs-openapi': {
    repositoryUrl: 'https://github.com/fuma-nama/fumadocs',
    changelogFetcherOptions: { tagPrefix: 'fumadocs-openapi@' },
  },
  'fumadocs-twoslash': {
    repositoryUrl: 'https://github.com/fuma-nama/fumadocs',
    changelogFetcherOptions: { tagPrefix: 'fumadocs-twoslash@' },
  },
  'fumadocs-typescript': {
    repositoryUrl: 'https://github.com/fuma-nama/fumadocs',
    changelogFetcherOptions: { tagPrefix: 'fumadocs-typescript@' },
  },
  'fumadocs-ui': {
    repositoryUrl: 'https://github.com/fuma-nama/fumadocs',
    changelogFetcherOptions: { tagPrefix: 'fumadocs-ui@' },
  },
  fumapress: {
    repositoryUrl: 'https://github.com/fuma-nama/fumadocs',
    changelogFetcherOptions: { tagPrefix: 'fumapress@' },
  },
  gitnexus: {
    repositoryUrl: 'https://github.com/abhigyanpatwari/GitNexus',
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  i18next: {
    repositoryUrl: 'https://github.com/i18next/i18next',
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  inquirer: {
    repositoryUrl: 'https://github.com/SBoudrias/Inquirer.js',
    changelogFetcherOptions: { tagPrefix: 'inquirer@' },
  },
  jiti: {
    repositoryUrl: 'https://github.com/unjs/jiti',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  'js-yaml': {
    repositoryUrl: 'https://github.com/nodeca/js-yaml',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  jose: {
    repositoryUrl: 'https://github.com/panva/jose',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubReleases',
      tagPrefix: 'v',
    },
  },
  lodash: {
    repositoryUrl: 'https://github.com/lodash/lodash',
    changelogFetcherOptions: {
      type: 'githubWiki',
      changelogFilename: 'Changelog',
      tagPrefix: 'v',
    },
  },
  'lucide-react': {
    repositoryUrl: 'https://github.com/lucide-icons/lucide',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
  },
  'lru-cache': {
    repositoryUrl: 'https://github.com/isaacs/node-lru-cache',
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  mocha: {
    repositoryUrl: 'https://github.com/mochajs/mocha',
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  negotiator: {
    repositoryUrl: 'https://github.com/jshttp/negotiator',
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  next: {
    repositoryUrl: 'https://github.com/vercel/next.js',
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
    groupByMajorVersion: true,
  },
  'next-i18next': {
    repositoryUrl: 'https://github.com/i18next/next-i18next',
  },
  'next-intl': {
    repositoryUrl: 'https://github.com/amannn/next-intl',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  npm: {
    repositoryUrl: 'https://github.com/npm/cli',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  'npm-check-updates': {
    repositoryUrl: 'https://github.com/raineorshine/npm-check-updates',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  openai: {
    repositoryUrl: 'https://github.com/openai/openai-node',
    changelogFetcherOptions: { tagPrefix: 'v' },
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
  },
  pagefind: {
    repositoryUrl: 'https://github.com/pagefind/pagefind',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  payload: {
    repositoryUrl: 'https://github.com/payloadcms/payload',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  pino: {
    repositoryUrl: 'https://github.com/pinojs/pino',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  'pino-pretty': {
    repositoryUrl: 'https://github.com/pinojs/pino-pretty',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  playwright: {
    repositoryUrl: 'https://github.com/microsoft/playwright',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  pm2: {
    repositoryUrl: 'https://github.com/Unitech/pm2',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  postcss: { repositoryUrl: 'https://github.com/postcss/postcss' },
  react: {
    repositoryUrl: 'https://github.com/facebook/react',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
  },
  recharts: {
    repositoryUrl: 'https://github.com/recharts/recharts',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  semver: {
    repositoryUrl: 'https://github.com/npm/node-semver',
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  sharp: {
    repositoryUrl: 'https://github.com/lovell/sharp',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  'size-sensor': {
    repositoryUrl: 'https://github.com/hustcc/size-sensor',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  stylelint: { repositoryUrl: 'https://github.com/stylelint/stylelint' },
  superstruct: {
    repositoryUrl: 'https://github.com/ianstormtaylor/superstruct',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  'tailwind-merge': {
    repositoryUrl: 'https://github.com/dcastil/tailwind-merge',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
  },
  tailwindcss: {
    repositoryUrl: 'https://github.com/tailwindlabs/tailwindcss',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  'totp-generator': {
    repositoryUrl: 'https://github.com/bellstrand/totp-generator',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  typescript: {
    repositoryUrl: 'https://github.com/microsoft/TypeScript',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  uuid: {
    repositoryUrl: 'https://github.com/uuidjs/uuid',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  'vike-react': {
    repositoryUrl: 'https://github.com/vikejs/vike-react',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
      changelogFilename: 'packages/vike-react/CHANGELOG.md',
    },
  },
  'vike-react-antd': {
    repositoryUrl: 'https://github.com/vikejs/vike-react',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
      changelogFilename: 'packages/vike-react-antd/CHANGELOG.md',
    },
  },
  'vike-react-apollo': {
    repositoryUrl: 'https://github.com/vikejs/vike-react',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
      changelogFilename: 'packages/vike-react-apollo/CHANGELOG.md',
    },
  },
  'vike-react-chakra': {
    repositoryUrl: 'https://github.com/vikejs/vike-react',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
      changelogFilename: 'packages/vike-react-chakra/CHANGELOG.md',
    },
  },
  'vike-react-query': {
    repositoryUrl: 'https://github.com/vikejs/vike-react',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
      changelogFilename: 'packages/vike-react-query/CHANGELOG.md',
    },
  },
  'vike-react-redux': {
    repositoryUrl: 'https://github.com/vikejs/vike-react',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
      changelogFilename: 'packages/vike-react-redux/CHANGELOG.md',
    },
  },
  'vike-react-styled-components': {
    repositoryUrl: 'https://github.com/vikejs/vike-react',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
      changelogFilename: 'packages/vike-react-styled-components/CHANGELOG.md',
    },
  },
  'vike-react-styled-jsx': {
    repositoryUrl: 'https://github.com/vikejs/vike-react',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
      changelogFilename: 'packages/vike-react-styled-jsx/CHANGELOG.md',
    },
  },
  'vike-react-zustand': {
    repositoryUrl: 'https://github.com/vikejs/vike-react',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
      changelogFilename: 'packages/vike-react-zustand/CHANGELOG.md',
    },
  },
  vite: {
    repositoryUrl: 'https://github.com/vitejs/vite',
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
      changelogFilename: 'packages/vite/CHANGELOG.md',
    },
  },
  'whatsapp-web.js': {
    repositoryUrl: 'https://github.com/pedroslopez/whatsapp-web.js',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
  zod: {
    repositoryUrl: 'https://github.com/colinhacks/zod',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: {
      type: 'githubChangelogFile',
    },
  },
});
