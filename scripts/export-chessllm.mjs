#!/usr/bin/env node
/**
 * Compacts chessLLM runs into the JSON the chess field note renders. One cohort
 * per file: protocol 2 (strict) and protocol 3 (recovery) measure different
 * things and are never merged.
 *
 *   node scripts/export-chessllm.mjs --out v2 ../chessLLM/runs/subscriptions-A ../chessLLM/runs/subscriptions-B
 *   node scripts/export-chessllm.mjs --out v3 ../chessLLM/runs/improved-v3-20260929-02
 *
 * The article reads counts from these files; a few numbers in the prose are
 * still hand-written, so re-read blogs/chessLLM.md after re-exporting.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const outAt = args.indexOf("--out");
const cohort = outAt >= 0 ? args.splice(outAt, 2)[1] : "v2";
const runs = args;
if (!runs.length || !["v2", "v3"].includes(cohort)) {
  console.error("usage: export-chessllm.mjs --out v2|v3 RUN_DIR [RUN_DIR ...]");
  process.exit(1);
}

const LABELS = {
  "gpt-6-astra": ["GPT-6 Astra", "OpenAI"],
  "gpt-6-sol": ["GPT-6 Sol", "OpenAI"],
  "gpt-6-luna": ["GPT-6 Luna", "OpenAI"],
  "claude-opus-5-5": ["Claude Opus 5.5", "Anthropic"],
  "claude-sonnet-5-5": ["Claude Sonnet 5.5", "Anthropic"],
  "gemini-3.1-pro": ["Gemini 3.1 Pro", "Google"],
  "gemini-3.8-flash": ["Gemini 3.8 Flash", "Google"],
};
const UCI = /\b([a-h][1-8][a-h][1-8][qrbn]?)\b/g;

const jsonl = (file) =>
  existsSync(file)
    ? readFileSync(file, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line))
    : [];
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2 : null;
};
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const round = (n, d = 1) => (n == null ? null : Math.round(n * 10 ** d) / 10 ** d);
const clip = (text, n = 900) => (text.length > n ? `${text.slice(0, n).trimEnd()}…` : text);
/** Board, side and castling are enough to draw a diagram. */
const boardOf = (fen) => fen.split(" ").slice(0, 3).join(" ");
const cpLoss = (a) =>
  a.centipawn_loss ??
  (a.best?.cp != null && a.chosen?.cp != null ? Math.max(0, a.best.cp - a.chosen.cp) : null);
const outputTokens = (r) => r.output_tokens_total ?? r.usage?.output_tokens ?? null;
/** Why a request didn't produce the accepted move on its own. */
const failure = (r) =>
  r.tool_calls?.length || /Tool use/.test(r.error ?? "")
    ? "tool"
    : r.error === "TimeoutError"
      ? "timeout"
      : r.error === "CancelledError"
        ? "interrupted"
        : r.error
          ? "service"
          : r.legal === false
            ? "invalid"
            : null;

const requests = [],
  analysis = [],
  plies = [],
  games = [],
  status = new Map();
let startedAt = null,
  snapshot = null,
  manifest = null;
for (const run of runs) {
  const tag = (rows) => rows.map((row) => ({ ...row, run }));
  requests.push(...tag(jsonl(join(run, "requests.jsonl"))));
  analysis.push(...tag(jsonl(join(run, "analysis.jsonl"))));
  plies.push(...tag(jsonl(join(run, "plies.jsonl"))));
  // A game can be checkpointed as incomplete before its final record; keep the latest.
  const latest = new Map();
  for (const g of jsonl(join(run, "games.jsonl")))
    latest.set(g.game_id ? `${g.bot}|${g.game_id}` : `${g.bot}|#${latest.size}`, g);
  games.push(...tag([...latest.values()]));
  for (const s of jsonl(join(run, "status.jsonl")))
    if (s.status !== "unavailable" || !status.has(s.model)) status.set(s.model, s.status);
  if (existsSync(join(run, "run_status.json")))
    for (const [model, s] of Object.entries(
      JSON.parse(readFileSync(join(run, "run_status.json"), "utf8")).models,
    ))
      status.set(model, s.status);
  manifest = JSON.parse(readFileSync(join(run, "manifest.json"), "utf8"));
  if (!startedAt || manifest.started_at < startedAt) startedAt = manifest.started_at;
  for (const r of requests)
    if (r.finished_at && (!snapshot || r.finished_at > snapshot)) snapshot = r.finished_at;
}

