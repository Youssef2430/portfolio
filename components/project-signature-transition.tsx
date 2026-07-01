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

// Signature paths are generated from hand-placed pen trajectories smoothed
// through a Catmull-Rom spline, so every name is one connected cursive stroke
// plus the late detail strokes (crossbars, i-dots) a real writer adds last.
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
    viewBox: "0 0 668 260",
    // Cursive "Atlas" in one stroke, a lazy bar through A and t, then "LLM".
    signaturePath:
      "M64.5 182 C70.5 169.7 89.5 128 100.3 108 C111.2 88 123.3 70.3 129.7 62 C136 53.7 137.2 52.3 138.3 58 C139.4 63.7 137 81 136.2 96 C135.5 111 134.2 133.7 133.9 148 C133.6 162.3 132.8 177.7 134.5 182 C136.1 186.3 141.3 174.7 143.8 174 C146.2 173.3 143.7 188.7 149.1 178 C154.5 167.3 169.8 126.7 176 110 C182.2 93.3 186 74.7 186.1 78 C186.3 81.3 179 113 176.8 130 C174.6 147 171.2 173.3 172.8 180 C174.4 186.7 183.7 170.3 186.4 170 C189.1 169.7 183.9 188 189.1 178 C194.4 168 210.2 129.3 218 110 C225.8 90.7 233.6 71 235.7 62 C237.8 53 233.7 51.3 230.6 56 C227.6 60.7 220.4 76 217.2 90 C214 104 212.3 125 211.2 140 C210.1 155 208.8 175 210.8 180 C212.8 185 213.4 179.3 223.4 170 C233.4 160.7 264.9 133.3 270.8 124 C276.6 114.7 263.8 113.3 258.4 114 C252.9 114.7 243 120.7 238.1 128 C233.3 135.3 229.7 149.3 229.3 158 C228.9 166.7 231.7 178.3 235.8 180 C239.9 181.7 248.3 174.7 253.7 168 C259.1 161.3 264.8 147.7 268.2 140 C271.6 132.3 274.1 120 274.1 122 C274.1 124 269 142.3 268.3 152 C267.6 161.7 267.6 177 269.8 180 C272 183 279.7 170.3 281.4 170 C283.1 169.7 275.8 186.3 280.1 178 C284.5 169.7 301.6 131 307.4 120 C313.2 109 315.7 114 314.7 112 C313.7 110 305.5 105.7 301.3 108 C297.1 110.3 290.1 118.7 289.4 126 C288.8 133.3 295.3 145.3 297.3 152 C299.2 158.7 302.3 161.3 301 166 C299.8 170.7 289.2 178.3 289.8 180 C290.4 181.7 302 176.7 304.4 176 M87.8 136 C96.2 133.5 121.6 125 138.2 121 C154.9 117 179.4 113.5 187.7 112 M391.4 70 C388.5 80 379 112 373.8 130 C368.6 148 359.9 168.7 360.1 178 C360.3 187.3 368.2 185.7 374.8 186 C381.5 186.3 395.6 181 399.8 180 M457.4 70 C454.5 80 445 112 439.8 130 C434.6 148 425.9 168.7 426.1 178 C426.3 187.3 434.2 185.7 440.8 186 C447.5 186.3 461.6 181 465.8 180 M499 185 C503.1 174.2 516 139.2 523.4 120 C530.8 100.8 538.9 79.3 543.4 70 C547.9 60.7 549.8 59 550.4 64 C550.9 69 547.9 85.7 546.6 100 C545.3 114.3 543.5 136.3 542.6 150 C541.7 163.7 538.3 185.3 541.5 182 C544.7 178.7 554.7 147 561.8 130 C568.9 113 578.4 90.7 583.8 80 C589.2 69.3 592.6 62.7 594 66 C595.5 69.3 593.2 86 592.6 100 C592 114 590.7 136.7 590.6 150 C590.5 163.3 589.7 176.3 591.8 180 C593.9 183.7 601.2 173.3 603.1 172",
    strokeWidth: 12.5,
    drawDuration: 2.3,
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
    viewBox: "0 0 363 260",
    // Open sweeping C flowing straight into "lui", i-dot flicked on last.
    signaturePath:
      "M178.1 72 C173.5 69.7 161.1 59.3 150.3 58 C139.5 56.7 125 57.7 113.4 64 C101.7 70.3 88.5 83.7 80.2 96 C71.9 108.3 65.5 125.3 63.5 138 C61.5 150.7 63 164 68.1 172 C73.1 180 85.1 184.7 93.8 186 C102.6 187.3 113.7 182.7 120.8 180 C127.9 177.3 128.3 170.3 136.4 170 C144.5 169.7 158.9 188 169.1 178 C179.4 168 190.2 129.3 198 110 C205.8 90.7 213.6 71 215.7 62 C217.8 53 213.7 51.3 210.6 56 C207.6 60.7 200.4 76 197.2 90 C194 104 192.3 125 191.2 140 C190.1 155 188.8 175 190.8 180 C192.8 185 201.5 170.3 203.4 170 C205.3 169.7 198.5 186 202.1 178 C205.7 170 220.6 132 225.1 122 C229.5 112 229.2 113 228.7 118 C228.3 123 223.1 141.7 222.3 152 C221.5 162.3 221.3 176.7 223.8 180 C226.3 183.3 232.3 178.7 237.1 172 C241.8 165.3 248.5 148.7 252.2 140 C255.9 131.3 259.2 118.3 259.4 120 C259.6 121.7 254.5 140.3 253.6 150 C252.7 159.7 252.2 174.3 254.1 178 C256 181.7 263.4 172 265.1 172 C266.7 172 260.7 186 264.1 178 C267.6 170 281.5 134 285.8 124 C290 114 290.1 113.7 289.7 118 C289.4 122.3 284.6 139.7 283.6 150 C282.6 160.3 281.8 176.7 283.8 180 C285.8 183.3 293.5 171.7 295.4 170 M295.4 95 C296.4 94 300.4 90 301.4 89",
    strokeWidth: 12.5,
    drawDuration: 1.75,
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
    viewBox: "0 0 637 260",
    // Quick handwritten caps: N with a retraced stem, looped L, open P.
    signaturePath:
      "M171 66 C168.5 75.7 160.5 104.7 155.8 124 C151 143.3 141.9 181.3 142.5 182 C143 182.7 153.5 146.7 159.1 128 C164.8 109.3 171.8 71.7 176.4 70 C181 68.3 182.3 101.7 186.7 118 C191.1 134.3 198.5 157 202.7 168 C207 179 207.4 191 212.2 184 C216.9 177 225 145.7 231.4 126 C237.9 106.3 247.8 76 251 66 M334.4 70 C331.1 80 320.3 112 314.8 130 C309.3 148 300.9 168.7 301.1 178 C301.3 187.3 309.2 185.7 315.8 186 C322.5 186.3 336.6 181 340.8 180 M408 185 C411.7 174.2 423.6 139.5 430.4 120 C437.2 100.5 444.8 77.7 448.7 68 C452.6 58.3 449.7 63.7 453.7 62 C457.6 60.3 466.1 57.3 472.3 58 C478.5 58.7 487.5 61 491 66 C494.6 71 495.4 80.3 493.5 88 C491.6 95.7 486.3 106.3 479.7 112 C473.1 117.7 461.6 120.7 454.1 122 C446.5 123.3 437.7 120.3 434.4 120",
    strokeWidth: 12.5,
    drawDuration: 1.55,
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
    viewBox: "0 0 557 260",
    // The whole word in a single connected stroke, t crossed at the end.
    signaturePath:
      "M66 185 C70.7 174.2 86 139.2 94.4 120 C102.8 100.8 111.6 79.3 116.4 70 C121.2 60.7 122.7 59.7 123.4 64 C124 68.3 121.5 81.7 120.2 96 C118.9 110.3 116.6 135.7 115.6 150 C114.6 164.3 111.3 185.3 114.5 182 C117.7 178.7 127.8 146.7 134.8 130 C141.8 113.3 151.2 92.3 156.5 82 C161.8 71.7 165.2 65 166.7 68 C168.2 71 166.1 86.3 165.6 100 C165.1 113.7 163.7 136.7 163.6 150 C163.5 163.3 162.7 176.3 164.8 180 C166.9 183.7 174 172.3 176.1 172 C178.1 171.7 173.1 186.3 177.1 178 C181.1 169.7 195.6 132 200.1 122 C204.5 112 204.2 113 203.7 118 C203.3 123 198.1 141.7 197.3 152 C196.5 162.3 196.3 176.7 198.8 180 C201.3 183.3 207.3 178.7 212.1 172 C216.8 165.3 223.5 148.7 227.2 140 C230.9 131.3 234.2 118.3 234.4 120 C234.6 121.7 229.5 140.3 228.6 150 C227.7 159.7 227.2 174.3 229.1 178 C231 181.7 230.6 181 240.1 172 C249.5 163 280.2 133.7 285.8 124 C291.3 114.3 278.5 113.3 273.4 114 C268.3 114.7 259.6 121 255.1 128 C250.7 135 247 147.7 246.6 156 C246.3 164.3 249.1 176.3 253.1 178 C257.2 179.7 266 172.7 271 166 C276.1 159.3 280.5 145.7 283.5 138 C286.6 130.3 289.9 114.7 289.4 120 C288.9 125.3 283.4 154.3 280.4 170 C277.4 185.7 275.3 203.7 271.4 214 C267.4 224.3 261.1 230.3 256.5 232 C251.9 233.7 245 228.7 243.8 224 C242.5 219.3 241.1 211.7 249 204 C256.9 196.3 279.5 192 291.1 178 C302.7 164 312.6 131 318.4 120 C324.2 109 326.7 114 325.7 112 C324.7 110 316.5 105.7 312.3 108 C308.1 110.3 301.1 118.7 300.4 126 C299.8 133.3 306.3 145.3 308.3 152 C310.2 158.7 313.3 161.3 312 166 C310.8 170.7 300.2 178.3 300.8 180 C301.4 181.7 311.4 176.3 315.4 176 C319.5 175.7 319.1 188.7 325.1 178 C331.2 167.3 344.3 131.3 351.7 112 C359.1 92.7 367.5 71.3 369.7 62 C371.8 52.7 367.6 51 364.6 56 C361.7 61 355.7 76.3 351.9 92 C348 107.7 344.2 135 341.6 150 C339 165 334.9 183.7 336.5 182 C338.1 180.3 345.9 150.3 351.2 140 C356.5 129.7 364 122.3 368.4 120 C372.8 117.7 376.4 120.2 377.4 126 C378.5 131.8 375.2 146 374.8 155 C374.4 164 372.9 177.5 374.8 180 C376.7 182.5 377.5 179.7 386.4 170 C395.3 160.3 423.6 131.3 428.1 122 C432.6 112.7 418.4 113 413.4 114 C408.4 115 401.7 121.3 398.1 128 C394.6 134.7 391.8 145.7 392 154 C392.1 162.3 395.2 175.3 399.1 178 C403 180.7 410.9 175.3 415.4 170 C419.9 164.7 424.1 153 426.2 146 C428.4 139 426.6 130.3 428.1 128 C429.7 125.7 433.7 127.3 435.5 132 C437.2 136.7 437.8 149 438.6 156 C439.5 163 440.3 170.3 440.8 174 C441.2 177.7 436.6 188.7 441.1 178 C445.7 167.3 461.8 126.7 468 110 C474.2 93.3 478 74.7 478.1 78 C478.3 81.3 471 113 468.8 130 C466.6 147 463.2 173.3 464.8 180 C466.4 186.7 476.1 171.7 478.4 170 M456 110 C459 108.8 468.2 104.3 474.1 103 C480 101.7 488.4 102.2 491.3 102",
    strokeWidth: 12.5,
    drawDuration: 2.35,
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
const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);

