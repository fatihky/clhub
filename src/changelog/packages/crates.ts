import { PACKAGE_MANAGERS } from '../package';
import { packageMapToArray } from './package-map-to-array';

const pm = PACKAGE_MANAGERS.crates;

export const cratesPackages = packageMapToArray(pm, {
  clap: { repositoryUrl: 'https://github.com/clap-rs/clap' },
  serde: {
    repositoryUrl: 'https://github.com/serde-rs/serde',
    changelogFetcherOptions: { tagPrefix: 'v' },
  },
  ripgrep: { repositoryUrl: 'https://github.com/BurntSushi/ripgrep' },
  tokio: { repositoryUrl: 'https://github.com/tokio-rs/tokio' },
});
