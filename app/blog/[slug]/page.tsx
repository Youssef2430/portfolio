import "katex/dist/katex.min.css";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Children,
  isValidElement,
  type ComponentProps,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowUpRight, Clock, Calendar } from "lucide-react";
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
import {
  extractSidenotes,
  noteIdentity,
  splitNoteChapters,
} from "@/lib/field-notes";
import {
  GameReplay,
  ParserLab,
  RunResults,
  YouAreTheModel,
} from "@/components/field-notes/chess-lab";
import {
  FalseStart,
  RetryTrace,
  ToolIncident,
} from "@/components/field-notes/chess-v3";
import {
  DecisionFlow,
  ForfeitFlip,
  LatencyStrip,
  PriceOfThinking,
  RunTimeline,
} from "@/components/field-notes/chess-charts";
import { MarketLab } from "@/components/field-notes/lazy-market-lab";
import { LivingTitle } from "@/components/field-notes/living-title";
import { NoteReader, EndNote } from "@/components/field-notes/reader";
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
    isValidElement<MarkdownElementProps>(child),
  );
  const className = isValidElement<MarkdownElementProps>(codeElement)
    ? (codeElement.props.className ?? "")
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

function MarkdownLink({
  href,
  children,
  // react-markdown's AST node must not reach the DOM.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node: _node,
  ...props
}: ComponentProps<"a"> & { node?: unknown }) {
  return (
    <a
      href={href}
      className="text-[hsl(var(--gold))] underline underline-offset-4 decoration-[hsl(var(--gold))]/30 hover:decoration-[hsl(var(--gold))] transition-colors"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  );
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
    <p className="text-[hsl(var(--foreground-soft))] leading-relaxed mb-6">
      {children}
    </p>
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
    <li className="text-[hsl(var(--foreground-soft))] leading-relaxed">
      {children}
    </li>
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
        <code className="fn-inline-code" {...props}>
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
  a: MarkdownLink,
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
            controls
            preload="metadata"
            muted
            playsInline
            className="w-full border border-border"
            aria-label={alt || undefined}
          />
        ) : (
          <a
            href={mediaSrc}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open full-size figure: ${alt || "Article figure"}`}
            className="fn-figure-link"
          >
            <Image
              src={mediaSrc}
              alt={alt || ""}
              width={800}
              height={450}
              className="w-full h-auto border border-border"
              sizes="(max-width: 768px) 100vw, 760px"
            />
          </a>
        )}
        {alt && (
          <span className="block mt-2 text-center text-xs text-[hsl(var(--foreground-muted))]">
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

const experiments: Record<string, ReactNode> = {
  markets: <MarketLab kind="paths" />,
  conditional: <MarketLab kind="conditional" />,
  foundations: <MarketLab kind="foundations" />,
  diagnostics: <MarketLab kind="diagnostics" />,
  history: <MarketLab kind="history" />,
  risk: <MarketLab kind="risk" />,
  model: <YouAreTheModel />,
  parsers: <ParserLab />,
  replay: <GameReplay initialCohort="v3" />,
  results: <RunResults initialCohort="v3" />,
  falsestart: <FalseStart />,
  retry: <RetryTrace />,
  tool: <ToolIncident />,
  flip: <ForfeitFlip />,
  flow: <DecisionFlow />,
  price: <PriceOfThinking />,
  latency: <LatencyStrip />,
  timeline: <RunTimeline />,
};

const inlineComponents: Components = {
  ...MarkdownComponents,
  p: ({ children }) => <>{children}</>,
};

function Sidenote({ id, n, text }: { id: string; n: string; text: string }) {
  return (
    <span className="sn">
      <label htmlFor={`sn-${id}`} className="sn-ref">
        <span className="sr-only">Note </span>
        {n}
      </label>
      <input type="checkbox" id={`sn-${id}`} className="sn-toggle" />
      <span className="sn-note" role="note">
        <span className="sn-num" aria-hidden="true">
          {n}
        </span>
        <ReactMarkdown
          components={inlineComponents}
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
        >
          {text}
        </ReactMarkdown>
      </span>
    </span>
  );
}

function withSidenotes(notes: Map<string, string>): Components {
  if (!notes.size) return MarkdownComponents;
  return {
    ...MarkdownComponents,
    a: (props) => {
      const id = props.href?.startsWith("#sn-") ? props.href.slice(4) : null;
      if (id && notes.has(id))
        return (
          <Sidenote id={id} n={getTextContent(props.children)} text={notes.get(id)!} />
        );
      return <MarkdownLink {...props} />;
    },
  };
}

function NoteMarkdown({
  content,
  components,
}: {
  content: string;
  components: Components;
}) {
  const parts = content.split(/^:::experiment (\w+):::\s*$/m);
  if (parts.length > 1)
    return (
      <>
        {parts.map((part, i) =>
          i % 2 ? (
            <div className="fn-inline-experiment" key={i}>
              {experiments[part]}
            </div>
          ) : (
            <NoteMarkdown key={i} content={part} components={components} />
          ),
        )}
      </>
    );
  return <MarkdownPassage content={content} components={components} />;
}

function MarkdownPassage({
  content,
  components,
}: {
  content: string;
  components: Components;
}) {
  const render = (text: string) => (
    <ReactMarkdown
      components={components}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        [rehypeKatex, { strict: false, throwOnError: false }],
        rehypeHighlight,
      ]}
    >
      {text}
    </ReactMarkdown>
  );
  const derivation = content.match(
    /### 1\.2 Solving the SDE via Itô['’]s Lemma[\s\S]*?(?=\n### |$)/,
  );
  if (!derivation || derivation.index === undefined) return render(content);
  return (
    <>
      {render(content.slice(0, derivation.index))}
      <details className="fn-derivation">
        <summary>
          <span className="fn-derivation-symbol" aria-hidden="true">
            ∫
          </span>
          <span className="fn-derivation-label">
            <small>Derivation</small>
            <strong>From price changes to log-returns</strong>
            <em>Itô’s lemma · about 2 minutes</em>
          </span>
          <span className="fn-derivation-toggle" aria-hidden="true">
            ↗
          </span>
        </summary>
        <div>{render(derivation[0].replace(/^### .+\n/, ""))}</div>
      </details>
      {render(content.slice(derivation.index + derivation[0].length))}
    </>
  );
}

function PostMeta({ post }: { post: BlogPost }) {
  const dateStr = formatPostDate(post.date);
  const rt = post.readingTimeMinutes;

  return (
    <div className="flex flex-wrap items-center gap-6 text-sm text-[hsl(var(--foreground-muted))]">
      <span className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        {dateStr}
      </span>
      {post.updated && (
        <span className="flex items-center gap-2">
          Updated {formatPostDate(post.updated)}
        </span>
      )}
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

  const note = noteIdentity(post);
  const { content: body, notes } = extractSidenotes(normalizedContent);
  const components = withSidenotes(notes);
  const { intro, chapters } = splitNoteChapters(body);
  const nextPost = getAllPosts().find((p) => p.slug !== post.slug);

  return (
    <main className="min-h-screen bg-background text-foreground fn-article-page">
      <JsonLd
        data={jsonLdGraph(
          {
            "@type": "BlogPosting",
            "@id": `${SITE_URL}/blog/${post.slug}#article`,
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            dateModified: post.updated ?? post.date,
            url: `${SITE_URL}/blog/${post.slug}`,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${SITE_URL}/blog/${post.slug}`,
            },
            author: { "@id": `${SITE_URL}/#person` },
            publisher: { "@id": `${SITE_URL}/#person` },
            keywords: post.tags?.join(", "),
            image: post.coverImage
              ? [`${SITE_URL}${post.coverImage}`]
              : undefined,
            inLanguage: "en",
          },
          personSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        )}
      />
      {/* Grain overlay */}
      <div className="grain-overlay" />

      <Navbar />

      <div className="fn-article-shell" id="note-top">
        <Link href="/blog" className="fn-back-link">
          <ArrowLeft size={15} /> Back to field notes
        </Link>
        <header className="fn-article-header">
          <div className="fn-kicker">
            <span className="fn-note-number">{note.number}</span> /{" "}
            {note.category}{" "}
            <span className="fn-header-arabic" lang="ar" dir="rtl">
              ملاحظات
            </span>
          </div>
          <LivingTitle kind={note.kind} title={note.title} />
          <p className="fn-article-deck">{note.subtitle}</p>
          <div className="fn-article-meta">
            <span className="fn-kicker">By Youssef Chouay</span>
            <PostMeta post={post} />
          </div>
          <details className="fn-research-title">
            <summary>Research title & topics</summary>
            <p>{post.title}</p>
            <div className="fn-tags">
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </details>
        </header>
        <div className="fn-article-layout">
          <NoteReader
            kind={note.kind}
            chapters={chapters.map(({ id, title }) => ({ id, title }))}
          />
          <article id="note-body" className="fn-article-content">
            <div
              id="start-reading"
              className="blog-article prose max-w-none fn-prose fn-opening"
            >
              <NoteMarkdown content={intro} components={components} />
            </div>
            {chapters.map((chapter, index) => (
              <section
                key={chapter.id}
                id={chapter.id}
                className="fn-chapter"
                aria-labelledby={`${chapter.id}-heading`}
              >
                <header className="fn-chapter-heading">
                  <span className="fn-kicker">
                    {String(index + 1).padStart(2, "0")} / Field note
                  </span>
                  <h2 id={`${chapter.id}-heading`}>{chapter.title}</h2>
                </header>
                <div className="blog-article prose max-w-none fn-prose">
                  <NoteMarkdown
                    content={chapter.markdown}
                    components={components}
                  />
                </div>
              </section>
            ))}
            <footer className="fn-article-end">
              <span className="fn-kicker">
                End of field note / {note.number}
              </span>
              <span className="font-arabic text-gold" lang="ar" dir="rtl">
                شكراً للقراءة
              </span>
              <EndNote kind={note.kind} />
            </footer>
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className="fn-next-note">
                <span className="fn-kicker">Read another article</span>
                <span>
                  {noteIdentity(nextPost).title}
                  <ArrowUpRight size={25} />
                </span>
                <small>{nextPost.readingTimeMinutes} min read</small>
              </Link>
            )}
          </article>
        </div>
      </div>

      <Footer />
    </main>
  );
}
