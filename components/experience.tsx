"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type YearMonth = [year: number, month: number];

type Group = { name?: string; bullets: ReactNode[] };

type Role = {
  id: string;
  role: string;
  company: string;
  short: string;
  url: string;
  location: string;
  period: string;
  start: YearMonth;
  end: YearMonth | null; // null = present
  summary: string;
  metric: { value: string; label: string };
  stack: string[];
  groups: Group[];
};

const roles: Role[] = [
  {
    id: "trend",
    role: "Software Engineer Intern",
    company: "TrendMicro / TrendAI",
    short: "TrendAI",
    url: "https://www.trendmicro.com/",
    location: "Ottawa, ON",
    period: "Jan 2026 – Present",
    start: [2026, 0],
    end: null,
    summary: "LLM threat detection on the AI Security team.",
    metric: { value: "4×", label: "faster inference" },
    stack: ["Rust", "Go", "AWS", "MCP", "LLM security"],
    groups: [
      {
        bullets: [
          "Worked with the AI Security team to migrate a prompt-scan engine to state-of-the-art detection models for LLM threat analysis, including implementation, testing, debugging, and rollout support.",
          "Implemented chunking behavior for an inference engine in Rust and Go, improving support for long prompts and document-style inputs in AI security workflows.",
          "Introduced dynamic chunking to the inference engine, speeding up inference by 4× and cutting energy usage by 62% while raising throughput.",
          "Owned design, implementation, testing, and AWS deployment of a backend service that retrieves company profiles and market data through MCP-based integrations for cybersecurity research workflows.",
        ],
      },
    ],
  },
  {
    id: "nrc",
    role: "Artificial Intelligence Researcher",
    company: "National Research Council",
    short: "NRC",
    url: "https://nrc.canada.ca/en",
    location: "Ottawa, ON",
    period: "May 2024 – Present",
    start: [2024, 4],
    end: null,
    summary: "First-author research putting LLM agents inside buildings and utilities.",
    metric: { value: "56%", label: "lower maintenance costs" },
    stack: ["Python", "LangChain", "Multi-agent", "SQLite", "Time-series"],
    groups: [
      {
        name: "AI-Enhanced Building Automation (BAS)",
        bullets: [
          <>
            Published, as <strong className="font-medium text-foreground">first author</strong>, the
            peer-reviewed paper &ldquo;
            <strong className="font-medium text-foreground">
              Implementing AI in Smart Buildings: A Modular, Proof-of-Concept approach
            </strong>
            &rdquo; and presented it at{" "}
            <a
              href="https://epec2025.ieee.ca/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--gold))] underline decoration-[hsl(var(--gold))]/30 underline-offset-4 transition-colors hover:text-foreground"
            >
              IEEE EPEC 2025
            </a>
            .
          </>,
          "Designed and deployed Python/LangChain agents bridging BAS and LLM tools, cutting data-processing time and operator workload by 49%.",
          "Built a SQLite-backed ingestion pipeline to process and integrate real-time BAS streams reliably.",
          "Partnered with Delta Controls and Carleton University to deliver AI building agents, achieving a 56% reduction in maintenance costs via automated fault detection, predictive maintenance, and real-time alerts.",
        ],
      },
      {
        name: "Enhanced Utilities Chatbot",
        bullets: [
          "Built a multi-agent, tool-using utilities chatbot that explains bills, simulates alternate rate plans, and diagnoses anomalies by linking AMI data with weather/holidays/tariffs for a $3M+ annual revenue company.",
          "Implemented a time-series engine (seasonal decomposition + change-point detection) to flag spikes, persistent baseload, and overnight leaks, then auto-generate plain-English \"why it happened\" narratives and savings playbooks.",
        ],
      },
    ],
  },
  {
    id: "ta",
    role: "Teaching Assistant",
    company: "University of Ottawa",
    short: "uOttawa · TA",
    url: "https://www.uottawa.ca/en",
    location: "Ottawa, ON",
    period: "Sept 2023 – Present",
    start: [2023, 8],
    end: null,
    summary: "Graduate ML and undergraduate algorithms courses.",
    metric: { value: "10+", label: "classes taught" },
    stack: ["Machine learning", "Bioinformatics", "Algorithms", "Paradigms"],
    groups: [
      {
        bullets: [
          "Assisted in teaching graduate classes (Machine Learning for Bio-informatics) and undergraduate courses (Data Structures & Algorithms, Design & Analysis of Algorithms, Programming Paradigms).",
        ],
      },
    ],
  },
  {
    id: "wind",
    role: "Junior Software Engineer",
    company: "Wind River Systems",
    short: "Wind River",
    url: "https://www.windriver.com/",
    location: "Ottawa, ON",
    period: "Sept 2022 – Aug 2023",
    start: [2022, 8],
    end: [2023, 8],
    summary: "An automation dashboard, end to end.",
    metric: { value: "90%", label: "faster queries & UI" },
    stack: ["Angular", "TypeScript", "Django", "PostgreSQL"],
    groups: [
      {
        bullets: [
          "Designed and implemented an Automation Dashboard using Angular, TypeScript, and Django, with a PostgreSQL database.",
          "Achieved over 90% faster query execution and UI responsiveness by optimizing API endpoints and reducing frontend rendering times.",
        ],
      },
    ],
  },
  {
    id: "uo-dev",
    role: "Software Developer",
    company: "University of Ottawa",
    short: "uOttawa · Dev",
    url: "https://www.uottawa.ca/en",
    location: "Ottawa, ON",
    period: "May 2022 – Apr 2024",
    start: [2022, 4],
    end: [2024, 4],
    summary: "Rebuilt the university's search engine.",
    metric: { value: "80%", label: "faster search responses" },
    stack: ["PHP", "MySQL", "Apache", "Bash", "Cron"],
    groups: [
      {
        bullets: [
          "Redesigned and optimized the university's search engine using PHP, MySQL, and Apache, improving query response times by 80%.",
          "Developed automation scripts using PHP, Bash, and Cron jobs to enhance search speed by 54%.",
        ],
      },
    ],
  },
];

