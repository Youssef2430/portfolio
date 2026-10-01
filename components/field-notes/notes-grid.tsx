"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatPostDate, type BlogPost } from "@/lib/blog-data";
import { noteIdentity } from "@/lib/field-notes";
import { ChessBoard, MarketPaths } from "./experiments";

export function NotesGrid({
  posts,
  filters = true,
}: {
  posts: BlogPost[];
  filters?: boolean;
}) {
  const [category, setCategory] = useState("All notes");
  const categories = [
    "All notes",
    ...new Set(posts.map((post) => noteIdentity(post).category)),
  ];
  const visible = posts.filter(
    (post) =>
      category === "All notes" || noteIdentity(post).category === category,
  );
  return (
    <div className="fn-index">
      {filters && (
        <div className="fn-filterbar">
          <div className="fn-filters" aria-label="Filter field notes">
            {categories.map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
                {c === "All notes" && (
                  <span>{String(posts.length).padStart(2, "0")}</span>
                )}
              </button>
            ))}
          </div>
          <span className="fn-kicker">Small experiments. Longer thoughts.</span>
        </div>
      )}
      <div className="fn-grid">
        {visible.map((post) => {
          const note = noteIdentity(post);
          return (
            <article className="fn-card" key={post.slug}>
              <div className="fn-card-meta fn-kicker">
                <span>
                  {note.number} / {note.category}
                </span>
                <span>{post.readingTimeMinutes} min read</span>
              </div>
              <h2>
                <Link href={`/blog/${post.slug}`}>{note.title}</Link>
              </h2>
              <p>{note.subtitle}</p>
              <div className="fn-card-visual">
                {note.kind === "markets" ? (
                  <MarketPaths compact />
                ) : note.kind === "chess" ? (
                  <>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="fn-board-link"
                      aria-label="Explore the chess benchmark"
                    >
                      <ChessBoard compact />
                    </Link>
                    <span className="fn-board-caption fn-kicker">
                      Your move, machine.
                    </span>
                  </>
                ) : (
                  <span className="fn-other-note" aria-hidden="true">
                    ↗
                  </span>
                )}
              </div>
              <Link href={`/blog/${post.slug}`} className="fn-read-link">
                <span>
                  Open the note{" "}
                  <span className="fn-date">· {formatPostDate(post.date)}</span>
                </span>
                <ArrowUpRight size={22} />
              </Link>
            </article>
          );
        })}
      </div>
      {posts.length === 0 && (
        <p className="fn-empty">
          The notebook is open. First notes coming soon.
        </p>
      )}
      {filters && (
        <div className="fn-index-footer">
          <span aria-live="polite">
            {visible.length} {visible.length === 1 ? "note" : "notes"} to
            explore
          </span>
          <span>Collected with curiosity, by Youssef.</span>
        </div>
      )}
    </div>
  );
}
