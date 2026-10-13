"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { MotionConfig } from "framer-motion";
import type { SerializableProject } from "@/components/project-detail";
import { CopyCommand, Facts, Hero, ProjectPage, Rows, Section } from "@/components/projects/case-study-chrome";
import { GluiPreview } from "@/components/projects/glui-preview";

const SITE = "https://clui.app/";
const REPO = "https://github.com/yssf-c/glui";

export function GluiExperience({ project }: { project: SerializableProject }) {
  return <MotionConfig reducedMotion="user"><ProjectPage id="glui" theme="glui-theme">
    <Hero
      layout="stacked"
      mark={<Image src="/glui/icon.svg" width={30} height={30} alt="" />}
      name="glui"
      title="Your coding agents, in one small window."
      lede="GLUI brings Claude Code, Codex and OpenCode into a floating workspace on the Mac. Press Option‑Space, ask, review what the agent wants to do, then tuck it away again."
      actions={<>
        <a className="pp-button" href={SITE} target="_blank" rel="noopener noreferrer">Visit clui.app<ArrowUpRight size={16} /></a>
        <a className="pp-link" href={project.link ?? REPO} target="_blank" rel="noopener noreferrer">Source on GitHub<ArrowUpRight size={14} /></a>
      </>}
      meta="Free and open source · macOS · Previously Clui"
      visual={<div className="glui-desk"><GluiPreview /></div>}
    />

    <Facts items={[
      ["My part", "Product design and integration"],
      ["Platform", "macOS on Apple Silicon"],
      ["Built with", "Electron, React, TypeScript, Zustand, SQLite, AppKit"],
    ]} />

    <Section id="idea" title="Why it exists">
      <p>Clui started as a small window into Claude Code. GLUI takes the idea further: one place for every agent I work with, with the conversation at the center.</p>
      <p>The hard part was adding agent switching, permissions, history and skills without turning a light overlay into another full desktop app. I shaped the product and its identity, and integrated the floating interface with a persistent orchestration runtime.</p>
      <p>GLUI builds on Lucas Couto’s <a href="https://github.com/lcoutodemos/clui-cc" target="_blank" rel="noopener noreferrer">Clui CC</a> and T3 Tools’ <a href="https://github.com/pingdotgg/t3code" target="_blank" rel="noopener noreferrer">T3 Code</a>, and credits both.</p>
    </Section>

    <Section id="experience" title="Using it">
      <Rows items={[
        ["Option‑Space", "Opens the pill. Hide it and the runtime keeps going, so the conversation is waiting when you come back."],
        ["Switch agents", "Hand a thread from Claude Code to Codex or OpenCode with its context, or branch it to try another direction."],
        ["Approve each step", "Tool activity streams in as it happens. You review approvals, and can open any conversation in its native CLI. GLUI uses the logins you already have."],
        ["Small extras", "Local voice input that stays on your Mac, your folder and Git branch beside the conversation, and one skills directory shared by every agent."],
      ]} />
      <p>It comes in Burgundy, Tidal and Liquid Glass, each in light and dark. macOS 26 gets native Liquid Glass; earlier versions get a frosted material.</p>
    </Section>

    <Section id="architecture" title="How it works">
      <p>The pill is only the visible part. Behind it, a workspace process runs Orchestrator V2 and keeps conversations and execution state alive while the window is hidden.</p>
      <ol className="pp-steps">
        <li><strong>Interface</strong>Electron and React behind an isolated preload, talking to its parent over private IPC.</li>
        <li><strong>Orchestration</strong>Durable threads, handoffs, branches, queued turns and restart recovery, through typed commands and provider adapters.</li>
        <li><strong>Execution</strong>Your agent CLIs keep their own authentication and session identities, and stream their activity back to the pill.</li>
      </ol>
      <p>One detail that mattered: the native AppKit glass lives in a separate, non-interactive panel behind the Electron window. The glass can sample the desktop without covering the conversation, and the backing panel follows the window as it moves.</p>
      <p><a className="pp-link" href={`${REPO}/blob/main/docs/ARCHITECTURE.md`} target="_blank" rel="noopener noreferrer">Read the architecture notes<ArrowUpRight size={14} /></a></p>
    </Section>

    <Section id="get-started" title="Install">
      <p>Needs an Apple Silicon Mac on macOS 13 or later, and at least one agent CLI you’re signed in to.</p>
      <div className="pp-actions"><a href={`${SITE}download?arch=arm64`} target="_blank" rel="noopener noreferrer" className="pp-button">Download GLUI<ArrowUpRight size={16} /></a></div>
      <p>Or with Homebrew:</p>
      <CopyCommand command="brew install --cask yssf-c/glui/glui" />
      <p className="pp-note">On an Intel Mac? <a href={`${SITE}download?arch=x64`} target="_blank" rel="noopener noreferrer">Clui v0.1.17</a> is still available as the legacy release.</p>
    </Section>
  </ProjectPage></MotionConfig>;
}
