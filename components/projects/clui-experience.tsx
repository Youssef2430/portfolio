"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDown, Layers, Palette, Zap, SlashSquare, ImagePlus, KeyRound } from "lucide-react";
import { motion, MotionConfig } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { SerializableProject } from "@/components/project-detail";
import { CluiSummon } from "@/components/projects/clui-summon";
import { CluiFlow } from "@/components/projects/clui-flow";
import { CluiTechStack } from "@/components/projects/clui-tech-stack";

import { StudyNav, NextStudy, CopyCommand } from "@/components/projects/case-study-chrome";

const CHAPTERS = [{id:"overlay",label:"The shortcut"},{id:"in-motion",label:"In motion"},{id:"architecture",label:"The craft"},{id:"get-started",label:"Get Clui"}];
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
      initial={false}
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

export function CluiExperience({ project }: { project: SerializableProject }) {
  return (
    <MotionConfig reducedMotion="user"><main className="clui-theme study-page clui-study min-h-screen overflow-clip bg-background text-foreground">
      <div className="grain-overlay" />
      <Navbar />

      <section id="project-top" className="clui-editorial-hero">
        <div className="study-width">
          <Link href="/#work" className="study-back"><ArrowLeft size={14} />Back to work</Link>
          <div className="clui-hero-grid">
            <div className="clui-hero-copy">
              <div className="clui-wordmark"><Image src="/clui/logo.png" width={44} height={44} alt="" /><span>{project.title}</span><span className="study-eyebrow">Made for macOS</span></div>
              <h1 className="clui-display">A little window.<br /><em>A lot of possibility.</em></h1>
              <p>Claude Code, a shortcut away. A floating desktop companion that’s there when you need it, and gone when you don’t.</p>
              <div className="study-actions"><a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="study-primary">Get Clui<ArrowUpRight size={16} /></a><a href="#overlay" className="study-text-link">Try the shortcut<ArrowDown size={14} /></a></div>
              <div className="clui-hero-footnote"><span>Free & open source</span><span>macOS 13+</span><span>Built solo</span></div>
            </div>
            <div className="clui-desktop-stage">
              <span className="clui-desktop-type" aria-hidden="true">less friction.<br /><em>more flow.</em></span>
              <div className="clui-desktop-overlay"><Image src="/clui/overlay-light.png" width={1040} height={720} priority alt="Clui’s floating desktop companion" className="dark:hidden" sizes="(max-width:768px) 90vw, 650px" /><Image src="/clui/overlay-dark.png" width={1040} height={720} priority alt="" aria-hidden className="hidden dark:block" sizes="(max-width:768px) 90vw, 650px" /></div>
              <span className="clui-desktop-note">Your desktop. With a little superpower.</span>
              <div className="clui-desktop-dock" aria-hidden="true"><span>⌘</span><span>⌥</span><Image src="/clui/logo.png" alt="" width={34} height={34} /><span>↗</span></div>
            </div>
          </div>
        </div>
      </section>
      <StudyNav name="Clui" chapters={CHAPTERS} />

      {/* ── Overview ── */}
      <section id="overview" className="px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <Label>Overview</Label><h2 className="clui-display study-section-title">A quieter way<br />to work.</h2>
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
      <section id="overlay" className="px-6 pb-24 md:px-12 md:pb-32">
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
      <section id="in-motion" className="border-t border-border px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10">
            <Label index="02">In motion</Label><h2 className="clui-display study-section-title">A place for your next <em>good idea.</em></h2>
          </Reveal>
          <Reveal delay={0.05}>
            <MacWindow title="Clui">
              <video
                src="/clui/demo.mp4"
                muted
                controls
                preload="none"
                poster="/clui/demo-light.png"
                playsInline
                className="block w-full"
              />
            </MacWindow>
          </Reveal>
        </div>
      </section>

      {/* ── 03 Under the hood (flow) ── */}
      <section id="architecture" className="border-t border-border px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Label index="03">Under the hood</Label><h2 className="clui-display study-section-title">You stay<br /><em>in control.</em></h2>
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
              <div className="min-w-0">
                <CluiFlow />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 04 On screen (gallery) ── */}
      <section id="gallery" className="border-t border-border px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-12">
            <Label index="04">On screen</Label><h2 className="clui-display study-section-title">Quietly <em>capable.</em></h2>
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
      <section id="capabilities" className="border-t border-border px-6 py-20 md:px-12 md:py-24">
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
      <section id="stack" className="border-t border-border px-6 py-20 md:px-12 md:py-24">
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
      <section id="get-started" className="px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-8 max-w-xl">
            <Label index="06">Get started</Label><h2 className="clui-display study-section-title">A little space for<br /><em>your next idea.</em></h2>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <CopyCommand command={BREW} />
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

      <NextStudy current="clui" />
      <Footer />
    </main></MotionConfig>
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
