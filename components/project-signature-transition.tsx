"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

// Preserve the public event API used by project cards and AI answer links.
const PROJECT_SIGNATURE_EVENT = "portfolio:project-signature-transition";
type ProjectId = "ramelli" | "glui" | "gallery-glow" | "biketrack" | "mugshot" | "nlp-phishing-detection";

/** Each project opens on its own color, in its own typeface. */
export type ProjectSignature = {
  id: ProjectId;
  title: string;
  line: string;
  bg: string;
  fg: string;
  accent: string;
  font: string;
};
export const PROJECT_SIGNATURES: Record<ProjectId, ProjectSignature> = {
  glui: {
    id: "glui", title: "GLUI", line: "Coding agents for the Mac",
    bg: "#800020", fg: "#fcefe4", accent: "#e4b7ae", font: "var(--font-hanken), sans-serif",
  },
  ramelli: {
    id: "ramelli", title: "Ramelli", line: "An AI chat workspace",
    bg: "#eb5823", fg: "#1f0e07", accent: "#fff1e8", font: "var(--font-newsreader), serif",
  },
  "gallery-glow": {
    id: "gallery-glow", title: "Gallery Glow", line: "Paintings for Apple TV",
    bg: "#edbd37", fg: "#1c1b17", accent: "#fffaf0", font: "var(--font-cormorant-garamond), serif",
  },
  biketrack: {
    id: "biketrack", title: "BikeTrack", line: "Workouts for Apple Watch",
    bg: "#0b0c0a", fg: "#c7f83a", accent: "#ff635b", font: "var(--font-oswald), sans-serif",
  },
  mugshot: {
    id: "mugshot", title: "Mugshot", line: "A coffee journal for iPhone",
    bg: "#38564a", fg: "#f6efe3", accent: "#e2bb61", font: "var(--font-fraunces), serif",
  },
  "nlp-phishing-detection": {
    id: "nlp-phishing-detection", title: "Phishing Detection", line: "Applied NLP, in Gmail",
    bg: "#0e1a2e", fg: "#f4ecdf", accent: "#f5a05c", font: "var(--font-ibm-plex-mono), monospace",
  },
};

type Transition = { key: number; config: ProjectSignature; href: string };
type TransitionDetail = { projectId: string; href?: string };

export function getProjectSignature(projectId: string): ProjectSignature | undefined {
  if (projectId === "atlasllm") projectId = "ramelli";
  if (projectId === "clui") projectId = "glui";
  return Object.hasOwn(PROJECT_SIGNATURES, projectId) ? PROJECT_SIGNATURES[projectId as ProjectId] : undefined;
}
function getPathname(href: string) {
  try { const path = new URL(href, window.location.origin).pathname; return path === "/projects/atlasllm" ? "/projects/ramelli" : path === "/projects/clui" ? "/projects/glui" : path; }
  catch { return href.split("?")[0].split("#")[0]; }
}
export function hasProjectSignatureTransition(projectId: string): projectId is ProjectId | "atlasllm" | "clui" {
  return Boolean(getProjectSignature(projectId));
}
export function startProjectSignatureTransition(projectId: string, href?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<TransitionDetail>(PROJECT_SIGNATURE_EVENT, { detail: { projectId, href } }));
  }
}

