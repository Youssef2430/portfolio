import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
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

  const title = `${post.title} | Youssef Chouay`;
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
    <h1 className="text-3xl font-light tracking-tight mb-6 mt-12 first:mt-0 text-white">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-light tracking-tight mb-4 mt-10 text-white">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-light tracking-tight mb-3 mt-8 text-white">
      {children}
    </h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-[hsl(0,0%,70%)] leading-relaxed mb-6">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-6 space-y-2 mb-6 text-[hsl(0,0%,70%)]">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-6 space-y-2 mb-6 text-[hsl(0,0%,70%)]">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-[hsl(0,0%,70%)] leading-relaxed">{children}</li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-2 border-[hsl(42,45%,75%)] pl-6 py-2 my-6 italic text-[hsl(0,0%,60%)]">
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="bg-[hsl(0,0%,10%)] px-1.5 py-0.5 text-sm font-mono text-[hsl(42,45%,75%)] border border-[hsl(0,0%,15%)]"
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
    <pre className="bg-[hsl(0,0%,6%)] p-4 overflow-x-auto my-6 text-sm border border-[hsl(0,0%,15%)]">
      {children}
    </pre>
  ),
  a: ({ href, children, ...props }: any) => (
    <a
      href={href}
      className="text-[hsl(42,45%,75%)] underline underline-offset-4 decoration-[hsl(42,45%,75%)]/30 hover:decoration-[hsl(42,45%,75%)] transition-colors"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-medium text-white">{children}</strong>
  ),
  img: ({ src, alt }: { src: string; alt: string }) => (
    <span className="block my-8">
      <Image
        src={src}
        alt={alt || ""}
        width={800}
        height={450}
        className="w-full border border-[hsl(0,0%,15%)]"
      />
      {alt && (
        <span className="block mt-2 text-center text-sm text-[hsl(0,0%,45%)]">
          {alt}
        </span>
      )}
    </span>
  ),
  hr: () => <hr className="my-12 border-t border-[hsl(0,0%,15%)]" />,
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border border-[hsl(0,0%,15%)]">{children}</table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border border-[hsl(0,0%,15%)] px-4 py-2 text-left font-medium text-white bg-[hsl(0,0%,8%)]">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border border-[hsl(0,0%,15%)] px-4 py-2 text-[hsl(0,0%,70%)]">
      {children}
    </td>
  ),
};

function PostMeta({ post }: { post: BlogPost }) {
  const dateStr = formatPostDate(post.date);
  const rt = post.readingTimeMinutes;

  return (
    <div className="flex flex-wrap items-center gap-6 text-sm text-[hsl(0,0%,50%)]">
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
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Read markdown content from file
  const content = await getPostContent(post);
  const normalizedContent = content
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, m) => `$${m}$`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, m) => `$$${m}$$`);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Grain overlay */}
      <div className="grain-overlay" />

      <Navbar />

      <div className="container mx-auto px-6 md:px-12 pt-32 pb-24 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="mb-12 inline-flex items-center text-sm text-[hsl(0,0%,50%)] hover:text-white transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Post Header */}
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-6 text-white">
              {post.title}
            </h1>

            <PostMeta post={post} />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider bg-white/5 text-[hsl(0,0%,60%)] border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative mb-12 aspect-[16/9] w-full overflow-hidden border border-[hsl(0,0%,15%)]">
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
          <article className="prose prose-invert max-w-none">
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
          <footer className="mt-16 pt-8 border-t border-[hsl(0,0%,15%)]">
            <div className="flex items-center justify-between">
              <Link
                href="/blog"
                className="inline-flex items-center text-sm text-[hsl(0,0%,50%)] hover:text-white transition-colors group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                All Posts
              </Link>

              <span className="font-arabic text-sm text-[hsl(42,45%,75%)] opacity-60">
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
