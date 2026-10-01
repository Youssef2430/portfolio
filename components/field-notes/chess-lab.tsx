"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  parseBoard,
  squareIndex,
  squareName,
  type Square,
} from "@/lib/chess-board";
import { resolveMove } from "@/lib/move-resolver";
import { SecretRoom } from "./secret-room";

/* ------------------------------------------------------------------ data */

type Ply = {
  n: number;
  u: string;
  s: string;
  f: string;
  m?: 1;
  e?: number | null;
  b?: string | null;
  l?: number | null;
  r?: string;
  t?: number;
  /** Protocol 3 only: how the move was recovered, and each attempt's outcome. */
  pm?: string;
  a?: string[];
};
export type Game = {
  bot: string;
  id: string;
  llmWhite: boolean;
  result: string;
  termination: string;
  opening: string;
  seconds: number;
  start: string | null;
  book?: string[];
  plies: Ply[];
  forfeit?: { ply: number; response: string; fen: string };
};
export type Forfeit = {
  bot: string;
  game: string;
  ply: number;
  side: "white" | "black";
  fen: string;
  prompt: string;
  legalMoves: string[];
  response: string;
  firstMention: string | null;
  lastToken: string | null;
};
export type Outcome = "clean" | "recovered" | "retried" | "forfeit" | "stopped";
export type Model = {
  id: string;
  label: string;
  vendor: string;
  status: string | null;
  finished: boolean;
  decisions: number;
  outcome: Record<Outcome, number>;
  failures: Record<string, number>;
  unfinished: number;
  seconds: number[];
  outputTokens: number | null;
  analysed: number;
  requests: number;
  games: number;
  completed: number;
  wins: number;
  draws: number;
  losses: number;
  forfeits: number;
  checkmated: number;
  aborted: number;
  medianSeconds: number | null;
  medianOutputTokens: number | null;
  meanCpl: number | null;
  medianCpl: number | null;
  bestMoveMatch: number | null;
  blunders: number;
};
export type Incident = {
  bot: string;
  game: string;
  ply: number;
  attempt: number;
  kind: string;
  method: string | null;
  error: string | null;
  response: string;
  move: string | null;
  san: string | null;
  seconds: number | null;
  at: string;
  /** Rejected attempts only. */
  fen?: string;
  choices?: string | null;
  feedback?: string | null;
};
export type ToolStep =
  | { kind: "thought"; title: string; text: string }
  | { kind: "tool"; title: string; cwd: string | null }
  | { kind: "permission"; options: string[] }
  | { kind: "denied"; text: string }
  | { kind: "answer"; text: string };
export type Cohort = "v2" | "v3";
export type RunData = {
  cohort: Cohort;
  protocol: string;
  startedAt: string;
  settings: { effort: string; attempts: number; timeout: number; structured: boolean };
  amendments: { at: string; reason: string; games?: [number, number]; concurrency?: [number, number] }[];
  executions: { at: string; resume: boolean }[];
  incidents: Incident[];
  toolIncident: {
    bot: string;
    game: string;
    ply: number;
    fen: string;
    seconds: number;
    steps: ToolStep[];
  } | null;
  timeline: {
    start: string;
    seconds: number;
    /** [start s, duration s, kind, ply, attempt, game] per request. */
    lanes: Record<string, [number, number, string, number, number, string][]>;
  } | null;
  snapshot: string;
  plannedGamesPerModel: number;
  opponent: { engine: string; uciElo: number; secondsPerMove: number };
  analysis: { engine: string; nodes: number };
  models: Model[];
  forfeits: Forfeit[];
  games: Game[];
};

const requests = new Map<Cohort, Promise<RunData>>();
/** Each protocol lives in its own file; both are fetched once and shared. */
export function useRunData(cohort: Cohort = "v2") {
  const [state, setState] = useState<{ cohort: Cohort; data: RunData | null; failed: boolean }>({
    cohort,
    data: null,
    failed: false,
  });
  useEffect(() => {
    if (!requests.has(cohort))
      requests.set(
        cohort,
        fetch(`/blog/data/chessllm-${cohort}.json`).then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        }),
      );
    let live = true;
    requests.get(cohort)!.then(
      (data) => live && setState({ cohort, data, failed: false }),
      () => {
        requests.delete(cohort);
        if (live) setState({ cohort, data: null, failed: true });
      },
    );
    return () => {
      live = false;
    };
  }, [cohort]);
  // Never hand back the previous cohort's data while the new one loads.
  return state.cohort === cohort ? state : { cohort, data: null, failed: false };
}
export const labelOf = (data: RunData, bot: string) =>
  data.models.find((m) => m.id === bot)?.label ?? bot;

export function CohortSwitch({
  value,
  set,
  label = "Protocol",
}: {
  value: Cohort;
  set: (c: Cohort) => void;
  label?: string;
}) {
  return (
    <div className="cl-cohort" role="group" aria-label={label}>
      {(["v2", "v3"] as const).map((c) => (
        <button key={c} aria-pressed={value === c} onClick={() => set(c)}>
          {c === "v2" ? "v2 · strict" : "v3 · recovery"}
        </button>
      ))}
    </div>
  );
}

export function Pending({ failed, children }: { failed: boolean; children: string }) {
  return (
    <p className="cl-pending" role="status">
      {failed
        ? "The run data didn’t load. Refresh to try again."
        : `Loading ${children}…`}
    </p>
  );
}

/* ----------------------------------------------------------------- board */

const GLYPH: Record<string, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};
const PIECE_NAME: Record<string, string> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};

export type BoardArrow = { uci: string; tone: "engine" | "you" | "model" };

