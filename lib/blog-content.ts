import { readFile } from 'fs/promises';
import { join } from 'path';
import type { BlogPost } from './blog-data';

/**
 * Server-only utility for reading blog markdown content.
 * This file should only be imported in server components or API routes.
 */

/**
 * Read markdown content from the file system for a given post.
 * This function can only be called on the server side.
 */
export async function getPostContent(post: BlogPost): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('getPostContent can only be called on the server');
  }

  try {
    const filePath = join(process.cwd(), post.contentFile);
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Error reading blog content file: ${post.contentFile}`, error);
    return `# ${post.title}\n\nContent not available.`;
  }
}

/**
 * Read multiple blog post contents in parallel.
 * Useful for server-side operations that need multiple posts.
 */
export async function getMultiplePostContents(posts: BlogPost[]): Promise<Map<string, string>> {
  const contentMap = new Map<string, string>();

  const promises = posts.map(async (post) => {
    try {
      const content = await getPostContent(post);
      contentMap.set(post.slug, content);
    } catch (error) {
      console.error(`Failed to load content for post: ${post.slug}`, error);
      contentMap.set(post.slug, `# ${post.title}\n\nContent not available.`);
    }
  });

  await Promise.all(promises);
  return contentMap;
}

/**
 * Extract the first few paragraphs from markdown content for preview purposes.
 * Strips markdown formatting and returns plain text.
 */
export function extractContentPreview(content: string, maxLength: number = 300): string {
  // Remove markdown headers
  let preview = content.replace(/^#+\s+.*$/gm, '');

  // Remove code blocks
  preview = preview.replace(/```[\s\S]*?```/g, '');

  // Remove inline code
  preview = preview.replace(/`[^`]+`/g, '');

  // Remove markdown formatting
  preview = preview.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
  preview = preview.replace(/\*(.*?)\*/g, '$1'); // Italic
  preview = preview.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Links

  // Remove extra whitespace and newlines
  preview = preview.replace(/\n+/g, ' ').trim();

  // Truncate to desired length
  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength).trim() + '...';
  }

  return preview;
}

/**
 * Calculate estimated reading time based on content length.
 * Assumes average reading speed of 200 words per minute.
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime); // Minimum 1 minute
}

/**
 * Extract all headings from markdown content for table of contents generation.
 */
export function extractHeadings(content: string): Array<{ level: number; text: string; id: string }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string; id: string }> = [];

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    headings.push({ level, text, id });
  }

  return headings;
}