const RULER_START = 2022;
const RULER_MONTHS = 5 * 12; // Jan 2022 → Jan 2027
const toPct = ([y, m]: YearMonth) =>
  Math.min(100, Math.max(0, (((y - RULER_START) * 12 + m) / RULER_MONTHS) * 100));

function useNow(): YearMonth {
  const [now] = useState(() => {
    const d = new Date();
    return [d.getFullYear(), d.getMonth() + d.getDate() / 31] as YearMonth;
  });
  return now;
}

// Greedy lane packing so overlapping roles stack instead of colliding.
function packLanes(items: Role[], now: YearMonth) {
  const sorted = [...items].sort((a, b) => toPct(a.start) - toPct(b.start));
  const laneEnds: number[] = [];
  const lanes = new Map<string, number>();
  for (const r of sorted) {
    const s = toPct(r.start);
    let lane = laneEnds.findIndex((end) => end <= s);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = toPct(r.end ?? now);
    lanes.set(r.id, lane);
  }
  return { lanes, count: laneEnds.length };
}

// Pull numbers out of plain-string bullets so the impact reads at a glance.
function Emphasize({ text }: { text: ReactNode }) {
  if (typeof text !== "string") return <>{text}</>;
  const parts = text.split(/(\d+%|\d+×|\$[\d.]+M\+)/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-medium text-foreground">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function SectionTitle() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const ease = [0.55, 0.45, 0.16, 1] as const;

  return (
    <div ref={ref} className="mb-16 flex items-center md:mb-24">
      <motion.span
        initial={{ opacity: 0, x: -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
        transition={{ duration: 1, ease }}
        className="text-section font-light text-foreground"
      >
        EX
      </motion.span>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.8, delay: 0.2, ease }}
        className="mx-2 flex flex-col items-center md:mx-4"
      >
        <span className="arabic-bracket text-lg md:text-xl">「</span>
        <span className="font-arabic text-xl text-[hsl(var(--gold))] md:text-3xl">خبرة</span>
        <span className="arabic-bracket text-lg md:text-xl">」</span>
      </motion.div>
      <motion.span
        initial={{ opacity: 0, x: 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
        transition={{ duration: 1, ease }}
        className="text-section font-light text-foreground"
      >
        P
      </motion.span>
    </div>
  );
}

function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`font-mono text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--foreground-muted))] ${className}`}
    >
      {children}
    </span>
  );
}

