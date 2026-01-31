import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import {
  cratesPackages,
  githubPackages,
  npmPackages,
  rubygemsPackages,
} from './src/changelog/packages';

// https://astro.build/config
export default defineConfig({
  site: 'https://fatihky.github.io/',
  base: process.env.NODE_ENV === 'production' ? '/clhub' : '',
  integrations: [
    starlight({
      title: 'Changelog Hub',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/fatihky/clhub',
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
            { label: 'Crates.io', link: '/crates/' },
            { label: 'GitHub', link: '/github/' },
            { label: 'npm', link: '/npm/' },
            { label: 'PyPI', link: '/pypi/' },
            { label: 'RubyGems', link: '/rubygems/' },
          ],
        },
        {
          label: 'Crates.io',
          collapsed: true,
          items: cratesPackages.map((pkg) => ({
            label: pkg.name,
            link: `/crates/${pkg.name}`,
          })),
        },
        {
          label: 'Github',
          collapsed: true,
          items: githubPackages.map((pkg) => ({
            label: pkg.name,
            link: `/github/${pkg.name}`,
          })),
        },
        {
          label: 'npm',
          collapsed: true,
          items: npmPackages.map((pkg) => ({
            label: pkg.name,
            link: `/npm/${pkg.name}`,
          })),
        },
        {
          label: 'RubyGems',
          collapsed: true,
          items: rubygemsPackages.map((pkg) => ({
            label: pkg.name,
            link: `/rubygems/${pkg.name}`,
          })),
        },
      ],
    }),
  ],
});
