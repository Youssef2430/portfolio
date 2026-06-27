"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

const PROJECT_SIGNATURE_EVENT = "portfolio:project-signature-transition";
const EASE = [0.16, 1, 0.3, 1] as const;

type SignatureProjectId =
  | "atlasllm"
  | "clui"
  | "nlp-phishing-detection"
  | "mugshot";

type SignatureConfig = {
  id: SignatureProjectId;
  href: string;
  title: string;
  kicker: string;
  status: string;
  themeClassName: string;
  backgroundClassName: string;
  /** Brand-matched gradient wash behind the texture, unique per project. */
  auraClassName: string;
  viewBox: string;
  signaturePath: string;
  strokeWidth: number;
  /** Total time the nib spends writing the whole name, in seconds. */
  drawDuration: number;
};

type TransitionState = {
  key: number;
  config: SignatureConfig;
  href: string;
};

type TransitionPhase = "writing" | "routing";

type SignatureTransitionDetail = {
  projectId: string;
  href?: string;
};

const SIGNATURE_PROJECTS: Record<SignatureProjectId, SignatureConfig> = {
  atlasllm: {
    id: "atlasllm",
    href: "/projects/atlasllm",
    title: "AtlasLLM",
    kicker: "AtlasLLM",
    status: "signing",
    themeClassName: "atlas-theme",
    backgroundClassName: "atlas-grid",
    auraClassName: "sig-aura-atlas",
    viewBox: "0 0 1200 260",
    signaturePath:
      "M86 184 C121 75 178 45 216 184 M116 146 C156 134 205 136 252 151 M306 85 C292 122 277 164 270 189 C304 190 337 176 361 151 M282 122 C322 122 353 119 379 116 M425 57 C404 111 387 160 381 190 C418 185 449 170 471 145 M520 122 C487 119 462 143 464 168 C466 195 504 196 535 156 C527 191 558 196 589 160 M650 116 C603 104 583 125 598 145 C616 169 666 157 676 180 C684 201 630 211 594 189 M747 61 C724 113 705 158 695 190 C736 187 775 186 811 190 M854 61 C831 113 812 158 802 190 C842 187 882 186 916 190 M948 190 C962 135 979 85 998 61 C1015 117 1032 154 1052 187 C1081 122 1113 79 1140 61 C1126 109 1114 151 1106 190",
    strokeWidth: 13,
    drawDuration: 2.05,
  },
  clui: {
    id: "clui",
    href: "/projects/clui",
    title: "Clui",
    kicker: "Clui",
    status: "signing",
    themeClassName: "clui-theme",
    backgroundClassName: "clui-dots",
    auraClassName: "sig-aura-clui",
    viewBox: "0 0 1000 260",
    signaturePath:
      "M286 92 C235 61 155 75 126 126 C94 181 165 217 246 184 C274 173 296 154 308 134 M365 55 C343 107 326 155 320 189 C354 187 386 171 409 145 M459 122 C444 158 435 188 463 190 C498 193 531 158 548 122 C532 167 543 193 577 190 C608 188 630 164 650 139 M708 122 C693 157 680 189 711 190 C742 191 770 171 790 145 M719 78 C719 68 733 68 733 78",
    strokeWidth: 15,
    drawDuration: 1.7,
  },
  "nlp-phishing-detection": {
    id: "nlp-phishing-detection",
    href: "/projects/nlp-phishing-detection",
    title: "NLP Phishing Detection",
    kicker: "NLP Phishing Detection",
    status: "signing",
    themeClassName: "phish-theme",
    backgroundClassName: "phish-hero-field",
    auraClassName: "sig-aura-phish",
    viewBox: "0 0 1000 260",
    signaturePath:
      "M154 190 C170 131 187 84 207 61 C239 116 278 160 324 190 C338 136 354 91 374 61 M452 61 C432 112 416 158 407 190 C451 187 495 187 535 190 M612 190 C630 130 651 79 674 62 C738 61 779 90 769 130 C758 174 690 174 638 143 C679 143 731 141 758 122",
    strokeWidth: 15,
    drawDuration: 1.7,
  },
  mugshot: {
    id: "mugshot",
    href: "/projects/mugshot",
    title: "Mugshot",
    kicker: "Mugshot",
    status: "brewing",
    themeClassName: "mugshot-theme",
    backgroundClassName: "mug-dots",
    auraClassName: "sig-aura-mugshot",
    viewBox: "0 0 980 260",
    // A loose cursive "Mugshot": each letter a separate pen stroke.
    signaturePath:
      "M66 192 C74 124 88 80 102 80 C116 80 126 132 136 172 C146 132 158 82 174 80 C190 82 198 132 206 192 M250 116 C242 156 240 182 262 184 C286 186 300 158 308 120 C304 158 306 184 330 182 M392 118 C360 108 342 136 358 156 C376 174 406 160 406 130 C404 164 398 218 370 230 C350 238 326 228 326 210 M470 124 C444 118 430 142 454 150 C474 156 488 172 464 184 C446 192 428 184 428 170 M520 70 C506 122 490 162 486 190 C500 142 520 114 544 114 C566 114 558 156 552 190 M610 156 C594 138 618 110 642 126 C664 140 652 184 624 184 C604 185 600 170 610 156 M712 84 C702 126 690 164 692 184 C694 200 714 198 732 184 M676 126 C700 124 726 122 750 120",
    strokeWidth: 14,
    drawDuration: 1.95,
  },
};

