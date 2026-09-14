"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ThinkingOrb } from "thinking-orbs";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Keep the shell and canvas mounted as the first tokens arrive. */
export function AssistantMessage({ text, active }: { text: string; active: boolean }) {
  const reduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const hasAnswer = text.length > 0;

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
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
