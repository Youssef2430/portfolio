"use client";

import { SecretRoom } from "./secret-room";
import { useEffect, useState } from "react";
import { ArrowUp, Check, Link as LinkIcon } from "lucide-react";

const CONSOLE_NOTES = {
  chess: [
    "♞ Reading the source? Respect.",
    "The chess terminal understands more than it admits. Try `help` under v3, then `yolo`, then `knight`. Don’t try `echo`.",
  ],
  markets: [
    "∿ Reading the source? Respect.",
    "Shock the market three times, then read the line under the headline.",
  ],
  other: ["Reading the source? Respect."],
};

export function NoteReader({
  chapters,
  kind = "other",
}: {
  chapters: { id: string; title: string }[];
  kind?: "markets" | "chess" | "other";
}) {
  const [progress, setProgress] = useState(0);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    const [title, body] = CONSOLE_NOTES[kind];
    console.log(
      `%c${title}%c\n${body ?? ""}\nPress ? on the page for keyboard shortcuts.`,
      "font: 600 14px Georgia, serif",
      "font: 12px ui-monospace, monospace; line-height: 1.6",
    );
  }, [kind]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        target.closest("input, textarea, select, [contenteditable='true']")
      )
        return;
      if (event.key === "?") {
        setHelp((open) => !open);
        return;
      }
      if (event.key === "Escape") setHelp(false);
      if (event.key !== "j" && event.key !== "k") return;
      const tops = chapters
        .map((c) => document.getElementById(c.id))
        .filter((el): el is HTMLElement => Boolean(el))
        .map((el) => el.getBoundingClientRect().top);
      // 120px clears the sticky navbar; a small slack avoids re-selecting the current chapter.
      const index =
        event.key === "j"
          ? tops.findIndex((top) => top > 130)
          : tops.findLastIndex((top) => top < 110);
      const id = index >= 0 ? chapters[index].id : event.key === "k" ? "note-top" : null;
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapters]);
  const [active, setActive] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const article = document.getElementById("note-body");
      if (!article) return;
      const start = article.getBoundingClientRect().top + window.scrollY;
      const available = article.offsetHeight - window.innerHeight + 140;
      setProgress(
        Math.max(
          0,
          Math.min(
            100,
            ((window.scrollY - start + 140) / Math.max(1, available)) * 100,
          ),
        ),
      );
      let current = "";
      for (const chapter of chapters) {
        const element = document.getElementById(chapter.id);
        if (element && element.getBoundingClientRect().top <= 180)
          current = chapter.id;
      }
      setActive(current);
      frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    const article = document.getElementById("note-body");
    if (article) observer.observe(article);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [chapters]);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  const contents = (
    <nav aria-label="In this field note">
      {chapters.map((chapter, i) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          aria-current={active === chapter.id ? "location" : undefined}
        >
          <span>{String(i + 1).padStart(2, "0")}</span>
          {chapter.title}
        </a>
      ))}
    </nav>
  );
  return (
    <aside className="fn-reader">
      <div
        className="fn-progress-track"
        role="progressbar"
        aria-label="Article reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="fn-reader-desktop">
        <p className="fn-kicker">In this field note</p>
        {contents}
      </div>
      <details className="fn-reader-mobile">
        <summary>
          In this field note <span>{Math.round(progress)}%</span>
        </summary>
        {contents}
      </details>
      <div className="fn-reader-actions">
        <span className="fn-kicker">{Math.round(progress)}% explored</span>
        <button
          onClick={copyLink}
          aria-label={copied ? "Link copied" : "Copy article link"}
        >
          {copied ? <Check size={14} /> : <LinkIcon size={14} />}
        </button>
        <a href="#note-top" aria-label="Back to article top">
          <ArrowUp size={14} />
        </a>
      </div>
      {help && (
        <div className="fn-keys" role="dialog" aria-label="Keyboard shortcuts">
          <p className="fn-kicker">Keyboard</p>
          <dl>
            <dt>j</dt>
            <dd>next section</dd>
            <dt>k</dt>
            <dd>previous section</dd>
            <dt>← →</dt>
            <dd>step through a focused game replay</dd>
            <dt>?</dt>
            <dd>toggle this card</dd>
          </dl>
          <p className="fn-keys-hint">
            {kind === "chess"
              ? "Some terminals understand more than one command. One of them gets you disqualified."
              : kind === "markets"
                ? "Some titles respond to pressure."
                : "Look closely."}
          </p>
        </div>
      )}
      {copyError && (
        <p className="fn-caption" role="status">
          Copy the address from your browser to share this note.
        </p>
      )}
    </aside>
  );
}

export function EndNote({ kind }: { kind: "markets" | "chess" | "other" }) {
  return <div className="fn-endnote"><SecretRoom kind={kind} /></div>;
}
