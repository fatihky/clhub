import { PACKAGE_MANAGERS, Package } from '../package';

const pm = PACKAGE_MANAGERS.rubygems;

export const rubygemsPackages: Package[] = [
  new Package(pm, 'devise', 'https://github.com/heartcombo/devise', undefined, {
    tagPrefix: 'v',
  }),
  new Package(
    pm,
    'paper_trail',
    'https://github.com/paper-trail-gem/paper_trail',
    undefined,
    {
      type: 'githubChangelogFile',
    },
  ),
  new Package(pm, 'rails', 'https://github.com/rails/rails'),
  new Package(pm, 'rspec', 'https://github.com/rspec/rspec'),
  new Package(pm, 'sidekiq', 'https://github.com/sidekiq/sidekiq'),
];
