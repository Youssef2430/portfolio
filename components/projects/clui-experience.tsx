"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Layers, Palette, Zap, SlashSquare, ImagePlus, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { SerializableProject } from "@/components/project-detail";
import { CluiSummon } from "@/components/projects/clui-summon";
import { CluiFlow } from "@/components/projects/clui-flow";
import { CluiTechStack } from "@/components/projects/clui-tech-stack";

const EASE = [0.16, 1, 0.3, 1] as const;
const SITE_URL = "https://clui.app";
const REPO_URL = "https://github.com/Youssef2430/clui";
const BREW = "brew install --cask Youssef2430/clui/clui";

/* ── Primitives ────────────────────────────────────────────────── */

function Label({ index, children }: { index?: string; children: ReactNode }) {
  return (
    <span className="clui-mono inline-flex items-center gap-2.5 text-[11px] tracking-[0.14em] uppercase text-[hsl(var(--foreground-subtle))]">
      {index && (
        <span className="inline-flex items-center gap-2.5 text-[hsl(var(--gold))]">
          {index}
          <span className="inline-block h-px w-7 bg-gradient-to-r from-[hsl(var(--gold))] to-transparent" />
        </span>
      )}
      {children}
    </span>
  );
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* macOS window chrome for the live demo / screenshots. */
function MacWindow({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_40px_90px_-45px_rgba(0,0,0,0.55)] ${className}`}>
      <div className="flex items-center gap-2 border-b border-border bg-[hsl(var(--background))] px-4 py-2.5">
        <span className="h-3 w-3 rounded-full" style={{ background: "#fc625d" }} />
        <span className="h-3 w-3 rounded-full" style={{ background: "#fdbc40" }} />
        <span className="h-3 w-3 rounded-full" style={{ background: "#35cd4b" }} />
        {title && (
          <span className="clui-mono ml-2 flex-1 truncate text-center text-[11px] text-[hsl(var(--foreground-subtle))]" style={{ marginRight: 46 }}>
            {title}
          </span>
        )}
      </div>
      <div className="line-clamp-none leading-[0]">{children}</div>
    </div>
  );
}

/* ── Real project data ─────────────────────────────────────────── */

const CAPS = ["Multi-tab sessions", "Permission control", "Skills marketplace", "Voice input", "Attachments", "History"];

const FEATURES = [
  { Icon: Layers, name: "Multi-tab sessions", desc: "Each tab is its own claude -p process with independent state." },
  { Icon: Palette, name: "Dual theme", desc: "Light and dark, system-follow or pinned." },
  { Icon: Zap, name: "Auto-updater", desc: "Ships updates silently via GitHub Releases." },
  { Icon: SlashSquare, name: "Slash commands", desc: "Type / to run any installed skill." },
  { Icon: ImagePlus, name: "File & screenshot attach", desc: "Paste images or grab a screen region into a message." },
  { Icon: KeyRound, name: "No API key needed", desc: "Reuses your existing Claude Code CLI auth." },
];

/* ── The presentation ──────────────────────────────────────────── */

export function CluiExperience(_props: { project: SerializableProject }) {
  return (
    <main className="clui-theme min-h-screen overflow-clip bg-background text-foreground">
      <div className="grain-overlay" />
      <Navbar />

      {/* ── Opener ── */}
      <section className="clui-aurora px-6 pt-32 md:px-12 md:pt-40">
        <div className="relative z-[1] mx-auto max-w-6xl">
          <Link
            href="/#work"
            className="group clui-mono inline-flex items-center text-xs uppercase tracking-[0.15em] text-[hsl(var(--foreground-muted))] transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Work
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mt-12 flex items-center gap-3.5"
          >
            <Image src="/clui/logo.png" alt="Clui logo" width={96} height={96} className="h-9 w-9 md:h-11 md:w-11" />
            <span className="text-2xl font-semibold tracking-tight md:text-3xl">Clui</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="clui-display mt-8 max-w-3xl text-5xl md:text-7xl"
          >
            The better UI for <em>Claude&nbsp;Code</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="clui-serif mt-6 max-w-xl text-lg font-light leading-relaxed text-[hsl(var(--foreground-soft))] md:text-xl"
          >
            A calm, transparent overlay that floats above every window and stays out of
            your way until you summon it. No API key. No friction. No trace.
          </motion.p>

          {/* meta strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="clui-mono mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6 text-[11px] uppercase tracking-[0.12em] text-[hsl(var(--foreground-subtle))]"
          >
            <span>macOS · Free &amp; open source</span>
            <span>Solo build</span>
            <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[hsl(var(--gold))] transition-colors hover:text-foreground">
              clui.app
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[hsl(var(--foreground-muted))] transition-colors hover:text-foreground">
              Source
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </motion.div>

          {/* hero: the floating overlay on its dotted canvas */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
            className="clui-dots mt-14 flex items-center justify-center rounded-2xl border border-border px-4 py-10 md:py-16"
          >
            <div className="relative w-full max-w-3xl">
              <Image
                src="/clui/overlay-light.png"
                alt="Clui's floating overlay, a transparent input pill above the desktop"
                width={1040}
                height={720}
                priority
                className="h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.18)] dark:hidden"
              />
              <Image
                src="/clui/overlay-dark.png"
                alt=""
                aria-hidden
                width={1040}
                height={720}
                priority
                className="hidden h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)] dark:block"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Overview ── */}
      <section className="px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <Label>Overview</Label>
          </Reveal>
          <div className="space-y-6 lg:col-span-8">
            <Reveal>
              <p className="text-lg leading-relaxed text-foreground/90 md:text-xl">
                Clui wraps the Claude Code CLI in a floating pill interface: multi-tab sessions,
                a permission approval layer, voice input and a skills marketplace, all without
                ever asking for an API key. It uses the auth you already have.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                It began as a fork of Lucas Couto&apos;s clui-cc. I wanted a cleaner way to install and
                version it, then kept adding the features I missed. The result is a lightweight macOS
                overlay that feels native to the way I actually work.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-wrap gap-2 pt-2">
                {CAPS.map((c) => (
                  <span key={c} className="clui-mono border border-border px-3 py-1.5 text-xs tracking-wide text-[hsl(var(--foreground-soft))]">
                    {c}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 01 The Overlay (signature) ── */}
      <section className="px-6 pb-24 md:px-12 md:pb-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Label index="01">The Overlay</Label>
              <h2 className="clui-display mt-5 text-3xl text-foreground md:text-5xl">
                Press two keys.<br />Claude <em>appears</em>.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                <span className="clui-mono text-sm text-foreground/80">⌥ Space</span> summons Clui above
                every window, in any app, wherever you are. The same shortcut sends it away. It leaves
                no dock icon and no menu clutter, just a transparent, click-through window that stays on
                top only when you want it.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="clui-dots rounded-2xl border border-border p-4 md:p-10">
              <CluiSummon />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── In motion (demo video) ── */}
      <section className="border-t border-border px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10">
            <Label index="02">In motion</Label>
          </Reveal>
          <Reveal delay={0.05}>
            <MacWindow title="Clui">
              <video
                src="/clui/demo.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="block w-full"
              />
            </MacWindow>
          </Reveal>
        </div>
      </section>

      {/* ── 03 Under the hood (flow) ── */}
      <section className="border-t border-border px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Label index="03">Under the hood</Label>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                The renderer never talks to a model directly. It sends your prompt to the main
                process, which spawns <span className="clui-mono text-sm text-foreground/80">claude -p</span> and
                pipes its NDJSON event stream straight to the UI, so every message, todo and tool call
                renders the moment it arrives. When a tool wants to act, the hook pauses the stream
                and waits for you.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <div className="clui-dots overflow-x-auto rounded-2xl border border-border p-4 md:p-8">
              <div className="min-w-[680px]">
                <CluiFlow />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 04 On screen (gallery) ── */}
      <section className="border-t border-border px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-12">
            <Label index="04">On screen</Label>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <Reveal className="md:col-span-7">
              <ShotCard src="/clui_context_usage.jpeg" alt="Clui showing live context-window usage by category" />
              <Caption>Live context budgeting: system prompt, tools, skills and messages, broken down token by token.</Caption>
            </Reveal>
            <Reveal delay={0.08} className="md:col-span-5">
              <ShotCard src="/clui_first_state.jpeg" alt="Clui's empty floating overlay inviting you to choose a folder" />
              <Caption>The resting state: pick a folder and start, or press ⌥ Space to make it vanish.</Caption>
            </Reveal>
            <Reveal delay={0.04} className="md:col-span-12">
              <ShotCard src="/clui_tasks_audio.jpeg" alt="Clui rendering a live todo list while recording voice input" />
              <Caption>Live todo tracking and voice capture, side by side: the agent&apos;s plan and your dictated prompt in one calm surface.</Caption>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 05 Capabilities ── */}
      <section className="border-t border-border px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10">
            <Label index="05">Capabilities</Label>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.name} className="group flex h-full items-start gap-3.5 bg-card p-5 transition-colors hover:bg-[hsl(var(--gold)/0.04)]">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background transition-colors group-hover:border-[hsl(var(--gold))]/40">
                    <f.Icon className="h-[17px] w-[17px] text-[hsl(var(--foreground-soft))] transition-colors group-hover:text-[hsl(var(--gold))]" strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-semibold tracking-tight text-foreground">{f.name}</h3>
                    <p className="mt-1 text-[13px] leading-snug text-[hsl(var(--foreground-soft))]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Built with ── */}
      <section className="border-t border-border px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10">
            <Label>Built with</Label>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="pt-10">
              <CluiTechStack />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Get started ── */}
      <section className="px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-8 max-w-xl">
            <Label index="06">Get started</Label>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <code className="clui-mono select-all rounded-lg bg-[hsl(var(--background))] px-4 py-3 text-sm text-foreground">
                <span className="text-[hsl(var(--gold))]">$ </span>{BREW}
              </code>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="clui-mono inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-[hsl(var(--gold))] transition-colors hover:text-foreground">
                  Download .dmg
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <a href={`${REPO_URL}/releases`} target="_blank" rel="noopener noreferrer" className="clui-mono inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-[hsl(var(--foreground-muted))] transition-colors hover:text-foreground">
                  Releases
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="clui-serif mt-5 max-w-lg text-sm leading-relaxed text-[hsl(var(--foreground-subtle))]">
              Requires macOS 13+ and the Claude Code CLI. No accounts, no sign-ups, no subscriptions.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Outro ── */}
      <section className="px-6 pb-28 md:px-12">
        <div className="mx-auto max-w-6xl border-t border-border pt-14">
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Image src="/clui/logo.png" alt="Clui" width={96} height={96} className="h-7 w-7" />
              <span className="text-lg font-semibold tracking-tight">Clui</span>
            </div>

            <div className="clui-mono flex flex-wrap items-center gap-x-8 gap-y-3 text-xs uppercase tracking-[0.12em]">
              <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[hsl(var(--gold))] transition-colors hover:text-foreground">
                Visit clui.app
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[hsl(var(--foreground-muted))] transition-colors hover:text-foreground">
                Source
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <Link
              href="/#work"
              className="group clui-mono inline-flex items-center text-sm uppercase tracking-[0.1em] text-[hsl(var(--foreground-muted))] transition-colors hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              All Projects
            </Link>
            <span className="font-arabic text-sm text-[hsl(var(--gold))] opacity-60">「مشروع」</span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ── Helpers ───────────────────────────────────────────────────── */

function ShotCard({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_30px_70px_-45px_rgba(0,0,0,0.5)]">
      <Image src={src} alt={alt} width={2080} height={1440} className="h-auto w-full" sizes="(max-width: 768px) 100vw, 60rem" />
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-sm leading-relaxed text-[hsl(var(--foreground-soft))]">{children}</p>;
}
