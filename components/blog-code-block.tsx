"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

type BlogCodeBlockProps = {
  children: ReactNode;
  code: string;
  language?: string;
};

const LANGUAGE_LABELS: Record<string, string> = {
  bash: "Shell",
  js: "JavaScript",
  javascript: "JavaScript",
  json: "JSON",
  md: "Markdown",
  markdown: "Markdown",
  python: "Python",
  sh: "Shell",
  shell: "Shell",
  ts: "TypeScript",
  tsx: "TSX",
  txt: "Text",
  text: "Text",
};

function formatLanguage(language?: string) {
  if (!language) return "Code";

  const normalized = language.toLowerCase();
  return LANGUAGE_LABELS[normalized] ?? normalized.toUpperCase();
}

function fallbackCopy(code: string) {
  const textarea = document.createElement("textarea");
  textarea.value = code;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function BlogCodeBlock({ children, code, language }: BlogCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyCode() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        fallbackCopy(code);
      }

      setCopied(true);
    } catch {
      fallbackCopy(code);
      setCopied(true);
    }
  }

  return (
    <figure className="blog-code-surface not-prose my-8 overflow-hidden border border-border/80 bg-[hsl(var(--card)/0.72)] shadow-[0_24px_70px_hsl(var(--foreground)/0.08)] backdrop-blur">
      <figcaption className="flex min-h-11 items-center justify-between gap-3 border-b border-border/70 bg-[hsl(var(--wash)/0.46)] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--gold))]" />
          <span className="truncate font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--foreground-muted))]">
            {formatLanguage(language)}
          </span>
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="inline-flex h-8 shrink-0 items-center gap-2 border border-border/80 bg-background/70 px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[hsl(var(--foreground-muted))] transition-colors hover:border-[hsl(var(--gold))]/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))]/50"
          aria-label={copied ? "Code copied" : "Copy code"}
          title={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-[hsl(var(--gold))]" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </figcaption>

      <pre className="!m-0 !border-0 overflow-x-auto p-5 text-[13px] leading-7 md:p-6">
        {children}
      </pre>
    </figure>
  );
}