/**
 * Trapezoid velocity profile: the pen accelerates over `a`, glides at a steady
 * speed, and settles over `d`. Keeps the mid-stroke pace constant instead of
 * the pulsing you get from easing every stroke in and out.
 */
function penEase(t: number, a = 0.16, d = 0.24) {
  const c = clamp01(t);
  const vMax = 1 / (1 - a / 2 - d / 2);
  if (c < a) return (vMax * c * c) / (2 * a);
  if (c < 1 - d) return vMax * (a / 2 + (c - a));
  const u = c - (1 - d);
  return vMax * (a / 2 + (1 - a - d) + u - (u * u) / (2 * d));
}

/** Smooth in-out for the pen's airborne hop between strokes. */
function hopEase(t: number) {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/** Deterministic per-stroke jitter so the rhythm feels human but renders identically every run. */
function strokeJitter(i: number) {
  const f = Math.sin((i + 1) * 12.9898) * 43758.5453;
  return 0.95 + (f - Math.floor(f)) * 0.1; // 0.95 to 1.05
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
  length: number; // px, real path length
  from: DOMPoint; // pen-down point
  to: DOMPoint; // pen-up point
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
  const nibRef = useRef<SVGGElement | null>(null);

  const sw = config.strokeWidth;

  useLayoutEffect(() => {
    const inks = inkRefs.current;
    const bleeds = bleedRefs.current;
    const nib = nibRef.current;

    // Reduced motion: present the finished signature, no animation.
    if (reduceMotion) {
      inks.forEach((p) => p && (p.style.strokeDashoffset = "0"));
      bleeds.forEach((p) => p && (p.style.strokeDashoffset = "0"));
      if (nib) nib.style.opacity = "0";
      return;
    }

    const n = inks.length;
    const total = config.drawDuration;

    // Pen-lift pauses scale with how far the pen actually travels through the
    // air to the next stroke; the remaining time is writing time, distributed
    // by stroke length so the nib glides at a near-constant speed.
    const lens = inks.map((p) => (p ? p.getTotalLength() : 0));
    const ends = inks.map((p, i) => ({
      from: p ? p.getPointAtLength(0) : new DOMPoint(),
      to: p ? p.getPointAtLength(lens[i]) : new DOMPoint(),
    }));

    const gaps: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      const dist = Math.hypot(
        ends[i + 1].from.x - ends[i].to.x,
        ends[i + 1].from.y - ends[i].to.y
      );
      gaps.push(clamp(dist / 1500, 0.07, 0.2));
    }

    const touchDown = 0.12; // beat before the nib meets the paper
    const writeTime = Math.max(0.3, total - gaps.reduce((a, b) => a + b, 0));
    const weights = lens.map((len, i) => Math.pow(Math.max(len, 24), 0.9) * strokeJitter(i));
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1;

    const schedule: StrokeSchedule[] = [];
    let cursor = touchDown;
    weights.forEach((w, i) => {
      const duration = (w / weightSum) * writeTime;
      schedule.push({
        start: cursor,
        end: cursor + duration,
        duration,
        length: lens[i],
        from: ends[i].from,
        to: ends[i].to,
      });
      cursor += duration + (gaps[i] ?? 0);
    });

    const writeEnd = schedule[n - 1]?.end ?? total;
    const liftDuration = 0.3;

    const moveNib = (x: number, y: number, scale: number, opacity: number) => {
      if (!nib) return;
      nib.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
      nib.style.opacity = opacity.toFixed(3);
    };

    /** Airborne hop between two strokes: a shallow arc lifted off the paper. */
    const hop = (from: DOMPoint, to: DOMPoint, u: number) => {
      const e = hopEase(u);
      const lift = 22 + Math.hypot(to.x - from.x, to.y - from.y) * 0.12;
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2 - lift;
      const a = 1 - e;
      const x = a * a * from.x + 2 * a * e * mx + e * e * to.x;
      const y = a * a * from.y + 2 * a * e * my + e * e * to.y;
      return { x, y };
    };

    let raf = 0;
    const startTime = performance.now();

    const frame = (now: number) => {
      const t = (now - startTime) / 1000;

      // Reveal each stroke as the ink flows on. Fully hidden strokes are also
      // faded out so round line caps can't leave a dot at the pen-down point.
      for (let i = 0; i < n; i++) {
        const s = schedule[i];
        let revealed: number;
        if (t >= s.end) revealed = 1;
        else if (t <= s.start) revealed = 0;
        else revealed = penEase((t - s.start) / s.duration);
        const offset = (1 - revealed).toFixed(4);
        const visible = revealed > 0 ? "1" : "0";
        if (inks[i]) {
          inks[i]!.style.strokeDashoffset = offset;
          inks[i]!.style.opacity = visible;
        }
        if (bleeds[i]) {
          bleeds[i]!.style.strokeDashoffset = offset;
          bleeds[i]!.style.opacity = visible;
        }
      }

      // Fly the nib: on the paper it rides the stroke tip, between strokes it
      // hops in a lifted arc, and at the end it floats off the page.
      if (t < schedule[0].start) {
        const p = schedule[0].from;
        moveNib(p.x, p.y - 10 * (1 - t / touchDown), 1.1, t / touchDown);
      } else if (t >= writeEnd) {
        const u = clamp01((t - writeEnd) / liftDuration);
        const p = schedule[n - 1].to;
        moveNib(p.x + 14 * u, p.y - 26 * u, 1 + 0.2 * u, 1 - u);
      } else {
        let placed = false;
        for (let i = 0; i < n && !placed; i++) {
          const s = schedule[i];
          if (t <= s.end) {
            if (t >= s.start) {
              const revealed = penEase((t - s.start) / s.duration);
              const p = inks[i]?.getPointAtLength(revealed * s.length);
              if (p) moveNib(p.x, p.y, 1, 1);
            } else {
              const prev = schedule[i - 1];
              const u = (t - prev.end) / (s.start - prev.end);
              const p = hop(prev.to, s.from, u);
              moveNib(p.x, p.y, 1.16, 0.55);
            }
            placed = true;
          }
        }
      }

      if (t < writeEnd + liftDuration) {
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
            opacity={reduceMotion ? 1 : 0}
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
            opacity={reduceMotion ? 1 : 0}
            shapeRendering="geometricPrecision"
            filter={`url(#${glowId})`}
          />
        ))}

        {/* the pen nib riding the tip of the ink */}
        {!reduceMotion && (
          <g ref={nibRef} style={{ opacity: 0 }}>
            <circle r={sw * 1.5} fill="hsl(var(--gold) / 0.16)" />
            <circle r={sw * 0.8} fill="hsl(var(--gold) / 0.45)" />
            <circle r={sw * 0.45} fill="hsl(var(--gold))" />
          </g>
        )}
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
        : Math.round(config.drawDuration * 1000 + 560);
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
