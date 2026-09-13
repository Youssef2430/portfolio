"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDown } from "lucide-react";
import { motion, MotionConfig } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { SerializableProject } from "@/components/project-detail";
import { AtlasWorkflow } from "@/components/projects/atlasllm-workflow";
import { MacBook, IPad, IPhone } from "@/components/projects/device-frames";
import { PROVIDERS } from "@/components/projects/provider-icons";
import { TechStack } from "@/components/projects/tech-stack";

import { StudyNav, NextStudy } from "@/components/projects/case-study-chrome";

const CHAPTERS = [{id:"overview",label:"The idea"},{id:"workflow",label:"Research engine"},{id:"product",label:"The product"},{id:"models",label:"The models"}];
const EASE = [0.16, 1, 0.3, 1] as const;
const REPO_URL = "https://github.com/Youssef2430/llmchat";

/* Screenshot slots (base paths; -light.png / -dark.png swap with the theme) */
const SHOT_HOME = "/atlasllm/macbook"; // desktop: "Good evening" + model picker
const SHOT_RESEARCH = "/atlasllm/ipad"; // tablet: Pro Search conversation
const SHOT_MOBILE = "/atlasllm/iphone"; // phone: Deep Research

/* ── Primitives ────────────────────────────────────────────────── */

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[11px] tracking-[0.25em] text-[hsl(var(--gold))] uppercase">
      [ {children} ]
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
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

/* The sparkle mark, swapped for its dark-mode variant with the site theme. */
function AtlasLogo({ className = "" }: { className?: string }) {
  return (
    <>
      <Image
        src="/atlasllm/logo-light.png"
        alt="AtlasLLM logo"
        width={96}
        height={96}
        className={`${className} dark:hidden`}
      />
      <Image
        src="/atlasllm/logo-dark.png"
        alt=""
        aria-hidden
        width={96}
        height={96}
        className={`hidden ${className} dark:block`}
      />
    </>
  );
}

/* ── Real project data ─────────────────────────────────────────── */

const MODES = ["Standard", "Web search", "Pro Search", "Deep Research"];

const FACTS = "9 providers · 30+ models · 4 chat modes · 11 workflow tasks";

/* ── The presentation ──────────────────────────────────────────── */

