import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getAllPosts, formatPostDate } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Blog | Youssef Chouay",
  description: "Writings on AI, software engineering, and graph theory.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Grain overlay */}
      <div className="grain-overlay" />

      <Navbar />

      <div className="container mx-auto px-6 md:px-12 pt-32 pb-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Back link */}
          <Link
            href="/"
            className="mb-12 inline-flex items-center text-sm text-[hsl(0,0%,50%)] hover:text-white transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Main
          </Link>

          {/* Section Title */}
          <div className="mb-16">
            <div className="flex items-center">
              <h1 className="text-section text-white font-light">BL</h1>
              <div className="flex flex-col items-center mx-4 md:mx-6">
                <span className="arabic-bracket text-lg md:text-xl">「</span>
                <span className="font-arabic text-xl md:text-3xl text-[hsl(42,45%,75%)]">
                  مقالات
                </span>
                <span className="arabic-bracket text-lg md:text-xl">」</span>
              </div>
              <h1 className="text-section text-white font-light">OG</h1>
            </div>
            <p className="mt-6 font-mono text-xs tracking-[0.2em] text-[hsl(0,0%,45%)] uppercase">
              Writings & Research
            </p>
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="text-[hsl(0,0%,50%)]">
              No posts yet. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <article className="project-card h-full">
                    {/* Cover Image */}
                    {post.coverImage && (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />

                        {/* Hover arrow */}
                        <div className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <ArrowUpRight className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <h2 className="text-lg font-light text-white mb-3 group-hover:text-[hsl(42,45%,75%)] transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-sm text-[hsl(0,0%,50%)] line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-[hsl(0,0%,40%)]">
                        <span className="font-mono text-xs">
                          {formatPostDate(post.date)}
                        </span>

                        {post.readingTimeMinutes && (
                          <span className="flex items-center gap-1 font-mono text-xs">
                            <Clock className="w-3 h-3" />
                            {post.readingTimeMinutes} min
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider bg-white/5 text-[hsl(0,0%,60%)] border border-white/10"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
