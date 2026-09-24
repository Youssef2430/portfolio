"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Check, Copy } from "lucide-react";
import { startProjectSignatureTransition } from "@/components/project-signature-transition";

type Chapter = { id: string; label: string };
export function StudyNav({ name, chapters }: { name: string; chapters: Chapter[] }) {
  const [active, setActive] = useState(chapters[0]?.id ?? "");
  useEffect(() => {
    const update = () => {
      const current = chapters.filter(chapter => (document.getElementById(chapter.id)?.getBoundingClientRect().top ?? Infinity) <= 180).at(-1);
      setActive(current?.id ?? chapters[0]?.id ?? "");
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [chapters]);
  return <nav aria-label={`${name} chapters`} className="study-nav">
    <div><a className="study-nav-name" href="#project-top">{name}<span> / Case study</span></a>
      <div className="study-nav-links">{chapters.map((chapter, i) => <a key={chapter.id} href={`#${chapter.id}`} aria-current={active === chapter.id ? "location" : undefined}><span>0{i + 1}</span>{chapter.label}</a>)}</div>
    </div>
  </nav>;
}
const NEXT = {
  ramelli: { id: "glui", name: "GLUI", note: "A little glue. A clearer headspace.", tag: "macOS agent workspace", number: "01" },
  glui: { id: "mugshot", name: "Mugshot", note: "Your daily cup, turned into a keepsake.", tag: "iOS coffee journal", number: "03" },
  mugshot: { id: "nlp-phishing-detection", name: "Phishing Detection", note: "Reading between the suspicious lines.", tag: "Applied NLP", number: "04" },
  "nlp-phishing-detection": { id: "ramelli", name: "Ramelli", note: "Thirty models. One conversation.", tag: "AI workspace", number: "02" },
};
export function NextStudy({ current }: { current: keyof typeof NEXT }) {
  const next = NEXT[current];
  return <section className="next-study">
    <Link href={`/projects/${next.id}`} onClick={event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); startProjectSignatureTransition(next.id);
    }}>
      <div className="study-eyebrow"><span>Keep exploring</span><span>Next project / {next.number}</span></div>
      <div className="next-study-title"><h2>{next.name}</h2><ArrowUpRight aria-hidden="true" /></div>
      <div className="next-study-note"><p>{next.note}</p><span>{next.tag}<ArrowRight size={14} /></span></div>
    </Link>
  </section>;
}
export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);
  return <div className="study-command"><code><span>$ </span>{command}</code><button type="button" aria-label={copied ? "Command copied" : "Copy install command"} onClick={async () => {
    try { await navigator.clipboard.writeText(command); setCopied(true); setFailed(false); }
    catch { setFailed(true); }
  }}>{copied ? <Check size={17} /> : <Copy size={17} />}</button><span className={failed ? "study-command-error" : "sr-only"} role="status">{failed ? "Select the command to copy it." : copied ? "Command copied" : ""}</span></div>;
}
