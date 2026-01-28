import { cratesPackages } from './crates';
import { githubPackages } from './github';
import { npmPackages } from './npm';
import { pypiPackages } from './pypi';
import { rubygemsPackages } from './rubygems';

export const allPackages = [
  ...npmPackages,
  ...pypiPackages,
  ...cratesPackages,
  ...rubygemsPackages,
  ...githubPackages,
];

export {
  cratesPackages,
  githubPackages,
  npmPackages,
  pypiPackages,
  rubygemsPackages,
};
