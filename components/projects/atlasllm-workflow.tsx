"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * AtlasLLM's real workflow orchestration (`@repo/orchestrator`), drawn as the
 * full task graph. `router` dispatches each message to one of four modes;
 * Deep Research fans out parallel web searches and loops the reflector back to
 * the planner until the answer is complete. A token tours a different mode each
 * cycle so the branching reads clearly.
 */

const H = 34; // chip height

type Node = { label: string; x: number; y: number; w: number; purpose: string };

const NODES: Record<string, Node> = {
  router: { label: "router", x: 150, y: 290, w: 92, purpose: "Entry point: routes each message to the right chat mode." },
  compA: { label: "completion", x: 360, y: 110, w: 112, purpose: "Standard conversational answer." },
  compB: { label: "completion", x: 360, y: 196, w: 112, purpose: "Conversational answer, grounded with a quick web search." },
  quick: { label: "quickSearch", x: 604, y: 196, w: 116, purpose: "Fast web search for standard chat grounding." },
  pro: { label: "pro-search", x: 360, y: 470, w: 112, purpose: "Quick comprehensive search with citations." },
  refine: { label: "refine-query", x: 332, y: 330, w: 120, purpose: "Analyses and clarifies the research question." },
  planner: { label: "planner", x: 502, y: 330, w: 104, purpose: "Plans strategy and generates search queries." },
  search: { label: "web-search", x: 668, y: 330, w: 112, purpose: "Runs searches in parallel and processes content." },
  reflector: { label: "reflector", x: 904, y: 330, w: 104, purpose: "Evaluates progress; loops back if gaps remain." },
  analysis: { label: "analysis", x: 1040, y: 330, w: 104, purpose: "Synthesises findings before the report is written." },
  writer: { label: "writer", x: 1158, y: 330, w: 96, purpose: "Writes the comprehensive, cited report." },
  suggestions: { label: "suggestions", x: 1290, y: 290, w: 120, purpose: "Proposes follow-up questions to keep exploring." },
};

type Edge = { from: string; to: string; kind?: "loop" | "fan" };

const EDGES: Edge[] = [
  { from: "router", to: "compA" },
  { from: "router", to: "compB" },
  { from: "router", to: "refine" },
  { from: "router", to: "pro" },
  { from: "compA", to: "suggestions" },
  { from: "compB", to: "quick" },
  { from: "quick", to: "suggestions" },
  { from: "refine", to: "planner" },
  { from: "planner", to: "search" },
  { from: "search", to: "reflector", kind: "fan" },
  { from: "reflector", to: "analysis" },
  { from: "analysis", to: "writer" },
  { from: "writer", to: "suggestions" },
  { from: "reflector", to: "planner", kind: "loop" },
];

const RUNS: Array<{ mode: string; path: string[] }> = [
  { mode: "Standard", path: ["router", "compA", "suggestions"] },
  { mode: "Web search", path: ["router", "compB", "quick", "suggestions"] },
  { mode: "Pro Search", path: ["router", "pro", "suggestions"] },
  {
    mode: "Deep Research",
    path: ["router", "refine", "planner", "search", "reflector", "planner", "search", "reflector", "analysis", "writer", "suggestions"],
  },
];

// Three parallel search lanes between web-search and reflector.
const FAN_Y = [308, 330, 352];

function rightEdge(n: Node) {
  return { x: n.x + n.w / 2, y: n.y };
}
function leftEdge(n: Node) {
  return { x: n.x - n.w / 2, y: n.y };
}

/** Path string for an edge. */
function edgePath(e: Edge): string {
  const from = NODES[e.from];
  const to = NODES[e.to];
  if (e.kind === "loop") {
    // reflector → planner, arc above the deep band
    const s = { x: from.x, y: from.y - H / 2 };
    const t = { x: to.x, y: to.y - H / 2 };
    return `M ${s.x} ${s.y} C ${s.x} 248 ${t.x} 248 ${t.x} ${t.y}`;
  }
  const s = rightEdge(from);
  const t = leftEdge(to);
  if (Math.abs(s.y - t.y) < 1) {
    return `M ${s.x} ${s.y} L ${t.x} ${t.y}`;
  }
  // mostly-horizontal cubic that curves near the destination
  const c1x = s.x + (t.x - s.x) * 0.55;
  const c2x = t.x - Math.min(60, (t.x - s.x) * 0.3);
  return `M ${s.x} ${s.y} C ${c1x} ${s.y} ${c2x} ${t.y} ${t.x} ${t.y}`;
}

