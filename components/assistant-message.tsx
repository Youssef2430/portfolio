"use client";

import { useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import { ThinkingOrb } from "thinking-orbs";
import {
  CITE_SCHEME,
  citationLabel,
  citedIds,
  normalizeCitations,
  settleStreamingMarkdown,
  type CitationSource,
} from "@/lib/citations";

const EASE = [0.22, 1, 0.36, 1] as const;

const keepCitations = (url: string) =>
  url.startsWith(CITE_SCHEME) ? url : defaultUrlTransform(url);

/** Plain clicks go through the guide; modified clicks open the page as usual. */
function followClick(
  event: MouseEvent<HTMLAnchorElement>,
  source: CitationSource,
  onCite: (source: CitationSource) => void,
) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  onCite(source);
}

/** Keep the shell and canvas mounted as the first tokens arrive. */
export function AssistantMessage({
  text,
  active,
  sources,
  onCite,
}: {
  text: string;
  active: boolean;
  sources: ReadonlyMap<string, CitationSource>;
  onCite: (source: CitationSource) => void;
}) {
  const reduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const hasAnswer = text.length > 0;
  const markdown = useMemo(() => {
    const normalized = normalizeCitations(text);
    return active ? settleStreamingMarkdown(normalized) : normalized;
  }, [text, active]);
  // Unknown ids are dropped: the answer keeps the words, without a dead link.
  const cited = useMemo(
    () => citedIds(markdown).flatMap((id) => sources.get(id) ?? []),
    [markdown, sources],
  );
  const components = useMemo<Components>(
    () => ({
      a({ href = "", children }) {
        if (!href.startsWith(CITE_SCHEME))
          return (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        const index = cited.findIndex((source) => source.id === href.slice(CITE_SCHEME.length));
        const source = cited[index];
        if (!source) return <>{children}</>;
        return (
          <a
            href={source.href}
            onClick={(event) => followClick(event, source, onCite)}
            className="decoration-[hsl(var(--gold))]/40 underline-offset-[3px] transition-colors hover:text-foreground"
          >
            {children}
            <sup className="ml-px inline-block text-[0.7em]">{index + 1}</sup>
          </a>
        );
      },
    }),
    [cited, onCite],
  );

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () => setHeight(content.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-assistant-message
      aria-busy={active}
      className="w-[92%] overflow-hidden rounded-[16px] rounded-bl-[4px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-3 text-card-foreground sm:w-[80%] sm:rounded-[20px] sm:rounded-bl-[4px] sm:px-4"
    >
      <div className="flex min-h-5 items-center font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--gold))]">
        <AnimatePresence initial={false}>
          {active && (
            <motion.span
              key="orb"
              className="block shrink-0 overflow-hidden"
              initial={false}
              animate={{ width: 28, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: EASE, opacity: { duration: 0.15 } }}
            >
              <ThinkingOrb state={hasAnswer ? "composing" : "connecting"} size={20} speed={0.85} aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
        <span>Youssef&apos;s AI</span>
        <span className="ml-auto pl-2 text-[8px] tracking-[0.12em] text-[hsl(var(--muted-foreground))]" role="status">
          {active ? (hasAnswer ? "Writing" : "Thinking") : ""}
        </span>
      </div>

      <motion.div
        className="overflow-hidden"
        initial={false}
        animate={{ height: hasAnswer ? height : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: EASE }}
      >
        <motion.div
          ref={contentRef}
          className="pt-2"
          initial={false}
          animate={{ opacity: hasAnswer ? 1 : 0, y: hasAnswer || reduceMotion ? 0 : 5 }}
          transition={{ duration: reduceMotion ? 0 : 0.24, ease: EASE }}
        >
          <div className="chat-message-text whitespace-pre-wrap break-words text-[13px] leading-relaxed [&_*]:break-words [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-foreground/10 [&_code]:px-1 [&_code]:text-[hsl(var(--gold))] [&_a]:text-[hsl(var(--gold))] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:ml-0 [&_p+p]:mt-2 sm:text-sm">
            <ReactMarkdown urlTransform={keepCitations} components={components}>
              {markdown}
            </ReactMarkdown>
          </div>
          {cited.length > 0 && (
            <ol aria-label="Sources" className="chat-message-text mt-3 border-t border-[hsl(var(--border))] pt-1.5">
              {cited.map((source, i) => (
                <li key={source.id}>
                  <a
                    href={source.href}
                    onClick={(event) => followClick(event, source, onCite)}
                    className="group -mx-1.5 flex items-baseline gap-2.5 rounded-[6px] px-1.5 py-1.5 transition-colors hover:bg-[hsl(var(--muted))]"
                  >
                    <span className="text-[10px] tabular-nums text-[hsl(var(--gold))]">{i + 1}</span>
                    <span className="w-[4.75rem] shrink-0 text-[8px] uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))] sm:text-[9px]">
                      {citationLabel(source)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11px] text-card-foreground sm:text-xs">
                      {source.title}
                      {source.context && (
                        <span className="text-[hsl(var(--muted-foreground))]"> · {source.context}</span>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-[11px] text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-0.5 group-hover:text-[hsl(var(--gold))]"
                    >
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
