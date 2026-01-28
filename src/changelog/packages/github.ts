import { PACKAGE_MANAGERS, Package } from '../package';

const pm = PACKAGE_MANAGERS.github;

export const githubPackages: Package[] = [
  new Package(
    pm,
    'toeverything/AFFiNE',
    'https://github.com/toeverything/AFFiNE',
  ),
  new Package(pm, 'JerryZLiu/Dayflow', 'https://github.com/JerryZLiu/Dayflow'),
  new Package(
    pm,
    'anthropics/claude-code',
    'https://github.com/anthropics/claude-code',
  ),
];