export function FenBoard({
  board,
  flip = false,
  move,
  arrow,
  arrows = [],
  label,
}: {
  board: Square[];
  flip?: boolean;
  move?: string | null;
  /** Shorthand for a single engine-suggestion arrow. */
  arrow?: string | null;
  arrows?: BoardArrow[];
  label: string;
}) {
  const id = useId();
  const order = Array.from({ length: 64 }, (_, i) => (flip ? 63 - i : i));
  const lit = move
    ? [squareIndex(move.slice(0, 2)), squareIndex(move.slice(2, 4))]
    : [];
  const centre = (square: string) => {
    let i = squareIndex(square);
    if (flip) i = 63 - i;
    return [(i % 8) + 0.5, Math.floor(i / 8) + 0.5];
  };
  const all: BoardArrow[] = [...(arrow ? [{ uci: arrow, tone: "engine" as const }] : []), ...arrows];
  const lines = all.map(({ uci, tone }) => {
    const [x1, y1] = centre(uci.slice(0, 2)),
      [x2, y2] = centre(uci.slice(2, 4));
    const length = Math.hypot(x2 - x1, y2 - y1) || 1;
    // Stop short of the centre so the head doesn't sit on the piece.
    return { tone, x1, y1, x2: x2 - ((x2 - x1) / length) * 0.3, y2: y2 - ((y2 - y1) / length) * 0.3 };
  });
  return (
    <div className="cl-board" role="img" aria-label={label}>
      {order.map((i) => {
        const piece = board[i];
        const dark = (Math.floor(i / 8) + (i % 8)) % 2 === 1;
        const row = Math.floor(order.indexOf(i) / 8),
          col = order.indexOf(i) % 8;
        return (
          <span
            key={i}
            className={`${dark ? "is-dark" : ""} ${lit.includes(i) ? "is-lit" : ""}`}
          >
            {piece && (
              <b
                className={
                  piece === piece.toUpperCase() ? "is-white" : "is-black"
                }
                title={`${piece === piece.toUpperCase() ? "White" : "Black"} ${PIECE_NAME[piece.toLowerCase()]}`}
              >
                {GLYPH[piece.toLowerCase()]}
                {"\uFE0E"}
              </b>
            )}
            {col === 0 && <small className="cl-rank">{squareName(i)[1]}</small>}
            {row === 7 && <small className="cl-file">{squareName(i)[0]}</small>}
          </span>
        );
      })}
      {lines.length > 0 && (
        <svg viewBox="0 0 8 8" aria-hidden="true">
          <defs>
            {(["engine", "you", "model"] as const).map((tone) => (
              <marker
                key={tone}
                id={`${id}-${tone}`}
                viewBox="0 0 4 4"
                refX="2"
                refY="2"
                markerWidth="3"
                markerHeight="3"
                orient="auto"
                className={`cl-head is-${tone}`}
              >
                <path d="M0,0 L4,2 L0,4 Z" />
              </marker>
            ))}
          </defs>
          {lines.map((l, i) => (
            <line
              key={i}
              className={`cl-arrow is-${l.tone}`}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              markerEnd={`url(#${id}-${l.tone})`}
            />
          ))}
        </svg>
      )}
    </div>
  );
}

/* ------------------------------------------------- you are the model */