// game_id is only unique per bot and run.
const key = (row) => `${row.run}|${row.bot}|${row.game_id ?? row.id}`;
const analysisByPly = new Map(analysis.map((a) => [`${key(a)}|${a.ply}`, a]));
const requestByPly = new Map(
  requests.filter((r) => r.legal).map((r) => [`${key(r)}|${r.ply}`, r]),
);
const attemptsByPly = new Map();
for (const r of requests) {
  const k = `${key(r)}|${r.ply}`;
  attemptsByPly.set(k, [...(attemptsByPly.get(k) ?? []), r]);
}

// v2 games have no game_id; they appear in play order per bot.
const gameIndex = new Map();
const gameRows = games.map((g) => {
  const n = (gameIndex.get(`${g.run}|${g.bot}`) ?? 0) + 1;
  gameIndex.set(`${g.run}|${g.bot}`, n);
  return { ...g, id: String(g.game_id ?? n) };
});

const forfeits = requests
  .filter(
    (r) =>
      r.legal === false &&
      gameRows.some((g) => key(g) === key(r) && g.termination === "invalid_move") &&
      // Only the final rejected attempt of a decision ended the game.
      !requests.some((o) => key(o) === key(r) && o.ply === r.ply && (o.attempt ?? 1) > (r.attempt ?? 1)),
  )
  .map((r) => {
    const response = (r.response ?? "").trim();
    const mentioned = [...response.matchAll(UCI)].map((m) => m[1]);
    return {
      bot: r.bot,
      game: r.game_id,
      ply: r.ply,
      side: r.side_to_move,
      fen: r.fen,
      prompt: r.prompt,
      legalMoves: r.legal_moves,
      response,
      // What protocol v1's regex would have accepted: the first legal-looking move mentioned.
      firstMention: mentioned.find((m) => r.legal_moves.includes(m)) ?? null,
      lastToken: response.split(/\s+/).at(-1) ?? null,
      outputTokens: outputTokens(r),
    };
  });

const exportGames = gameRows.map((g) => {
  const gamePlies = plies.filter((p) => key(p) === key(g)).sort((a, b) => a.ply - b.ply);
  const forfeit = forfeits.find((f) => f.bot === g.bot && String(f.game) === g.id);
  const firstRequest = requests
    .filter((r) => key(r) === key(g))
    .sort((a, b) => a.ply - b.ply || (a.attempt ?? 1) - (b.attempt ?? 1))[0];
  // Opening-book moves are played before the first recorded ply.
  const book =
    firstRequest && gamePlies[0] ? firstRequest.history_uci.slice(0, gamePlies[0].ply - 1) : [];
  return {
    bot: g.bot,
    id: g.id,
    llmWhite: g.color_llm_white,
    result: g.result,
    termination: g.termination,
    opening: g.opening,
    seed: g.seed,
    seconds: round(g.game_duration, 0),
    start: gamePlies[0] ? boardOf(gamePlies[0].fen) : null,
    book,
    plies: gamePlies.map((p) => {
      const k = `${key(p)}|${p.ply}`;
      const a = analysisByPly.get(k);
      const r = requestByPly.get(k);
      const tries = attemptsByPly.get(k) ?? [];
      const reply = r?.response?.trim() ?? "";
      const plain = reply === r?.move_uci || r?.parse_method === "json";
      return {
        n: p.ply,
        u: p.move_uci,
        s: p.move_san,
        f: boardOf(p.fen_after),
        ...(p.player === g.bot ? { m: 1 } : {}),
        ...(a ? { e: a.chosen?.expected_score ?? null, b: a.best?.pv?.[0] ?? null, l: cpLoss(a) } : {}),
        ...(r && !plain ? { r: clip(reply) } : {}),
        ...(r ? { t: round(r.wall_seconds, 1) } : {}),
        ...(r?.parse_method && !["strict", "json"].includes(r.parse_method) ? { pm: r.parse_method } : {}),
        ...(tries.length > 1 ? { a: tries.map((t) => failure(t) ?? "ok") } : {}),
      };
    }),
    ...(forfeit
      ? { forfeit: { ply: forfeit.ply, response: forfeit.response, fen: boardOf(forfeit.fen) } }
      : {}),
  };
});

const won = (g) =>
  g.result !== "1/2-1/2" && g.result !== "*" && (g.result === "1-0") === g.color_llm_white;
