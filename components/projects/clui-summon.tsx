"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Paperclip, Camera, BrainCircuit, Mic, ArrowUp } from "lucide-react";

const PROMPTS = ["Refactor the auth middleware", "Explain this codebase", "Help me plan the next feature"];

/** An interactive preview of Clui's shortcut. No request is sent to a model. */
export function CluiSummon() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15%" });
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.closest("input, textarea, select") || target.isContentEditable)) return;
      if (event.altKey && event.code === "Space" && !event.repeat) {
        event.preventDefault();
        setOpen(value => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView]);

  return <div ref={ref} className="clui-summon-demo">
    <div className="clui-summon-heading"><span className="study-eyebrow">A shortcut to your next idea</span><span>Interactive preview</span></div>
    <div className="clui-summon-field">
      <AnimatePresence initial={false}>
        {open ? <motion.div key="overlay" id="clui-preview-overlay" className="clui-summon-overlay" initial={{ opacity: 0, y: reduced ? 0 : 18, scale: reduced ? 1 : .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : 8 }} transition={{ type: "spring", stiffness: 350, damping: 28 }}>
          <div className="clui-summon-tools" aria-hidden="true"><BrainCircuit size={16} /><Camera size={16} /><Paperclip size={16} /></div>
          <div className="clui-summon-input"><span>{PROMPTS[prompt]}</span><Mic size={16} /><span className="clui-summon-send" aria-hidden="true"><ArrowUp size={17} /></span></div>
        </motion.div> : <motion.p key="empty" className="clui-summon-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>A clear desktop.<br /><em>An idea waiting to happen.</em></motion.p>}
      </AnimatePresence>
    </div>
    <button type="button" className="clui-shortcut" aria-expanded={open} aria-controls={open ? "clui-preview-overlay" : undefined} aria-label={open ? "Hide Clui preview" : "Summon Clui preview"} onClick={() => setOpen(value => !value)}><kbd>⌥</kbd><span>+</span><kbd>Space</kbd></button>
    <p className="clui-summon-instruction" role="status">{open ? "There when you need it. Press again to tuck it away." : "Click the keys or press Option + Space to bring Clui into view."}</p>
    <div className="clui-prompt-examples" aria-label="Preview prompt">{PROMPTS.map((text, index) => <button type="button" key={text} aria-pressed={prompt === index && open} onClick={() => { setPrompt(index); setOpen(true); }}>{text}<span aria-hidden="true">↗</span></button>)}</div>
  </div>;
}