const SAN =
  /^([KQRBN])?([a-h])?([1-8])?x?([a-h][1-8])(=?[QRBNqrbn])?[+#!?]*$/;
/** Best effort only: used to tell a reader which UCI move their SAN meant. */
function sanToUci(san: string, f: Forfeit) {
  if (/^(o-o|0-0)(-o|-0)?[+#]?$/i.test(san)) {
    const long = /^(o-o-o|0-0-0)/i.test(san);
    const rank = f.side === "white" ? "1" : "8";
    const castle = `e${rank}${long ? "c" : "g"}${rank}`;
    return f.legalMoves.includes(castle) ? castle : null;
  }
  const m = san.match(SAN);
  if (!m) return null;
  const board = parseBoard(f.fen);
  const kind = (m[1] ?? "P").toLowerCase();
  const hits = f.legalMoves.filter((uci) => {
    const piece = board[squareIndex(uci.slice(0, 2))]?.toLowerCase();
    return (
      piece === kind &&
      uci.slice(2, 4) === m[4] &&
      (!m[2] || uci[0] === m[2]) &&
      (!m[3] || uci[1] === m[3]) &&
      (!m[5] || uci[4] === m[5].replace("=", "").toLowerCase())
    );
  });
  return hits.length === 1 ? hits[0] : null;
}

type Verdict = {
  tone: "legal" | "forfeit" | "aside" | "retry";
  title: string;
  body: string;
  move?: string;
  /** Ends the position: an accepted move, a forfeit, or a disqualification. */
  counts?: boolean;
  secret?: boolean;
  /** The correction the v3 harness appends to the prompt before the next attempt. */
  feedback?: string;
};

const SHELL = /^(\$\s*|!\s*)?(echo|ls|cd|rm|cat|vim|nano|git|bash|zsh|sh|python3?|node|npx|curl|wget|stockfish|exit|clear)\b/;
const RESOLVED_BY: Record<string, string> = {
  strict: "a bare move, the ideal answer",
  json: "a JSON object, the same contract Codex and Claude were held to",
  code_block: "one move alone in a final code block",
  marked_final: "a final line marked as the move",
  final_line: "a final line holding exactly one move, the rule that rescued 15 Gemini replies",
};

/** Replies that mean the same thing under either protocol. */
function aside(lower: string, f: Forfeit, model: string, protocol: Cohort): Verdict | null {
  if (/^sudo\b/.test(lower))
    return {
      tone: "aside",
      title: "Permission denied",
      body: "The arbiter is not in the sudoers file, and neither are you. This incident will be reported to the knight.",
    };
  if (SHELL.test(lower))
    return protocol === "v3"
      ? {
          tone: "forfeit",
          title: "Disqualified: tool use",
          body: `“Tool use invalidates unaided chess benchmark.” Gemini 3.1 Pro tried exactly this in the real run: it opened a shell to run echo "e1g1". It didn’t work for Gemini either.`,
          counts: true,
        }
      : {
          tone: "aside",
          title: "zsh: this is a chessboard",
          body: "It only understands one command, and that command looks like e2e4. (v3 is less forgiving about this. Try it there.)",
        };
  if (lower === "yolo")
    return {
      tone: "aside",
      title: "Mode not available",
      body: "Google’s client really does ship a session mode called YOLO: “Auto-approve all tools.” The harness answers every permission request with no.",
    };
  if (lower === "/plan")
    return {
      tone: "aside",
      title: "/plan",
      body: "Antigravity advertises this command to every chess session: “generates an implementation plan artifact and awaits user approval.” The knight does not await approval.",
    };
  if (lower === "resume" || lower === "--resume")
    return {
      tone: "aside",
      title: "Resumed from checkpoint",
      body: "Journal replayed, FEN and history validated, attempt budget restored exactly as it was. You still have to move.",
    };
  if (["help", "?", "man chess"].includes(lower))
    return {
      tone: "aside",
      title: "Usage",
      body:
        protocol === "v2"
          ? "Reply with exactly one legal UCI move from the list above. There are no flags. There are no options. There is only the list."
          : `Reply with a legal UCI move: bare, as {"move": "…"}, or alone on your final line after any analysis you like. Three attempts. No tools.`,
    };
  if (lower === "hint")
    return {
      tone: "aside",
      title: "Hint",
      body: `${model} tried ${f.lastToken} here. It was legal. It did not help.`,
    };
  if (["knight", "♞", "horsey"].includes(lower))
    return {
      tone: "aside",
      title: "The knight has been expecting you",
      body: "It hasn’t been allowed on the board all article. Take it for a walk.",
      secret: true,
    };
  if (lower === "42")
    return {
      tone: "aside",
      title: "That’s the seed",
      body: "Every schedule in both runs was generated from seed 42. It is not, however, a move.",
    };
  if (lower === "retry")
    return {
      tone: "aside",
      title: protocol === "v2" ? "No retries in v2" : "Retries are automatic",
      body:
        protocol === "v2"
          ? "One reply, one chance. That was the whole point of v2, and the whole problem."
          : "Up to three attempts per decision, each told exactly why the last one failed.",
    };
  return null;
}

function judgeV2(reply: string, f: Forfeit, model: string): Verdict {
  const lower = reply.toLowerCase();
  // Protocol 2: strip whitespace, then the whole reply must be one legal move.
  if (f.legalMoves.includes(lower))
    return {
      tone: "legal",
      title: "✓ Accepted",
      body:
        lower === f.lastToken
          ? `Same move ${model} chose. You just didn’t explain it, which is the entire difference between you and a forfeit.`
          : `${model} wanted ${f.lastToken}. Different idea, but yours arrived without a paragraph attached, so yours counts.`,
      move: lower,
      counts: true,
    };
  if (!reply)
    return { tone: "forfeit", title: "× Forfeit", body: "An empty reply. Silence is also not a move.", counts: true };
  if (lower === "0000")
    return {
      tone: "forfeit",
      title: "× Forfeit, with style",
      body: "0000 is UCI’s null move: valid protocol, illegal chess. Nobody has tried that on me before. It still forfeits.",
      counts: true,
    };
  if (["resign", "gg", "i resign", "draw?", "draw"].includes(lower))
    return {
      tone: "forfeit",
      title: "× Forfeit",
      body: "Noted with respect. It isn’t a UCI move either, so technically you forfeited twice.",
      counts: true,
    };
  if (lower === "e2e4")
    return { tone: "forfeit", title: "× Illegal", body: "A great first move. This is not the first move.", counts: true };
  if (reply.startsWith("{"))
    return {
      tone: "forfeit",
      title: "× Forfeit: v2 doesn’t read JSON",
      body: "Structured output arrives in v3. Here, even a perfectly formed object is ‘other text’.",
      counts: true,
    };
  const san = sanToUci(reply, f);
  if (san)
    return {
      tone: "forfeit",
      title: "× Forfeit: that’s SAN",
      body: `The prompt asked for UCI. You meant ${san}. Version one of my harness would have converted it for you. Version two doesn’t negotiate.`,
      counts: true,
    };
  const words = reply.split(/\s+/);
  const buried = words
    .map((w) => w.toLowerCase().replace(/[^a-h1-8qrbn]/g, ""))
    .find((w) => f.legalMoves.includes(w));
  if (buried)
    return {
      tone: "forfeit",
      title: "× Forfeit",
      body: `${buried} is legal, but it came with ${words.length - 1} extra word${words.length === 2 ? "" : "s"}. Exactly how ${model} lost this position. Welcome to the club.`,
      counts: true,
    };
  if (/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(lower))
    return {
      tone: "forfeit",
      title: "× Illegal move",
      body: `${lower} isn’t in the list. For the record, across this whole run not one model picked a move outside the list. They only ever lost by talking.`,
      counts: true,
    };
  return {
    tone: "forfeit",
    title: "× Forfeit",
    body: "That isn’t a UCI move. The harness logs it as “Expected exactly one legal UCI move” and ends the game.",
    counts: true,
  };
}

function judgeV3(reply: string, f: Forfeit, model: string, attempt: number, max: number): Verdict {
  const r = resolveMove(reply, f.legalMoves);
  if (r.move)
    return {
      tone: "legal",
      title: attempt > 1 ? `✓ Accepted on attempt ${attempt}` : "✓ Accepted",
      body: `Recovered from ${RESOLVED_BY[r.method]}.${r.move === f.lastToken ? ` It’s also the move ${model} meant here, which v3 would have played too.` : ""}`,
      move: r.move,
      counts: true,
    };
  const san = sanToUci(reply, f);
  const why =
    reply.toLowerCase() === "0000"
      ? "0000 is UCI’s null move. Legal protocol, illegal chess."
      : san
        ? `That’s SAN. You meant ${san}. Gemini 3.8 Flash did this three times in the real run, answering Kc2 when the menu said “d3c2 = Kc2”. The retry fixed it every time.`
        : r.error === "illegal_move"
          ? `${r.method === "strict" ? reply.trim().toLowerCase() : "That move"} isn’t legal here.`
          : reply.trim()
            ? "There’s no single move in an unambiguous place. v3 never guesses between moves mentioned in prose."
            : "An empty reply.";
  const feedback = `Your previous response was rejected (${r.error}).\nPrevious response: ${reply.trim().slice(0, 60) || "(empty)"}\nChoose from the listed legal moves. Return only the requested move format.`;
  if (attempt >= max)
    return {
      tone: "forfeit",
      title: `× Forfeit after ${max} attempts`,
      body: `${why} No valid move after the bounded correction attempts. In the real v3 run, nobody got here.`,
      counts: true,
    };
  return {
    tone: "retry",
    title: `↻ Rejected: ${r.error} · attempt ${attempt} of ${max}`,
    body: why,
    feedback,
  };
}

function judge(raw: string, f: Forfeit, model: string, protocol: Cohort, attempt: number): Verdict {
  const reply = raw.trim();
  return (
    aside(reply.toLowerCase(), f, model, protocol) ??
    (protocol === "v2" ? judgeV2(reply, f, model) : judgeV3(raw, f, model, attempt, 3))
  );
}

export function Highlight({
  text: raw,
  token,
  at,
}: {
  text: string;
  token: string | null;
  at: "first" | "last";
}) {
  // Some replies contain runs of blank lines; one is enough to show the gap.
  const text = raw.replace(/\n{3,}/g, "\n\n");
  if (!token) return <>{text}</>;
  const i = at === "first" ? text.indexOf(token) : text.lastIndexOf(token);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark>{token}</mark>
      {text.slice(i + token.length)}
    </>
  );
}

export function YouAreTheModel() {
  const { data, failed } = useRunData("v2");
  const inputId = useId();
  const [protocol, setProtocol] = useState<Cohort>("v2");
  const [index, setIndex] = useState(0);
  const [reply, setReply] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [transcript, setTranscript] = useState<{ reply: string; feedback: string }[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [tally, setTally] = useState({ legal: 0, forfeit: 0 });
  const [secret, setSecret] = useState(false);
  const [finalReply, setFinalReply] = useState("");
  const [showFull, setShowFull] = useState(false);
  const promptRef = useRef<HTMLPreElement>(null);
  const positions = useMemo(
    () => [...(data?.forfeits ?? [])].sort((a, b) => a.ply - b.ply),
    [data],
  );
  const answered = verdict?.counts === true;
  useEffect(() => {
    const el = promptRef.current;
    if (el) el.scrollTop = transcript.length ? el.scrollHeight : 0;
  }, [transcript, index]);
  useEffect(() => {
    if (startedAt === null || answered) return;
    const timer = setInterval(() => setElapsed(Date.now() - startedAt), 100);
    return () => clearInterval(timer);
  }, [startedAt, answered]);
  if (!data || !positions.length)
    return (
      <section className="fn-experiment cl-model">
        <Pending failed={failed}>the positions</Pending>
      </section>
    );
  const f = positions[index % positions.length];
  const model = labelOf(data, f.bot);
  const median = data.models.find((m) => m.id === f.bot)?.medianSeconds;
  const before = parseBoard(f.fen);
  const v3Pick = resolveMove(f.response, f.legalMoves).move;
  function submit() {
    const v = judge(reply, f, model, protocol, transcript.length + 1);
    setVerdict(v);
    if (v.secret) setSecret(true);
    if (v.feedback) {
      setTranscript((t) => [...t, { reply, feedback: v.feedback! }]);
      setReply("");
    }
    if (v.counts) setFinalReply(reply);
    if (v.counts)
      setTally((t) =>
        v.tone === "legal" ? { ...t, legal: t.legal + 1 } : { ...t, forfeit: t.forfeit + 1 },
      );
  }
  function reset(nextIndex = index) {
    setIndex(nextIndex);
    setReply("");
    setVerdict(null);
    setTranscript([]);
    setStartedAt(null);
    setElapsed(0);
    setFinalReply("");
    setShowFull(false);
  }
  return (
    <section className={`fn-experiment cl-model is-${protocol}`} aria-label="Play one move as the model">
      <div className="fn-lab-top">
        <span className="fn-kicker">Experiment 01 / You are the model</span>
        <span className="fn-live-label">
          Position {(index % positions.length) + 1} of {positions.length}
        </span>
      </div>
      <h2>Here’s the exact prompt. Reply the way the rules want.</h2>
      <p>
        Every position below is one where a model forfeited under protocol v2.
        Same prompt, same judge. {model} took {median ?? "a few"} seconds per
        move on median. Then flip the switch and play the same position under
        v3’s rules.
      </p>
      <div className="cl-terminal">
        <div className="cl-terminal-bar">
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <i aria-hidden="true" />
          <span>
            chessllm · {protocol === "v2" ? "protocol 2 · strict" : "protocol 3 · recovery"} · {f.side} to move
          </span>
          <CohortSwitch
            value={protocol}
            set={(c) => {
              setProtocol(c);
              reset();
            }}
            label="Judge"
          />
          <span className="cl-clock">{(elapsed / 1000).toFixed(1)}s</span>
        </div>
        <pre className="cl-prompt" ref={promptRef}>
          <span className="cl-role">prompt ›</span>
          {"\n"}
          {f.prompt}
          {transcript.map((t, i) => (
            <span key={i} className="cl-transcript">
              {"\n\n"}
              <span className="cl-role">you ›</span> {t.reply || "(empty)"}
              {"\n"}
              <span className="cl-harness">{t.feedback}</span>
            </span>
          ))}
        </pre>
        <form
          className="cl-reply"
          onSubmit={(e) => {
            e.preventDefault();
            if (!answered) submit();
          }}
        >
          <label htmlFor={inputId} className="cl-role">
            you ›
          </label>
          <textarea
            id={inputId}
            value={reply}
            disabled={answered}
            rows={Math.min(6, reply.split("\n").length)}
            onFocus={() => startedAt === null && setStartedAt(Date.now())}
            onChange={(e) => {
              setReply(e.target.value);
              if (verdict && !verdict.counts && verdict.tone !== "retry") setVerdict(null);
            }}
            onKeyDown={(e) => {
              // Enter sends; Shift+Enter writes the "analysis, then a final line" reply v3 can read.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!answered) submit();
              }
            }}
            placeholder={
              protocol === "v2"
                ? "type a move, e.g. e7e6"
                : 'a move, {"move": "…"}, or analysis + Shift+Enter + a move'
            }
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={600}
          />
          <button type="submit" disabled={answered} aria-label="Send reply">
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
      {verdict && (
        <div className={`cl-verdict is-${verdict.tone}`} role="status">
          <strong>{verdict.title}</strong>
          <p>{verdict.body}</p>
        </div>
      )}
      {answered && (
        <div className="cl-duel">
          <div className="cl-duel-board">
            <FenBoard
              board={before}
              flip={f.side === "black"}
              arrows={[
                ...(v3Pick ? [{ uci: v3Pick, tone: "model" as const }] : []),
                ...(verdict?.move ? [{ uci: verdict.move, tone: "you" as const }] : []),
              ]}
              label={`The position, with your move${verdict?.move ? ` ${verdict.move}` : ""} and ${model}’s move ${v3Pick ?? ""} drawn as arrows`}
            />
            <div className="cl-duel-keys">
              <span>
                <i className="is-you" /> you{verdict?.move ? ` · ${verdict.move}` : " · no move"}
              </span>
              <span>
                <i className="is-model" /> {model} · {v3Pick}
              </span>
            </div>
          </div>
          <div className="cl-duel-cards">
            {[
              {
                who: "You",
                tone: "you",
                text: finalReply,
                meta: `${(elapsed / 1000).toFixed(1)}s${transcript.length ? ` · ${transcript.length + 1} attempts` : ""}`,
                v2: f.legalMoves.includes(finalReply.trim().toLowerCase()) ? finalReply.trim().toLowerCase() : null,
                v3: resolveMove(finalReply, f.legalMoves).move,
                disqualified: verdict?.title.startsWith("Disqualified"),
              },
              {
                who: model,
                tone: "model",
                text: f.response,
                meta: `game ${f.game} · ply ${f.ply} · ${f.response.split(/\s+/).length} words`,
                v2: null,
                v3: v3Pick,
                disqualified: false,
              },
            ].map((c) => {
              const long = c.tone === "model" && c.text.length > 160 && !showFull;
              return (
                <article key={c.tone} className={`cl-duel-card is-${c.tone}`}>
                  <header>
                    <strong>{c.who}</strong>
                    <small>{c.meta}</small>
                  </header>
                  <blockquote className={long ? "is-clamped" : ""}>
                    <Highlight text={c.text.trim() || "(empty)"} token={c.v3} at="last" />
                  </blockquote>
                  {c.tone === "model" && c.text.length > 160 && (
                    <button className="fn-text-button" onClick={() => setShowFull(!showFull)}>
                      {showFull ? "Collapse" : "Read the whole reply"}
                    </button>
                  )}
                  <div className="cl-duel-judges">
                    <p>
                      <span>v2 judge</span>
                      <b className={c.v2 ? "is-ok" : "is-bad"}>{c.v2 ? `plays ${c.v2}` : "forfeit"}</b>
                    </p>
                    <p>
                      <span>v3 judge</span>
                      <b className={c.disqualified ? "is-bad" : c.v3 ? "is-ok" : "is-bad"}>
                        {c.disqualified ? "disqualified" : c.v3 ? `plays ${c.v3}` : "forfeit"}
                      </b>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="cl-duel-next">
            <p className="fn-caption">
              {verdict?.move && verdict.move === v3Pick
                ? `Same move as ${model}. The only difference between you was the paragraph.`
                : verdict?.move
                  ? `Different moves. Neither is graded here: this terminal only checks what the harness checks.`
                  : `${model} at least found a legal move. It just buried it.`}
            </p>
            <button className="fn-button" onClick={() => reset(index + 1)}>
              Next position <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
      <div className="fn-validator-footer">
        <span>
          You: {tally.legal} accepted · {tally.forfeit} forfeited
        </span>
        <span>
          The models on these positions: v2 0/{positions.length} · v3 {positions.filter((p) => resolveMove(p.response, p.legalMoves).move).length}/{positions.length}
        </span>
      </div>
      {secret && (
        <div className="cl-secret">
          <SecretRoom kind="chess" revealed />
        </div>
      )}
    </section>
  );
}

/* --------------------------------------------------------- parser lab */

const PARSERS = [
  {
    id: "v2",
    label: "v2 · whole reply",
    note: "Strip whitespace. The entire reply must be one legal move. This is the rule the run used.",
    pick: (f: Forfeit) =>
      f.legalMoves.includes(f.response.trim().toLowerCase()) ? f.response.trim() : null,
    at: "first" as const,
  },
  {
    id: "v1",
    label: "v1 · first move mentioned",
    note: "My 2025 parser: search the reply for the first move-shaped string that happens to be legal.",
    pick: (f: Forfeit) => f.firstMention,
    at: "first" as const,
  },
  {
    id: "last",
    label: "Last word",
    note: "Take the final token. Tempting, because every reply ended with the model’s actual choice. Also fragile: “e7e6, though d7d5 is fine” would play d7d5.",
    pick: (f: Forfeit) =>
      f.lastToken && f.legalMoves.includes(f.lastToken) ? f.lastToken : null,
    at: "last" as const,
  },
  {
    id: "v3",
    label: "v3 · unambiguous places",
    note: "Protocol 3: a bare move, a JSON object, one move alone in a final code block, a line marked “Final move:”, or a final line holding exactly one move. Anything else is rejected with feedback, never guessed.",
    pick: (f: Forfeit) => resolveMove(f.response, f.legalMoves).move,
    at: "last" as const,
  },
];

export function ParserLab() {
  const { data, failed } = useRunData("v2");
  const [judge, setJudge] = useState(1);
  const [row, setRow] = useState<string | null>(null);
  if (!data)
    return (
      <section className="fn-experiment">
        <Pending failed={failed}>the forfeits</Pending>
      </section>
    );
  const key = (f: Forfeit) => `${f.bot}-${f.game}`;
  // Open on the reply where the judges disagree most: the one v1 gets wrong.
  const selected =
    data.forfeits.find((f) => key(f) === row) ??
    data.forfeits.find((f) => f.firstMention && f.firstMention !== f.lastToken) ??
    data.forfeits[0];
  const p = PARSERS[judge];
  const pick = p.pick(selected);
  const wrong = pick && pick !== selected.lastToken;
  const short = (bot: string) => labelOf(data, bot).replace(/^Claude /, "").replace(/ 5\.5$/, "");
  return (
    <section className="fn-experiment cl-parsers" aria-label="Parser comparison">
      <div className="fn-lab-top">
        <span className="fn-kicker">Experiment 02 / Pick a parser</span>
        <span className="fn-live-label">{data.forfeits.length} real replies</span>
      </div>
      <h2>Same replies. Four judges.</h2>
      <div className="cl-matrix" role="group" aria-label="What each parser extracts from each reply">
        <div className="cl-matrix-head">
          <span>Reply</span>
          {PARSERS.map((option, i) => {
            const picks = data.forfeits.map((f) => option.pick(f));
            const ok = picks.filter(Boolean).length;
            const bad = data.forfeits.filter((f, j) => picks[j] && picks[j] !== f.lastToken).length;
            return (
              <button
                key={option.id}
                aria-pressed={judge === i}
                aria-label={`${option.label}: ${ok} of ${data.forfeits.length} accepted${bad ? `, ${bad} wrong` : ""}`}
                onClick={() => setJudge(i)}
              >
                <span>{option.label}</span>
                <strong>
                  {ok}/{data.forfeits.length}
                </strong>
                <small>{bad ? `${bad} wrong move` : ok ? "all as intended" : "all forfeit"}</small>
              </button>
            );
          })}
        </div>
        <div className="cl-matrix-body">
          {data.forfeits.map((f) => (
            <button
              key={key(f)}
              className="cl-matrix-row"
              aria-label={`${labelOf(data, f.bot)} game ${f.game}: ${PARSERS.map((o) => `${o.label} ${o.pick(f) ?? "forfeit"}`).join(", ")}`}
              aria-pressed={key(f) === key(selected)}
              onClick={() => setRow(key(f))}
            >
              <span className="cl-matrix-reply" aria-hidden="true">
                <b>
                  {short(f.bot)} · g{f.game}
                </b>
                {f.response.replace(/\s+/g, " ").trim()}
              </span>
              {PARSERS.map((option, i) => {
                const m = option.pick(f);
                const tone = !m ? "is-forfeit" : m !== f.lastToken ? "is-wrong" : "is-ok";
                return (
                  <span key={option.id} aria-hidden="true" className={`cl-cell ${tone} ${i === judge ? "is-col" : ""}`}>
                    {m ?? "×"}
                  </span>
                );
              })}
            </button>
          ))}
        </div>
      </div>
      <div className={`cl-matrix-detail ${wrong ? "is-wrong" : pick ? "is-ok" : "is-forfeit"}`} aria-live="polite">
        <header>
          <span>
            {labelOf(data, selected.bot)} · game {selected.game} · ply {selected.ply}
          </span>
          <em>
            {p.label}: {pick ? (wrong ? `plays ${pick}, which the model rejected` : `plays ${pick}`) : "forfeit"}
          </em>
        </header>
        <blockquote className="cl-quote">
          <Highlight text={selected.response} token={pick} at={p.at} />
        </blockquote>
        <p>{p.note}</p>
      </div>
      <p className="fn-caption">
        Every reply that forfeited a game under v2, verbatim. Green: the move
        the model meant. Gold: a legal move it didn’t choose. Choose a row to
        read it; choose a column to see how that judge reads it.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------ replay */

const verdictOf = (g: Game) => {
  const won = (g.result === "1-0") === g.llmWhite && g.result !== "1/2-1/2";
  if (g.termination === "invalid_move") return { icon: "F", text: "forfeit" };
  if (g.termination === "max_plies") return { icon: "∞", text: "unfinished" };
  if (g.termination === "provider_error") return { icon: "–", text: "aborted" };
  if (g.result === "1/2-1/2") return { icon: "½", text: "draw" };
  return won ? { icon: "W", text: "won" } : { icon: "L", text: "mated" };
};

function EvalStrip({
  game,
  at,
  seek,
}: {
  game: Game;
  at: number;
  seek: (i: number) => void;
}) {
  const w = 600,
    h = 84;
  const n = game.plies.length;
  const x = (i: number) => (n <= 1 ? 0 : (i / n) * w);
  const y = (e: number) => 6 + (1 - e) * (h - 12);
  const pts = game.plies
    .map((p, i) => ({ i: i + 1, e: p.e, l: p.l }))
    .filter((p) => p.e != null) as { i: number; e: number; l?: number | null }[];
  return (
    <svg
      className="cl-eval"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Engine expected score after each model move"
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        seek(Math.round(((event.clientX - box.left) / box.width) * n));
      }}
    >
      <line x1="0" x2={w} y1={y(0.5)} y2={y(0.5)} className="cl-eval-mid" />
      <path
        d={
          pts.length
            ? `M0,${y(0.5)} ` + pts.map((p) => `L${x(p.i)},${y(p.e)}`).join(" ")
            : ""
        }
        className="cl-eval-line"
      />
      {pts
        .filter((p) => (p.l ?? 0) >= 300)
        .map((p) => (
          <circle key={p.i} cx={x(p.i)} cy={y(p.e)} r="3.2" className="cl-eval-blunder" />
        ))}
      <line x1={x(at)} x2={x(at)} y1="0" y2={h} className="cl-eval-cursor" />
    </svg>
  );
}

const REPLAY_START: Record<Cohort, [string, string]> = {
  v2: ["claude-opus-5-5", "10"],
  v3: ["gemini-3.8-flash", "1"],
};
const ATTEMPT_LABEL: Record<string, string> = {
  invalid: "an invalid reply",
  timeout: "a timeout",
  interrupted: "an interrupted request",
  service: "a service error",
  tool: "a tool call",
};
const METHOD_LABEL: Record<string, string> = {
  final_line: "the final line of its analysis",
  code_block: "a final code block",
  marked_final: "a line marked as the final move",
};

export function GameReplay({
  initialCohort = "v2",
  number = "05",
}: {
  initialCohort?: Cohort;
  number?: string;
}) {
  const [cohort, setCohort] = useState<Cohort>(initialCohort);
  const { data, failed } = useRunData(cohort);
  const [bot, setBot] = useState(REPLAY_START[initialCohort][0]);
  const [gameId, setGameId] = useState(REPLAY_START[initialCohort][1]);
  const [at, setAt] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const game = data?.games.find((g) => g.bot === bot && g.id === gameId);
  const n = game?.plies.length ?? 0;
  useEffect(() => {
    // Scroll only the move list; scrollIntoView would also move the page.
    const list = listRef.current;
    const current = list?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!list || !current) return;
    const top = current.offsetTop;
    if (top < list.scrollTop || top > list.scrollTop + list.clientHeight - 30)
      list.scrollTop = top - list.clientHeight / 2;
  }, [at, gameId, bot]);
  if (!data || !game || !game.start)
    return (
      <section className="fn-experiment cl-replay">
        <Pending failed={failed}>the games</Pending>
      </section>
    );
  const bots = data.models.filter((m) => data.games.some((g) => g.bot === m.id && g.plies.length));
  const games = data.games.filter((g) => g.bot === bot && g.plies.length);
  const ply = at > 0 ? game.plies[at - 1] : null;
  const board = parseBoard(ply ? ply.f : game.start);
  const model = labelOf(data, bot);
  const done = at === n;
  const seek = (i: number) => setAt(Math.max(0, Math.min(n, i)));
  const pick = (b: string, id: string) => {
    setBot(b);
    setGameId(id);
    setAt(0);
  };
  const v = verdictOf(game);
  const moves: [Ply | null, Ply | null][] = [];
  game.plies.forEach((p) => {
    const white = p.n % 2 === 1;
    if (white || !moves.length) moves.push(white ? [p, null] : [null, p]);
    else if (moves[moves.length - 1][1] === null) moves[moves.length - 1][1] = p;
    else moves.push([null, p]);
  });
  let caption: ReactNode = (
    <>
      {game.opening}. {model} plays {game.llmWhite ? "White" : "Black"} against{" "}
      {data.opponent.engine} at UCI_Elo {data.opponent.uciElo}. Step through
      with the arrows, or click the chart.
    </>
  );
  if (ply?.m) {
    const loss = ply.l ?? 0;
    const failedTries = ply.a?.filter((k) => k !== "ok") ?? [];
    caption = (
      <>
        <strong>
          {model} played {ply.s}
        </strong>
        {ply.t != null && ` in ${ply.t}s`}.{" "}
        {failedTries.length > 0 &&
          `It took ${ply.a!.length} attempts, after ${failedTries.map((k) => ATTEMPT_LABEL[k] ?? k).join(" and ")}. `}
        {ply.pm && `The move was recovered from ${METHOD_LABEL[ply.pm] ?? ply.pm}. `}
        {ply.b && ply.b !== ply.u
          ? `Stockfish preferred ${ply.b} (dashed arrow); the difference was ${(loss / 100).toFixed(1)} pawn${loss === 100 ? "" : "s"}.`
          : "Stockfish agreed."}
        {loss >= 300 && " That’s the kind of move the dot on the chart is for."}
        {ply.r && <q className="cl-inline-quote">{ply.r}</q>}
      </>
    );
  } else if (ply) {
    caption = <>Stockfish replied {ply.s}.</>;
  }
  return (
    <section
      className="fn-experiment cl-replay"
      aria-label="Replay a benchmark game"
      tabIndex={0}
      onKeyDown={(e) => {
        const step = { ArrowLeft: -1, ArrowRight: 1, Home: -n, End: n }[e.key];
        if (step !== undefined) {
          e.preventDefault();
          seek(at + step);
        }
      }}
    >
      <div className="fn-lab-top">
        <span className="fn-kicker">Experiment {number} / Replay a real game</span>
        <span className="fn-live-label">
          {v.text} · {n} plies · {Math.round(game.seconds / 60)} min
        </span>
      </div>
      <CohortSwitch
        value={cohort}
        set={(c) => {
          setCohort(c);
          pick(...REPLAY_START[c]);
        }}
        label="Run"
      />
      <div className="cl-pickers">
        <div className="ml-tabs" role="group" aria-label="Model">
          {bots.map((m) => (
            <button
              key={m.id}
              aria-pressed={bot === m.id}
              onClick={() => {
                const first = data.games.find((g) => g.bot === m.id && g.plies.length);
                if (first) pick(m.id, first.id);
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="cl-games" role="group" aria-label="Game">
          {games.map((g) => {
            const gv = verdictOf(g);
            return (
              <button
                key={g.id}
                aria-pressed={g.id === gameId}
                onClick={() => pick(bot, g.id)}
                title={`${g.opening} · ${gv.text}`}
              >
                <span>{g.id}</span>
                <i className={`cl-chip is-${gv.text}`} aria-label={gv.text} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="cl-replay-grid">
        <FenBoard
          board={board}
          flip={!game.llmWhite}
          move={ply?.u}
          arrow={ply?.m && ply.b && ply.b !== ply.u ? ply.b : null}
          label={ply ? `Position after ${ply.s}` : "Starting position of the game"}
        />
        <div className="cl-replay-side">
          <ol className="cl-moves" ref={listRef}>
            {!!game.book?.length && (
              <li className="cl-moves-book">
                <span>book</span>
                <button onClick={() => seek(0)} aria-current={at === 0 ? "step" : undefined}>
                  {game.book.join(" ")}
                </button>
              </li>
            )}
            {moves.map(([w, b], i) => (
              <li key={i}>
                <span>{Math.ceil((w ?? b)!.n / 2)}.</span>
                {[w, b].map((p, j) =>
                  p ? (
                    <button
                      key={j}
                      onClick={() => seek(game.plies.indexOf(p) + 1)}
                      aria-current={ply === p ? "step" : undefined}
                      className={`${p.m ? "is-model" : ""} ${(p.l ?? 0) >= 300 ? "is-blunder" : ""}`}
                    >
                      {p.s}
                      {(p.a || p.pm) && (
                        <sup
                          className={p.a ? "is-retry" : "is-recovered"}
                          title={p.a ? `${p.a.length} attempts` : "recovered from analysis"}
                        >
                          {p.a ? "↻" : "¶"}
                        </sup>
                      )}
                    </button>
                  ) : (
                    <i key={j}>…</i>
                  ),
                )}
              </li>
            ))}
            {game.forfeit && (
              <li className="cl-moves-end">
                <span>×</span>
                <button onClick={() => seek(n)}>forfeit</button>
              </li>
            )}
          </ol>
          <div className="cl-steps">
            <button onClick={() => seek(0)} aria-label="First position">
              <ChevronsLeft size={15} />
            </button>
            <button onClick={() => seek(at - 1)} aria-label="Previous ply">
              <ChevronLeft size={15} />
            </button>
            <span>
              {at}/{n}
            </span>
            <button onClick={() => seek(at + 1)} aria-label="Next ply">
              <ChevronRight size={15} />
            </button>
            <button onClick={() => seek(n)} aria-label="Last position">
              <ChevronsRight size={15} />
            </button>
          </div>
        </div>
      </div>
      <EvalStrip game={game} at={at} seek={seek} />
      <div className="cl-eval-legend">
        <span>Engine’s expected score for {model} after each of its moves</span>
        <span>
          <i className="cl-dot" /> 3+ pawns lost in one move
        </span>
      </div>
      <p className="cl-caption" aria-live="polite">
        {caption}
      </p>
      {done && game.forfeit && (
        <div className="cl-verdict is-forfeit">
          <strong>× Forfeit at ply {game.forfeit.ply}</strong>
          <blockquote className="cl-quote">
            <Highlight
              text={game.forfeit.response}
              token={game.forfeit.response.split(/\s+/).at(-1) ?? null}
              at="last"
            />
          </blockquote>
        </div>
      )}
      {done && !game.forfeit && (
        <div className={`cl-verdict ${v.text === "won" ? "is-legal" : "is-aside"}`}>
          <strong>
            {v.text === "won"
              ? `${model} delivered checkmate.`
              : v.text === "mated"
                ? `Checkmate. ${model} lost on the board, fair and square.`
                : v.text === "unfinished"
                  ? `Stopped at the ${n + (game.book?.length ?? 0)}-ply limit after ${(game.seconds / 3600).toFixed(1)} hours. Incomplete, not a draw.`
                  : "The game stopped early. Not a chess result."}
          </strong>
        </div>
      )}
    </section>
  );
}

/* ----------------------------------------------------------- results */

export function RunResults({ initialCohort = "v2" }: { initialCohort?: Cohort }) {
  const [cohort, setCohort] = useState<Cohort>(initialCohort);
  const { data, failed } = useRunData(cohort);
  if (!data)
    return (
      <section className="fn-experiment">
        <Pending failed={failed}>the results</Pending>
      </section>
    );
  const rows = [...data.models].sort(
    (a, b) => Number(b.finished) - Number(a.finished) || b.completed - a.completed,
  );
  const when = new Date(data.snapshot).toLocaleString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <section className="fn-experiment cl-results" aria-label="Run results">
      <div className="fn-lab-top">
        <span className="fn-kicker">Figure 6 / The scoreboard, with denominators</span>
        <span className="fn-live-label">Snapshot {when} UTC</span>
      </div>
      <CohortSwitch value={cohort} set={setCohort} label="Run" />
      <div className="cl-table-wrap">
        <table className="cl-table">
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">How games ended</th>
              <th scope="col" title="Median wall-clock seconds per decision, including CLI startup">
                s / move
              </th>
              <th scope="col" title="Mean centipawn loss against Stockfish's preferred move. Lower is better.">
                Avg. loss
              </th>
              <th scope="col" title="Share of decisions matching Stockfish's first choice">
                Engine match
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const segments = [
                ["won", m.wins],
                ["drawn", m.draws],
                ["mated", m.checkmated],
                ["forfeit", m.forfeits],
                ["unfinished", m.unfinished],
                ["aborted", m.aborted],
              ] as const;
              return (
                <tr key={m.id}>
                  <th scope="row">
                    {m.label}
                    <small>
                      {`${m.games}/${data.plannedGamesPerModel} games`}
                      {m.status === "blocked"
                        ? " · disqualified"
                        : !m.finished && " · in progress"}
                    </small>
                  </th>
                  <td>
                    <div
                      className="cl-endings"
                      aria-label={segments.map(([k, v]) => `${v} ${k}`).join(", ")}
                    >
                      {Array.from({ length: data.plannedGamesPerModel }, (_, i) => {
                        let acc = 0;
                        const kind = segments.find(([, v]) => (acc += v) > i)?.[0];
                        return <i key={i} className={kind ? `is-${kind}` : ""} />;
                      })}
                    </div>
                    <small>
                      {segments
                        .filter(([, v]) => v)
                        .map(([k, v]) => `${v} ${k}`)
                        .join(" · ") || "no finished games yet"}
                    </small>
                  </td>
                  <td>{m.medianSeconds ?? "–"}</td>
                  <td>{m.meanCpl ?? "–"}</td>
                  <td>
                    {m.bestMoveMatch != null ? `${Math.round(m.bestMoveMatch * 100)}%` : "–"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="cl-legend">
        {(["won", "drawn", "mated", "forfeit", "unfinished", "aborted"] as const).map((k) => (
          <span key={k}>
            <i className={`is-${k}`} />
            {k}
          </span>
        ))}
        <span>
          <i /> not played yet
        </span>
      </div>
      <p className="fn-caption">
        Opponent: {data.opponent.engine} at UCI_Elo {data.opponent.uciElo},{" "}
        {data.opponent.secondsPerMove}s per move. Move quality: {data.analysis.engine} at{" "}
        {data.analysis.nodes.toLocaleString("en-US")} nodes per position, model
        decisions only.{" "}
        {cohort === "v2"
          ? "Ten games per model is a pilot, not a ranking. Rows marked in progress were still running when this snapshot was taken."
          : `Protocol 3: ${data.settings.effort} effort, ${data.settings.attempts} attempts per decision, a ${data.settings.timeout}s timeout. Two games per model is one opening pair: an anecdote with a methods section.`}
      </p>
    </section>
  );
}
