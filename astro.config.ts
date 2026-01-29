import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { cratesPackages, githubPackages, npmPackages, rubygemsPackages } from './src/changelog/packages';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'Changelog Hub',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/withastro/starlight',
        },
      ],
      sidebar: [
        {
          label: 'Changelogs',
          link: '/',
        },
        {
          label: 'Package Sources',
          collapsed: false,
          items: [
            { label: 'Crates.io', link: '/changelogs/crates/' },
            { label: 'GitHub', link: '/changelogs/github/' },
            { label: 'npm', link: '/changelogs/npm/' },
            { label: 'PyPI', link: '/changelogs/pypi/' },
            { label: 'RubyGems', link: '/changelogs/rubygems/' },
          ],
        },
        {
          label: 'Crates.io',
          collapsed: true,
          items: cratesPackages.map((pkg) => ({
            label: pkg.name,
            link: `/changelogs/crates/${pkg.name}`,
          })),
        },
        {
          label: 'Github',
          collapsed: true,
          items: githubPackages.map((pkg) => ({
            label: pkg.name,
            link: `/changelogs/github/${pkg.name}`,
          })),
        },
        {
          label: 'npm',
          collapsed: true,
          items: npmPackages.map((pkg) => ({
            label: pkg.name,
            link: `/changelogs/npm/${pkg.name}`,
          })),
        },
        {
          label: 'RubyGems',
          collapsed: true,
          items: rubygemsPackages.map((pkg) => ({
            label: pkg.name,
            link: `/changelogs/rubygems/${pkg.name}`,
          })),
        },
      ],
    }),
  ],
});
