"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { getLatestPosts, formatPostDate } from "@/lib/blog-data";

export function BlogSection() {
  const posts = getLatestPosts(3);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      id="blog"
      className="relative py-32 overflow-hidden"
    >
      {/* Static noise with fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          maskImage: `linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)`,
          opacity: 0.06,
        }}
      />

      <div className="container mx-auto px-6 md:px-12">
        {/* Section Title */}
        <div ref={titleRef} className="relative mb-20">
          <div className="flex items-center">
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 1, ease: [0.55, 0.45, 0.16, 1] }}
              className="text-section text-white font-light"
            >
              BL
            </motion.span>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.55, 0.45, 0.16, 1] }}
              className="flex flex-col items-center mx-2 md:mx-4"
            >
              <span className="arabic-bracket text-lg md:text-xl">「</span>
              <span className="font-arabic text-xl md:text-3xl text-[hsl(42,45%,75%)]">
                مقالات
              </span>
              <span className="arabic-bracket text-lg md:text-xl">」</span>
            </motion.div>

            <motion.span
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 1, ease: [0.55, 0.45, 0.16, 1] }}
              className="text-section text-white font-light"
            >
              OG
            </motion.span>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 font-mono text-xs tracking-[0.2em] text-[hsl(0,0%,45%)] uppercase"
          >
            Writings & Research
          </motion.p>
        </div>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center text-[hsl(0,0%,50%)]">
            No posts yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {posts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/blog/${post.slug}`} className="group block">
                  <article className="project-card h-full">
                    {/* Cover Image */}
                    {post.coverImage && (
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />

                        {/* Hover arrow */}
                        <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <ArrowUpRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-base font-light text-white mb-2 group-hover:text-[hsl(42,45%,75%)] transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <div className="flex items-center justify-between text-[hsl(0,0%,40%)]">
                        <span className="font-mono text-[10px]">
                          {formatPostDate(post.date)}
                        </span>

                        {post.readingTimeMinutes && (
                          <span className="flex items-center gap-1 font-mono text-[10px]">
                            <Clock className="w-3 h-3" />
                            {post.readingTimeMinutes} min
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-sm tracking-wider text-[hsl(0,0%,50%)] hover:text-white transition-colors group"
          >
            <span>VIEW ALL POSTS</span>
            <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