/** One small looping drawing per project, animated in CSS (see .pl-art in project-pages.css). */
function SignatureArt({ id }: { id: ProjectId }) {
  const clip = useId();
  return (
    <svg viewBox="0 0 64 64" className={`pl-art pl-art-${id}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {id === "glui" && <>
        <path className="pl-draw" pathLength={1} d="M43 19A17 17 0 1 0 49 32H35" strokeWidth="7" />
        <circle className="pl-blink" cx="51" cy="50" r="2.5" fill="var(--pl-accent)" stroke="none" />
      </>}
      {id === "ramelli" && <>
        <path className="pl-draw" pathLength={1} d="M8 32h14" />
        {["M22 32C34 32 36 16 50 16", "M22 32h28", "M22 32C34 32 36 48 50 48"].map((d, i) =>
          <path key={d} className="pl-draw pl-branch" pathLength={1} d={d} style={{ "--n": i } as CSSProperties} />)}
        <circle cx="8" cy="32" r="3" fill="currentColor" />
        {[16, 32, 48].map((y, i) => <circle key={y} className="pl-pop" cx="52" cy={y} r="3.5" fill="var(--pl-accent)" stroke="currentColor" strokeWidth="1.5" style={{ "--n": i } as CSSProperties} />)}
      </>}
      {id === "gallery-glow" && <>
        <defs><clipPath id={clip}><rect x="15" y="17" width="34" height="26" /></clipPath></defs>
        <image className="pl-fade" href="/gallery-glow/venus.webp" x="11" y="17" width="42" height="26" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clip})`} />
        <rect className="pl-draw" pathLength={1} x="10" y="12" width="44" height="36" strokeWidth="3" />
        <path d="M27 56h10" opacity=".45" />
      </>}
      {id === "biketrack" && <>
        <path d="M6 34h12l4-12 7 24 6-16 4 4h19" opacity=".18" />
        <path className="pl-trace" pathLength={1} d="M6 34h12l4-12 7 24 6-16 4 4h19" strokeWidth="2.5" />
        <circle className="pl-beat" cx="56" cy="16" r="3" fill="var(--pl-accent)" stroke="none" />
      </>}
      {id === "mugshot" && <>
        <defs><clipPath id={clip}><path d="M16 28h28v16a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8z" /></clipPath></defs>
        <rect className="pl-fill" x="16" y="28" width="28" height="24" fill="var(--pl-accent)" stroke="none" clipPath={`url(#${clip})`} />
        <path d="M16 28h28v16a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8z M44 32h3a5 5 0 0 1 0 10h-3" />
        {[24, 30, 36].map((x, i) => <path key={x} className="pl-steam" d={`M${x} 22c-2-3 2-5 0-8`} style={{ "--n": i } as CSSProperties} />)}
      </>}
      {id === "nlp-phishing-detection" && <>
        <rect x="10" y="16" width="44" height="32" rx="2" />
        <path d="M10 18l22 16 22-16" />
        <path className="pl-scan" d="M6 16h52" stroke="var(--pl-accent)" strokeWidth="2.5" />
        <circle className="pl-pop pl-verdict" cx="50" cy="46" r="8" fill="var(--pl-bg)" stroke="var(--pl-accent)" />
        <path className="pl-draw pl-verdict-tick" pathLength={1} d="M46.5 46l2.5 2.5 4.5-5" stroke="var(--pl-accent)" />
      </>}
    </svg>
  );
}

const EASE = [0.76, 0, 0.24, 1] as const;
const MIN_OPEN_MS = 1150;