function LiveDot() {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--gold))] opacity-70" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold))]" />
    </span>
  );
}

function CompanyLink({ role }: { role: Role }) {
  return (
    <a
      href={role.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1 text-[hsl(var(--gold))] transition-colors hover:text-foreground"
    >
      {role.company}
      <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

function Bullets({ role }: { role: Role }) {
  return (
    <div className="space-y-8">
      {role.groups.map((g, gi) => (
        <div key={gi}>
          {g.name && (
            <div className="mb-4 flex items-baseline gap-3">
              <span className="font-mono text-[10px] tracking-[0.18em] text-[hsl(var(--gold))]">
                {String.fromCharCode(65 + gi)}
              </span>
              <h4 className="text-sm tracking-wide text-foreground">{g.name}</h4>
            </div>
          )}
          <ul className="space-y-3">
            {g.bullets.map((b, bi) => (
              <li
                key={bi}
                className="relative pl-6 text-sm leading-relaxed text-[hsl(var(--foreground-muted))] before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-3 before:bg-[hsl(var(--foreground-faint))]"
              >
                <Emphasize text={b} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Stack({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((t) => (
        <li
          key={t}
          className="border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--foreground-soft))]"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Sticky index + mini timeline + reader
// ---------------------------------------------------------------------------

function MiniTimeline({
  active,
  onSelect,
  title = "Timeline",
}: {
  active: string;
  onSelect: (id: string) => void;
  title?: ReactNode;
}) {
  const now = useNow();
  const nowPct = toPct(now);
  const { lanes, count } = packLanes(roles, now);
  const role = roles.find((r) => r.id === active)!;
  const from = toPct(role.start);
  const to = toPct(role.end ?? now);
  const LANE_H = 8;
  const GAP = 6;
  const ease = [0.55, 0.45, 0.16, 1] as const;

  return (
    <div className="select-none">
      <div className="flex items-baseline justify-between">
        <Eyebrow className="text-[10px] text-[hsl(var(--foreground-subtle))]">{title}</Eyebrow>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={active}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="font-mono text-[10px] tracking-wider text-[hsl(var(--gold))]"
          >
            {role.period}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative mt-4">
        {/* Active span band */}
        <motion.div
          className="pointer-events-none absolute -bottom-2 -top-2 bg-[hsl(var(--gold))]/10"
          initial={false}
          animate={{ left: `${from}%`, width: `${to - from}%` }}
          transition={{ duration: 0.6, ease }}
        />

        <div className="relative" style={{ height: count * LANE_H + (count - 1) * GAP }}>
          {roles.map((r) => {
            const left = toPct(r.start);
            const width = toPct(r.end ?? now) - left;
            const on = r.id === active;
            return (
              <button
                key={r.id}
                type="button"
                aria-label={`${r.short}, ${r.period}`}
                onClick={() => onSelect(r.id)}
                className={`absolute transition-all duration-500 ${
                  on
                    ? "bg-[hsl(var(--gold))] shadow-[0_0_12px_hsl(var(--gold)/0.6)]"
                    : "bg-[hsl(var(--foreground-faint))]/40 hover:bg-[hsl(var(--foreground-faint))]"
                }`}
                style={{
                  top: lanes.get(r.id)! * (LANE_H + GAP),
                  height: LANE_H,
                  left: `calc(${left}% + 1px)`,
                  width: `calc(${width}% - 2px)`,
                }}
              />
            );
          })}
          <div
            className="pointer-events-none absolute -bottom-2 -top-2 w-px bg-foreground"
            style={{ left: `${nowPct}%` }}
          />
        </div>
      </div>

      <div className="relative mt-4 h-4 border-t border-border">
        {Array.from({ length: 6 }, (_, i) => RULER_START + i).map((y) => {
          const pct = toPct([y, 0]);
          const lit = pct >= from - 0.01 && pct <= to + 0.01;
          return (
            <span
              key={y}
              className={`absolute top-1.5 -translate-x-1/2 font-mono text-[10px] tracking-wider transition-colors duration-500 first:translate-x-0 last:-translate-x-full ${
                lit ? "text-[hsl(var(--gold))]" : "text-[hsl(var(--foreground-faint))]"
              }`}
              style={{ left: `${pct}%` }}
            >
              &apos;{String(y).slice(2)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function IndexReader() {
  const [active, setActive] = useState(roles[0].id);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    // The active role is the last one whose top has crossed 40% of the viewport.
    const update = () => {
      const line = window.innerHeight * 0.4;
      let current = roles[0].id;
      for (const r of roles) {
        const el = refs.current[r.id];
        if (el && el.getBoundingClientRect().top <= line) current = r.id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      <SectionTitle />
      <div className="grid gap-12 md:grid-cols-[260px_1fr] md:gap-20">
        <nav className="hidden md:block">
          <ol className="sticky top-28 space-y-1">
            {roles.map((r, i) => {
              const on = active === r.id;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() =>
                      refs.current[r.id]?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                    className="group relative flex w-full items-baseline gap-4 py-3 pl-5 text-left"
                  >
                    <span
                      className={`absolute left-0 top-0 h-full w-px transition-colors duration-300 ${
                        on ? "bg-[hsl(var(--gold))]" : "bg-border"
                      }`}
                    />
                    <span
                      className={`font-mono text-[11px] tabular-nums transition-colors ${
                        on ? "text-[hsl(var(--gold))]" : "text-[hsl(var(--foreground-faint))]"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block text-sm transition-colors ${
                          on ? "text-foreground" : "text-[hsl(var(--foreground-muted))] group-hover:text-foreground"
                        }`}
                      >
                        {r.short}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] tracking-wider text-[hsl(var(--foreground-subtle))]">
                        {r.start[0]} — {r.end ? r.end[0] : "now"}
                      </span>
                    </span>
                    {!r.end && <LiveDot />}
                  </button>
                </li>
              );
            })}
            <li className="pt-8">
              <MiniTimeline
                active={active}
                onSelect={(id) =>
                  refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              />
            </li>
          </ol>
        </nav>

        <div>
          {/* Mobile: the sidebar is hidden, so pin the timeline above the roles */}
          <div className="sticky top-[60px] z-10 -mx-6 mb-10 border-b border-border bg-background/85 px-6 py-4 backdrop-blur-md md:hidden">
            <MiniTimeline
              active={active}
              onSelect={(id) =>
                refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              title={
                <>
                  <span className="text-[hsl(var(--gold))]">
                    {String(roles.findIndex((r) => r.id === active) + 1).padStart(2, "0")}
                  </span>{" "}
                  <span className="text-foreground">{roles.find((r) => r.id === active)!.short}</span>
                </>
              }
            />
          </div>
          {roles.map((r, i) => (
            <article
              key={r.id}
              id={`xp-${r.id}`}
              ref={(el) => {
                refs.current[r.id] = el;
              }}
              className="scroll-mt-48 border-t border-border py-14 first-of-type:border-t-0 first-of-type:pt-0 md:scroll-mt-28"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <Eyebrow>
                    {String(i + 1).padStart(2, "0")} · {r.period}
                  </Eyebrow>
                  <h3 className="mt-4 text-3xl font-light leading-tight text-foreground md:text-4xl">
                    {r.role}
                  </h3>
                  <p className="mt-2 text-[hsl(var(--foreground-soft))]">
                    <CompanyLink role={r} />{" "}
                    <span className="text-[hsl(var(--foreground-faint))]">·</span>{" "}
                    <span className="text-[hsl(var(--foreground-muted))]">{r.location}</span>
                  </p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <div className="text-4xl font-light tracking-tight text-[hsl(var(--gold))]">
                    {r.metric.value}
                  </div>
                  <Eyebrow className="mt-1 block text-[10px]">{r.metric.label}</Eyebrow>
                </div>
              </div>

              <p className="mt-8 max-w-2xl text-lg font-light text-[hsl(var(--foreground-soft))]">
                {r.summary}
              </p>
              <div className="mt-8 max-w-2xl">
                <Bullets role={r} />
              </div>
              <div className="mt-8">
                <Stack items={r.stack} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

export function Experience() {
  return (
    <section id="experience" className="relative py-32">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--wash))] to-transparent opacity-50" />

      {/* Static noise with fade */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          maskImage: `linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)`,
          opacity: 0.06,
        }}
      />

      <div className="relative z-[2] container mx-auto px-6 md:px-12">
        <IndexReader />
      </div>
    </section>
  );
}
