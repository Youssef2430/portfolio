"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

// Preserve the public event API used by project cards and AI answer links.
const PROJECT_SIGNATURE_EVENT = "portfolio:project-signature-transition";
type ProjectId = "ramelli" | "glui" | "mugshot" | "nlp-phishing-detection";
type ProjectConfig = {
  id: ProjectId;
  title: string;
  category: string;
  description: string;
  index: string;
  theme: string;
  stages: [string, string, string];
};
const PROJECTS: Record<ProjectId, ProjectConfig> = {
  ramelli: {
    id: "ramelli", title: "Ramelli", category: "AI workspace", index: "02", theme: "atlas-theme",
    description: "A little space for big ideas.",
    stages: ["Finding our bearings", "A world of possibilities", "Welcome to Ramelli"],
  },
  glui: {
    id: "glui", title: "GLUI", category: "macOS agent workspace", index: "01", theme: "glui-theme",
    description: "A little glue. A clearer headspace.",
    stages: ["Bringing your agents together", "A little room to think", "Make yourself at home"],
  },
  mugshot: {
    id: "mugshot", title: "Mugshot", category: "Coffee & daily rituals", index: "03", theme: "mugshot-theme",
    description: "Good things take a little brewing.",
    stages: ["One moment, one coffee", "Almost brewed", "Made just for you"],
  },
  "nlp-phishing-detection": {
    id: "nlp-phishing-detection", title: "Phishing Detection", category: "Natural language processing", index: "04", theme: "phish-theme",
    description: "Reading between the suspicious lines.",
    stages: ["A closer look", "The details make the difference", "Let’s investigate"],
  },
};
type Transition = { key: number; config: ProjectConfig; href: string };
type TransitionDetail = { projectId: string; href?: string };

function getConfig(projectId: string): ProjectConfig | undefined {
  if (projectId === "atlasllm") projectId = "ramelli";
  if (projectId === "clui") projectId = "glui";
  return Object.hasOwn(PROJECTS, projectId) ? PROJECTS[projectId as ProjectId] : undefined;
}
function getPathname(href: string) {
  try { const path = new URL(href, window.location.origin).pathname; return path === "/projects/atlasllm" ? "/projects/ramelli" : path === "/projects/clui" ? "/projects/glui" : path; }
  catch { return href.split("?")[0].split("#")[0]; }
}
export function hasProjectSignatureTransition(projectId: string): projectId is ProjectId | "atlasllm" | "clui" {
  return Boolean(getConfig(projectId));
}
export function startProjectSignatureTransition(projectId: string, href?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<TransitionDetail>(PROJECT_SIGNATURE_EVENT, { detail: { projectId, href } }));
  }
}

/** Integer coordinates keep the little illustrations crisp at every pixel step. */
function ProjectPixels({ id, progress, still }: { id: ProjectId; progress: number; still: boolean }) {
  const step = Math.floor(progress / 12);
  return (
    <svg viewBox="0 0 32 32" className="project-loader-sprite" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true">
      {id === "ramelli" && <>
        <image href="/ramelli/logo-light.svg" width="32" height="32" className="dark:hidden" />
        <image href="/ramelli/logo-dark.svg" width="32" height="32" className="hidden dark:block" />
      </>}
      {id === "glui" && <image href="/glui/icon.svg" width="32" height="32" />}
      {id === "mugshot" && <>
        <g className={still ? "" : "project-loader-steam"}><path d="M10 3h1v2h-1v2H9V5h1z M16 2h1v2h-1v2h-1V4h1z M22 3h1v2h-1v2h-1V5h1z" opacity=".6" /></g>
        <path d="M7 11h17v12h-2v2H9v-2H7z" opacity=".08" />
        <rect x="8" y={23 - Math.floor(progress / 10)} width="15" height={Math.floor(progress / 10)} opacity=".5" />
        <path d="M7 11h17v12h-2v2H9v-2H7z M24 13h4v1h1v6h-1v1h-4 M5 28h22" fill="none" stroke="currentColor" />
        <path d="M12 16h2v1h2v-1h2v3h-1v1h-1v1h-1v-1h-1v-1h-2z" fill="hsl(var(--background))" opacity={progress > 62 ? 1 : 0} />
      </>}
      {id === "nlp-phishing-detection" && <>
        <path d="M15 4h2v1h4v1h4v1h2v10h-1v4h-2v3h-3v2h-3v2h-4v-2h-3v-2H8v-3H6v-4H5V7h2V6h4V5h4z" opacity=".08" />
        <path d="M15 4h2v1h4v1h4v1h2v10h-1v4h-2v3h-3v2h-3v2h-4v-2h-3v-2H8v-3H6v-4H5V7h2V6h4V5h4z" fill="none" stroke="currentColor" />
        {progress < 80 ? <>
          {[11, 15, 19].map(y => <rect key={y} x="10" y={y} width={y === 19 ? 7 : 12} height="1" opacity=".3" />)}
          <rect x="8" y={9 + (still ? 5 : step % 5) * 3} width="16" height="2" />
        </> : <path d="M10 15h3v3h2v-2h2v-2h2v-2h3v3h-2v2h-2v2h-2v3h-3v-2h-2v-2h-1z" className="project-loader-secondary" />}
      </>}
    </svg>
  );
}

