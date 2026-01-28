import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';

const changelogs = defineCollection({
	loader: glob({ pattern: ['**/*.md', '!**/_not_found.md'], base: './changelogs' }),
	schema: z.object({}).optional(),
});

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	changelogs,
};