// Three sub-paths for the web-search → reflector parallel fan-out.
function fanPaths(): string[] {
  const s = rightEdge(NODES.search);
  const t = leftEdge(NODES.reflector);
  return FAN_Y.map((my) => `M ${s.x} ${s.y} C ${s.x + 40} ${s.y} ${s.x + 30} ${my} ${(s.x + t.x) / 2} ${my} S ${t.x - 30} ${t.y} ${t.x} ${t.y}`);
}

export function AtlasWorkflow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-20%" });
  const reduced = useReducedMotion();
  const [frameIdx, setFrameIdx] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);

  // Flatten runs into a single sequence of frames the token steps through.
  const frames = useMemo(() => {
    const out: Array<{ mode: string; node: string; from: string | null; visited: Set<string> }> = [];
    for (const run of RUNS) {
      const visited = new Set<string>();
      run.path.forEach((node, i) => {
        visited.add(node);
        out.push({ mode: run.mode, node, from: i > 0 ? run.path[i - 1] : null, visited: new Set(visited) });
      });
    }
    return out;
  }, []);

  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setFrameIdx((i) => (i + 1) % frames.length), 720);
    return () => clearInterval(id);
  }, [reduced, inView, frames.length]);

  const frame = reduced ? null : frames[frameIdx];
  const activeMode = frame?.mode ?? "Deep Research";

  const isVisited = (id: string) => !hovered && frame?.visited.has(id);
  const isCurrent = (id: string) => (hovered ? hovered === id : frame?.node === id);
  const edgeActive = (e: Edge) => !hovered && frame?.from === e.from && frame?.node === e.to && !(e.kind === "loop");
  const loopActive = !hovered && frame?.from === "reflector" && frame?.node === "planner";

  const caption = hovered ? NODES[hovered] : frame ? NODES[frame.node] : NODES.writer;

  return (
    <div ref={ref}>
      {/* active mode */}
      <div className="mb-6 flex items-center gap-3">
        <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[hsl(var(--foreground-subtle))]">
          Active flow
        </span>
        <span className="font-mono text-xs tracking-wide text-[hsl(var(--gold))]">{activeMode}</span>
      </div>

      <svg
        viewBox="0 0 1380 560"
        className="w-full h-auto"
        role="img"
        aria-label="AtlasLLM workflow graph: router branches into Standard, Web, Pro Search and Deep Research; Deep Research fans out parallel searches and loops the reflector back to the planner before analysis and the writer."
      >
        {/* ── Edges ── */}
        <g fill="none" strokeLinecap="round">
          {EDGES.map((e) => {
            if (e.kind === "fan") {
              const paths = fanPaths();
              const active = !hovered && frame?.from === "search" && frame?.node === "reflector";
              return (
                <g key="fan">
                  {paths.map((d, i) => (
                    <g key={i}>
                      <path d={d} stroke="hsl(var(--foreground))" strokeOpacity={0.16} strokeWidth={1.3} />
                      {!reduced && (
                        <path
                          d={d}
                          stroke="hsl(var(--gold))"
                          strokeWidth={2}
                          strokeOpacity={active ? 0.9 : 0}
                          className="atlas-flow"
                          style={{ transition: "stroke-opacity 0.3s ease" }}
                        />
                      )}
                    </g>
                  ))}
                  <text
                    x={(NODES.search.x + NODES.reflector.x) / 2}
                    y={388}
                    textAnchor="middle"
                    fontFamily="'Roboto Mono', monospace"
                    fontSize={11}
                    fill="hsl(var(--foreground))"
                    fillOpacity={0.32}
                  >
                    parallel fan-out
                  </text>
                </g>
              );
            }
            const d = edgePath(e);
            const active = e.kind === "loop" ? loopActive : edgeActive(e);
            return (
              <g key={`${e.from}-${e.to}-${e.kind ?? ""}`}>
                <path
                  d={d}
                  stroke="hsl(var(--foreground))"
                  strokeOpacity={0.16}
                  strokeWidth={1.4}
                  strokeDasharray={e.kind === "loop" ? "2 6" : undefined}
                />
                {!reduced && (
                  <path
                    d={d}
                    stroke="hsl(var(--gold))"
                    strokeWidth={2.2}
                    strokeOpacity={active ? 0.95 : 0}
                    className="atlas-flow"
                    style={{ transition: "stroke-opacity 0.3s ease" }}
                  />
                )}
              </g>
            );
          })}

          {/* loop label */}
          <text
            x={(NODES.reflector.x + NODES.planner.x) / 2}
            y={236}
            textAnchor="middle"
            fontFamily="'Roboto Mono', monospace"
            fontSize={11}
            letterSpacing="0.06em"
            fill="hsl(var(--gold))"
            fillOpacity={loopActive ? 0.95 : 0.5}
            style={{ transition: "fill-opacity 0.3s ease" }}
          >
            reflect · up to 6×
          </text>
        </g>

        {/* ── Entry / exit ── */}
        <g>
          <circle cx={52} cy={290} r={4} fill="hsl(var(--gold))" />
          <line x1={56} y1={290} x2={leftEdge(NODES.router).x} y2={290} stroke="hsl(var(--foreground))" strokeOpacity={0.16} strokeWidth={1.4} />
          <text x={52} y={314} textAnchor="middle" fontFamily="'Roboto Mono', monospace" fontSize={10} letterSpacing="0.16em" fill="hsl(var(--foreground))" fillOpacity={0.4}>MSG</text>

          <line x1={rightEdge(NODES.suggestions).x} y1={290} x2={1356} y2={290} stroke="hsl(var(--foreground))" strokeOpacity={0.16} strokeWidth={1.4} />
          <circle cx={1360} cy={290} r={4} fill="hsl(var(--foreground))" fillOpacity={0.4} />
          <text x={1356} y={314} textAnchor="middle" fontFamily="'Roboto Mono', monospace" fontSize={10} letterSpacing="0.16em" fill="hsl(var(--foreground))" fillOpacity={0.4}>END</text>
        </g>

        {/* ── Fan-out lane dots ── */}
        {FAN_Y.map((fy) => (
          <circle key={fy} cx={(NODES.search.x + NODES.reflector.x) / 2} cy={fy} r={2.4} fill="hsl(var(--foreground))" fillOpacity={0.25} />
        ))}

        {/* ── Nodes ── */}
        {Object.entries(NODES).map(([id, n]) => {
          const current = isCurrent(id);
          const visited = isVisited(id);
          const on = current || visited;
          return (
            <g
              key={id}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "default" }}
            >
              <rect
                x={n.x - n.w / 2}
                y={n.y - H / 2}
                width={n.w}
                height={H}
                rx={8}
                fill={current ? "hsl(var(--gold) / 0.14)" : on ? "hsl(var(--gold) / 0.05)" : "hsl(var(--card))"}
                stroke={on ? "hsl(var(--gold))" : "hsl(var(--border))"}
                strokeWidth={current ? 1.8 : on ? 1.2 : 1}
                style={{ transition: "fill 0.3s ease, stroke 0.3s ease, stroke-width 0.3s ease" }}
              />
              <text
                x={n.x}
                y={n.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'Roboto Mono', monospace"
                fontSize={12}
                fill={on ? "hsl(var(--gold))" : "hsl(var(--foreground-soft))"}
                style={{ transition: "fill 0.3s ease" }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* caption */}
      <div className="mt-6 flex items-baseline gap-3 min-h-[1.5rem]">
        <span className="font-mono text-xs text-[hsl(var(--gold))]">{caption.label}</span>
        <span className="text-sm text-[hsl(var(--foreground-soft))]">{caption.purpose}</span>
      </div>
    </div>
  );
}
