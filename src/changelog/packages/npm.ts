import { PACKAGE_MANAGERS } from '../package';
import { versionFetcherOptionPresets } from '../version-fetchers/version-fetcher';
import { packageMapToArray } from './package-map-to-array';

const pm = PACKAGE_MANAGERS.npm;

export const npmPackages = packageMapToArray(pm, {
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
  '@standard-schema/spec': {
    repositoryUrl: 'https://github.com/standard-schema/standard-schema',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  antd: {
    repositoryUrl: 'https://github.com/ant-design/ant-design',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
  },
  dotenv: {
    repositoryUrl: 'https://github.com/motdotla/dotenv',
    changelogFetcherOptions: { type: 'githubChangelogFile' },
  },
  express: {
    repositoryUrl: 'https://github.com/expressjs/express',
    versionFetcherOptions: versionFetcherOptionPresets.onlySemver,
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  i18next: {
    repositoryUrl: 'https://github.com/i18next/i18next',
    changelogFetcherOptions: { tagPrefix: 'v' },
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
  pino: {
    repositoryUrl: 'https://github.com/pinojs/pino',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  'pino-pretty': {
    repositoryUrl: 'https://github.com/pinojs/pino-pretty',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
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
