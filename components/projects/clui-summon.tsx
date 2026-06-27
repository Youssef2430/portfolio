"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Paperclip, Camera, BrainCircuit, Mic, ArrowUp } from "lucide-react";

/**
 * Clui's signature interaction, recreated: ⌥ + Space summons the floating
 * input pill above every window. The keys press on a loop and the pill retypes
 * a different prompt each time - the same calm, traceless overlay the app shows
 * at runtime. Mirrors `web/src/components/SectionSummon.tsx`.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const PROMPTS = [
  "Ask Claude Code anything…",
  "Refactor the auth middleware",
  "Why is the build slower?",
  "Add tests for the hook server",
];

// Stacked, slightly overlapping affordance circles (skills / screenshot / attach).
const CIRCLES = [
  { Icon: BrainCircuit, title: "Skills" },
  { Icon: Camera, title: "Screenshot" },
  { Icon: Paperclip, title: "Attach" },
];

export function CluiSummon() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-20%" });
  const reduced = useReducedMotion();

  const [pressed, setPressed] = useState(false);
  const [appeared, setAppeared] = useState(false);
  const [promptIdx, setPromptIdx] = useState(0);
  const [typed, setTyped] = useState(PROMPTS[0]);

  // The pill appears once, then simply retypes prompts as the keys press -
  // no per-cycle grow/shrink, so the layout stays calm.
  useEffect(() => {
    if (reduced || !inView) {
      setAppeared(true);
      setTyped(PROMPTS[promptIdx]);
      return;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    function cycle(idx: number, firstRun: boolean) {
      if (cancelled) return;
      const text = PROMPTS[idx];
      setPressed(true);
      at(360, () => setPressed(false));

      const startType = firstRun ? 700 : 420;
      if (firstRun) at(360, () => setAppeared(true));
      setTyped("");
      for (let i = 0; i <= text.length; i++) {
        at(startType + i * 26, () => setTyped(text.slice(0, i)));
      }
      const done = startType + text.length * 26;
      at(done + 2600, () => {
        const next = (idx + 1) % PROMPTS.length;
        setPromptIdx(next);
        cycle(next, false);
      });
    }

    const kickoff = setTimeout(() => cycle(promptIdx, true), 500);
    return () => {
      cancelled = true;
      clearTimeout(kickoff);
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, inView]);

  const isPlaceholder = typed === PROMPTS[0];

  return (
    <div ref={ref} className="flex flex-col items-center gap-10 py-6">
      {/* circles + pill */}
      <div className="flex w-full max-w-[440px] items-center gap-3">
        {/* stacked, overlapping circles */}
        <div className="flex flex-shrink-0 items-center">
          {CIRCLES.map(({ Icon, title }, i) => (
            <span
              key={title}
              title={title}
              style={{ zIndex: CIRCLES.length - i }}
              className="-ml-2.5 flex h-[38px] w-[38px] items-center justify-center rounded-full border border-border bg-card text-[hsl(var(--foreground-subtle))] ring-2 ring-background backdrop-blur-xl first:ml-0"
            >
              <Icon className="h-[17px] w-[17px]" strokeWidth={1.6} />
            </span>
          ))}
        </div>

        <motion.div
          initial={false}
          animate={appeared ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex h-[50px] flex-1 items-center gap-1.5 rounded-[25px] border border-border bg-card/70 px-1.5 pl-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          <span className={`min-w-0 flex-1 truncate text-[13.5px] ${isPlaceholder ? "text-[hsl(var(--foreground-subtle))]" : "text-foreground"}`}>
            {typed}
            <span className="clui-caret" />
          </span>
          <button className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-card text-[hsl(var(--foreground-soft))]" aria-hidden>
            <Mic className="h-4 w-4" strokeWidth={1.6} />
          </button>
          <button className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--gold))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" aria-hidden>
            <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </motion.div>
      </div>

      {/* keyboard */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2.5">
          <Key pressed={pressed} className="w-12">⌥</Key>
          <span className="text-xl font-light text-[hsl(var(--foreground-subtle))]">+</span>
          <Key pressed={pressed} className="px-12 text-xs tracking-[0.06em]">Space</Key>
        </div>
        <p className="clui-mono text-[11px] tracking-[0.04em] text-[hsl(var(--foreground-subtle))]">
          Summon from anywhere · no dock icon, no trace
        </p>
      </div>
    </div>
  );
}

/* A single mac-style keycap: fixed height, rounded corners, a 3-D press. */
function Key({ children, pressed, className = "" }: { children: React.ReactNode; pressed: boolean; className?: string }) {
  return (
    <span
      className={`clui-mono inline-flex h-12 select-none items-center justify-center rounded-[11px] border border-border bg-background text-base text-foreground shadow-[0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_0_hsl(var(--foreground)/0.04)] transition-all duration-150 ${className}`}
      style={{
        borderBottomWidth: pressed ? 1 : 3,
        transform: pressed ? "translateY(2px)" : "translateY(0)",
        backgroundColor: pressed ? "hsl(var(--gold) / 0.08)" : undefined,
      }}
    >
      {children}
    </span>
  );
}
