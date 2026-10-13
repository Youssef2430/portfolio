"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Copy } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PROJECT_SIGNATURES, startProjectSignatureTransition, type ProjectSignature } from "@/components/project-signature-transition";

/*
 * The shared, quiet skeleton every project page is built from: a hero, a few
 * short sections, a facts list, and a link to the next project. Each page
 * brings its own palette and typeface through its theme class.
 */

type PageId = ProjectSignature["id"];
const ORDER: PageId[] = ["glui", "ramelli", "gallery-glow", "biketrack", "mugshot", "nlp-phishing-detection"];

export function ProjectPage({ id, theme, children }: { id: PageId; theme: string; children: ReactNode }) {
  return (
    <main className={`${theme} pp min-h-screen overflow-clip bg-background text-foreground`} data-project={id}>
      <Navbar />
      {children}
      <NextProject current={id} />
      <Footer />
    </main>
  );
}

const rise = (i: number) => ({ "--i": i }) as CSSProperties;

export function Hero({ mark, name, title, lede, actions, meta, visual, layout = "split" }: {
  mark?: ReactNode; name: string; title: ReactNode; lede: ReactNode; actions: ReactNode;
  meta?: ReactNode; visual: ReactNode; layout?: "split" | "stacked";
}) {
  return (
    <section id="project-top" className={`pp-hero pp-hero-${layout}`}>
      <div className="pp-width">
        <Link href="/#work" className="pp-back pp-rise" style={rise(0)}><ArrowLeft size={14} />All work</Link>
        <div className="pp-hero-grid">
          <div className="pp-hero-copy">
            <p className="pp-name pp-rise" style={rise(1)}>{mark}<span>{name}</span></p>
            <h1 className="pp-title pp-rise" style={rise(2)}>{title}</h1>
            <p className="pp-lede pp-rise" style={rise(3)}>{lede}</p>
            <div className="pp-actions pp-rise" style={rise(4)}>{actions}</div>
            {meta && <p className="pp-meta pp-rise" style={rise(5)}>{meta}</p>}
          </div>
          <div className="pp-hero-visual pp-rise" style={rise(layout === "split" ? 3 : 5)}>{visual}</div>
        </div>
      </div>
    </section>
  );
}

export function Facts({ items }: { items: [string, ReactNode][] }) {
  return (
    <div className="pp-width">
      <dl className="pp-facts">{items.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
    </div>
  );
}

/** A heading beside its prose; `wide` content spans the full measure below. */
export function Section({ id, title, children, wide }: { id: string; title: ReactNode; children?: ReactNode; wide?: ReactNode }) {
  return (
    <section id={id} className="pp-section">
      <div className="pp-width pp-section-grid pp-reveal">
        <h2 className="pp-h2">{title}</h2>
        {children && <div className="pp-prose">{children}</div>}
      </div>
      {wide && <div className="pp-width pp-wide pp-reveal">{wide}</div>}
    </section>
  );
}

/** Term and description rows, for the handful of details a project needs. */
export function Rows({ items }: { items: [ReactNode, ReactNode][] }) {
  return <dl className="pp-rows">{items.map(([term, text], i) => <div key={i}><dt>{term}</dt><dd>{text}</dd></div>)}</dl>;
}

/** Roving-focus tabs, shared by the pages that switch between screens. */
export function TabList({ label, prefix, items, selected, onSelect }: {
  label: string; prefix: string; items: { id: string; label: string }[]; selected: number; onSelect: (index: number) => void;
}) {
  return (
    <div className="pp-tabs" role="tablist" aria-label={label}>
      {items.map((item, index) => <button key={item.id} id={`${prefix}-tab-${item.id}`} type="button" role="tab" aria-selected={selected === index} aria-controls={`${prefix}-panel`} tabIndex={selected === index ? 0 : -1} onClick={() => onSelect(index)} onKeyDown={event => {
        const last = items.length - 1;
        const next = event.key === "ArrowRight" ? (index + 1) % items.length : event.key === "ArrowLeft" ? (index + last) % items.length : event.key === "Home" ? 0 : event.key === "End" ? last : null;
        if (next === null) return;
        event.preventDefault(); onSelect(next); document.getElementById(`${prefix}-tab-${items[next].id}`)?.focus();
      }}>{item.label}</button>)}
    </div>
  );
}

/** The next project, previewed in the color its transition opens on. */
function NextProject({ current }: { current: PageId }) {
  const next = PROJECT_SIGNATURES[ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]];
  const style = { "--next-bg": next.bg, "--next-fg": next.fg, "--next-font": next.font } as CSSProperties;
  return (
    <section className="pp-next" data-guide-skip data-next={next.id} style={style}>
      <Link href={`/projects/${next.id}`} onClick={event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); startProjectSignatureTransition(next.id);
      }}>
        <span className="pp-next-label">Next project</span>
        <span className="pp-next-name">{next.title}</span>
        <span className="pp-next-line">{next.line}<ArrowRight size={16} /></span>
      </Link>
    </section>
  );
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
