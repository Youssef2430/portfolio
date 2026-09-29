"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// A looping figure for the thesis: the hard polygon Pₙ, the dyadic triangulation of its
// strip (upper bound, Theorem 3), a zoom into the strip, and a morph into the empty-box
// propagation that drives the lower bound (Proposition 2.1).

type Pt = [number, number];
type Seg = [Pt, Pt];

const N = 8;
const EASE = [0.55, 0.45, 0.16, 1] as const;
const MORPH = { duration: 1.4, ease: EASE };

// ---------------------------------------------------------------------------
// Upper bound: the dyadic construction G* on Qₙ (Definitions 3.1–3.4)
// ---------------------------------------------------------------------------

function zigzag(left: Pt[], right: Pt[]): Pt[][] {
  const tris: Pt[][] = [];
  const s = left.length - 1;
  const t = right.length - 1;
  let i = 0;
  let j = 0;
  while (i < s || j < t) {
    if (i < s && (j === t || left[i + 1][1] <= right[j + 1][1])) {
      tris.push([left[i], right[j], left[i + 1]]);
      i++;
    } else {
      tris.push([left[i], right[j], right[j + 1]]);
      j++;
    }
  }
  return tris;
}

function dyadicTriangulation(n: number) {
  const L = Math.ceil(Math.log2(n));
  const O: Pt = [0, 0];
  const U: Pt = [0, n];
  const x = (l: number) => 1 - l / L;
  const heights = (l: number) =>
    Array.from({ length: n }, (_, h) => h).filter((h) => h > 0 && h % 2 ** l === 0);
  const columns: Pt[][] = Array.from({ length: L }, (_, l) =>
    heights(l).map((h) => [x(l), h] as Pt),
  );
  columns.push([O, U]);

  const lower: Pt[] = [...columns.slice(0, L).map((c) => c[0]).reverse(), [1, 0]];
  const upper: Pt[] = [...columns.slice(0, L).map((c) => c[c.length - 1]).reverse(), [1, n]];

  const tris: Pt[][] = [];
  for (let k = 0; k + 1 < lower.length; k++) tris.push([O, lower[k], lower[k + 1]]);
  for (let k = 0; k + 1 < upper.length; k++) tris.push([U, upper[k], upper[k + 1]]);
  for (let l = 1; l <= L; l++) tris.push(...zigzag(columns[l], columns[l - 1]));

  const onBoundary = ([a, b]: Seg) =>
    (a[0] === b[0] && (a[0] === 0 || a[0] === 1)) || (a[1] === b[1] && (a[1] === 0 || a[1] === n));
  const seen = new Map<string, Seg>();
  for (const [a, b, c] of tris) {
    for (const seg of [[a, b], [b, c], [c, a]] as Seg[]) {
      const key = seg.map((p) => p.join(",")).sort().join("|");
      if (!seen.has(key) && !onBoundary(seg)) seen.set(key, seg);
    }
  }
  const steiner = columns.slice(1, L).flat();
  return { edges: [...seen.values()], steiner, triangles: tris.length };
}

const upperBound = dyadicTriangulation(N);

// ---------------------------------------------------------------------------
// Lower bound: a triangulated strip carrying successive empty boxes (schematic)
// ---------------------------------------------------------------------------

const wall = (j: number): Pt => [1, j];
const O: Pt = [0, 0];
const U: Pt = [0, N];
const p1: Pt = [0.3, 1.6];
const p2: Pt = [0.3, 6.4];
const q1: Pt = [0.55, 2.8];
const q2: Pt = [0.55, 5.2];
const r1: Pt = [0.78, 3.4];
const r2: Pt = [0.78, 4.7];

const propagationEdges: Seg[] = [
  [U, p1], [O, p1], [U, p2], [p1, p2],
  [p1, q1], [p2, q2], [q1, q2], [p2, q1],
  [q1, r1], [q2, r2], [r1, r2], [q2, r1],
  [wall(0), p1], [wall(0), q1], [wall(0), r1],
  [wall(N), p2], [wall(N), q2], [wall(N), r2],
  ...[1, 2, 3, 4].map((j) => [r1, wall(j)] as Seg),
  ...[4, 5, 6, 7].map((j) => [r2, wall(j)] as Seg),
];
const propagationVertices: Pt[] = [p1, p2, q1, q2, r1, r2];

