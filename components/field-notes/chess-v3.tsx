"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { applyUci, parseBoard } from "@/lib/chess-board";
import { FenBoard, Pending, useRunData, type Incident, type ToolStep } from "./chess-lab";

/* ------------------------------------------------ the harness's own forfeit */

/**
 * Transcribed from runs/improved-v3-20260929/traces (the aborted first v3 run):
 * Claude Code's event stream for the very first decision, and what the harness read.
 */
const CLAUDE_EVENTS = [
  { kind: "text", body: "I’m playing Nc3 (b1c3). It develops the knight, supports a later e4 push and is the usual answer to Black’s King’s Indian/Grünfeld setup." },
  { kind: "tool_use", body: 'StructuredOutput  {"move": "b1c3"}' },
  { kind: "tool_result", body: "Structured output provided successfully" },
  { kind: "result", body: 'structured_output: {"move": "b1c3"}' },
];
const FALSE_START = { games: 12, rejected: 36, seconds: 103 };

export function FalseStart() {
  const [step, setStep] = useState(0);
  const [games, setGames] = useState(0);
  const total = CLAUDE_EVENTS.length + 3;
  useEffect(() => {
    if (step < total) {
      const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 700 : 850);
      return () => clearTimeout(t);
    }
    if (games < FALSE_START.games) {
      const t = setTimeout(() => setGames((g) => g + 1), 140);
      return () => clearTimeout(t);
    }
  }, [step, games, total]);
  const reads = step - CLAUDE_EVENTS.length;
  return (
    <section className="fn-experiment cl-falsestart" aria-label="The harness forfeits its own model">
      <div className="fn-lab-top">
        <span className="fn-kicker">Exhibit / The first v3 run, 23:54 UTC</span>
        <button
          className="fn-text-button"
          onClick={() => {
            setStep(0);
            setGames(0);
          }}
        >
          <RotateCcw size={12} /> Replay
        </button>
      </div>
      <div className="cl-fs-grid">
        <div>
          <span className="fn-kicker">What Claude Opus sent</span>
          <ol className="cl-fs-events">
            {CLAUDE_EVENTS.map((e, i) => (
              <li key={i} className={`is-${e.kind} ${i < step ? "is-in" : ""}`}>
                <span>{e.kind}</span>
                <code>{e.body}</code>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <span className="fn-kicker">What my harness read</span>
          <ol className="cl-fs-events is-harness">
            {[1, 2, 3].map((attempt) => (
              <li key={attempt} className={`is-reject ${attempt <= reads ? "is-in" : ""}`}>
                <span>attempt {attempt}</span>
                <code>
                  response: &quot;&quot; → missing_or_ambiguous_move
                </code>
              </li>
            ))}
          </ol>
          <div className={`cl-fs-tally ${reads >= 3 ? "is-in" : ""}`} aria-live="polite">
            <div className="cl-fs-games" aria-hidden="true">
              {Array.from({ length: FALSE_START.games }, (_, i) => (
                <i key={i} className={i < games ? "is-lost" : ""} />
              ))}
            </div>
            <p>
              <strong>{games}</strong> of {FALSE_START.games} games forfeited ·{" "}
              {FALSE_START.rejected} rejected requests · {Math.floor(FALSE_START.seconds / 60)}m{" "}
              {FALSE_START.seconds % 60}s
            </p>
          </div>
        </div>
      </div>
      <p className="fn-caption">
        Every Claude reply in the first attempt at v3 was a valid, schema-checked
        move, delivered in a field my code wasn’t reading. Opus and Sonnet
        each “lost” six games before the run was stopped.
      </p>
    </section>
  );
}

/* ---------------------------------------------------------- the Kc2 retry */

function Choices({ line, answer }: { line: string; answer: string }) {
  return (
    <>
      {line.split("; ").map((pair, i) => {
        const [uci, san] = pair.split(" = ");
        const hit = san?.toLowerCase() === answer.toLowerCase();
        return (
          <span key={i} className={hit ? "is-hit" : ""}>
            {i > 0 && "; "}
            <b>{uci}</b> = <em>{san}</em>
          </span>
        );
      })}
    </>
  );
}

export function RetryTrace() {
  const { data, failed } = useRunData("v3");
  const [pick, setPick] = useState(0);
  const [stage, setStage] = useState(3);
  const cases = useMemo(() => {
    if (!data) return [];
    return data.incidents
      .filter((i) => i.kind === "invalid")
      .map((bad) => ({
        bad,
        fix: data.incidents.find(
          (i) => i.bot === bad.bot && i.game === bad.game && i.ply === bad.ply && i.attempt === bad.attempt + 1,
        ) as Incident | undefined,
      }));
  }, [data]);
  if (!data || !cases.length)
    return (
      <section className="fn-experiment">
        <Pending failed={failed}>the retries</Pending>
      </section>
    );
  const { bad, fix } = cases[pick];
  const board = parseBoard(bad.fen!);
  const after = fix?.move ? applyUci(board, fix.move) : board;
  const steps = ["The menu", "Attempt 1", "Feedback", "Attempt 2"];
  return (
    <section className="fn-experiment cl-retry" aria-label="A rejected reply and its correction">
      <div className="fn-lab-top">
        <span className="fn-kicker">Experiment 03 / Say why, then ask again</span>
        <span className="fn-live-label">Gemini 3.8 Flash · game {bad.game} · ply {bad.ply}</span>
      </div>
      <div className="cl-cohort" role="group" aria-label="Case">
        {cases.map((c, i) => (
          <button key={i} aria-pressed={pick === i} onClick={() => setPick(i)}>
            “{c.bad.response}”
          </button>
        ))}
      </div>
      <div className="fn-pipeline cl-retry-steps">
        {steps.map((name, i) => (
          <button key={name} aria-pressed={i === stage} onClick={() => setStage(i)}>
            <span>0{i + 1}</span>
            {name}
            <ArrowRight size={14} />
          </button>
        ))}
      </div>
      <div className="cl-retry-grid">
        <FenBoard
          board={stage === 3 ? after : board}
          move={stage === 3 ? fix?.move : null}
          label="The position Gemini was asked about"
        />
        <div className="cl-retry-log">
          <div className={`cl-retry-row ${stage >= 0 ? "is-in" : ""}`}>
            <span className="cl-role">prompt ›</span> Legal choices (UCI = SAN):{" "}
            <Choices line={bad.choices ?? ""} answer={stage >= 1 ? bad.response : ""} />
          </div>
          {stage >= 1 && (
            <div className="cl-retry-row is-in is-bad">
              <span className="cl-role">gemini ›</span> <mark>{bad.response}</mark>
              <small>
                {bad.seconds}s · rejected: {bad.error}
              </small>
            </div>
          )}
          {stage >= 2 && (
            <div className="cl-retry-row is-in is-harness">
              <span className="cl-role">harness ›</span>
              <pre>{bad.feedback}</pre>
            </div>
          )}
          {stage >= 3 && fix && (
            <div className="cl-retry-row is-in is-good">
              <span className="cl-role">gemini ›</span>
              <span className="cl-retry-answer">{fix.response}</span>
              <small>
                {fix.seconds}s · accepted {fix.move} ({fix.san}) via {fix.method?.replace("_", " ")}
              </small>
            </div>
          )}
        </div>
      </div>
      <p className="fn-caption">
        All three of Flash’s invalid replies were a king move in SAN, copied
        from the right-hand side of the menu. Each was fixed on the second
        attempt. Nothing was converted for it: the model had to send the move again.
      </p>
    </section>
  );
}

/* ------------------------------------------------ Gemini reaches for a shell */

type Step = ToolStep;
/** Milliseconds each kind of event stays on screen at 1× speed. */
const DWELL: Record<string, number> = { thought: 1100, tool: 2200, permission: 2400, denied: 2000, answer: 1800 };

function useTyped(text: string, run: boolean, perTick = 3) {
  const [n, setN] = useState(0);
  const [prev, setPrev] = useState(text);
  if (prev !== text) {
    setPrev(text);
    setN(0);
  }
  useEffect(() => {
    if (!run || n >= text.length) return;
    const t = setTimeout(() => setN((x) => Math.min(text.length, x + perTick)), 16);
    return () => clearTimeout(t);
  }, [run, n, text, perTick]);
  return run ? text.slice(0, n) : text;
}

export function ToolIncident() {
  const { data, failed } = useRunData("v3");
  const steps = useMemo(() => (data?.toolIncident?.steps ?? []) as Step[], [data]);
  const [at, setAt] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const toolAt = steps.findIndex((s) => s.kind === "tool");
  const turnAt = steps.findIndex((s, i) => i > toolAt && s.kind === "thought");
  const last = steps.length - 1;
  const active = playing && at < last;
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(true);
        else setAt(steps.length - 1);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [seen, steps.length]);
  useEffect(() => {
    if (!active) return;
    const kind = at >= 0 ? steps[at].kind : "thought";
    const t = setTimeout(() => setAt((i) => i + 1), (at < 0 ? 400 : DWELL[kind]) / speed);
    return () => clearTimeout(t);
  }, [active, at, steps, speed]);
  const current = at >= 0 ? steps[at] : null;
  const thoughtIdx = (() => {
    for (let i = at; i >= 0; i--) if (steps[i]?.kind === "thought") return i;
    return -1;
  })();
  const thought = thoughtIdx >= 0 ? (steps[thoughtIdx] as Extract<Step, { kind: "thought" }>) : null;
  const typed = useTyped(thought?.text ?? "", active && current?.kind === "thought", Math.ceil(4 * speed));
  const earlier = steps
    .slice(0, Math.max(0, thoughtIdx))
    .filter((s): s is Extract<Step, { kind: "thought" }> => s.kind === "thought")
    .slice(-3);
  const toolStage = at >= toolAt ? Math.min(3, at - toolAt + 1) : 0; // 1 command, 2 dialog, 3 denied
  const command = useTyped(`echo "e1g1"`, active && current?.kind === "tool", 1);
  if (!data?.toolIncident)
    return (
      <section className="fn-experiment">
        <Pending failed={failed}>the trace</Pending>
      </section>
    );
  const incident = data.toolIncident;
  const done = at >= last;
  const permission = steps[toolAt + 1] as Extract<Step, { kind: "permission" }> | undefined;
  const thoughtsBefore = steps.slice(0, toolAt).filter((x) => x.kind === "thought").length;
  const thoughtsAfter = steps.slice(toolAt).filter((x) => x.kind === "thought").length;
  const seek = (i: number) => {
    setPlaying(false);
    setAt(Math.max(-1, Math.min(last, i)));
  };
  return (
    <section ref={sectionRef} className="fn-experiment cl-trace" aria-label="Gemini 3.1 Pro attempts a tool call">
      <div className="fn-lab-top">
        <span className="fn-kicker">Experiment 04 / The model that reached for a terminal</span>
        <span className="fn-live-label">
          Gemini 3.1 Pro · game {incident.game} · ply {incident.ply} · {incident.seconds}s
        </span>
      </div>
      <h2>{incident.seconds} seconds inside one decision</h2>

      <div className="cl-rail" aria-hidden="true">
        {steps.map((st, i) => (
          <button
            key={i}
            tabIndex={-1}
            className={`is-${st.kind} ${i <= at ? "is-past" : ""} ${i === at ? "is-now" : ""} ${i === turnAt ? "is-turn" : ""}`}
            onClick={() => seek(i)}
            title={st.kind === "thought" ? st.title : st.kind}
          />
        ))}
      </div>
      <input
        className="cl-rail-scrub"
        type="range"
        min={-1}
        max={last}
        value={at}
        onChange={(e) => seek(Number(e.target.value))}
        aria-label="Scrub through the decision’s events"
        aria-valuetext={`Event ${at + 1} of ${steps.length}${current?.kind === "thought" ? `: ${current.title}` : current ? `: ${current.kind}` : ""}`}
      />

      <div className={`cl-trace-grid ${current && current.kind !== "thought" && current.kind !== "answer" ? "is-tool" : ""}`}>
        <div className={`cl-mind ${thoughtIdx === turnAt && at >= turnAt ? "is-turn" : ""}`}>
          <span className="cl-pane-label">
            Reasoning · thought {thoughtIdx >= 0 ? steps.slice(0, thoughtIdx + 1).filter((x) => x.kind === "thought").length : 0} of{" "}
            {thoughtsBefore + thoughtsAfter}
          </span>
          <ol className="cl-mind-earlier" aria-hidden="true">
            {earlier.map((e, i) => (
              <li key={`${e.title}-${i}`} style={{ opacity: 0.25 + i * 0.2 }}>
                {e.title}
              </li>
            ))}
          </ol>
          {thought ? (
            <div className="cl-mind-now" key={thoughtIdx}>
              {thoughtIdx === turnAt && <span className="cl-mind-flag">The model notices</span>}
              <strong>{thought.title}</strong>
              <p>
                {typed}
                {typed.length < thought.text.length && <i className="cl-caret" />}
              </p>
            </div>
          ) : (
            <div className="cl-mind-now is-idle">
              <strong>Session started</strong>
              <p>Fresh session, no tools, one position to think about.</p>
            </div>
          )}
          {at >= last && current?.kind === "answer" && (
            <div className="cl-mind-answer">
              <span>final answer</span>
              <code>{current.text}</code>
            </div>
          )}
        </div>

        <div className={`cl-sandbox stage-${toolStage}`}>
          <div className="cl-sandbox-bar">
            <i />
            <i />
            <i />
            <span>sandbox · throwaway temp dir</span>
          </div>
          <div className="cl-sandbox-body">
            {toolStage === 0 ? (
              <p className="cl-sandbox-idle">No tool calls. Every permission request will be refused.</p>
            ) : (
              <>
                <p className="cl-sandbox-cmd">
                  <span>$</span> {toolStage === 1 ? command : `echo "e1g1"`}
                  {toolStage === 1 && <i className="cl-caret" />}
                </p>
                {toolStage >= 2 && permission && (
                  <div className="cl-dialog" role="group" aria-label="Permission request">
                    <span>Gemini wants to run a command</span>
                    <div>
                      {permission.options.map((o) => (
                        <em key={o} className={o === "Deny" ? (toolStage >= 3 ? "is-chosen" : "is-target") : ""}>
                          {o}
                        </em>
                      ))}
                    </div>
                    <small>{toolStage >= 3 ? "harness chose: Deny" : "harness is answering…"}</small>
                  </div>
                )}
                {toolStage >= 3 && (
                  <div className="cl-denied-stamp">
                    <span>Rejected by user</span>
                    <small>tool call recorded</small>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="cl-trace-controls">
        <button className="fn-button" onClick={() => (done ? (setAt(-1), setPlaying(true)) : setPlaying(!active))}>
          {active ? <Pause size={13} /> : done ? <RotateCcw size={13} /> : <Play size={13} />}
          {active ? "Pause" : done ? "Replay" : at >= 0 ? "Resume" : "Play"}
        </button>
        <button className="fn-button" onClick={() => seek(toolAt - 1)} disabled={at >= toolAt}>
          <SkipForward size={13} /> To the tool call
        </button>
        <div className="cl-cohort" role="group" aria-label="Playback speed">
          {[1, 3, 8].map((x) => (
            <button key={x} aria-pressed={speed === x} onClick={() => setSpeed(x)}>
              {x}×
            </button>
          ))}
        </div>
        <span className="cl-trace-count">
          event {Math.max(0, at + 1)}/{steps.length}
        </span>
      </div>

      {done && (
        <div className="cl-verdict is-forfeit cl-trace-verdict">
          <strong>Disqualified: “Tool use invalidates unaided chess benchmark”</strong>
          <p>
            {thoughtsBefore} thoughts, one shell command to print a move it had already
            chosen, then {thoughtsAfter} more thoughts and a legal answer, h2h3. The move
            didn’t matter. Once a tool call is observed, the result can’t be called unaided.
          </p>
        </div>
      )}
      <p className="fn-caption">
        Antigravity’s event stream for this one request, in order, with long
        thoughts trimmed. Nothing ran: the harness refuses every permission
        request. The dialog’s options are the ones the client offered.
      </p>
    </section>
  );
}