const models = [...new Set(requests.map((r) => r.bot))].map((bot) => {
  const rs = requests.filter((r) => r.bot === bot);
  const as = analysis.filter((a) => a.bot === bot);
  const gs = gameRows.filter((g) => g.bot === bot);
  const completed = gs.filter((g) => g.result !== "*");
  const losses = as.map(cpLoss).filter((x) => x != null);
  const tokens = rs.map(outputTokens).filter((x) => x != null);
  const decisions = new Map();
  for (const r of rs) {
    const k = `${key(r)}|${r.ply}`;
    decisions.set(k, [...(decisions.get(k) ?? []), r]);
  }
  // How each decision was resolved, in the order the chart stacks them.
  const outcome = { clean: 0, recovered: 0, retried: 0, forfeit: 0, stopped: 0 };
  for (const tries of decisions.values()) {
    const accepted = tries.find((t) => t.legal);
    if (!accepted) outcome[tries.some((t) => t.legal === false) ? "forfeit" : "stopped"]++;
    else if (tries.length > 1) outcome.retried++;
    else if (accepted.format_recovered || ["final_line", "code_block", "marked_final"].includes(accepted.parse_method))
      outcome.recovered++;
    else outcome.clean++;
  }
  const failures = {};
  for (const r of rs) {
    const f = failure(r);
    if (f) failures[f] = (failures[f] ?? 0) + 1;
  }
  return {
    id: bot,
    label: LABELS[bot]?.[0] ?? bot,
    vendor: LABELS[bot]?.[1] ?? "",
    status: status.get(bot) ?? null,
    finished: status.get(bot) === "finished",
    requests: rs.length,
    decisions: decisions.size,
    outcome,
    failures,
    legalRequests: rs.filter((r) => r.legal).length,
    bareAnswers: rs.filter((r) => (r.response ?? "").trim() === r.move_uci).length,
    games: gs.length,
    completed: completed.length,
    wins: completed.filter(won).length,
    draws: completed.filter((g) => g.result === "1/2-1/2").length,
    losses: completed.filter((g) => !won(g) && g.result !== "1/2-1/2").length,
    forfeits: gs.filter((g) => g.termination === "invalid_move").length,
    checkmated: gs.filter((g) => g.termination === "checkmate" && !won(g)).length,
    unfinished: gs.filter((g) => g.termination === "max_plies").length,
    aborted: gs.filter((g) => g.result === "*" && g.termination !== "max_plies").length,
    medianSeconds: round(median(rs.map((r) => r.wall_seconds).filter(Boolean))),
    // Every accepted decision's wall time, for the latency strip chart.
    seconds: rs.filter((r) => r.legal && r.wall_seconds).map((r) => round(r.wall_seconds, 1)),
    medianOutputTokens: tokens.length ? median(tokens) : null,
    outputTokens: tokens.length ? tokens.reduce((a, b) => a + b, 0) : null,
    analysed: as.length,
    meanCpl: round(mean(losses), 0),
    medianCpl: round(median(losses), 0),
    bestMoveMatch: as.length
      ? round(as.filter((a) => a.best?.pv?.[0] === a.move_uci).length / as.length, 3)
      : null,
    blunders: losses.filter((l) => l >= 300).length,
  };
});

/** Every request that didn't simply succeed on its first try, verbatim. */
const incidents = requests
  .filter((r) => (r.attempt ?? 1) > 1 || failure(r) || r.format_recovered)
  .map((r) => {
    const k = `${key(r)}|${r.ply}`;
    return {
      bot: r.bot,
      game: r.game_id,
      ply: r.ply,
      attempt: r.attempt ?? 1,
      kind: failure(r) ?? (r.format_recovered ? "recovered" : "retry-ok"),
      method: r.parse_method ?? null,
      error: r.validation_error ?? r.error ?? null,
      response: clip((r.response ?? "").trim(), 700),
      move: r.legal ? r.move_uci : null,
      san: r.legal ? r.move_san : null,
      legalSan: r.legal === false ? requestByPly.get(k)?.move_san ?? null : undefined,
      seconds: round(r.wall_seconds, 1),
      at: r.started_at,
      ...(r.legal === false
        ? {
            fen: boardOf(r.fen),
            choices: r.prompt.match(/Legal choices \(UCI = SAN\): (.+)/)?.[1] ?? null,
            // The correction appended to the next attempt's prompt, verbatim.
            feedback:
              requests
                .find((o) => key(o) === key(r) && o.ply === r.ply && o.attempt === (r.attempt ?? 1) + 1)
                ?.prompt.match(/\nYour previous response was rejected[\s\S]*$/)?.[0]
                .trim() ?? null,
          }
        : {}),
    };
  })
  .sort((a, b) => a.at.localeCompare(b.at));