const DELTA = 0.07;
const boxes: { x: number; a: number; b: number }[] = [
  { x: 0, a: 3, b: 5 },
  { x: 0.3, a: 3.4, b: 4.4 },
  { x: 0.55, a: 3.7, b: 4.2 },
  { x: 0.78, a: 3.87, b: 4.12 },
];

// Pair up both edge sets by position so the morph slides each line to a nearby counterpart.
const byMidpoint = (a: Seg, b: Seg) =>
  a[0][0] + a[1][0] - (b[0][0] + b[1][0]) || a[0][1] + a[1][1] - (b[0][1] + b[1][1]);
const upperSorted = [...upperBound.edges].sort(byMidpoint);
const lowerSorted = [...propagationEdges].sort(byMidpoint);
const EDGE_COUNT = Math.max(upperSorted.length, lowerSorted.length);
const pick = <T,>(list: T[], i: number) => list[Math.floor((i * list.length) / EDGE_COUNT)];

const VERTEX_COUNT = Math.max(upperBound.steiner.length, propagationVertices.length);
const pickVertex = (list: Pt[], i: number) => list[Math.floor((i * list.length) / VERTEX_COUNT)];

// The rest of the hard polygon Pₙ (Definition 1.1): guard edge AF and the left block.
const A: Pt = [-2, 0];
const B: Pt = [-2, N + 1];
const F: Pt = U;
const TOP_RIGHT: Pt = [1, N + 1];
const outerEdges: Seg[] = [[B, F], [B, wall(N)]];

// ---------------------------------------------------------------------------
// Cameras and phases
// ---------------------------------------------------------------------------

type Camera = (p: Pt) => Pt;
const full: Camera = ([x, y]) => [70 + (x + 2) * 60, 200 - y * 20];
const strip: Camera = ([x, y]) => [40 + x * 240, 196 - y * 21];

type Phase = 0 | 1 | 2 | 3;
const PHASE_MS: Record<Phase, number> = { 0: 1800, 1: 2600, 2: 2000, 3: 5200 };
const CAPTIONS: Record<Phase, React.ReactNode> = {
  0: <>Pₙ</>,
  1: <>upper · O(log n)</>,
  2: <>upper · O(log n)</>,
  3: <>lower · Ω(log N)</>,
};

