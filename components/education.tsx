"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { MapPin } from "lucide-react";
import { ThesisFigure } from "@/components/thesis-figure";
import { useNow } from "@/components/experience";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type YearMonth = [year: number, month: number];

type Degree = {
  id: "msc" | "basc";
  short: string;
  field: string;
  start: YearMonth;
  end: YearMonth; // exclusive
};

const degrees: Degree[] = [
  { id: "basc", short: "B.A.Sc.", field: "Software Engineering", start: [2020, 8], end: [2025, 0] },
  { id: "msc", short: "M.Sc.", field: "Computer Science", start: [2025, 0], end: [2027, 0] },
];

const coursework = [
  { name: "Data Structures & Algorithms", area: "Theory" },
  { name: "Discrete Mathematics", area: "Theory" },
  { name: "Embedded Systems", area: "Systems" },
  { name: "Real-Time Systems Design", area: "Systems" },
  { name: "Databases", area: "Data" },
  { name: "Enterprise Architecture", area: "Architecture" },
];

const THESIS_TITLE = "Minimum Feature Size in Proper Triangulations: A tight logarithmic bound";

// Ruler spans Jan 2020 → Jan 2027.
const RULER_START = 2020;
const RULER_MONTHS = 7 * 12;
const toPct = ([y, m]: YearMonth) =>
  Math.min(100, Math.max(0, (((y - RULER_START) * 12 + m) / RULER_MONTHS) * 100));

function progressOf(degree: Degree, now: YearMonth) {
  const a = toPct(degree.start);
  const b = toPct(degree.end);
  return Math.min(1, Math.max(0, (toPct(now) - a) / (b - a)));
}

const EASE = [0.55, 0.45, 0.16, 1] as const;

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`font-mono text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--foreground-muted))] ${className}`}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Degree panels
// ---------------------------------------------------------------------------

function MscSpotlight({ progress }: { progress: number }) {
  return (
    <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--gold))] opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold))]" />
          </span>
          <Eyebrow className="text-[hsl(var(--gold))]">
            In progress · {Math.round(progress * 100)}%
          </Eyebrow>
          <Eyebrow>Jan 2025 — Dec 2026</Eyebrow>
        </div>

        <h3 className="mt-6 text-4xl font-light leading-[1.05] text-foreground md:text-5xl">
          Master of
          <br />
          Computer Science
        </h3>

        <div className="mt-8 border-l border-[hsl(var(--gold))] pl-5">
          <Eyebrow>Thesis</Eyebrow>
          <p className="mt-2 text-lg font-light italic leading-snug text-[hsl(var(--foreground-soft))]">
            {THESIS_TITLE}
          </p>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <dt><Eyebrow>Supervisor</Eyebrow></dt>
            <dd className="mt-1.5 text-foreground">Vida Dujmović</dd>
          </div>
          <div>
            <dt><Eyebrow>Funding</Eyebrow></dt>
            <dd className="mt-1.5 text-foreground">
              $52,000+{" "}
              <span className="text-[hsl(var(--foreground-muted))]">in scholarships</span>
            </dd>
          </div>
        </dl>

        <div className="mt-10">
          <div className="h-px w-full bg-border">
            <div className="h-px bg-[hsl(var(--gold))]" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--foreground-subtle))]">
            <span>Enrolled</span>
            <span>Expected · Dec 2026</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:pt-1">
        <ThesisFigure />
      </div>
    </div>
  );
}

