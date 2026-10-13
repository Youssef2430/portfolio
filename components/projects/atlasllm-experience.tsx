"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { MotionConfig } from "framer-motion";
import type { SerializableProject } from "@/components/project-detail";
import { AtlasWorkflow } from "@/components/projects/atlasllm-workflow";
import { MacBook, IPad, IPhone } from "@/components/projects/device-frames";
import { PROVIDERS } from "@/components/projects/provider-icons";
import { Facts, Hero, ProjectPage, Section } from "@/components/projects/case-study-chrome";

const REPO_URL = "https://github.com/yssf-c/llmchat";

/* Screenshot slots (base paths; -light.png / -dark.png swap with the theme) */
const SHOT_HOME = "/ramelli/macbook"; // desktop: current workspace and prompt shortcuts
const SHOT_RESEARCH = "/ramelli/ipad"; // tablet: live sample conversation
const SHOT_MOBILE = "/ramelli/iphone"; // phone: follow-up in the same conversation

/* Official Ramelli mark, matched to the site theme. */
function RamelliLogo() {
  return <>
    <Image src="/ramelli/logo-light.svg" alt="" width={30} height={30} className="dark:hidden" />
    <Image src="/ramelli/logo-dark.svg" alt="" width={30} height={30} className="hidden dark:block" />
  </>;
}

export function RamelliExperience({ project }: { project: SerializableProject }) {
  return <MotionConfig reducedMotion="user"><ProjectPage id="ramelli" theme="atlas-theme">
    <Hero
      layout="stacked"
      mark={<RamelliLogo />}
      name="Ramelli"
      title="Thirty models in one conversation."
      lede="Ramelli is an AI chat workspace. Start with a quick question, switch models without losing the thread, or hand it to Deep Research and watch it plan, search and check its own answer."
      actions={<>
        <a href={project.link} target="_blank" rel="noopener noreferrer" className="pp-button">Open Ramelli<ArrowUpRight size={16} /></a>
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="pp-link">Source on GitHub<ArrowUpRight size={14} /></a>
      </>}
      meta="Previously AtlasLLM"
      visual={<MacBook src={SHOT_HOME} alt="Ramelli workspace with model controls and prompt shortcuts" priority />}
    />

    <Facts items={[
      ["Models", "30+ from 9 providers"],
      ["Modes", "Standard, Web search, Pro Search, Deep Research"],
      ["Built with", project.technologies.join(", ")],
    ]} />

    <Section id="overview" title="The idea">
      <p>Ramelli puts thirty-plus models from nine providers behind one conversation, routed through a single OpenRouter layer. You can switch models mid-thread and keep the context.</p>
      <p>It’s local-first: your data stays on the device, with optional real-time sync through Convex. All four modes, from a quick answer to multi-step Deep Research, share the same streaming interface with the model’s reasoning visible.</p>
    </Section>

    <Section id="workflow" title="The research engine" wide={<AtlasWorkflow />}>
      <p>Each request runs as a graph of tasks in a custom, type-safe workflow engine, <code>@repo/orchestrator</code>, with dependencies, retries, timeouts and parallel fan-out.</p>
      <p>A router picks one of four flows. Deep Research plans its searches, runs them in parallel, and loops a reflector back to the planner until the answer holds up. Pick a mode below to follow a request through it.</p>
    </Section>

    <Section id="product" title="On every screen" wide={
      <div className="ramelli-devices">
        <figure>
          <IPad src={SHOT_RESEARCH} alt="Ramelli answering a question about retrieval-augmented generation on a tablet" />
          <figcaption>A conversation about retrieval-augmented generation, with references and model controls.</figcaption>
        </figure>
        <figure>
          <IPhone src={SHOT_MOBILE} alt="A concise follow-up answer in the same Ramelli conversation on a phone" />
          <figcaption>The same thread on a phone, with a follow-up question.</figcaption>
        </figure>
      </div>
    } />

    <Section id="models" title="The models" wide={
      <ul className="ramelli-providers">
        {PROVIDERS.map(({ name, Icon, mono }) => <li key={name}><Icon size={22} className={mono ? "text-foreground" : undefined} />{name}</li>)}
      </ul>
    }>
      <p>Nine providers, reached through one API.</p>
    </Section>
  </ProjectPage></MotionConfig>;
}
