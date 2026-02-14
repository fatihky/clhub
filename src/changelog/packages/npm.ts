import { PACKAGE_MANAGERS } from '../package';
import { versionFetcherOptionPresets } from '../version-fetchers/version-fetcher';
import { packageMapToArray } from './package-map-to-array';

const pm = PACKAGE_MANAGERS.npm;

export const npmPackages = packageMapToArray(pm, {
  '@astrojs/starlight': {
    repositoryUrl: 'https://github.com/withastro/starlight',
    changelogFetcherOptions: { tagPrefix: '@astrojs/starlight@' },
  },
  '@fingerprintjs/fingerprintjs': {
    repositoryUrl: 'https://github.com/fingerprintjs/fingerprintjs',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  '@formatjs/intl-localematcher': {
    repositoryUrl: 'https://github.com/formatjs/formatjs',
    changelogFetcherOptions: {
      tagPrefix: '@formatjs/intl-localematcher@',
    },
  },
  '@inquirer/prompts': {
    repositoryUrl: 'https://github.com/SBoudrias/Inquirer.js',
    changelogFetcherOptions: {
      tagPrefix: '@inquirer/prompts@',
    },
  },
  '@orama/orama': {
    repositoryUrl: 'https://github.com/oramasearch/orama',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  '@standard-schema/spec': {
    repositoryUrl: 'https://github.com/standard-schema/standard-schema',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  antd: {
    repositoryUrl: 'https://github.com/ant-design/ant-design',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
  },
  astro: {
    repositoryUrl: 'https://github.com/withastro/astro',
    changelogFetcherOptions: { tagPrefix: 'astro@' },
  },
  chokidar: {
    repositoryUrl: 'https://github.com/paulmillr/chokidar',
  },
  commander: {
    repositoryUrl: 'https://github.com/tj/commander.js',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  corepack: {
    repositoryUrl: 'https://github.com/nodejs/corepack',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  dotenv: {
    repositoryUrl: 'https://github.com/motdotla/dotenv',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  'echarts-for-react': {
    repositoryUrl: 'https://github.com/hustcc/echarts-for-react',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  enquirer: {
    repositoryUrl: 'https://github.com/enquirer/enquirer',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  esbuild: {
    repositoryUrl: 'https://github.com/evanw/esbuild',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  express: {
    repositoryUrl: 'https://github.com/expressjs/express',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  'fast-deep-equal': {
    repositoryUrl: 'https://github.com/epoberezkin/fast-deep-equal',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  i18next: {
    repositoryUrl: 'https://github.com/i18next/i18next',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  inquirer: {
    repositoryUrl: 'https://github.com/SBoudrias/Inquirer.js',
    changelogFetcherOptions: { tagPrefix: 'inquirer@' },
  },
  lodash: {
    repositoryUrl: 'https://github.com/lodash/lodash',
    changelogFetcherOptions: {
      type: 'githubWiki',
      changelogFilename: 'Changelog', // optional, defaults to 'Changelog'
      tagPrefix: 'v', // optional, for version matching
    },
  },
  'lucide-react': {
    repositoryUrl: 'https://github.com/lucide-icons/lucide',
    versionFetcherOptions: versionFetcherOptionPresets.excludePreReleases,
  },
  negotiator: {
    repositoryUrl: 'https://github.com/jshttp/negotiator',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  next: {
    repositoryUrl: 'https://github.com/vercel/next.js',
    changelogFetcherOptions: { tagPrefix: 'v' },
    groupByMajorVersion: true,
  },
  'next-i18next': {
    repositoryUrl: 'https://github.com/i18next/next-i18next',
  },
  'next-intl': {
    repositoryUrl: 'https://github.com/amannn/next-intl',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  npm: {
    repositoryUrl: 'https://github.com/npm/cli',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  'npm-check-updates': {
    repositoryUrl: 'https://github.com/raineorshine/npm-check-updates',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  pagefind: {
    repositoryUrl: 'https://github.com/pagefind/pagefind',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  payload: {
    repositoryUrl: 'https://github.com/payloadcms/payload',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  pino: {
    repositoryUrl: 'https://github.com/pinojs/pino',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  'pino-pretty': {
    repositoryUrl: 'https://github.com/pinojs/pino-pretty',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  // placeholder
  playwright: {
    repositoryUrl: 'https://github.com/microsoft/playwright',
    versionFetcherOptions: {
      excludePatterns: [
        /.*-(alpha|beta|next)(-|\.).*/,
        // example: 1.16.1-1634934341000
        /\d+\.\d+\.\d+-\d+/,
      ],
    },
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  pm2: {
    repositoryUrl: 'https://github.com/Unitech/pm2',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  postcss: { repositoryUrl: 'https://github.com/postcss/postcss' },
  react: {
    repositoryUrl: 'https://github.com/facebook/react',
    versionFetcherOptions: {
      excludePatterns: [
        /^0\.0\.0.*/,
        // 19.0.0-rc-f90a6bcc-20240827
        // 16.4.0-alpha.0911da3
        /.*-(alpha|beta|canary|next|rc)(-\w+(-202\d+)?|\.\w+)?/,
      ],
    },
  },
  semver: {
    repositoryUrl: 'https://github.com/npm/node-semver',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  sharp: {
    repositoryUrl: 'https://github.com/lovell/sharp',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  'size-sensor': {
    repositoryUrl: 'https://github.com/hustcc/size-sensor',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  stylelint: { repositoryUrl: 'https://github.com/stylelint/stylelint' },
  superstruct: {
    repositoryUrl: 'https://github.com/ianstormtaylor/superstruct',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  'tailwind-merge': {
    repositoryUrl: 'https://github.com/dcastil/tailwind-merge',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  tailwindcss: {
    repositoryUrl: 'https://github.com/tailwindlabs/tailwindcss',
    versionFetcherOptions: {
      excludePatterns: [
        // examples: 4.0.0-alpha.36, 4.0.0-beta.9, 2.2.0-canary.13, 2.1.2-internal.4, 2.0.1-compat
        /\d+\.\d+\.\d+-(alpha|beta|canary|compat|internal).*/,
        // examples: 0.0.0-34779b4, 0.0.0-development.1, 0.0.0-insiders.855fa30
        /^0\.0\.0-\w+/,
      ],
    },
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  'totp-generator': {
    repositoryUrl: 'https://github.com/bellstrand/totp-generator',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  typescript: {
    repositoryUrl: 'https://github.com/microsoft/TypeScript',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { tagPrefix: 'v' },
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
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  zod: {
    repositoryUrl: 'https://github.com/colinhacks/zod',
    versionFetcherOptions: {
      // examples: 4.1.13-beta.0, 4.4.0-canary.20260125T200534
      excludePatterns: [/.*-(alpha|beta|canary).*/],
    },
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
});