function getSignatureConfig(projectId: string): SignatureConfig | undefined {
  return SIGNATURE_PROJECTS[projectId as SignatureProjectId];
}

function getPathname(href: string) {
  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href.split("?")[0].split("#")[0];
  }
}

/** Break a compound `d` into one entry per pen stroke (each `M` starts a new stroke). */
function splitStrokes(d: string): string[] {
  const matches = d.match(/[Mm][^Mm]*/g);
  return matches ? matches.map((s) => s.trim()).filter(Boolean) : [d];
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Smootherstep: gentle acceleration in, gentle settle out, for a fluid stroke. */
function penEase(t: number) {
  const c = clamp01(t);
  return c * c * c * (c * (c * 6 - 15) + 10);
}

/** Deterministic per-stroke jitter so the rhythm feels human but renders identically every run. */
function strokeJitter(i: number) {
  const f = Math.sin((i + 1) * 12.9898) * 43758.5453;
  return 0.86 + (f - Math.floor(f)) * 0.28; // 0.86 to 1.14
}

export function hasProjectSignatureTransition(
  projectId: string
): projectId is SignatureProjectId {
  return Boolean(getSignatureConfig(projectId));
}

export function startProjectSignatureTransition(projectId: string, href?: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<SignatureTransitionDetail>(PROJECT_SIGNATURE_EVENT, {
      detail: { projectId, href },
    })
  );
}

type StrokeSchedule = {
  start: number; // seconds
  end: number; // seconds
  duration: number;
};

function Signature({
  config,
  reduceMotion,
}: {
  config: SignatureConfig;
  reduceMotion: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const glowId = `${id}-glow`;
  const bleedId = `${id}-bleed`;

  const strokes = useMemo(() => splitStrokes(config.signaturePath), [config.signaturePath]);
  const inkRefs = useRef<(SVGPathElement | null)[]>([]);
  const bleedRefs = useRef<(SVGPathElement | null)[]>([]);

  const sw = config.strokeWidth;

  useLayoutEffect(() => {
    const inks = inkRefs.current;
    const bleeds = bleedRefs.current;

    // Reduced motion: present the finished signature, no animation.
    if (reduceMotion) {
      inks.forEach((p) => p && (p.style.strokeDashoffset = "0"));
      bleeds.forEach((p) => p && (p.style.strokeDashoffset = "0"));
      return;
    }

    const lens = inks.map((p) => (p ? p.getTotalLength() : 0));
    const n = inks.length;
    const total = config.drawDuration;

    // Carve out brief pauses between strokes; the rest is writing time,
    // distributed by stroke length so the ink flows at a roughly steady pace.
    const gap = n > 1 ? Math.min(0.085, (total * 0.12) / (n - 1)) : 0;
    const writeTime = Math.max(0.2, total - gap * (n - 1));
    const totalLen = lens.reduce((a, b) => a + b, 0) || 1;
    const weights = lens.map((len, i) => Math.max(len, totalLen * 0.05) * strokeJitter(i));
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1;

    const schedule: StrokeSchedule[] = [];
    let cursor = 0;
    weights.forEach((w) => {
      const duration = (w / weightSum) * writeTime;
      schedule.push({ start: cursor, end: cursor + duration, duration });
      cursor += duration + gap;
    });

    const writeEnd = schedule[n - 1]?.end ?? total;

    let raf = 0;
    const startTime = performance.now();

    const frame = (now: number) => {
      const t = (now - startTime) / 1000;

      // Reveal each stroke as the ink flows on.
      for (let i = 0; i < n; i++) {
        const s = schedule[i];
        let revealed: number;
        if (t >= s.end) revealed = 1;
        else if (t <= s.start) revealed = 0;
        else revealed = penEase((t - s.start) / s.duration);
        const offset = (1 - revealed).toFixed(4);
        if (inks[i]) inks[i]!.style.strokeDashoffset = offset;
        if (bleeds[i]) bleeds[i]!.style.strokeDashoffset = offset;
      }

      if (t < writeEnd) {
        raf = requestAnimationFrame(frame);
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [config.drawDuration, reduceMotion, strokes, sw]);

  return (
    <div className="relative mx-auto w-full max-w-[min(92vw,1040px)]">
      <motion.svg
        className="block h-[clamp(8rem,23vw,15rem)] w-full overflow-visible"
        viewBox={config.viewBox}
        role="img"
        aria-label={`${config.title} signature`}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.4, ease: EASE }}
      >
        <defs>
          <filter
            id={glowId}
            x="-15%"
            y="-60%"
            width="130%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            {/* soft outer glow */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="halo" />
            <feColorMatrix
              in="halo"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.3 0"
              result="glow"
            />
            {/* feather the ink's own edge so the curves read silky, not jagged */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="ink" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="ink" />
            </feMerge>
          </filter>
          <filter id={bleedId} x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="5.5" />
          </filter>
        </defs>

        {/* signing line: drawn first, like a line on a form */}
        {!reduceMotion && (
          <motion.line
            x1={56}
            x2={Number(config.viewBox.split(" ")[2]) - 56}
            y1={224}
            y2={224}
            stroke="hsl(var(--foreground) / 0.16)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ pathLength: { duration: 0.5, ease: EASE }, opacity: { duration: 0.3 } }}
          />
        )}

        {/* soft ink-bleed underlay */}
        {strokes.map((d, i) => (
          <path
            key={`bleed-${i}`}
            ref={(el) => {
              bleedRefs.current[i] = el;
            }}
            d={d}
            fill="none"
            stroke="hsl(var(--gold) / 0.22)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={sw * 1.7}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={reduceMotion ? 0 : 1}
            shapeRendering="geometricPrecision"
            filter={`url(#${bleedId})`}
          />
        ))}

        {/* the ink itself */}
        {strokes.map((d, i) => (
          <path
            key={`ink-${i}`}
            ref={(el) => {
              inkRefs.current[i] = el;
            }}
            d={d}
            fill="none"
            stroke="hsl(var(--gold))"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={sw}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={reduceMotion ? 0 : 1}
            shapeRendering="geometricPrecision"
            filter={`url(#${glowId})`}
          />
        ))}
      </motion.svg>
    </div>
  );
}

function SignatureOverlay({
  transition,
  phase,
  reduceMotion,
}: {
  transition: TransitionState;
  phase: TransitionPhase;
  reduceMotion: boolean;
}) {
  const { config } = transition;

  return (
    <motion.div
      className={`fixed inset-0 z-[10000] isolate overflow-hidden bg-background text-foreground ${config.themeClassName}`}
      data-signature-project={config.id}
      data-signature-phase={phase}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.08 : 0.34, ease: EASE }}
    >
      <div className={`absolute inset-0 ${config.auraClassName}`} />
      <div className={`absolute inset-0 ${config.backgroundClassName} opacity-40`} />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 py-10 text-center">
        <motion.p
          className="font-mono text-[10px] uppercase tracking-[0.32em] text-[hsl(var(--foreground-muted))] md:text-xs"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.32, ease: EASE }}
        >
          {config.kicker}
        </motion.p>

        <Signature config={config} reduceMotion={reduceMotion} />

        <motion.p
          className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[hsl(var(--foreground-subtle))] md:text-[11px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "routing" ? 0.82 : 0.52 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.26 }}
        >
          {phase === "routing" ? "opening project" : config.status}
        </motion.p>
      </div>
    </motion.div>
  );
}

