"use client";

import { useId, useRef, useState } from "react";
import { ArrowUp, Check, ChevronDown, Folder, GitBranch, Minus, Plus, SlidersHorizontal } from "lucide-react";
import { ProviderIcon } from "@/components/projects/glui-provider-icon";

const AGENTS = [
  { id: "claude", name: "Claude Code", reply: "I’ll start with the details: a little more breathing room, clearer hierarchy, and a composer that stays close to your work." },
  { id: "codex", name: "Codex", reply: "The layout has room to breathe. I’ve brought the conversation, your tools, and the next step into one small workspace." },
  { id: "opencode", name: "OpenCode", reply: "Picking up the same thread. The workspace is ready for another perspective, with your conversation right here." },
] as const;
export type GluiAppearance = "burgundy" | "glass" | "tidal";

export function GluiMark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M57 22.5A25 25 0 1 0 65 41H43" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/** A local design demo. Switching providers, approvals, and themes sends no requests. */
export function GluiPreview() {
  const [agent, setAgent] = useState<(typeof AGENTS)[number]>(AGENTS[1]);
  const [expanded, setExpanded] = useState(true);
  const [appearance, setAppearance] = useState<GluiAppearance>("burgundy");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [approved, setApproved] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const threadId = useId();
  const settingsId = useId();
  const expandButton = useRef<HTMLButtonElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);

  return <div className="glui-demo" data-appearance={appearance} onKeyDown={event => {
    if (event.altKey && event.code === "Space") { event.preventDefault(); setExpanded(value => !value); }
    if (event.key === "Escape" && settingsOpen) { setSettingsOpen(false); settingsButton.current?.focus(); }
  }}>
    <div className="glui-demo-stage">
      <div className="glui-thread glui-glass" id={threadId} hidden={!expanded}>
        <div className="glui-thread-header"><span><GluiMark />A little room to think<span className="glui-preview-label">Preview</span></span><button type="button" aria-label="Collapse conversation preview" onClick={() => { setExpanded(false); expandButton.current?.focus(); }}><Minus size={16} /></button></div>
        <div className="glui-thread-body">
          <p className="glui-user-message">Let’s make this feel a little more like home.</p>
          <div className="glui-agent-heading"><ProviderIcon provider={agent.id} size={19} /><strong>{agent.name}</strong><span>{handoff ? "Context carried over" : "Ready when you are"}</span></div>
          <p className="glui-agent-message" aria-live="polite">{agent.reply}</p>
          <div className="glui-tool-preview"><span><span className="glui-tool-symbol">{approved ? <Check size={14} /> : <GitBranch size={14} />}</span>{approved ? "Preview change approved" : "Update workspace.tsx"}</span><button type="button" onClick={() => setApproved(value => !value)} aria-label={approved ? "Reset example approval" : "Allow example change"}>{approved ? "Reset" : "Allow"}{!approved && <ArrowUp size={12} />}</button></div>
        </div>
        <div className="glui-thread-footer"><span><Folder size={12} />your-next-idea</span><span>Local workspace<i /></span></div>
      </div>
      {!expanded && <div className="glui-folded-note"><GluiMark /><p>A little less on screen.<br /><span>Your context stays with you.</span></p></div>}
      <div className="glui-composer glui-glass">
        <button ref={expandButton} type="button" aria-label={expanded ? "Fold away GLUI preview" : "Expand GLUI preview"} aria-expanded={expanded} aria-controls={threadId} onClick={() => setExpanded(value => !value)}>{expanded ? <Minus size={16} /> : <Plus size={16} />}</button>
        <span>What should we build next?</span>
        <button ref={settingsButton} type="button" aria-label="Preview appearance settings" aria-expanded={settingsOpen} aria-controls={settingsId} onClick={() => setSettingsOpen(value => !value)}><SlidersHorizontal size={17} /></button>
        <span className="glui-send" aria-hidden="true"><ArrowUp size={19} /></span>
      </div>
      <div className="glui-appearance-menu glui-glass" id={settingsId} hidden={!settingsOpen}>
        <span>Make yourself at home</span>
        {([ ["burgundy", "Burgundy"], ["glass", "Liquid Glass"], ["tidal", "Tidal"] ] as const).map(([id, label]) => <button type="button" key={id} aria-pressed={appearance === id} onClick={() => setAppearance(id)}><i data-swatch={id} />{label}{appearance === id && <Check size={13} />}</button>)}
      </div>
      <div className="glui-composer-shelf"><span><Folder size={11} />your-next-idea</span><span><ProviderIcon provider={agent.id} size={12} />{agent.name}<ChevronDown size={10} /></span><span><GitBranch size={11} />main</span></div>
    </div>
    <div className="glui-agent-switcher" role="group" aria-label="Choose an agent to preview">{AGENTS.map(item => <button type="button" key={item.id} aria-pressed={agent.id === item.id} onClick={() => { if (agent.id !== item.id) { setAgent(item); setHandoff(true); } }}><ProviderIcon provider={item.id} size={17} />{item.name}</button>)}</div>
    <div className="glui-demo-hint"><button type="button" onClick={() => setExpanded(value => !value)} aria-label="Toggle GLUI shortcut preview" aria-expanded={expanded} aria-controls={threadId}><kbd>⌥</kbd><kbd>space</kbd></button><span>Switch agents. Try the glass. Tuck it away.</span></div>
    <p className="glui-demo-disclaimer">Interactive design preview · no agent requests are sent</p>
  </div>;
}

/** A lightweight, noninteractive preview for the portfolio's cursor-following card. */
export function GluiCardPreview() {
  return <div className="glui-theme glui-card-preview" role="img" aria-label="GLUI’s burgundy glass workspace with Claude Code, Codex, and OpenCode">
    <div className="glui-card-brand"><GluiMark /><span>glui</span><small>A little glue for your ideas.</small></div>
    <div className="glui-card-thread glui-glass"><div><ProviderIcon provider="codex" size={15} /><strong>Codex</strong><span>Done</span></div><p>Three agents.<br />One place to make it happen.</p><span><Check size={12} />Your context, carried forward.</span></div>
    <div className="glui-card-composer glui-glass"><Plus size={13} /><span>What should we build next?</span><ArrowUp size={16} /></div>
    <div className="glui-card-agents">{AGENTS.map(item => <span key={item.id}><ProviderIcon provider={item.id} size={12} />{item.name}</span>)}</div>
  </div>;
}