function BascDetail() {
  return (
    <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
      <div>
        <div className="flex items-center gap-3">
          <Eyebrow className="text-[hsl(var(--gold))]">✓ Conferred</Eyebrow>
          <Eyebrow>Sept 2020 — Dec 2024</Eyebrow>
        </div>
        <h3 className="mt-6 text-4xl font-light leading-[1.05] text-foreground md:text-5xl">
          Bachelor of
          <br />
          Applied Science
        </h3>
        <p className="mt-4 text-lg font-light text-[hsl(var(--foreground-soft))]">
          Software Engineering
        </p>
      </div>
      <div>
        <Eyebrow>Selected coursework</Eyebrow>
        <ol className="mt-4">
          {coursework.map((c, i) => (
            <li
              key={c.name}
              className="flex items-baseline gap-4 border-b border-border py-3 text-sm text-[hsl(var(--foreground-soft))]"
            >
              <span className="font-mono text-[11px] text-[hsl(var(--gold))]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">{c.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
                {c.area}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export function Education() {
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });
  const [active, setActive] = useState<Degree["id"]>("msc");
  const now = useNow([2026, 9]);
  const nowPct = toPct(now);
  const mscProgress = progressOf(degrees[1], now);

  return (
    <section id="education" className="relative overflow-hidden py-32">
      {/* Static noise with fade */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          maskImage: `linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)`,
          opacity: 0.06,
        }}
      />

      <div className="container mx-auto px-6 md:px-12">
        {/* Section Title */}
        <div ref={titleRef} className="relative mb-16 md:mb-24">
          <div className="flex items-center">
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 1, ease: EASE }}
              className="text-section font-light text-foreground"
            >
              ED
            </motion.span>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              className="mx-2 flex flex-col items-center md:mx-4"
            >
              <span className="arabic-bracket text-lg md:text-xl">「</span>
              <span className="font-arabic text-xl text-[hsl(var(--gold))] md:text-3xl">
                تعليم
              </span>
              <span className="arabic-bracket text-lg md:text-xl">」</span>
            </motion.div>

            <motion.span
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 1, ease: EASE }}
              className="text-section font-light text-foreground"
            >
              U
            </motion.span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {/* Institution */}
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Institution</Eyebrow>
              <h3 className="mt-2 text-3xl font-light text-foreground md:text-4xl">
                University of Ottawa
              </h3>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs tracking-wider text-[hsl(var(--foreground-muted))]">
              <MapPin className="h-3 w-3 text-[hsl(var(--gold))]" />
              Ottawa, ON <span className="text-[hsl(var(--foreground-faint))]">/</span> 2020 — 2026
            </div>
          </div>

          {/* Ruler */}
          <div className="relative mt-14 select-none">
            <div className="relative h-6">
              {Array.from({ length: 8 }, (_, i) => RULER_START + i).map((y) => (
                <span
                  key={y}
                  className="absolute -translate-x-1/2 font-mono text-[11px] tracking-wider text-[hsl(var(--foreground-muted))] first:translate-x-0 last:-translate-x-full"
                  style={{ left: `${toPct([y, 0])}%` }}
                >
                  {y}
                </span>
              ))}
            </div>

            <div className="relative h-4 border-b border-border">
              {Array.from({ length: RULER_MONTHS + 1 }, (_, i) => (
                <span
                  key={i}
                  className={`absolute bottom-0 w-px ${
                    i % 12 === 0
                      ? "h-4 bg-[hsl(var(--foreground-subtle))]"
                      : i % 3 === 0
                        ? "h-2 bg-[hsl(var(--foreground-faint))]"
                        : "h-1 bg-border"
                  }`}
                  style={{ left: `${(i / RULER_MONTHS) * 100}%` }}
                />
              ))}
            </div>

            <div className="relative mt-5 h-14">
              {degrees.map((d) => {
                const left = toPct(d.start);
                const width = toPct(d.end) - left;
                const isActive = active === d.id;
                const progress = progressOf(d, now) * 100;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setActive(d.id)}
                    onMouseEnter={() => setActive(d.id)}
                    aria-pressed={isActive}
                    className={`absolute inset-y-0 overflow-hidden border text-left transition-all duration-500 ${
                      isActive
                        ? "border-[hsl(var(--gold))]"
                        : "border-border opacity-60 hover:opacity-90"
                    }`}
                    style={{
                      left: `calc(${left}% + 2px)`,
                      width: `calc(${width}% - 4px)`,
                      background: `linear-gradient(to right, hsl(var(--gold) / ${isActive ? 1 : 0.35}) ${progress}%, transparent ${progress}%), repeating-linear-gradient(135deg, hsl(var(--gold) / 0.25) 0 1px, transparent 1px 7px)`,
                    }}
                  >
                    <span
                      className={`absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] md:left-4 ${
                        isActive ? "text-background" : "text-foreground"
                      }`}
                    >
                      {d.short} <span className="hidden sm:inline">· {d.field}</span>
                    </span>
                  </button>
                );
              })}

              {/* Now marker */}
              <div
                className="pointer-events-none absolute -bottom-3 -top-[3.25rem] w-px bg-foreground"
                style={{ left: `${nowPct}%` }}
              >
                <span className="absolute -top-1 left-1/2 flex h-2 w-2 -translate-x-1/2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground" />
                </span>
              </div>
            </div>
            <div className="relative mt-5 h-4">
              <span
                className="absolute -translate-x-full pr-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground"
                style={{ left: `${nowPct}%` }}
              >
                Now
              </span>
            </div>
          </div>

          {/* Detail */}
          <div className="mt-14 border-t border-border pt-12">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                {active === "msc" ? <MscSpotlight progress={mscProgress} /> : <BascDetail />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
