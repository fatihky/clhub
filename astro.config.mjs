// @ts-check

import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

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
      ],
    }),
  ],
});
