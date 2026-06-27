"use client";

/**
 * Mugshot's signature interaction: the core loop, recreated.
 *
 * Snap a coffee → the app lifts it into a die-cut sticker → the sticker drops
 * onto a calendar day. It auto-plays on a gentle loop and replays when tapped.
 * The whole thing lives on a fixed-aspect stage so the percentage-positioned
 * flying sticker maps correctly at every size.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, Check } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** capturing → reveal → placing → settled, then loop. */
type Step = 0 | 1 | 2 | 3;
const STEP_MS = [1700, 1300, 1100, 1700] as const;

// Pre-stamped calendar days, so the board already feels lived-in.
const STAMPS: Record<number, { src: string; rot: number }> = {
  2: { src: "/mugshot/stickers/matcha.png", rot: -8 },
  5: { src: "/mugshot/stickers/latte-top.png", rot: 6 },
  8: { src: "/mugshot/stickers/mocha.png", rot: -5 },
  11: { src: "/mugshot/stickers/coldbrew.png", rot: 7 },
  12: { src: "/mugshot/stickers/cup-top.png", rot: -10 },
};
const TARGET_DAY = 14; // the empty cell our fresh sticker lands on

export function MugshotLoop() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>(0);
  const timer = useRef<number | null>(null);

  const advance = useCallback(() => {
    setStep((s) => ((s + 1) % 4) as Step);
  }, []);

  useEffect(() => {
    if (reduce) {
      setStep(3);
      return;
    }
    timer.current = window.setTimeout(advance, STEP_MS[step]);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [step, advance, reduce]);

  const replay = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setStep(0);
  };

  const placed = step >= 2;
  const settled = step === 3;

  // Flying sticker target: over the viewfinder while brewing, on the day cell once placed.
  const flyPos = placed
    ? { left: "72%", top: "31%", scale: 0.5, rotate: -7 }
    : { left: "21%", top: "45%", scale: 1, rotate: -2 };

  return (
    <div className="mug-rounded">
      <div className="relative mx-auto aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-[28px] border border-[hsl(var(--mug-cream))] bg-[hsl(var(--mug-card))] shadow-[0_30px_70px_-45px_rgba(35,27,20,0.5)]">
        <div className="mug-dots absolute inset-0 opacity-60" />

        {/* ── Left column: capture → make sticker ── */}
        <div className="absolute inset-y-0 left-0 flex w-[42%] flex-col items-center justify-center gap-4 px-3 md:px-5">
          <span className="mug-rounded text-[10px] font-extrabold uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))] md:text-[11px]">
            {step === 0 ? "Snap" : "Sticker"}
          </span>

          {/* Viewfinder / processing puck */}
          <div className="relative flex h-[42%] w-full items-center justify-center">
            <div
              className={`relative flex aspect-square h-full max-h-[150px] items-center justify-center rounded-[26px] transition-colors duration-500 ${
                step === 0
                  ? "bg-[hsl(var(--mug-soft))]"
                  : "bg-[hsl(var(--mug-soft))]/40"
              }`}
            >
              <ViewfinderCorners className="absolute inset-3 text-[hsl(var(--mug-sage-deep))]/70" />
              {step === 0 && (
                <Camera
                  className="h-8 w-8 text-[hsl(var(--mug-sage-deep))]"
                  strokeWidth={2.4}
                />
              )}
              {step === 0 && (
                <>
                  <Steam className="absolute left-1/2 top-2 -translate-x-1/2" />
                </>
              )}
            </div>
          </div>

          <div className="flex min-h-[22px] items-center gap-2">
            {step === 0 ? (
              <>
                <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[hsl(var(--mug-coral))] border-t-transparent" />
                <span className="text-[12px] font-bold text-[hsl(var(--foreground-soft))] md:text-[13px]">
                  Making sticker
                </span>
              </>
            ) : (
              <motion.span
                key="label"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[12px] font-bold text-[hsl(var(--foreground-soft))] md:text-[13px]"
              >
                Iced Latte
              </motion.span>
            )}
          </div>
        </div>

        {/* ── Right column: the sticker calendar ── */}
        <div className="absolute inset-y-0 right-0 flex w-[58%] flex-col justify-center p-4 md:p-6">
          <div className="rounded-[22px] border border-[hsl(var(--mug-cream))] bg-[hsl(var(--mug-card))]/90 p-3 shadow-[0_18px_40px_-30px_rgba(35,27,20,0.5)] md:p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="mug-display text-base font-semibold text-[hsl(var(--foreground))] md:text-lg">
                June
              </span>
              <span className="mug-rounded text-[9px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
                2026
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 15 }, (_, i) => {
                const day = i + 1;
                const stamp = STAMPS[day];
                const isTarget = day === TARGET_DAY;
                return (
                  <div
                    key={day}
                    className={`relative flex aspect-square items-center justify-center rounded-[11px] text-[8px] font-bold transition-colors duration-500 md:text-[9px] ${
                      isTarget && settled
                        ? "bg-[hsl(var(--mug-roast))] text-[hsl(var(--mug-card))]"
                        : "bg-[hsl(var(--mug-soft))]/70 text-[hsl(var(--foreground-subtle))]"
                    }`}
                  >
                    <span className={stamp ? "opacity-30" : "opacity-90"}>
                      {day}
                    </span>
                    {stamp && (
                      <Image
                        src={stamp.src}
                        alt=""
                        width={64}
                        height={64}
                        className="mug-sticker absolute inset-0 m-auto h-[78%] w-[78%] object-contain"
                        style={{ transform: `rotate(${stamp.rot}deg)` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* gentle caffeine nudge that ticks up once a cup lands */}
          <div className="mt-3 px-1">
            <div className="mb-1 flex items-center justify-between">
              <span className="mug-rounded text-[9px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground-subtle))]">
                Caffeine today
              </span>
              <span className="mug-numeral text-[11px] text-[hsl(var(--gold))]">
                {settled ? "120" : "0"}
                <span className="text-[8px] font-bold text-[hsl(var(--foreground-subtle))]">
                  {" "}
                  mg
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--mug-soft))]">
              <motion.div
                className="h-full rounded-full bg-[hsl(var(--gold))]"
                animate={{ width: settled ? "30%" : "0%" }}
                transition={{ duration: 0.9, ease: EASE }}
              />
            </div>
          </div>
        </div>

        {/* ── The flying die-cut sticker ── */}
        <motion.div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
          initial={false}
          animate={{
            left: flyPos.left,
            top: flyPos.top,
            scale: step === 0 ? 0 : flyPos.scale,
            rotate: flyPos.rotate,
            opacity: step === 0 ? 0 : 1,
          }}
          transition={
            step === 1
              ? { type: "spring", stiffness: 240, damping: 14 }
              : { duration: 0.7, ease: EASE }
          }
        >
          <div className="relative">
            <Image
              src="/mugshot/stickers/boba.png"
              alt="A coffee photo lifted into a die-cut sticker"
              width={150}
              height={300}
              className="mug-sticker h-auto w-[64px] object-contain md:w-[78px]"
            />
            {/* caffeine chip rides along until it's placed */}
            {step === 1 && (
              <motion.span
                initial={{ opacity: 0, y: 6, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.25, ...{ type: "spring", stiffness: 260, damping: 16 } }}
                className="mug-rounded absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[hsl(var(--mug-roast))] px-2 py-0.5 text-[9px] font-extrabold text-[hsl(var(--mug-card))] shadow-md"
              >
                120 mg
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* placement confirmation pop on the target cell */}
        {settled && !reduce && (
          <motion.div
            className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
            style={{ left: "72%", top: "31%" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.15, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1, times: [0, 0.4, 1], ease: EASE }}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--mug-sage))] text-[hsl(var(--mug-card))] shadow-lg">
              <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
            </span>
          </motion.div>
        )}

        {/* replay affordance */}
        <button
          onClick={replay}
          className="mug-rounded absolute bottom-3 left-3 z-40 rounded-full bg-[hsl(var(--mug-card))]/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground-muted))] backdrop-blur transition-colors hover:text-[hsl(var(--foreground))]"
          aria-label="Replay the capture loop"
        >
          Replay
        </button>
      </div>

      {/* step legend */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {["Snap a coffee", "Make a sticker", "Place it on the day"].map(
          (lbl, i) => {
            const active = (i === 0 && step === 0) || (i === 1 && step === 1) || (i === 2 && step >= 2);
            return (
              <div key={lbl} className="flex items-center gap-2">
                <span
                  className={`mug-rounded text-[10px] font-bold uppercase tracking-[0.1em] transition-colors md:text-[11px] ${
                    active
                      ? "text-[hsl(var(--gold))]"
                      : "text-[hsl(var(--foreground-subtle))]"
                  }`}
                >
                  {lbl}
                </span>
                {i < 2 && (
                  <span className="text-[hsl(var(--foreground-faint))]">→</span>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

function ViewfinderCorners({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 26 L4 4 L26 4" />
      <path d="M74 4 L96 4 L96 26" />
      <path d="M96 74 L96 96 L74 96" />
      <path d="M26 96 L4 96 L4 74" />
    </svg>
  );
}

function Steam({ className = "" }: { className?: string }) {
  return (
    <div className={`flex gap-1 ${className}`} aria-hidden>
      {[0, 0.4, 0.8].map((d, i) => (
        <span
          key={i}
          className="mug-steam block h-4 w-[3px] rounded-full bg-[hsl(var(--mug-latte))]/60"
          style={{ animationDelay: `${d}s` }}
        />
      ))}
    </div>
  );
}
