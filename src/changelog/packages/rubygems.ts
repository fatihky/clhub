import { PACKAGE_MANAGERS, Package } from '../package';

const pm = PACKAGE_MANAGERS.rubygems;

export const rubygemsPackages: Package[] = [
  new Package(pm, 'rails', 'https://github.com/rails/rails'),
  new Package(pm, 'sidekiq', 'https://github.com/sidekiq/sidekiq'),
  new Package(pm, 'rspec', 'https://github.com/rspec/rspec'),
];