function PixelLoader({ transition, ready, skipped, reduceMotion, stalled, onComplete, onSkip, onCancel }: {
  transition: Transition; ready: boolean; skipped: boolean; reduceMotion: boolean; stalled: boolean;
  onComplete: () => void; onSkip: () => void; onCancel: () => void;
}) {
  const { config } = transition;
  const titleId = useId();
  const actionRef = useRef<HTMLButtonElement>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const startedRef = useRef<number | null>(null);
  const completionRef = useRef<{ time: number; progress: number } | null>(null);

  useEffect(() => { actionRef.current?.focus({ preventScroll: true }); }, []);

  useEffect(() => {
    let frame: number;
    let finishedAt: number | null = null;
    const tick = (now: number) => {
      startedRef.current ??= now;
      const elapsed = now - startedRef.current;
      const instant = reduceMotion || skipped;
      let next: number;
      if (ready && (instant || elapsed >= 1200)) {
        completionRef.current ??= { time: now, progress: progressRef.current };
        const completion = completionRef.current;
        next = instant ? 100 : Math.min(100, Math.floor(completion.progress + (100 - completion.progress) * (now - completion.time) / 180));
      } else {
        // This measures the opening transition, not downloaded bytes. Wait below
        // completion until Next confirms the destination pathname is mounted.
        next = Math.min(92, Math.floor(92 * (1 - Math.exp(-elapsed / 510))));
      }
      next = Math.max(progressRef.current, next);
      progressRef.current = next;
      setProgress(next);
      if (next === 100) {
        finishedAt ??= now;
        if (instant || now - finishedAt >= 200) { onComplete(); return; }
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [ready, skipped, reduceMotion, onComplete]);

  const stage = progress === 100 ? 2 : progress >= 48 ? 1 : 0;

  return (
    <motion.div
      className={`project-loader fixed inset-0 z-[10000] isolate overflow-clip bg-background text-foreground ${config.theme}`}
      data-project-loader={config.id}
      role="dialog" aria-modal="true" aria-labelledby={titleId}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? .08 : .22 }}
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
      <div className="project-loader-grid" aria-hidden="true" />
      <div className="relative flex h-full min-h-[420px] flex-col px-6 py-7 sm:px-12 sm:py-10">
        <header className="project-loader-meta flex items-center justify-between">
          <span>YC <span className="mx-2 opacity-30">/</span> Selected work</span>
          <span>{config.index}<span className="mx-2 opacity-30">/</span>04</span>
        </header>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[440px]">
            <div className="project-loader-art">
              <span className="project-loader-corner" /><span className="project-loader-corner" />
              <span className="project-loader-corner" /><span className="project-loader-corner" />
              <ProjectPixels id={config.id} progress={progress} still={reduceMotion || progress === 100} />
            </div>
            <p className="project-loader-meta mt-8 text-center text-[hsl(var(--gold))]">{config.category}</p>
            <h2 id={titleId} className={`project-loader-title ${config.id === "nlp-phishing-detection" ? "project-loader-title-long" : ""}`}>{config.title}<span className="text-[hsl(var(--gold))]">.</span></h2>
            <p className="project-loader-description">{config.description}</p>
            <div className="mt-10 sm:mt-12">
              <div className="mb-3 flex items-end justify-between">
                <span className="project-loader-meta">Opening project</span>
                <span className="project-loader-count" aria-hidden="true">{String(progress).padStart(2, "0")}<span className="ml-1 text-xs opacity-40">%</span></span>
              </div>
              <div className="project-loader-track" role="progressbar" aria-label={`Opening ${config.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <svg className="project-loader-matrix" width="100%" height="24" aria-hidden="true">
                  <defs>
                    <pattern id={`${titleId}-pixels`} width="4" height="4" patternUnits="userSpaceOnUse">
                      <rect x=".5" y=".5" width="2.7" height="2.7" rx=".35" fill="white" />
                    </pattern>
                    <mask id={`${titleId}-matrix`}><rect width="100%" height="100%" fill={`url(#${titleId}-pixels)`} /></mask>
                    <linearGradient id={`${titleId}-glow`}>
                      <stop offset="0" stopColor="currentColor" stopOpacity=".05" />
                      <stop offset=".55" stopColor="currentColor" stopOpacity=".5" />
                      <stop offset=".9" stopColor="currentColor" />
                      <stop offset="1" stopColor="hsl(var(--loader-highlight))" stopOpacity=".85" />
                    </linearGradient>
                  </defs>
                  <g mask={`url(#${titleId}-matrix)`}>
                    <rect width="100%" height="24" fill="currentColor" opacity=".06" />
                    <rect data-pixel-fill width={`${progress}%`} height="24" fill={`url(#${titleId}-glow)`} />
                  </g>
                </svg>
              </div>
              <div className="mt-3 flex min-h-8 items-start justify-between gap-3">
                <p role="status" className="project-loader-status">{stalled ? "Taking a little longer…" : config.stages[stage]}</p>
                <span className="project-loader-meta shrink-0 opacity-40" aria-hidden="true">{String(stage + 1).padStart(2, "0")} / 03</span>
              </div>
            </div>
          </div>
        </div>
        <footer className="project-loader-meta flex items-center justify-between gap-4">
          <span>Made by Youssef Chouay</span>
          {stalled ? <a href={transition.href} className="project-loader-action">Open project ↗</a> :
            <button ref={actionRef} type="button" onClick={skipped ? onCancel : onSkip} className="project-loader-action">{skipped ? "Dismiss" : "Skip"} ↗</button>}
        </footer>
      </div>
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
      const config = getConfig(detail?.projectId ?? "");
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
      {transition && <PixelLoader key={transition.key} transition={transition} ready={pathname === getPathname(transition.href)} skipped={skipped} reduceMotion={reduceMotion} stalled={stalled} onComplete={dismiss} onSkip={() => { setSkipped(true); navigate(); }} onCancel={dismiss} />}
    </AnimatePresence>
  );
}