export function AtlasLLMExperience({ project }: { project: SerializableProject }) {
  return (
    <MotionConfig reducedMotion="user"><main className="atlas-theme study-page atlas-study min-h-screen bg-background text-foreground overflow-clip">
      <div className="grain-overlay" />
      <Navbar />

      <section id="project-top" className="atlas-editorial-hero">
        <div className="study-width">
          <Link href="/#work" className="study-back"><ArrowLeft size={14} />Back to work</Link>
          <div className="atlas-hero-grid">
            <div className="atlas-hero-copy">
              <div className="atlas-wordmark"><AtlasLogo className="h-9 w-9" /><span>AtlasLLM</span><span className="study-eyebrow">Independent AI workspace</span></div>
              <h1>One space.<br /><span>Every model.</span></h1>
              <p>Go from a quick question to a deep investigation. Thirty-plus models, a shared conversation, and a research engine that shows its work.</p>
              <div className="study-actions"><a href={project.link} target="_blank" rel="noopener noreferrer" className="study-primary">Explore AtlasLLM<ArrowUpRight size={16} /></a><a href="#workflow" className="study-text-link">Follow the research<ArrowDown size={14} /></a></div>
            </div>
            <div className="atlas-hero-stage">
              <div className="atlas-stage-top"><span className="study-eyebrow">Your workspace, without the walls</span><span className="atlas-status-dot" /></div>
              <div className="atlas-hero-device"><MacBook src={SHOT_HOME} alt="AtlasLLM workspace with its multi-model picker" priority /></div>
              <div className="atlas-model-dock">{PROVIDERS.slice(0, 5).map(({name, Icon, mono}) => <span key={name} title={name}><Icon size={23} className={mono ? "text-foreground" : undefined} /></span>)}<span className="atlas-model-more">+4</span></div>
              <div className="atlas-stage-note"><span>Switch models.<br /><strong>Keep the context.</strong></span><span>01 — 04<br /><strong>Standard → Deep Research</strong></span></div>
            </div>
          </div>
          <div className="atlas-hero-stats">{[["30+", "Models, one conversation"], ["9", "Providers, one interface"], ["4", "Ways to find your answer"]].map(([value, label]) => <div key={value}><strong>{value}</strong><span>{label}</span></div>)}</div>
        </div>
      </section>
      <StudyNav name="AtlasLLM" chapters={CHAPTERS} />

      {/* ── Overview ── */}
      <section id="overview" className="px-6 md:px-12 py-24 md:py-32">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <Label>Overview</Label><h2 className="study-section-title">Built for<br />curiosity.</h2>
          </Reveal>
          <div className="lg:col-span-8 space-y-6">
            <Reveal>
              <p className="text-lg md:text-xl leading-relaxed text-foreground/90">
                AtlasLLM puts thirty-plus models from nine providers behind one
                conversation, routed through a single OpenRouter abstraction.
                Switch models mid-thread without losing context.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-base md:text-lg leading-relaxed text-[hsl(var(--foreground-soft))]">
                It is local-first by default; your data lives on-device, with
                optional real-time Convex sync across devices. Four chat modes,
                from a quick answer to multi-step Deep Research, all share the
                same streaming, reasoning-visible interface.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-wrap gap-2 pt-2">
                {MODES.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1.5 text-xs font-mono tracking-wide text-[hsl(var(--foreground-soft))] border border-border"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Workflow orchestration (signature) ── */}
      <section id="workflow" className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-12">
            <Reveal className="lg:col-span-5">
              <Label>Workflow orchestration</Label>
              <h2 className="mt-5 text-2xl md:text-4xl font-light tracking-tight text-foreground leading-tight">
                One router, four agentic flows.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="text-base md:text-lg leading-relaxed text-[hsl(var(--foreground-soft))]">
                A custom, type-safe workflow engine (<span className="font-mono text-sm text-foreground/80">@repo/orchestrator</span>)
                runs each request as a graph of tasks, with dependencies, retries,
                timeouts and parallel fan-out. The router dispatches to one of four
                modes; Deep Research plans searches, runs them in parallel, and
                loops the reflector back to the planner until the answer is complete.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="atlas-grid border border-border p-4 md:p-8 overflow-x-auto">
              <div className="min-w-0">
                <AtlasWorkflow />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Product (device family) ── */}
      <section id="product" className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-14 max-w-2xl">
            <Label>The product</Label>
            <h2 className="mt-5 text-2xl md:text-4xl font-light tracking-tight text-foreground leading-tight">
              Calm on every screen.
            </h2>
          </Reveal>

          <div className="atlas-device-gallery grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-end">
            <Reveal className="md:col-span-8">
              <IPad src={SHOT_RESEARCH} alt="AtlasLLM Pro Search conversation with sources" />
              <p className="mt-5 text-sm text-[hsl(var(--foreground-soft))] leading-relaxed">
                Reasoning and web-search steps, inline sources and citations: the
                full research trail behind every answer.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-4">
              <div className="mx-auto max-w-[260px] md:mb-8">
                <IPhone src={SHOT_MOBILE} alt="AtlasLLM Deep Research on mobile" />
              </div>
              <p className="mt-5 text-sm text-[hsl(var(--foreground-soft))] leading-relaxed">
                Deep Research, fully responsive: steps, sources and the streamed
                report on a phone.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Model coverage (icons) ── */}
      <section id="models" className="border-y border-border">
        <div className="mx-auto max-w-6xl px-6 md:px-12 py-20 md:py-24">
          <Reveal className="mb-12">
            <Label>Model coverage</Label>
            <h2 className="mt-5 text-2xl md:text-4xl font-light tracking-tight text-foreground leading-tight">
              Nine providers, one API.
            </h2>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="atlas-provider-grid">
              {PROVIDERS.map(({ name, Icon, mono }) => (
                <div key={name} className="flex items-center gap-2.5">
                  <Icon size={24} className={mono ? "text-foreground" : undefined} />
                  <span className="text-sm text-[hsl(var(--foreground-soft))]">{name}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-10 font-mono text-[11px] tracking-[0.18em] uppercase text-[hsl(var(--foreground-subtle))]">
              {FACTS}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Built with ── */}
      <section id="stack" className="px-6 md:px-12 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-8">
            <Label>Built with</Label><a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="study-text-link mt-6">Explore the source<ArrowUpRight size={14} /></a>
          </Reveal>
          <Reveal delay={0.05}>
            <TechStack />
          </Reveal>
        </div>
      </section>

      <NextStudy current="atlasllm" />
      <Footer />
    </main></MotionConfig>
  );
}
