import { PACKAGE_MANAGERS, Package } from '../package';

const pm = PACKAGE_MANAGERS.pypi;

export const pypiPackages: Package[] = [
  new Package(pm, 'django', 'https://github.com/django/django'),
  new Package(pm, 'flask', 'https://github.com/pallets/flask'),
  new Package(pm, 'requests', 'https://github.com/psf/requests'),
  new Package(
    pm,
    'open-webui',
    'https://github.com/open-webui/open-webui',
    undefined,
    { tagPrefix: 'v' },
  ),
];