export function ThesisFigure() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const [phase, setPhase] = useState<Phase>(0);

  useEffect(() => {
    if (!inView) return;
    const id = window.setTimeout(
      () => setPhase((p) => ((p + 1) % 4) as Phase),
      PHASE_MS[phase],
    );
    return () => window.clearTimeout(id);
  }, [phase, inView]);

  const cam = phase >= 2 ? strip : full;
  const showMesh = phase >= 1;
  const morphed = phase === 3;

  const P = (p: Pt) => cam(p);
  const line = ([a, b]: Seg) => {
    const [x1, y1] = P(a);
    const [x2, y2] = P(b);
    return { x1, y1, x2, y2 };
  };
  const path = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${P(p).join(",")}`).join(" ");

  const polygonOutline = path([A, B, TOP_RIGHT, wall(0), O, F, A]);
  const stair: Pt[] = boxes.flatMap((b, i) => {
    const next = boxes[i + 1];
    return next ? [[b.x + DELTA, b.b], [next.x, b.b], [next.x, next.b]] : [[b.x + DELTA, b.b]];
  });

  return (
    <figure ref={ref} className="w-full">
      <svg viewBox="0 0 320 214" className="w-full overflow-hidden">
        {/* region */}
        <motion.path
          initial={false}
          animate={{ d: polygonOutline }}
          transition={MORPH}
          className="fill-[hsl(var(--gold)/0.05)] stroke-none"
        />

        {/* triangulation, morphing between the dyadic construction and the propagation strip */}
        {Array.from({ length: EDGE_COUNT }, (_, i) => (
          <motion.line
            key={i}
            initial={false}
            animate={{
              ...line(morphed ? pick(lowerSorted, i) : pick(upperSorted, i)),
              opacity: showMesh ? (morphed ? 0.55 : 1) : 0,
            }}
            transition={{ ...MORPH, delay: showMesh && phase === 1 ? i * 0.025 : 0 }}
            className="stroke-[hsl(var(--foreground-faint))]"
            strokeWidth={0.7}
          />
        ))}
        {outerEdges.map((seg, i) => (
          <motion.line
            key={`o${i}`}
            initial={false}
            animate={{ ...line(seg), opacity: showMesh ? 1 : 0 }}
            transition={MORPH}
            className="stroke-[hsl(var(--foreground-faint))]"
            strokeWidth={0.7}
          />
        ))}

        {/* input boundary */}
        <motion.path
          initial={false}
          animate={{ d: polygonOutline }}
          transition={MORPH}
          className="fill-none stroke-[hsl(var(--foreground))]"
          strokeWidth={1}
          strokeLinejoin="round"
        />
        <motion.line
          initial={false}
          animate={line([A, F])}
          transition={MORPH}
          className="stroke-[hsl(var(--gold))]"
          strokeWidth={1.4}
        />
        <motion.line
          initial={false}
          animate={line([O, F])}
          transition={MORPH}
          className="stroke-[hsl(var(--gold))]"
          strokeWidth={2}
        />

        {/* boxes */}
        {boxes.map((b, i) => {
          const [x, yTop] = P([b.x, b.b]);
          const [x2, yBottom] = P([b.x + DELTA, b.a]);
          const mid = (yTop + yBottom) / 2;
          return (
            <motion.rect
              key={i}
              initial={false}
              animate={
                morphed
                  ? { x, y: yTop, width: x2 - x, height: yBottom - yTop, opacity: 1 }
                  : { x, y: mid, width: x2 - x, height: 0, opacity: 0 }
              }
              transition={{ duration: 0.6, ease: EASE, delay: morphed ? 1.2 + i * 0.55 : 0 }}
              className="fill-[hsl(var(--gold)/0.25)] stroke-[hsl(var(--gold))]"
              strokeWidth={0.9}
            />
          );
        })}
        <motion.path
          initial={false}
          animate={{ d: path(stair), pathLength: morphed ? 1 : 0, opacity: morphed ? 1 : 0 }}
          transition={
            morphed
              ? { d: MORPH, opacity: { duration: 0 }, pathLength: { duration: 2, delay: 1.3, ease: "easeInOut" } }
              : { duration: 0.3 }
          }
          fill="none"
          className="stroke-[hsl(var(--gold))]"
          strokeWidth={0.9}
          strokeDasharray="3 2.5"
        />

        {/* vertices */}
        {Array.from({ length: VERTEX_COUNT }, (_, i) => {
          const [cx, cy] = P(morphed ? pickVertex(propagationVertices, i) : pickVertex(upperBound.steiner, i));
          return (
            <motion.circle
              key={`s${i}`}
              r={2.2}
              initial={false}
              animate={{ cx, cy, opacity: showMesh ? 1 : 0 }}
              transition={MORPH}
              className="fill-[hsl(var(--gold))]"
            />
          );
        })}
        {[...Array.from({ length: N + 2 }, (_, j) => wall(j)), A, B, O, F].map((p, i) => {
          const [cx, cy] = P(p);
          return (
            <motion.circle
              key={`v${i}`}
              r={1.8}
              initial={false}
              animate={{ cx, cy }}
              transition={MORPH}
              className="fill-[hsl(var(--foreground))]"
            />
          );
        })}
      </svg>

      <figcaption className="mt-3 flex h-4 items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--foreground-subtle))]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={phase === 2 ? 1 : phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="normal-case tracking-wider"
          >
            {CAPTIONS[phase]}
          </motion.span>
        </AnimatePresence>
        <span className="flex gap-1.5">
          {[0, 1, 2, 3].map((p) => (
            <span
              key={p}
              className={`h-px w-4 transition-colors duration-500 ${
                p === phase ? "bg-[hsl(var(--gold))]" : "bg-border"
              }`}
            />
          ))}
        </span>
      </figcaption>
    </figure>
  );
}
