import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SectionHeading } from "@/components/section-heading";
import { BlogCard } from "@/components/blog-card";
import { getAllPosts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Blog | Youssef Chouay",
  description: "All blog posts by Youssef Chouay.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Back to main page"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Main Page
          </Link>

          <SectionHeading japanese="ブログ" english="Blog" />

          {posts.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No posts yet. Check back soon!
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard
                    key={post.slug}
                    slug={post.slug}
                    title={post.title}
                    date={post.date}
                    excerpt={post.excerpt}
                    coverImage={post.coverImage}
                    tags={post.tags}
                    readingTimeMinutes={post.readingTimeMinutes}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
