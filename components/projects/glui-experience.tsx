"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, AudioLines, Command, FolderGit2, GitBranch, Layers3, PanelTop, ShieldCheck, Terminal, Workflow } from "lucide-react";
import { MotionConfig } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { SerializableProject } from "@/components/project-detail";
import { StudyNav, NextStudy, CopyCommand } from "@/components/projects/case-study-chrome";
import { GluiMark, GluiPreview } from "@/components/projects/glui-preview";
import { ProviderIcon } from "@/components/projects/glui-provider-icon";

const SITE = "https://clui.app/";
const REPO = "https://github.com/Youssef2430/glui";
const CHAPTERS = [{ id: "idea", label: "The idea" }, { id: "experience", label: "The experience" }, { id: "appearance", label: "The aesthetic" }, { id: "architecture", label: "The engineering" }, { id: "get-started", label: "Get GLUI" }];
const FEATURES = [
  { Icon: Command, title: "A shortcut back to your work", text: "Option + Space brings the floating pill into view. Hide it again and the runtime keeps going, with the conversation ready when you return." },
  { Icon: GitBranch, title: "Another agent. The same thread.", text: "Move between Claude Code, Codex, and OpenCode with a context handoff, or branch a conversation to explore a different direction." },
  { Icon: ShieldCheck, title: "The next step is yours", text: "Follow tool activity as it happens, review approvals, and open a conversation in its native CLI. GLUI uses the agent authentication you already have." },
];
const DETAILS = [
  { Icon: AudioLines, name: "Local voice input", text: "Speak a prompt. Transcription stays on your Mac." },
  { Icon: FolderGit2, name: "Files in context", text: "Keep attachments, your working folder, and Git branch close to the conversation." },
  { Icon: Layers3, name: "A shared skills directory", text: "Install a skill once and link it into compatible agents, preserving existing skills." },
];

