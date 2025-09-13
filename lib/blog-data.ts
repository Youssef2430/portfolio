/**
 * Blog data module with sample posts and helpers.
 *
 * - Add your real posts here or wire this up to a CMS later.
 * - All utilities are pure and tree-shakeable.
 */

export type BlogPost = {
  slug: string; // unique identifier used in URLs
  title: string;
  date: string; // ISO-8601 date string
  excerpt: string;
  contentFile: string; // path to markdown file (e.g. blogs/my-post.md)
  tags: string[];
  coverImage?: string; // path to public/ asset (e.g. /blog/cover.jpg)
  readingTimeMinutes: number;
  published: boolean;
};

const blogPostsData: BlogPost[] = [
  {
    slug: "building-ledgerglass-privacy-first-macos-finance-app",
    title:
      "Building LedgerGlass: Why I Built a Privacy-First Finance App for macOS, How It Works, and What’s Next",
    date: "2025-09-01",
    excerpt:
      "From APIs to a Mac-native, privacy-first finance app: importing bank CSVs, on-device ML categorization, a color-coded Subscriptions Calendar, and a roadmap toward bank-statement reconciliation — all offline.",
    contentFile: "blogs/ledgerUI.md",
    tags: ["macos", "swiftui", "swiftdata", "privacy", "personal-finance"],
    coverImage: "/blog/glassUI.png",
    readingTimeMinutes: 8,
    published: true,
  },
  {
    slug: "llm-evals-building-a-chess-benchmark",
    title: "LLM Evals: Building a Chess Benchmark",
    date: "2025-07-10",
    excerpt:
      "What I learned building a provider-agnostic evaluation harness that pits LLMs against Stockfish with calibrated difficulty.",
    contentFile: "blogs/chessLLM.md",
    tags: ["ai", "evals", "chess"],
    coverImage: "/blog/chessLLM.gif",
    readingTimeMinutes: 7,
    published: true,
  },
  {
    slug: "designing-resilient-apis-with-rust-and-actix",
    title: "GeeGees Sports Platform — One Project, Three Engines",
    date: "2025-05-04",
    excerpt:
      "How I turned intramural chaos into a privacy-first stack—scraper → Rust API → Next.js hub—that makes uOttawa sports feel pro.",
    contentFile: "blogs/geegeereg.md",
    tags: ["rust", "react", "sports", "web"],
    coverImage: "/blog/dropins.png",
    readingTimeMinutes: 8,
    published: true,
  },
  {
    slug: "nlp-and-vision-for-phishing-detection",
    title: "NLP and Vision for Phishing Detection",
    date: "2024-10-01",
    excerpt:
      "Combining text and visual signals to robustly detect phishing attempts in the wild.",
    contentFile: "blogs/nlp-and-vision-for-phishing-detection.md",
    tags: ["ml", "nlp", "security"],
    coverImage: "/blog/wandb.png",
    readingTimeMinutes: 9,
    published: true,
  },
];

/**
 * Internal: clone to prevent accidental mutations leaking.
 */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Parse ISO date safely. Unparseable dates become epoch (to avoid NaN issues).
 */
function toDate(d: string): Date {
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? new Date(0) : dt;
}

/**
 * Return all published posts, sorted by newest first.
 */
export function getAllPosts(): BlogPost[] {
  const published = blogPostsData.filter((p) => p.published);
  return clone(
    published.sort(
      (a, b) => toDate(b.date).getTime() - toDate(a.date).getTime(),
    ),
  );
}

/**
 * Return the latest N published posts (default 3).
 */
export function getLatestPosts(limit = 3): BlogPost[] {
  return getAllPosts().slice(0, Math.max(0, limit));
}

/**
 * Find a post by slug. Returns undefined if not found or unpublished.
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  const found = blogPostsData.find((p) => p.slug === slug && p.published);
  return found ? clone(found) : undefined;
}

/**
 * Filter posts by tag (case-insensitive), newest first.
 */
export function getPostsByTag(tag: string): BlogPost[] {
  const needle = tag.trim().toLowerCase();
  return getAllPosts().filter((p) =>
    p.tags.some((t) => t.toLowerCase() === needle),
  );
}

/**
 * Simple pagination helper over all published posts (newest first).
 * Returns the current page of posts and metadata.
 */
export function paginatePosts(params: {
  page?: number; // 1-based
  pageSize?: number;
}): {
  posts: BlogPost[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
} {
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const pageSize = Math.max(1, Math.floor(params.pageSize ?? 10));
  const all = getAllPosts();
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * pageSize;
  const end = start + pageSize;
  const posts = all.slice(start, end);

  return {
    posts,
    page: clampedPage,
    pageSize,
    total,
    totalPages,
    hasPrev: clampedPage > 1,
    hasNext: clampedPage < totalPages,
  };
}

/**
 * Utility to format a post date for display (e.g., "Aug 1, 2025").
 * Locale defaults to 'en-US'.
 */
export function formatPostDate(date: string, locale = "en-US"): string {
  const dt = toDate(date);
  return dt.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Raw data export (avoid mutating).
 * Prefer calling helpers above for most use-cases.
 */
export const __rawBlogPosts = clone(blogPostsData);
