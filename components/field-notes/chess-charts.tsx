"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { resolveMove } from "@/lib/move-resolver";
import { Pending, useRunData, type Model, type Outcome, type RunData } from "./chess-lab";

/**
 * True once the element has been at least `threshold` visible. A callback ref,
 * because these figures render a loading state first and mount their real
 * element only when the data arrives.
 */
function useInView<T extends Element>(threshold = 0.35) {
  const [el, setEl] = useState<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!el || seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [el, seen, threshold]);
  return [setEl, seen] as const;
}

/* --------------------------------------------- the opening: forfeits, re-judged */

export function ForfeitFlip() {
  const { data, failed } = useRunData("v2");
  const [ref, seen] = useInView<HTMLElement>(0.4);
  // Until the reader picks a judge, v3 takes over as soon as the figure is seen.
  const [choice, setV3] = useState<boolean | null>(null);
  const v3 = choice ?? seen;
  const [flipped, setFlipped] = useState(0);
  const total = data?.forfeits.length ?? 0;
  // Flip the cards one by one after the figure comes into view, or when toggled.
  useEffect(() => {
    if (!seen || !total) return;
    const target = v3 ? total : 0;
    if (flipped === target) return;
    const t = setTimeout(() => setFlipped((n) => n + (target > n ? 1 : -1)), flipped === 0 && v3 ? 500 : 110);
    return () => clearTimeout(t);
  }, [seen, v3, flipped, total]);
  if (!data)
    return (
      <section className="fn-experiment">
        <Pending failed={failed}>the forfeits</Pending>
      </section>
    );
  const short = (bot: string) =>
    (data.models.find((m) => m.id === bot)?.label ?? bot).replace(/^Claude /, "");
  return (
    <section ref={ref} className="fn-experiment cc-chart cc-flip" aria-label="The twelve v2 forfeits, judged again by v3">
      <div className="fn-lab-top">
        <span className="fn-kicker">Figure 1 / Twelve forfeits, re-judged</span>
        <div className="cl-cohort" role="group" aria-label="Judge">
          <button aria-pressed={!v3} onClick={() => setV3(false)}>
            v2 judge
          </button>
          <button aria-pressed={v3} onClick={() => setV3(true)}>
            v3 judge
          </button>
        </div>
      </div>
      <div className="cc-flip-head">
        <strong aria-live="polite">{total - flipped}</strong>
        <p>
          games lost to formatting
          <br />
          <span>
            {flipped === total ? "under v3, which reads every one of them correctly" : flipped === 0 ? "under v2, all by legal moves with sentences attached" : "re-judging…"}
          </span>
        </p>
      </div>
      <ol className="cc-flip-grid">
        {data.forfeits.map((f, i) => {
          const move = resolveMove(f.response, f.legalMoves).move;
          return (
            <li key={`${f.bot}-${f.game}`} className={i < flipped ? "is-flipped" : ""}>
              <div className="cc-card">
                <div className="cc-card-face is-front">
                  <span>{short(f.bot)} · game {f.game}</span>
                  <strong>forfeit</strong>
                  <small>{f.response.replace(/\s+/g, " ").slice(0, 46)}…</small>
                </div>
                <div className="cc-card-face is-back">
                  <span>{short(f.bot)} · game {f.game}</span>
                  <strong>{move}</strong>
                  <small>{f.response.split(/\s+/).length} words, one move</small>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="fn-caption">
        Every game Claude lost to the format rule in v2. Each reply ended with a
        legal move on its own line; v3’s parser reads exactly that line, and in
        every case it’s the move the model said it wanted.
      </p>
    </section>
  );
}

/** One fixed order everywhere, so a model keeps its row across charts. */
const ORDER = [
  "gpt-6-astra",
  "gpt-6-sol",
  "gpt-6-luna",
  "claude-opus-5-5",
  "claude-sonnet-5-5",
  "gemini-3.1-pro",
  "gemini-3.8-flash",
];
const OUTCOMES: { key: Outcome; label: string; note: string }[] = [
  { key: "clean", label: "Clean", note: "accepted on the first try, in the requested format" },
  { key: "recovered", label: "Recovered", note: "move read from an unambiguous final line" },
  { key: "retried", label: "Retried", note: "needed a second attempt (invalid reply, timeout or interruption)" },
  { key: "forfeit", label: "Forfeit", note: "no valid move; the game was lost" },
  { key: "stopped", label: "Stopped", note: "a service error or disqualification ended the decision" },
];
const byOrder = (a: Model, b: Model) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id);
const fmtSeconds = (s: number) => (s >= 100 ? `${Math.round(s)}s` : s >= 10 ? `${s.toFixed(0)}s` : `${s.toFixed(1)}s`);

/** A tooltip that follows the pointer inside a positioned figure. */
function useTip() {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number; body: ReactNode } | null>(null);
  const show = (event: React.PointerEvent | React.MouseEvent, body: ReactNode) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    // Clamp here, in the handler, so rendering never has to measure the figure.
    const x = Math.min(event.clientX - box.left + 14, box.width - 230);
    setTip({ x, y: event.clientY - box.top + 14, body });
  };
  const hide = () => setTip(null);
  const node = tip && (
    <div className="cc-tip" role="tooltip" style={{ left: tip.x, top: tip.y }}>
      {tip.body}
    </div>
  );
  return [ref, show, hide, node] as const;
}

function useBoth() {
  const v2 = useRunData("v2");
  const v3 = useRunData("v3");
  return { v2: v2.data, v3: v3.data, failed: v2.failed || v3.failed };
}

/* ------------------------------------------------ where each decision went */

function FlowBar({
  model,
  cohort,
  onTip,
  hide,
}: {
  model: Model;
  cohort: string;
  onTip: (e: React.PointerEvent, body: ReactNode) => void;
  hide: () => void;
}) {
  const total = model.decisions || 1;
  const parts = OUTCOMES.filter((o) => model.outcome[o.key] > 0);
  const help = model.outcome.recovered + model.outcome.retried;
  return (
    <div className="cc-flow-row">
      <span className="cc-flow-cohort">{cohort}</span>
      <div className="cc-flow-bar" role="img" aria-label={`${model.label}, ${cohort}: ${parts.map((p) => `${model.outcome[p.key]} ${p.label.toLowerCase()}`).join(", ")}`}>
        {parts.map((p) => (
          <i
            key={p.key}
            className={`oc-${p.key}`}
            style={{ flexGrow: model.outcome[p.key], minWidth: 3 }}
            onPointerMove={(e) =>
              onTip(
                e,
                <>
                  <strong>
                    {model.label} · {cohort}
                  </strong>
                  <span>
                    <i className={`cc-key oc-${p.key}`} /> {p.label}: {model.outcome[p.key]} of {model.decisions} decisions (
                    {((model.outcome[p.key] / total) * 100).toFixed(1)}%)
                  </span>
                  <small>{p.note}</small>
                </>,
              )
            }
            onPointerLeave={hide}
          />
        ))}
      </div>
      <span className="cc-flow-note">
        {model.outcome.forfeit > 0 ? (
          <>
            <i className="cc-key oc-forfeit" /> {model.outcome.forfeit} forfeit{model.outcome.forfeit === 1 ? "" : "s"}
          </>
        ) : model.outcome.stopped > 0 ? (
          <>
            <i className="cc-key oc-stopped" /> stopped
          </>
        ) : help > 0 ? (
          <>
            <i className={`cc-key ${model.outcome.recovered >= model.outcome.retried ? "oc-recovered" : "oc-retried"}`} />{" "}
            {help} rescued
          </>
        ) : (
          "all clean"
        )}
      </span>
    </div>
  );
}

export function DecisionFlow() {
  const { v2, v3, failed } = useBoth();
  const [tipRef, showTip, hideTip, tipNode] = useTip();
  const [table, setTable] = useState(false);
  if (!v2 || !v3)
    return (
      <section className="fn-experiment">
        <Pending failed={failed}>both runs</Pending>
      </section>
    );
  const rows = [...v3.models].sort(byOrder).map((m) => ({ v3: m, v2: v2.models.find((x) => x.id === m.id)! }));
  const sum = (d: RunData, k: Outcome) => d.models.reduce((a, m) => a + m.outcome[k], 0);
  return (
    <section className="fn-experiment cc-chart" aria-label="How every decision was resolved, v2 against v3">
      <div className="fn-lab-top">
        <span className="fn-kicker">Figure 4 / Where every decision went</span>
        <button className="fn-text-button" onClick={() => setTable(!table)} aria-pressed={table}>
          {table ? "Show chart" : "Show table"}
        </button>
      </div>
      <div className="cc-stats">
        <div>
          <strong>{sum(v2, "forfeit")}</strong>
          <span>games forfeited on format, v2</span>
        </div>
        <div>
          <strong>{sum(v3, "forfeit")}</strong>
          <span>games forfeited on format, v3</span>
        </div>
        <div>
          <strong>{sum(v3, "recovered") + sum(v3, "retried")}</strong>
          <span>v3 decisions that needed rescuing</span>
        </div>
      </div>
      <div className="cc-legend">
        {OUTCOMES.map((o) => (
          <span key={o.key}>
            <i className={`cc-key oc-${o.key}`} /> {o.label}
          </span>
        ))}
      </div>
      {table ? (
        <table className="cl-table cc-table">
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">Run</th>
              {OUTCOMES.map((o) => (
                <th scope="col" key={o.key}>
                  {o.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.flatMap(({ v2: a, v3: b }) =>
              [
                ["v2", a],
                ["v3", b],
              ].map(([c, m]) => (
                <tr key={`${(m as Model).id}-${c}`}>
                  <th scope="row">{(m as Model).label}</th>
                  <td>{c as string}</td>
                  {OUTCOMES.map((o) => (
                    <td key={o.key}>{(m as Model).outcome[o.key]}</td>
                  ))}
                </tr>
              )),
            )}
          </tbody>
        </table>
      ) : (
        <div className="cc-flow" ref={tipRef}>
          {rows.map(({ v2: a, v3: b }) => (
            <div className="cc-flow-model" key={b.id}>
              <span className="cc-flow-name">{b.label}</span>
              <FlowBar model={a} cohort="v2" onTip={showTip} hide={hideTip} />
              <FlowBar model={b} cohort="v3" onTip={showTip} hide={hideTip} />
            </div>
          ))}
          <div className="cc-flow-axis" aria-hidden="true">
            <span>0%</span>
            <span>50%</span>
            <span>100% of decisions</span>
          </div>
          {tipNode}
        </div>
      )}
      <p className="fn-caption">
        Each bar is one model’s decisions in one run, as shares. v2 ran up to ten
        games per model at low effort; v3 ran two at high effort, so the bars
        compare proportions, not volume.
      </p>
    </section>
  );
}

/* ------------------------------------------------- what the thinking cost */

const W = 640;
export function PriceOfThinking({ number = "2" }: { number?: string }) {
  const { v2, v3, failed } = useBoth();
  const [plotRef, drawn] = useInView<HTMLDivElement>(0.45);
  const [tipRef, showTip, hideTip, tipNode] = useTip();
  const [focus, setFocus] = useState<string | null>(null);
  const rows = useMemo(
    () =>
      v2 && v3
        ? [...v3.models]
            .sort(byOrder)
            .map((b) => ({ b, a: v2.models.find((m) => m.id === b.id)! }))
            .filter(({ a, b }) => a.medianSeconds && b.medianSeconds && a.meanCpl != null && b.meanCpl != null)
        : [],
    [v2, v3],
  );
  if (!v2 || !v3)
    return (
      <section className="fn-experiment">
        <Pending failed={failed}>both runs</Pending>
      </section>
    );
  const H = 360,
    L = 56,
    R = 24,
    T = 20,
    B = 44;
  const lx = (s: number) => L + ((Math.log10(s) - Math.log10(2)) / (Math.log10(200) - Math.log10(2))) * (W - L - R);
  const ly = (c: number) => T + (1 - c / 130) * (H - T - B);
  // Hand-placed labels: Opus and Flash land within a pixel of each other in v3.
  const labelAt: Record<string, [number, number, "start" | "end"]> = {
    "gpt-6-astra": [8, -10, "start"],
    "gpt-6-sol": [8, 4, "start"],
    "gpt-6-luna": [8, 4, "start"],
    "claude-opus-5-5": [-10, 16, "end"],
    "claude-sonnet-5-5": [-8, -9, "end"],
    "gemini-3.1-pro": [8, 4, "start"],
    "gemini-3.8-flash": [8, 14, "start"],
  };
  return (
    <section className="fn-experiment cc-chart" aria-label="Seconds per move against move quality, v2 to v3">
      <div className="fn-lab-top">
        <span className="fn-kicker">Figure {number} / What high effort bought</span>
        <span className="fn-live-label">hollow = v2 · filled = v3</span>
      </div>
      <div className={`cc-plot ${drawn ? "is-drawn" : ""}`} ref={plotRef}>
        <div ref={tipRef} className="cc-plot-inner">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Connected scatter of median seconds per move against average centipawn loss for each model, from protocol 2 to protocol 3">
          <defs>
            <marker id="cc-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" className="cc-arrowhead" />
            </marker>
          </defs>
          {[0, 25, 50, 75, 100, 125].map((c) => (
            <g key={c}>
              <line x1={L} x2={W - R} y1={ly(c)} y2={ly(c)} className="cc-grid" />
              <text x={L - 8} y={ly(c) + 3} textAnchor="end" className="cc-tick">
                {c}
              </text>
            </g>
          ))}
          {[2, 5, 10, 20, 50, 100, 200].map((s) => (
            <text key={s} x={lx(s)} y={H - B + 18} textAnchor="middle" className="cc-tick">
              {s}s
            </text>
          ))}
          <text x={L} y={H - 6} className="cc-axis">
            Median seconds per move (log scale) →
          </text>
          <text x={14} y={T + 4} className="cc-axis" transform={`rotate(-90 14 ${T + 4})`} textAnchor="end">
            ← Avg. loss per move (centipawns)
          </text>
          <text x={L + 8} y={ly(4)} className="cc-better">
            ↙ faster and more accurate
          </text>
          {rows.map(({ a, b }, index) => {
            const dim = focus && focus !== b.id;
            const [dx, dy, anchor] = labelAt[b.id] ?? [8, 4, "start"];
            const x1 = lx(a.medianSeconds!),
              y1 = ly(a.meanCpl!),
              x2 = lx(b.medianSeconds!),
              y2 = ly(b.meanCpl!);
            const len = Math.hypot(x2 - x1, y2 - y1) || 1;
            const body = (
              <>
                <strong>{b.label}</strong>
                <span>
                  {fmtSeconds(a.medianSeconds!)} → {fmtSeconds(b.medianSeconds!)} per move
                </span>
                <span>
                  avg. loss {a.meanCpl} → {b.meanCpl} cp
                </span>
                <span>
                  output tokens / move {a.medianOutputTokens ?? "n/a"} → {b.medianOutputTokens ?? "n/a"}
                </span>
                <small>
                  {a.analysed} → {b.analysed} analysed moves
                  {b.analysed < 20 && " · tiny sample"}
                </small>
              </>
            );
            return (
              <g
                key={b.id}
                style={{ "--i": index } as React.CSSProperties}
                className={`cc-model ${dim ? "is-dim" : ""} ${focus === b.id ? "is-focus" : ""}`}
                onPointerEnter={() => setFocus(b.id)}
                onPointerMove={(e) => showTip(e, body)}
                onPointerLeave={() => {
                  setFocus(null);
                  hideTip();
                }}
              >
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2 - ((x2 - x1) / len) * 7}
                  y2={y2 - ((y2 - y1) / len) * 7}
                  className="cc-link"
                  pathLength={1}
                  markerEnd="url(#cc-arrow)"
                />
                <circle cx={x1} cy={y1} r="5" className="cc-v2" />
                <circle cx={x2} cy={y2} r={b.analysed < 20 ? 4 : 5.5} className={`cc-v3 ${b.analysed < 20 ? "is-thin" : ""}`} />
                <text x={x2 + dx} y={y2 + dy} textAnchor={anchor} className="cc-label">
                  {b.label}
                </text>
                <circle cx={x2} cy={y2} r="16" className="cc-hit" />
                <circle cx={x1} cy={y1} r="12" className="cc-hit" />
              </g>
            );
          })}
        </svg>
        {tipNode}
        </div>
      </div>
      <p className="fn-caption">
        Centipawn loss: how far each move fell short of Stockfish 17.1’s choice
        at 50,000 nodes, averaged over the model’s own decisions. Lower is better.
        v2 and v3 played different numbers of games from different openings; treat
        each arrow as a direction, not a measurement. Gemini 3.1 Pro’s v3 point
        rests on six moves.
      </p>
    </section>
  );
}

/* -------------------------------------------------------- every wait, dotted */

export function LatencyStrip() {
  const { v2, v3, failed } = useBoth();
  const [tipRef, showTip, hideTip, tipNode] = useTip();
  if (!v2 || !v3)
    return (
      <section className="fn-experiment">
        <Pending failed={failed}>both runs</Pending>
      </section>
    );
  const models = [...v3.models].sort(byOrder);
  const L = 128,
    R = 20,
    rowH = 44,
    T = 26,
    H = T + models.length * rowH + 30;
  const x = (s: number) => L + ((Math.log10(Math.max(1, s)) - 0) / Math.log10(600)) * (W - L - R);
  // Deterministic jitter keeps the dots still between renders.
  const jitter = (i: number) => ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 5;
  return (
    <section className="fn-experiment cc-chart" aria-label="Every accepted decision's wall-clock time">
      <div className="fn-lab-top">
        <span className="fn-kicker">Figure 5 / Every wait, one dot each</span>
        <span className="fn-live-label">
          {models.reduce((a, m) => a + m.seconds.length, 0) + v2.models.reduce((a, m) => a + m.seconds.length, 0)} decisions
        </span>
      </div>
      <div className="cc-legend">
        <span>
          <i className="cc-key cc-key-v2" /> v2, low effort
        </span>
        <span>
          <i className="cc-key cc-key-v3" /> v3, high effort
        </span>
        <span>
          <i className="cc-key cc-key-median" /> median
        </span>
      </div>
      <div className="cc-plot" ref={tipRef}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Strip plot of seconds per decision by model, v2 and v3, on a log scale">
          {[1, 3, 10, 30, 100, 300].map((s) => (
            <g key={s}>
              <line x1={x(s)} x2={x(s)} y1={T - 6} y2={H - 26} className="cc-grid" />
              <text x={x(s)} y={H - 10} textAnchor="middle" className="cc-tick">
                {s}s
              </text>
            </g>
          ))}
          {[
            [120, "v2 timeout"],
            [360, "v3 timeout"],
          ].map(([s, label]) => (
            <g key={label}>
              <line x1={x(s as number)} x2={x(s as number)} y1={T - 10} y2={H - 26} className="cc-limit" />
              <text x={x(s as number) - 4} y={T - 14} textAnchor="end" className="cc-tick">
                {label}
              </text>
            </g>
          ))}
          {models.map((m, row) => {
            const before = v2.models.find((a) => a.id === m.id)!;
            const y0 = T + row * rowH;
            const med = (xs: number[]) => {
              const s = [...xs].sort((a, b) => a - b);
              return s.length ? (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2 : 0;
            };
            return (
              <g key={m.id}>
                <text x={0} y={y0 + 18} className="cc-row-label">
                  {m.label}
                </text>
                {[
                  [before.seconds, y0 + 8, "cc-dot-v2", "v2"],
                  [m.seconds, y0 + 24, "cc-dot-v3", "v3"],
                ].map(([secs, cy, cls, c]) => {
                  const list = secs as number[];
                  const md = med(list);
                  return (
                    <g key={c as string}>
                      {list.map((s, i) => (
                        <circle key={i} cx={x(s)} cy={(cy as number) + jitter(i + row * 997) - 2.5} r="2.2" className={cls as string} />
                      ))}
                      {list.length > 0 && (
                        <>
                          <line x1={x(md)} x2={x(md)} y1={(cy as number) - 7} y2={(cy as number) + 7} className="cc-median" />
                          <rect
                            x={L}
                            y={(cy as number) - 8}
                            width={W - L - R}
                            height={16}
                            className="cc-hit"
                            onPointerMove={(e) =>
                              showTip(
                                e,
                                <>
                                  <strong>
                                    {m.label} · {c as string}
                                  </strong>
                                  <span>median {fmtSeconds(md)} per move</span>
                                  <span>
                                    slowest {fmtSeconds(Math.max(...list))} · fastest {fmtSeconds(Math.min(...list))}
                                  </span>
                                  <small>{list.length} accepted decisions</small>
                                </>,
                              )
                            }
                            onPointerLeave={hideTip}
                          />
                        </>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
        {tipNode}
      </div>
      <p className="fn-caption">
        Wall-clock seconds per accepted decision, including client start-up.
        Retries and failed attempts are not dots. Their time is in Figure 3.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------ the long night */

const KIND_CLASS: Record<string, string> = {
  ok: "tl-ok",
  recovered: "oc-recovered",
  "retry-ok": "oc-retried",
  invalid: "oc-forfeit",
  timeout: "oc-retried is-hollow",
  interrupted: "oc-retried is-hollow",
  service: "oc-stopped",
  tool: "oc-forfeit",
};
const KIND_LABEL: Record<string, string> = {
  ok: "accepted first try",
  recovered: "recovered from the final line",
  "retry-ok": "accepted on a retry",
  invalid: "rejected reply",
  timeout: "timed out or interrupted",
  interrupted: "interrupted by a restart",
  service: "service error",
  tool: "tool call, disqualified",
};

export function RunTimeline() {
  const { data, failed } = useRunData("v3");
  const [tipRef, showTip, hideTip, tipNode] = useTip();
  if (!data?.timeline)
    return (
      <section className="fn-experiment">
        <Pending failed={failed}>the timeline</Pending>
      </section>
    );
  const { timeline } = data;
  const t0 = Date.parse(timeline.start);
  const models = [...data.models].sort(byOrder);
  const L = 128,
    R = 16,
    T = 54,
    lane = 30,
    H = T + models.length * lane + 34;
  const x = (s: number) => L + (s / timeline.seconds) * (W - L - R);
  const firstHour = Math.ceil(t0 / 3_600_000) * 3_600_000;
  const hours = [];
  for (let t = firstHour; t < t0 + timeline.seconds * 1000; t += 3_600_000) hours.push(t);
  const markers = [
    ...data.executions.slice(1).map((e, i) => ({
      at: Date.parse(e.at),
      label: `resume ${i + 1}`,
    })),
  ];
  const amendments = data.amendments.map((a) => ({
    at: Date.parse(a.at),
    label: a.games ? `schedule ${a.games[0]} → ${a.games[1]} games` : a.concurrency ? `GPT slots ${a.concurrency[0]} → ${a.concurrency[1]}` : "amended",
  }));
  const requests = Object.values(timeline.lanes).reduce((a, l) => a + l.length, 0);
  const busy = Object.values(timeline.lanes).reduce((a, l) => a + l.reduce((s, r) => s + r[1], 0), 0);
  const clock = (ms: number) => new Date(ms).toISOString().slice(11, 16);
  return (
    <section className="fn-experiment cc-chart" aria-label="Every request of the v3 run on a wall clock">
      <div className="fn-lab-top">
        <span className="fn-kicker">Figure 3 / One night, {requests} requests</span>
        <span className="fn-live-label">
          {clock(t0)}–{clock(t0 + timeline.seconds * 1000)} UTC
        </span>
      </div>
      <div className="cc-stats">
        <div>
          <strong>
            {Math.floor(timeline.seconds / 3600)}h {Math.round((timeline.seconds % 3600) / 60)}m
          </strong>
          <span>wall clock</span>
        </div>
        <div>
          <strong>{(busy / 3600).toFixed(1)}h</strong>
          <span>of model time, overlapped</span>
        </div>
        <div>
          <strong>{requests}</strong>
          <span>requests, {data.executions.length} processes</span>
        </div>
      </div>
      <div className="cc-legend">
        {["ok", "recovered", "retry-ok", "timeout", "invalid"].map((k) => (
          <span key={k}>
            <i className={`cc-key ${KIND_CLASS[k]}`} /> {KIND_LABEL[k]}
          </span>
        ))}
      </div>
      <div className="cc-plot" ref={tipRef}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Timeline of all v3 requests by model, with restarts and amendments marked">
          {hours.map((h) => (
            <g key={h}>
              <line x1={x((h - t0) / 1000)} x2={x((h - t0) / 1000)} y1={T - 4} y2={H - 28} className="cc-grid" />
              <text x={x((h - t0) / 1000)} y={H - 12} textAnchor="middle" className="cc-tick">
                {clock(h)}
              </text>
            </g>
          ))}
          {[...markers, ...amendments].map((m, i) => {
            const mx = x((m.at - t0) / 1000);
            const isAmend = i >= markers.length;
            // The first amendment and restart sit close together: label it leftwards.
            const left = (isAmend ? i - markers.length : i) === 0;
            return (
              <g key={`${m.label}-${i}`}>
                <line x1={mx} x2={mx} y1={isAmend ? 12 : 30} y2={H - 28} className={isAmend ? "cc-amend" : "cc-resume"} />
                <text
                  x={left ? mx - 4 : mx + 4}
                  y={isAmend ? 20 : 38}
                  textAnchor={left ? "end" : "start"}
                  className="cc-marker"
                >
                  {m.label}
                </text>
              </g>
            );
          })}
          {models.map((m, row) => {
            const y = T + row * lane;
            const reqs = timeline.lanes[m.id] ?? [];
            return (
              <g key={m.id}>
                <text x={0} y={y + lane / 2 + 3} className="cc-row-label">
                  {m.label}
                </text>
                <line x1={L} x2={W - R} y1={y + lane / 2} y2={y + lane / 2} className="cc-lane" />
                {reqs.map(([start, dur, kind], i) => (
                  <rect
                    key={i}
                    x={x(start)}
                    y={y + 7 + (kind === "ok" ? 3 : 0)}
                    width={Math.max(1.2, x(start + dur) - x(start) - 0.6)}
                    height={kind === "ok" ? lane - 20 : lane - 14}
                    rx="1"
                    className={`tl-req ${KIND_CLASS[kind] ?? "tl-ok"}`}
                  />
                ))}
                {m.status === "blocked" && (
                  <text x={x(reqs.at(-1)![0] + reqs.at(-1)![1]) + 6} y={y + lane / 2 + 3} className="cc-marker is-alert">
                    disqualified
                  </text>
                )}
                <rect
                  x={L}
                  y={y}
                  width={W - L - R}
                  height={lane}
                  className="cc-hit"
                  onPointerMove={(e) => {
                    const box = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                    const at = ((((e.clientX - box.left) / box.width) * W - L) / (W - L - R)) * timeline.seconds;
                    const hit =
                      reqs.find(([s, d]) => at >= s && at <= s + d) ??
                      reqs.reduce((best, r) => (Math.abs(r[0] - at) < Math.abs(best[0] - at) ? r : best), reqs[0]);
                    if (!hit) return;
                    const [s, d, kind, ply, attempt, game] = hit;
                    showTip(
                      e,
                      <>
                        <strong>{m.label}</strong>
                        <span>
                          game {game} · ply {ply}
                          {attempt > 1 ? ` · attempt ${attempt}` : ""}
                        </span>
                        <span>
                          <i className={`cc-key ${KIND_CLASS[kind]}`} /> {KIND_LABEL[kind] ?? kind}
                        </span>
                        <small>
                          {clock(t0 + s * 1000)} UTC · {fmtSeconds(d)}
                        </small>
                      </>,
                    );
                  }}
                  onPointerLeave={hideTip}
                />
              </g>
            );
          })}
        </svg>
        {tipNode}
      </div>
      <p className="fn-caption">
        Every request of the v3 run on one clock, from the ledger’s own timestamps.
        Solid rules mark amendments to the run; dotted ones, the two restarts that
        resumed it from its journal. Nothing was lost across either.
      </p>
    </section>
  );
}
