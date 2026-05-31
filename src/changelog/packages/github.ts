import { PACKAGE_MANAGERS, Package } from '../package';

const pm = PACKAGE_MANAGERS.github;

export const githubPackages: Package[] = [
  new Package(
    pm,
    'toeverything/AFFiNE',
    'https://github.com/toeverything/AFFiNE',
  ),
  new Package(pm, 'jdx/mise', 'https://github.com/jdx/mise'),
  new Package(pm, 'JerryZLiu/Dayflow', 'https://github.com/JerryZLiu/Dayflow'),
  new Package(
    pm,
    'anomalyco/opencode',
    'https://github.com/anomalyco/opencode',
    undefined,
    { tagPrefix: 'v' },
  ),
  new Package(
    pm,
    'anthropics/claude-code',
    'https://github.com/anthropics/claude-code',
  ),
  new Package(
    pm,
    'navidrome/navidrome',
    'https://github.com/navidrome/navidrome',
    undefined,
    { tagPrefix: 'v' },
  ),
];
