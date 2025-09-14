import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  getAllPosts,
  getPostBySlug,
  formatPostDate,
  type BlogPost,
} from "@/lib/blog-data";
import { getPostContent } from "@/lib/blog-content";
import { cn } from "@/lib/utils";

// Pre-generate static params for all published posts
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

// Per-post metadata
export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Post not found | Blog",
      description: "The requested post could not be found.",
    };
  }

  const title = `${post.title} | Blog`;
  const description = post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
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
const MarkdownComponents: any = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-3xl font-light tracking-tight mb-6 mt-8 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-medium tracking-tight mb-4 mt-8">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-medium tracking-tight mb-3 mt-6">{children}</h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-6 space-y-2 mb-4">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-6 space-y-2 mb-4">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-gray-700 dark:text-gray-300 leading-relaxed">
      {children}
    </li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-4 italic text-gray-600 dark:text-gray-400">
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
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
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto my-4 text-sm">
      {children}
    </pre>
  ),
  a: ({ href, children, ...props }: any) => (
    <a
      href={href}
      className="text-black dark:text-white underline underline-offset-2 hover:no-underline"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-black dark:text-white">
      {children}
    </strong>
  ),
};

function PostMeta({ post }: { post: BlogPost }) {
  const dateStr = formatPostDate(post.date);
  const rt = post.readingTimeMinutes;
  const hasRT = typeof rt === "number" && rt > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
      <span>{dateStr}</span>
      {hasRT ? <span>• {rt} min read</span> : null}
      {post.tags?.length ? (
        <>
          <span>•</span>
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 5).map((t) => (
              <span
                key={t}
                className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300"
              >
                #{t}
              </span>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Read markdown content from file
  const content = await getPostContent(post);

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Navbar />
      <div className="pointer-events-none fixed inset-0 z-0 dark:hidden bg-black/20"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Back to all posts"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>

          <h1 className="text-4xl font-light tracking-tight mb-3">
            {post.title}
          </h1>
          <PostMeta post={post} />

          {post.coverImage ? (
            <div className="relative mt-8 mb-10 aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority={false}
              />
            </div>
          ) : null}

          <article
            className={cn(
              "prose prose-gray dark:prose-invert max-w-none",
              (post as any)?.blurBehindText &&
                "relative -mx-4 sm:mx-0 rounded-xl px-4 sm:px-6 py-5 bg-white/10 dark:bg-black/20 backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10",
            )}
          >
            <ReactMarkdown
              components={MarkdownComponents}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  );
}