export function ProjectSignatureTransitionProvider() {
  const router = useRouter();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = Boolean(shouldReduceMotion);
  const timersRef = useRef<number[]>([]);
  const [transition, setTransition] = useState<TransitionState | null>(null);
  const [phase, setPhase] = useState<TransitionPhase>("writing");

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  useEffect(() => {
    if (!transition) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [transition]);

  useEffect(() => {
    const handleStart = (event: Event) => {
      const detail = (event as CustomEvent<SignatureTransitionDetail>).detail;
      const config = getSignatureConfig(detail?.projectId ?? "");

      if (!config) return;

      const href = detail?.href ?? config.href;
      clearTimers();
      setPhase("writing");
      setTransition({ key: Date.now(), config, href });

      // Wait for the nib to finish writing (plus its lift-off) before routing.
      const pushDelay = reduceMotion
        ? 120
        : Math.round(config.drawDuration * 1000 + 480);
      const timer = window.setTimeout(() => {
        setPhase("routing");
        router.push(href);
      }, pushDelay);

      timersRef.current.push(timer);
    };

    window.addEventListener(PROJECT_SIGNATURE_EVENT, handleStart);
    return () => window.removeEventListener(PROJECT_SIGNATURE_EVENT, handleStart);
  }, [clearTimers, reduceMotion, router]);

  useEffect(() => {
    if (!transition || phase !== "routing") return;

    const targetPathname = getPathname(transition.href);
    if (pathname !== targetPathname) return;

    const settleDelay = reduceMotion ? 120 : 460;
    const timer = window.setTimeout(() => {
      setTransition(null);
      setPhase("writing");
    }, settleDelay);

    return () => window.clearTimeout(timer);
  }, [pathname, phase, reduceMotion, transition]);

  return (
    <AnimatePresence mode="wait">
      {transition && (
        <SignatureOverlay
          key={transition.key}
          transition={transition}
          phase={phase}
          reduceMotion={reduceMotion}
        />
      )}
    </AnimatePresence>
  );
}