export function GluiExperience({ project }: { project: SerializableProject }) {
  return <MotionConfig reducedMotion="user"><main className="glui-theme glui-study study-page min-h-screen overflow-clip bg-background text-foreground">
    <Navbar />
    <section id="project-top" className="glui-hero">
      <div className="study-width"><div className="glui-hero-meta"><Link href="/#work" className="study-back"><ArrowLeft size={14} />Back to work</Link><span className="study-eyebrow">01 / Desktop software</span></div>
        <div className="glui-hero-copy">
          <div className="glui-wordmark"><Image src="/glui/icon.svg" width={38} height={38} alt="" /><span aria-label={project.title}>glui</span><span className="glui-wordmark-note">Glue UI for your coding agents</span></div>
          <h1>A little glue.<br /><em>A clearer headspace.</em></h1>
          <p>Claude Code, Codex, and OpenCode, brought together in a floating Mac workspace. Your tools stay powerful. Your desktop gets a little quieter.</p>
          <div className="study-actions"><a className="study-primary" href={SITE} target="_blank" rel="noopener noreferrer">Meet GLUI<ArrowUpRight size={16} /></a><a className="study-text-link" href="#experience">Explore the experience<ArrowDown size={14} /></a></div>
          <div className="glui-hero-notes"><span>Made for macOS</span><span>Free & open source</span><span>Previously Clui</span></div>
        </div>
      </div>
      <div className="glui-hero-canvas"><div className="glui-hero-ribbon" aria-hidden="true" /><GluiPreview /></div>
      <div className="glui-project-facts study-width"><div><span>My contribution</span><strong>Product design & integration</strong></div><div><span>Platform</span><strong>macOS · Apple Silicon</strong></div><div><span>The evolution</span><strong>Clui → GLUI</strong></div></div>
    </section>

    <StudyNav name="GLUI" chapters={CHAPTERS} />

    <section id="idea" className="study-section"><div className="study-width glui-story-grid">
      <div><span className="study-eyebrow">01 / The idea</span><h2 className="glui-heading">Less switching.<br /><em>More making.</em></h2></div>
      <div className="glui-story-copy"><p className="glui-lead">Clui started as a small window into Claude Code. GLUI takes that idea further: one place for the agents I work with, with the conversation at the center.</p><p>The challenge was to bring more capability into a surface that still feels light. Agent selection, permissions, history, and skills all need a home, without turning the overlay into another full desktop application.</p><p>I shaped the product identity and integrated the floating interface with a persistent orchestration runtime. GLUI builds on Lucas Couto’s <a href="https://github.com/lcoutodemos/clui-cc" target="_blank" rel="noopener noreferrer">Clui CC</a> and T3 Tools’ <a href="https://github.com/pingdotgg/t3code" target="_blank" rel="noopener noreferrer">T3 Code</a>, with both foundations credited in the project.</p></div>
    </div></section>

    <section id="experience" className="glui-experience-section study-section"><div className="study-width">
      <div className="glui-section-intro"><span className="study-eyebrow">02 / The experience</span><h2 className="glui-heading">Everything close.<br /><em>Nothing in the way.</em></h2><p>The pill follows the rhythm of your work: a small composer when you’re thinking, a clear conversation when you need the detail.</p></div>
      <div className="glui-feature-rows">{FEATURES.map(({ Icon, title, text }, index) => <article key={title}><span className="glui-feature-index">0{index + 1}</span><div className="glui-feature-title"><Icon size={25} strokeWidth={1.4} /><h3>{title}</h3></div><p>{text}</p></article>)}</div>
      <div className="glui-provider-line"><span>Three perspectives. One workspace.</span><div><span><ProviderIcon provider="claude" />Claude Code</span><span><ProviderIcon provider="codex" />Codex</span><span><ProviderIcon provider="opencode" />OpenCode</span></div></div>
    </div></section>

    <section id="appearance" className="study-section glui-appearance-section"><div className="study-width glui-appearance-grid">
      <div className="glui-material-study" aria-label="GLUI material study: translucent layers over a burgundy ribbon"><div className="glui-material-ribbon" /><div className="glui-material-pane glui-glass"><GluiMark /><span>A little of your world.<br /><strong>A space of your own.</strong></span><div className="glui-material-input"><PlusMark /><span>What’s on your mind?</span><ArrowUp size={18} /></div></div><span className="glui-material-label">Burgundy / Rose / Cream / Glass</span></div>
      <div className="glui-appearance-copy"><span className="study-eyebrow">03 / A new visual language</span><h2 className="glui-heading">Warmth,<br /><em>with a lighter touch.</em></h2><p>Deep burgundy gives GLUI its character. Rose and cream soften the edges. Translucent surfaces let the desktop feel present, even with a conversation open.</p><p>The app pairs native Liquid Glass on macOS 26+ with a frosted material on earlier versions. Burgundy, Tidal, and Liquid Glass each support light, dark, and system appearance.</p><div className="glui-palette" aria-label="GLUI color palette"><span style={{ background: "#800020" }} title="Burgundy #800020" /><span style={{ background: "#d45060" }} title="Rose #d45060" /><span style={{ background: "#e4b7ae" }} title="Blush #e4b7ae" /><span style={{ background: "#f3e6d5" }} title="Cream #f3e6d5" /><span style={{ background: "#fffaf5" }} title="Ivory #fffaf5" /></div><p className="glui-small-note">Try the appearance control in the preview above.</p></div>
    </div></section>

    <section id="architecture" className="study-section glui-engineering-section"><div className="study-width">
      <div className="glui-engineering-intro"><div><span className="study-eyebrow">04 / The engineering</span><h2 className="glui-heading">A small surface.<br /><em>A durable foundation.</em></h2></div><p>The floating interface is only the visible part. Behind it, an owned workspace process runs Orchestrator V2, keeping conversations and execution state alive when the pill is hidden.</p></div>
      <ol className="glui-architecture-flow" aria-label="GLUI runtime architecture">
        <li><PanelTop /><span>01 / Interface</span><h3>Floating pill</h3><p>Electron, React, and an isolated preload. A focused surface for prompts, attachments, and approvals.</p><small>Private parent / child IPC</small></li>
        <li><Workflow /><span>02 / Orchestration</span><h3>Persistent workspace</h3><p>Orchestrator V2 owns durable threads, handoffs, branching, queued turns, and restart recovery.</p><small>Typed commands & provider adapters</small></li>
        <li><Terminal /><span>03 / Execution</span><h3>Your agent CLIs</h3><p>Claude Code, Codex, and OpenCode retain their authentication and native session identities.</p><small>Streamed activity back to the pill</small></li>
      </ol>
      <div className="glui-craft-note"><span className="study-eyebrow">One detail that mattered</span><div><h3>Glass behind the window. Clarity in front.</h3><p>The native AppKit glass lives in a separate, noninteractive panel behind Electron. Keeping those surfaces separate lets the glass sample the desktop without obscuring the conversation. The foreground window handles input; the backing follows its position and visibility.</p><a href={`${REPO}/blob/main/docs/ARCHITECTURE.md`} target="_blank" rel="noopener noreferrer" className="study-text-link">Read the architecture<ArrowUpRight size={14} /></a></div></div>
      <div className="glui-detail-grid">{DETAILS.map(({ Icon, name, text }) => <div key={name}><Icon size={21} strokeWidth={1.5} /><h3>{name}</h3><p>{text}</p></div>)}</div>
      <div className="glui-stack"><span className="study-eyebrow">Built with</span><p>Electron<span>React</span><span>TypeScript</span><span>Zustand</span><span>SQLite</span><span>AppKit</span></p></div>
    </div></section>

    <section id="get-started" className="study-section glui-get-started"><div className="study-width">
      <div className="glui-download-mark"><Image src="/glui/icon.svg" alt="" width={64} height={64} /></div><span className="study-eyebrow">Open source. Made for your Mac.</span><h2 className="glui-heading">Your next idea<br /><em>has a little home.</em></h2>
      <div className="study-actions"><a href={`${SITE}download?arch=arm64`} target="_blank" rel="noopener noreferrer" className="study-primary">Download GLUI<ArrowDown size={16} /></a><a href={REPO} target="_blank" rel="noopener noreferrer" className="study-text-link">Explore the source<ArrowUpRight size={16} /></a></div>
      <p className="glui-install-note">Apple Silicon · macOS 13+ · An authenticated agent CLI</p>
      <div className="glui-install-command"><span>Or make yourself at home with Homebrew</span><CopyCommand command="brew install --cask Youssef2430/glui/glui" /></div>
      <a className="glui-legacy-link" href={`${SITE}download?arch=x64`} target="_blank" rel="noopener noreferrer">On Intel? Clui v0.1.17 remains available as the legacy release.<ArrowRight size={13} /></a>
    </div></section>
    <NextStudy current="glui" /><Footer />
  </main></MotionConfig>;
}

function PlusMark() { return <span aria-hidden="true">+</span>; }
