"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getLatestPosts } from "@/lib/blog-data";
import { NotesGrid } from "@/components/field-notes/notes-grid";

export function BlogSection() {
  return (
    <section id="blog" className="relative py-24 md:py-32">
      <div className="container mx-auto px-6 md:px-12">
        <header className="fn-index-heading">
          <div>
            <h2 className="fn-blog-title" aria-label="Blog">
              BL
              <span className="fn-arabic-title" aria-hidden="true">
                <small>「</small>
                <span lang="ar" dir="rtl">
                  مقالات
                </span>
                <small>」</small>
              </span>
              OG
            </h2>
            <p className="fn-kicker">Writings & research / Field notes</p>
          </div>
          <p className="fn-introduction">
            A few things I’ve built, questioned, and tried to make sense of.
            Pull on a thread.
          </p>
        </header>
        <NotesGrid posts={getLatestPosts(3)} filters={false} />
        <div className="mt-10 flex justify-center">
          <Link href="/blog" className="fn-text-button">
            Explore all field notes <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
