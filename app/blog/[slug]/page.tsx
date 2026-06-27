import "katex/dist/katex.min.css";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Children, isValidElement, type ReactNode } from "react";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  getAllPosts,
  getPostBySlug,
  formatPostDate,
  type BlogPost,
} from "@/lib/blog-data";
import { getPostContent } from "@/lib/blog-content";
import { JsonLd } from "@/components/json-ld";
import {
  jsonLdGraph,
  personSchema,
  breadcrumbSchema,
  SITE_URL,
} from "@/lib/seo";
import { BlogCodeBlock } from "@/components/blog-code-block";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];

function normalizeMarkdownMediaSrc(src: unknown): string {
  const value = typeof src === "string" ? src.trim() : "";

  if (
    !value ||
    value.startsWith("/") ||
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    /^(https?:)?\/\//.test(value)
  ) {
    return value;
  }

  return `/blog/${value.replace(/^\.?\//, "")}`;
}

function isVideoSrc(src: string): boolean {
  const pathname = src.split(/[?#]/)[0]?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.some((extension) => pathname.endsWith(extension));
}

type MarkdownElementProps = {
  children?: ReactNode;
  className?: string;
};

function getTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }

  if (isValidElement<MarkdownElementProps>(node)) {
    return getTextContent(node.props.children);
  }

  return "";
}

function getCodeBlockMetadata(children: ReactNode) {
  const codeElement = Children.toArray(children).find((child) =>
    isValidElement<MarkdownElementProps>(child)
  );
  const className = isValidElement<MarkdownElementProps>(codeElement)
    ? codeElement.props.className ?? ""
    : "";
  const language = className.match(/language-([\w-]+)/)?.[1];

  return {
    code: getTextContent(children).replace(/\n$/, ""),
    language,
  };
}

// Pre-generate static params for all published posts
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

// Per-post metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {
      title: "Post not found | Blog",
      description: "The requested post could not be found.",
    };
  }

  const title = `${post.title} | Youssef Chouay`;
  const description = post.excerpt;

  return {
    title,
    description,
    keywords: post.tags,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      authors: ["Youssef Chouay"],
      tags: post.tags,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

// Custom components for markdown rendering
const MarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-light tracking-tight mb-6 mt-12 first:mt-0 text-foreground">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-light tracking-tight mb-4 mt-10 text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-light tracking-tight mb-3 mt-8 text-foreground">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-[hsl(var(--foreground-soft))] leading-relaxed mb-6">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 space-y-2 mb-6 text-[hsl(var(--foreground-soft))]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 space-y-2 mb-6 text-[hsl(var(--foreground-soft))]">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-[hsl(var(--foreground-soft))] leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[hsl(var(--gold))] pl-6 py-2 my-6 italic text-[hsl(var(--foreground-muted))]">
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="bg-muted px-1.5 py-0.5 text-sm font-mono text-[hsl(var(--gold))] border border-border"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => {
    const { code, language } = getCodeBlockMetadata(children);

    return (
      <BlogCodeBlock code={code} language={language}>
        {children}
      </BlogCodeBlock>
    );
  },
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      className="text-[hsl(var(--gold))] underline underline-offset-4 decoration-[hsl(var(--gold))]/30 hover:decoration-[hsl(var(--gold))] transition-colors"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-foreground">{children}</strong>
  ),
  img: ({ src, alt }) => {
    const mediaSrc = normalizeMarkdownMediaSrc(src);

    if (!mediaSrc) {
      return null;
    }

    return (
      <span className="block my-8">
        {isVideoSrc(mediaSrc) ? (
          <video
            src={mediaSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full border border-border"
            aria-label={alt || undefined}
          />
        ) : (
          <Image
            src={mediaSrc}
            alt={alt || ""}
            width={800}
            height={450}
            className="w-full border border-border"
          />
        )}
        {alt && (
          <span className="block mt-2 text-center text-sm text-[hsl(var(--foreground-subtle))]">
            {alt}
          </span>
        )}
      </span>
    );
  },
  hr: () => <hr className="my-12 border-t border-border" />,
  table: ({ children }) => (
    <div className="blog-data-table-wrap my-8 overflow-x-auto border border-border/80 bg-[hsl(var(--card)/0.62)] shadow-[0_18px_55px_hsl(var(--foreground)/0.06)]">
      <table className="blog-data-table !my-0 w-full table-fixed border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border/80 bg-[hsl(var(--wash)/0.55)] px-4 py-3 text-left text-xs font-medium text-[hsl(var(--foreground-muted))]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border/50 px-4 py-3 align-top text-[hsl(var(--foreground-soft))]">
      {children}
    </td>
  ),
};

function PostMeta({ post }: { post: BlogPost }) {
  const dateStr = formatPostDate(post.date);
  const rt = post.readingTimeMinutes;

  return (
    <div className="flex flex-wrap items-center gap-6 text-sm text-[hsl(var(--foreground-muted))]">
      <span className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        {dateStr}
      </span>
      {typeof rt === "number" && rt > 0 && (
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {rt} min read
        </span>
      )}
    </div>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Read markdown content from file
  const content = await getPostContent(post);
  const normalizedContent = content
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, m) => `$${m}$`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, m) => `$$${m}$$`);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={jsonLdGraph(
          {
            "@type": "BlogPosting",
            "@id": `${SITE_URL}/blog/${post.slug}#article`,
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            dateModified: post.date,
            url: `${SITE_URL}/blog/${post.slug}`,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${SITE_URL}/blog/${post.slug}`,
            },
            author: { "@id": `${SITE_URL}/#person` },
            publisher: { "@id": `${SITE_URL}/#person` },
            keywords: post.tags?.join(", "),
            image: post.coverImage ? [`${SITE_URL}${post.coverImage}`] : undefined,
            inLanguage: "en",
          },
          personSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ])
        )}
      />
      {/* Grain overlay */}
      <div className="grain-overlay" />

      <Navbar />

      <div className="container mx-auto px-6 md:px-12 pt-32 pb-24 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="mb-12 inline-flex items-center text-sm text-[hsl(var(--foreground-muted))] hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Post Header */}
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-6 text-foreground">
              {post.title}
            </h1>

            <PostMeta post={post} />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider bg-foreground/5 text-[hsl(var(--foreground-muted))] border border-foreground/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative mb-12 aspect-[16/9] w-full overflow-hidden border border-border">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <article className="blog-article prose max-w-none">
            <ReactMarkdown
              components={MarkdownComponents}
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[
                [rehypeKatex, { strict: false, throwOnError: false }],
                rehypeHighlight,
              ]}
            >
              {normalizedContent}
            </ReactMarkdown>
          </article>

          {/* Post Footer */}
          <footer className="mt-16 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm text-[hsl(var(--foreground-muted))] hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                All Posts
              </Link>

              <span className="font-arabic text-sm text-[hsl(var(--gold))] opacity-60">
                شكراً للقراءة
              </span>
            </div>
          </footer>
        </div>
      </div>

      <Footer />
    </main>
  );
}
