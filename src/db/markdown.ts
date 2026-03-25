import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

/**
 * Renders markdown to HTML using the unified pipeline.
 * This replaces Astro's render() function for content collection entries.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse) // Parse markdown to AST
    .use(remarkGfm) // Support GitHub Flavored Markdown
    .use(remarkRehype, { allowDangerousHtml: true }) // Convert to HTML AST
    .use(rehypeRaw) // Parse raw HTML in markdown
    .use(rehypeStringify) // Serialize to HTML string
    .process(markdown);

  return String(result);
}