function SignatureLoader({ transition, ready, skipped, reduceMotion, stalled, onComplete, onSkip, onCancel }: {
  transition: Transition; ready: boolean; skipped: boolean; reduceMotion: boolean; stalled: boolean;
  onComplete: () => void; onSkip: () => void; onCancel: () => void;
}) {
  const { config } = transition;
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const startedRef = useRef(0);

  useEffect(() => { startedRef.current = performance.now(); actionRef.current?.focus({ preventScroll: true }); }, []);

  // Hold the color long enough for one loop of the drawing, then lift once the
  // destination route is mounted. Skipping or reduced motion lifts right away.
  useEffect(() => {
    if (!ready) return;
    const wait = skipped || reduceMotion ? 0 : Math.max(0, MIN_OPEN_MS - (performance.now() - startedRef.current));
    const timer = window.setTimeout(() => {
      // Lets the page's entrance play while the color lifts away.
      rootRef.current?.setAttribute("data-leaving", "");
      onComplete();
    }, wait);
    return () => window.clearTimeout(timer);
  }, [ready, skipped, reduceMotion, onComplete]);

  const style = { "--pl-bg": config.bg, "--pl-fg": config.fg, "--pl-accent": config.accent, "--pl-font": config.font } as CSSProperties;
  const wipe = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: .12 } }
    : { initial: { clipPath: "inset(100% 0 0 0)" }, animate: { clipPath: "inset(0% 0 0 0)" }, exit: { clipPath: "inset(0 0 100% 0)" }, transition: { duration: .6, ease: EASE } };

  return (
    <motion.div
      ref={rootRef}
      className="project-loader"
      data-project-loader={config.id}
      style={style}
      role="dialog" aria-modal="true" aria-labelledby={titleId}
      {...wipe}
      onKeyDown={event => {
        if (event.key === "Escape") onCancel();
        if (event.key === "Tab") {
          const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, a"));
          const index = items.indexOf(document.activeElement as HTMLElement);
          event.preventDefault();
          items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length]?.focus();
        }
      }}
    >
      <div className="pl-center">
        <SignatureArt id={config.id} />
        <h2 id={titleId} className="pl-title"><span>{config.title}</span></h2>
        <p className="pl-line">{config.line}</p>
        <p role="status" className="sr-only">{stalled ? "Taking a little longer to open." : `Opening ${config.title}`}</p>
      </div>
      {stalled
        ? <a href={transition.href} className="pl-action">Still loading. Open it directly</a>
        : <button ref={actionRef} type="button" onClick={skipped ? onCancel : onSkip} className="pl-action">{skipped ? "Dismiss" : "Skip"}</button>}
    </motion.div>
  );
}

export function ProjectSignatureTransitionProvider() {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = Boolean(useReducedMotion());
  const activeRef = useRef(false);
  const navigatedRef = useRef(false);
  const focusOriginRef = useRef<HTMLElement | null>(null);
  const [transition, setTransition] = useState<Transition | null>(null);
  const [skipped, setSkipped] = useState(false);
  const [stalled, setStalled] = useState(false);
  const dismiss = useCallback(() => {
    activeRef.current = false;
    setTransition(null);
  }, []);
  const navigate = useCallback(() => {
    if (transition && !navigatedRef.current) {
      navigatedRef.current = true;
      router.push(transition.href);
    }
  }, [router, transition]);

  useEffect(() => {
    const handleStart = (event: Event) => {
      const detail = (event as CustomEvent<TransitionDetail>).detail;
      const config = getProjectSignature(detail?.projectId ?? "");
      if (!config || activeRef.current) return;
      activeRef.current = true;
      navigatedRef.current = false;
      focusOriginRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const href = detail.href ?? `/projects/${config.id}`;
      setSkipped(false);
      setStalled(false);
      setTransition({ key: Date.now(), config, href });
      router.prefetch(href);
    };
    window.addEventListener(PROJECT_SIGNATURE_EVENT, handleStart);
    return () => window.removeEventListener(PROJECT_SIGNATURE_EVENT, handleStart);
  }, [router]);

  useEffect(() => {
    if (!transition) return;
    // Navigate once the color has covered the page.
    const routeTimer = window.setTimeout(navigate, reduceMotion ? 0 : 650);
    const stallTimer = window.setTimeout(() => setStalled(true), 8000);
    return () => { window.clearTimeout(routeTimer); window.clearTimeout(stallTimer); };
  }, [transition, navigate, reduceMotion]);

  useEffect(() => {
    if (!transition) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const main = document.querySelector("main");
    const wasInert = main?.inert ?? false;
    if (main) main.inert = true;
    return () => {
      document.body.style.overflow = previousOverflow;
      if (main) main.inert = wasInert;
    };
  }, [transition]);

  return (
    <AnimatePresence onExitComplete={() => {
      if (activeRef.current) return;
      const previous = focusOriginRef.current;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
      else {
        const heading = document.querySelector<HTMLElement>("main h1");
        if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
      }
    }}>
      {transition && <SignatureLoader key={transition.key} transition={transition} ready={pathname === getPathname(transition.href)} skipped={skipped} reduceMotion={reduceMotion} stalled={stalled} onComplete={dismiss} onSkip={() => { setSkipped(true); navigate(); }} onCancel={dismiss} />}
    </AnimatePresence>
  );
}
