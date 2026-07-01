"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { SerializableProject } from "@/components/project-detail";
import { AtlasWorkflow } from "@/components/projects/atlasllm-workflow";
import { MacBook, IPad, IPhone } from "@/components/projects/device-frames";
import { PROVIDERS } from "@/components/projects/provider-icons";
import { TechStack } from "@/components/projects/tech-stack";

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
    <main className="atlas-theme min-h-screen bg-background text-foreground overflow-clip">
      <div className="grain-overlay" />
      <Navbar />

      {/* ── Opener ── */}
      <section className="px-6 md:px-12 pt-32 md:pt-40">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/#work"
            className="group inline-flex items-center font-mono text-xs tracking-[0.15em] uppercase text-[hsl(var(--foreground-muted))] hover:text-foreground transition-colors"
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
            <AtlasLogo className="h-9 w-9 md:h-11 md:w-11" />
            <span className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              AtlasLLM
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="mt-8 max-w-3xl text-5xl md:text-7xl font-light tracking-tight leading-[1.04] text-foreground"
          >
            Thirty models.
            <br />
            <span className="text-[hsl(var(--gold))]">One conversation.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="mt-6 max-w-2xl text-lg md:text-xl font-light leading-relaxed text-[hsl(var(--foreground-soft))]"
          >
            A privacy-first, multi-model AI chat platform with agentic research.
            Deep Research and Pro Search modes built on a custom workflow engine.
          </motion.p>

          {/* meta strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6 font-mono text-[11px] tracking-[0.12em] uppercase text-[hsl(var(--foreground-subtle))]"
          >
            <span>Solo build</span>
            <span>Turborepo monorepo</span>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[hsl(var(--gold))] hover:text-foreground transition-colors"
            >
              atlasllm.chat
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[hsl(var(--foreground-muted))] hover:text-foreground transition-colors"
            >
              Source
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </motion.div>

          {/* hero - MacBook on the grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
            className="atlas-grid mt-14 border border-border p-6 md:p-14"
          >
            <div className="mx-auto max-w-3xl">
              <MacBook src={SHOT_HOME} alt="AtlasLLM home screen with model picker" priority />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Overview ── */}
      <section className="px-6 md:px-12 py-24 md:py-32">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <Label>Overview</Label>
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
      <section className="px-6 md:px-12 pb-24 md:pb-32">
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
              <div className="min-w-[760px]">
                <AtlasWorkflow />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Product (device family) ── */}
      <section className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-14 max-w-2xl">
            <Label>The product</Label>
            <h2 className="mt-5 text-2xl md:text-4xl font-light tracking-tight text-foreground leading-tight">
              Calm on every screen.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-end">
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
      <section className="border-y border-border">
        <div className="mx-auto max-w-6xl px-6 md:px-12 py-20 md:py-24">
          <Reveal className="mb-12">
            <Label>Model coverage</Label>
            <h2 className="mt-5 text-2xl md:text-4xl font-light tracking-tight text-foreground leading-tight">
              Nine providers, one API.
            </h2>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
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
      <section className="px-6 md:px-12 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-8">
            <Label>Built with</Label>
          </Reveal>
          <Reveal delay={0.05}>
            <TechStack />
          </Reveal>
        </div>
      </section>

      {/* ── Outro ── */}
      <section className="px-6 md:px-12 pb-28">
        <div className="mx-auto max-w-6xl border-t border-border pt-14">
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <AtlasLogo className="h-7 w-7" />
              <span className="text-lg font-semibold tracking-tight">AtlasLLM</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs tracking-[0.12em] uppercase">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[hsl(var(--gold))] hover:text-foreground transition-colors"
              >
                Visit live
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[hsl(var(--foreground-muted))] hover:text-foreground transition-colors"
              >
                Source
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <Link
              href="/#work"
              className="group inline-flex items-center font-mono text-sm uppercase tracking-[0.1em] text-[hsl(var(--foreground-muted))] hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              All Projects
            </Link>
            <span className="font-arabic text-sm text-[hsl(var(--gold))] opacity-60">
              「مشروع」
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
