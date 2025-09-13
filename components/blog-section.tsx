"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { SectionHeading } from "./section-heading";
import { ParallaxSection } from "./parallax-section";
import { BlogCard } from "./blog-card";
import { getLatestPosts } from "@/lib/blog-data";

export function BlogSection() {
  const posts = getLatestPosts(3);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="blog" className="py-24 sm:py-32">
      <ParallaxSection offset={15}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading japanese="ブログ" english="Blog" />

          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {posts.length === 0 ? (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
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

                  <div className="mt-8 flex justify-end">
                    <Link
                      href="/blog"
                      className="text-sm underline underline-offset-4 hover:no-underline"
                      aria-label="See more blog posts"
                    >
                      See more →
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </ParallaxSection>
    </section>
  );
}
