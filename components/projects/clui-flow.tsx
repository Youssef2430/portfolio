"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Clui's runtime architecture, drawn as an animated graph. The renderer never
 * talks to a model directly: it hands the prompt to the main process, which
 * spawns `claude -p` and pipes its NDJSON event stream back to the UI. When a
 * tool wants to act, the PreToolUse hook detours through the permission UI and
 * resumes once you decide. A token tours a normal run, then a tool-call run.
 */

const H = 38;

type Node = { label: string; x: number; y: number; w: number; purpose: string };

const NODES: Record<string, Node> = {
  prompt: { label: "your prompt", x: 110, y: 70, w: 128, purpose: "You type or speak in the floating overlay (the renderer)." },
  main: { label: "main process", x: 330, y: 70, w: 132, purpose: "Electron main receives the prompt over IPC and owns the CLI." },
  cli: { label: "claude -p", x: 548, y: 70, w: 112, purpose: "Main spawns the Claude Code CLI as a child process via node-pty." },
  hook: { label: "PreToolUse hook", x: 778, y: 188, w: 150, purpose: "A local HTTP hook intercepts each Bash / Edit / Write before it runs." },
  perm: { label: "permission UI", x: 620, y: 300, w: 134, purpose: "You review the call and allow once, allow for the session, or deny." },
  stream: { label: "NDJSON stream", x: 330, y: 188, w: 140, purpose: "Events stream back line by line - messages, todos, tool calls." },
  render: { label: "live render", x: 110, y: 188, w: 120, purpose: "The renderer paints each event the moment it arrives." },
};

type Edge = { from: string; to: string; kind?: "loop" };

const EDGES: Edge[] = [
  { from: "prompt", to: "main" },
  { from: "main", to: "cli" },
  { from: "cli", to: "stream" },
  { from: "stream", to: "render" },
  { from: "cli", to: "hook" },
  { from: "hook", to: "perm" },
  { from: "perm", to: "cli", kind: "loop" },
];

const RUNS: Array<{ mode: string; path: string[] }> = [
  { mode: "Normal run", path: ["prompt", "main", "cli", "stream", "render"] },
  { mode: "Tool call", path: ["prompt", "main", "cli", "hook", "perm", "cli", "stream", "render"] },
];

function anchor(n: Node, towards: Node) {
  const dx = towards.x - n.x;
  const dy = towards.y - n.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return { x: n.x + Math.sign(dx) * (n.w / 2), y: n.y, horiz: true };
  }
  return { x: n.x, y: n.y + Math.sign(dy) * (H / 2), horiz: false };
}

function edgePath(e: Edge): string {
  const a = NODES[e.from];
  const b = NODES[e.to];
  const s = anchor(a, b);
  const t = anchor(b, a);
  const c1 = s.horiz ? { x: s.x + (t.x - s.x) * 0.5, y: s.y } : { x: s.x, y: s.y + (t.y - s.y) * 0.5 };
  const c2 = t.horiz ? { x: t.x - (t.x - s.x) * 0.5, y: t.y } : { x: t.x, y: t.y - (t.y - s.y) * 0.5 };
  return `M ${s.x} ${s.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${t.x} ${t.y}`;
}

export function CluiFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-20%" });
  const reduced = useReducedMotion();
  const [frameIdx, setFrameIdx] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);

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
    const id = setInterval(() => setFrameIdx((i) => (i + 1) % frames.length), 760);
    return () => clearInterval(id);
  }, [reduced, inView, frames.length]);

  const frame = reduced ? null : frames[frameIdx];
  const activeMode = frame?.mode ?? "Tool call";

  const isVisited = (id: string) => !hovered && frame?.visited.has(id);
  const isCurrent = (id: string) => (hovered ? hovered === id : frame?.node === id);
  const edgeActive = (e: Edge) => !hovered && frame?.from === e.from && frame?.node === e.to;

  const caption = hovered ? NODES[hovered] : frame ? NODES[frame.node] : NODES.cli;

  return (
    <div ref={ref}>
      <div className="mb-6 flex items-center gap-3">
        <span className="clui-mono text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--foreground-subtle))]">Active flow</span>
        <span className="clui-mono text-xs tracking-wide text-[hsl(var(--gold))]">{activeMode}</span>
      </div>

      <svg
        viewBox="0 0 920 360"
        className="h-auto w-full"
        role="img"
        aria-label="Clui architecture: the renderer sends a prompt to the main process, which spawns claude -p; events stream back as NDJSON to the live render. Tool calls detour through the PreToolUse hook and the permission UI before resuming."
      >
        {/* edges */}
        <g fill="none" strokeLinecap="round">
          {EDGES.map((e) => {
            const d = edgePath(e);
            const active = edgeActive(e);
            return (
              <g key={`${e.from}-${e.to}`}>
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
                    className="clui-flow-line"
                    style={{ transition: "stroke-opacity 0.3s ease" }}
                  />
                )}
              </g>
            );
          })}

          {/* loop label */}
          <text
            x={(NODES.perm.x + NODES.cli.x) / 2 - 6}
            y={186}
            textAnchor="middle"
            fontFamily="'DM Mono', monospace"
            fontSize={10.5}
            fill="hsl(var(--gold))"
            fillOpacity={0.7}
          >
            on allow · resume
          </text>
        </g>

        {/* entry */}
        <g>
          <circle cx={36} cy={70} r={4} fill="hsl(var(--gold))" />
          <line x1={40} y1={70} x2={anchor(NODES.prompt, NODES.main).x - NODES.prompt.w} y2={70} stroke="hsl(var(--foreground))" strokeOpacity={0.16} strokeWidth={1.4} />
        </g>

        {/* nodes */}
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
                rx={9}
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
                fontFamily="'DM Mono', monospace"
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
        <span className="clui-mono text-xs text-[hsl(var(--gold))]">{caption.label}</span>
        <span className="text-sm text-[hsl(var(--foreground-soft))]">{caption.purpose}</span>
      </div>
    </div>
  );
}
