import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { NotesGrid } from "@/components/field-notes/notes-grid";
import { Footer } from "@/components/footer";
import { getAllPosts } from "@/lib/blog-data";
import { JsonLd } from "@/components/json-ld";
import {
  jsonLdGraph,
  personSchema,
  breadcrumbSchema,
  SITE_URL,
} from "@/lib/seo";

const BLOG_DESCRIPTION =
  "Writings on AI, software engineering, and graph theory by Youssef Chouay.";

export const metadata: Metadata = {
  title: "Blog | Youssef Chouay",
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | Youssef Chouay",
    description: BLOG_DESCRIPTION,
    type: "website",
    url: "/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Youssef Chouay",
    description: BLOG_DESCRIPTION,
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={jsonLdGraph(
          {
            "@type": "Blog",
            "@id": `${SITE_URL}/blog#blog`,
            name: "Youssef Chouay's Blog",
            description: BLOG_DESCRIPTION,
            url: `${SITE_URL}/blog`,
            author: { "@id": `${SITE_URL}/#person` },
            inLanguage: "en",
            blogPost: posts.map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              url: `${SITE_URL}/blog/${post.slug}`,
              datePublished: post.date,
            })),
          },
          personSchema,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        )}
      />
      {/* Grain overlay */}
      <div className="grain-overlay" />

      <Navbar />

      <div className="container mx-auto px-6 md:px-12 pt-32 pb-24 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="mb-12 inline-flex items-center text-sm text-[hsl(var(--foreground-muted))] hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Main
          </Link>

          <header className="fn-index-heading">
            <div>
              <h1 className="fn-blog-title" aria-label="Blog">
                BL
                <span className="fn-arabic-title" aria-hidden="true">
                  <small>「</small>
                  <span lang="ar" dir="rtl">
                    مقالات
                  </span>
                  <small>」</small>
                </span>
                OG
              </h1>
              <p className="fn-kicker">Writings & research / Field notes</p>
            </div>
            <p className="fn-introduction">
              Ideas, experiments, and things I’m figuring out. A little more to
              explore in every note.
            </p>
          </header>
          <NotesGrid posts={posts} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