/** The Antigravity ACP trace for the request that tried to use a tool, reduced to the story. */
function toolIncident() {
  const r = requests.find((q) => /Tool use/.test(q.error ?? "") && q.trace_path);
  if (!r) return null;
  const trace = JSON.parse(readFileSync(join(r.run, r.trace_path), "utf8"));
  const steps = [];
  for (const line of trace.stdout.split("\n").filter(Boolean)) {
    const event = JSON.parse(line);
    if (event.type !== "acp_trace") continue;
    for (const e of event.events ?? []) {
      const u = e.params?.update;
      if (u?.sessionUpdate === "agent_thought_chunk") {
        const [, title, body] = u.content.text.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/) ?? [null, "", u.content.text];
        steps.push({ kind: "thought", title, text: clip(body.trim(), 420) });
      } else if (u?.sessionUpdate === "tool_call")
        steps.push({ kind: "tool", title: u.title, cwd: u.rawInput?.Cwd ?? null });
      else if (e.method === "session/request_permission")
        steps.push({ kind: "permission", options: e.params.options.map((o) => o.name) });
      else if (u?.sessionUpdate === "tool_call_update")
        steps.push({ kind: "denied", text: u.rawOutput ?? u.status });
      else if (u?.sessionUpdate === "agent_message_chunk")
        steps.push({ kind: "answer", text: u.content?.text ?? "" });
    }
  }
  // Merge streamed answer chunks.
  const merged = [];
  for (const s of steps)
    if (s.kind === "answer" && merged.at(-1)?.kind === "answer") merged.at(-1).text += s.text;
    else merged.push(s);
  return {
    bot: r.bot,
    game: r.game_id,
    ply: r.ply,
    fen: boardOf(r.fen),
    seconds: round(r.wall_seconds, 0),
    steps: merged,
  };
}

/** Wall-clock position of every request, for the run timeline: [start s, duration s, kind]. */
function timeline() {
  const t0 = Math.min(...requests.map((r) => Date.parse(r.started_at)));
  const lanes = {};
  for (const r of requests) {
    const kind = failure(r) ?? (r.format_recovered ? "recovered" : (r.attempt ?? 1) > 1 ? "retry-ok" : "ok");
    (lanes[r.bot] ??= []).push([
      Math.round((Date.parse(r.started_at) - t0) / 1000),
      Math.max(1, Math.round(r.wall_seconds ?? 0)),
      kind,
      r.ply,
      r.attempt ?? 1,
      String(r.game_id),
    ]);
  }
  const end = Math.max(...requests.map((r) => Date.parse(r.finished_at ?? r.started_at)));
  return { start: new Date(t0).toISOString(), seconds: Math.round((end - t0) / 1000), lanes };
}

const settings = manifest.settings ?? {};
const out = {
  cohort,
  protocol: manifest.protocol ?? "2-subscription",
  source: "github.com/Youssef2430/chessLLM",
  startedAt,
  snapshot,
  settings: {
    effort: settings.effort ?? "low",
    attempts: settings.attempts ?? 1,
    timeout: settings.timeout ?? 120,
    structured: settings.structured ?? false,
  },
  amendments: (manifest.amendments ?? []).map((a) => ({
    at: a.timestamp,
    reason: a.reason,
    ...(a.new_games ? { games: [a.original_games, a.new_games] } : {}),
    ...(a.new_codex_concurrency ? { concurrency: [a.previous_codex_concurrency, a.new_codex_concurrency] } : {}),
  })),
  executions: (manifest.executions ?? []).map((e) => ({ at: e.started_at, resume: e.resume })),
  opponent: { engine: "Stockfish 17.1", uciElo: 1320, secondsPerMove: 0.3 },
  analysis: { engine: "Stockfish 17.1", nodes: 50000 },
  plannedGamesPerModel: manifest.schedule?.length ?? manifest.config?.max_games ?? 10,
  models,
  forfeits,
  incidents: cohort === "v3" ? incidents : [],
  toolIncident: cohort === "v3" ? toolIncident() : null,
  timeline: cohort === "v3" ? timeline() : null,
  games: exportGames,
};
const target = `public/blog/data/chessllm-${cohort}.json`;
writeFileSync(target, JSON.stringify(out));
console.log(
  `${target}: ${models.length} models, ${exportGames.length} games, ${forfeits.length} forfeits, ${out.incidents.length} incidents, ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`,
);
