import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { simulateGBM, splitNoteChapters } from "../lib/field-notes.ts";

test("zero volatility gives the exact deterministic GBM solution", () => {
  const paths = simulateGBM(0);
  assert.equal(paths.length, 8);
  for (const path of paths) {
    assert.equal(path.length, 253);
    assert.equal(path[0], 100);
    assert.ok(Math.abs(path[252] - 100 * Math.exp(0.12)) < 1e-9);
  }
});

test("simulations are repeatable, positive, and sensitive to seed and volatility", () => {
  const paths = simulateGBM(0.214, 17);
  assert.deepEqual(paths, simulateGBM(0.214, 17));
  assert.notDeepEqual(paths, simulateGBM(0.214, 18));
  assert.notDeepEqual(paths, simulateGBM(0.4, 17));
  for (const value of simulateGBM(0.6).flat())
    assert.ok(Number.isFinite(value) && value > 0);
});

test("chapter parser ignores code fences, removes duplicate H1, and makes unique anchors", () => {
  const parsed = splitNoteChapters(
    "# Title\n\nIntro\n\n## Topic\nText\n```md\n## Not a heading\n```\n## Topic\nMore",
  );
  assert.equal(parsed.intro, "Intro\n");
  assert.deepEqual(
    parsed.chapters.map((c) => c.id),
    ["topic", "topic-2"],
  );
  assert.ok(parsed.chapters[0].markdown.includes("## Not a heading"));
});

test("both articles retain every paragraph, formula, and media reference when split", () => {
  const normalize = (s) =>
    s
      .replace(/^#{1,2} .+$/gm, "")
      .replace(/^---\s*$/gm, "")
      .replace(/\s+/g, "");
  for (const file of ["blogs/chessLLM.md", "blogs/stock_volatility_blog.md"]) {
    const source = readFileSync(file, "utf8");
    const { intro, chapters } = splitNoteChapters(source);
    assert.equal(
      normalize(intro + chapters.map((c) => c.markdown).join("")),
      normalize(source),
    );
    assert.equal(chapters.length, (source.match(/^## /gm) || []).length);
    assert.equal(new Set(chapters.map((c) => c.id)).size, chapters.length);
  }
});

test("market scenarios are reproducible, finite, and use Poisson jump counts", async () => {
  const { simulateMarket, randomSource, mean } = await import("../lib/market-math.ts");
  assert.deepEqual(simulateMarket(12, 100), simulateMarket(12, 100));
  assert.notDeepEqual(simulateMarket(12, 100), simulateMarket(13, 100));
  for (const row of simulateMarket(42, 1000)) {
    assert.ok(row.v > 0);
    assert.ok(Object.values(row).every(Number.isFinite));
    assert.ok(Math.abs(row.loss - (-row.r - .5 * row.logV + .3 * Math.abs(row.z))) < 1e-12);
  }
  const rng = randomSource(44);
  const counts = Array.from({ length: 50000 }, () => rng.poisson(.05));
  assert.ok(Math.abs(mean(counts) - .05) < .004);
  assert.ok(Math.abs(counts.filter(n => n > 0).length / counts.length - (1 - Math.exp(-.05))) < .004);
});

test("histograms conserve samples and tail risk is calculated from actual losses", async () => {
  const { histogram, tailRisk } = await import("../lib/market-math.ts");
  const losses = Array.from({ length: 100 }, (_, i) => i);
  assert.equal(histogram(losses).reduce((s, bin) => s + bin.y, 0), 100);
  assert.equal(histogram([2, 2, 2]).reduce((s, bin) => s + bin.y, 0), 3);
  const { valueAtRisk, expectedShortfall } = tailRisk(losses, .95);
  assert.ok(Math.abs(valueAtRisk - 94.05) < 1e-10);
  assert.equal(expectedShortfall, 97);
});

test("knight tour rejects repeats and allows only L-shaped moves", async () => {
  const { knightMoves } = await import("../lib/market-math.ts");
  assert.deepEqual(knightMoves(0), [8, 13]);
  assert.deepEqual(knightMoves(0, [8]), [13]);
  for (let square = 0; square < 36; square++) for (const dest of knightMoves(square)) {
    const dx = Math.abs(square % 6 - dest % 6), dy = Math.abs(Math.floor(square / 6) - Math.floor(dest / 6));
    assert.equal(dx * dy, 2);
  }
});

test("markets article contains no static plots and historical observations are monthly", () => {
  const source = readFileSync("blogs/stock_volatility_blog.md", "utf8");
  assert.doesNotMatch(source, /!\[.*\]\(.*\.(png|mp4)/);
  for (const name of ["markets", "foundations", "conditional", "diagnostics", "history", "risk"])
    assert.ok(source.includes(`:::experiment ${name}:::`));
  for (const file of ["blogs/chessLLM.md", "blogs/stock_volatility_blog.md"])
    assert.ok(!readFileSync(file, "utf8").includes("—"));
  const data = JSON.parse(readFileSync("public/blog/data/sp500-monthly.json", "utf8"));
  assert.equal(data.observations.length, 60);
  assert.equal(data.observations[0].date, "2020-01-01");
  assert.equal(data.observations[59].date, "2024-12-01");
  assert.ok(data.observations.every(r => Number.isFinite(r.close) && r.close > 0));
});

test("Q-Q normal quantiles match known reference values", async () => {
  const { normalQuantile } = await import("../lib/market-math.ts");
  assert.ok(Math.abs(normalQuantile(.5)) < 1e-6);
  assert.ok(Math.abs(normalQuantile(.975) - 1.959964) < 1e-5);
  assert.ok(Math.abs(normalQuantile(.025) + 1.959964) < 1e-5);
});

test("sidenotes are numbered by first reference and their definitions removed", async () => {
  const { extractSidenotes } = await import("../lib/field-notes.ts");
  const { content, notes } = extractSidenotes(
    "Alpha[^b] and beta[^a], again[^b].\n\n[^a]: First *note*.\n[^b]: Second.\nTail [^missing].",
  );
  assert.equal(content, "Alpha[1](#sn-b) and beta[2](#sn-a), again[1](#sn-b).\n\nTail [^missing].");
  assert.deepEqual([...notes.entries()], [["a", "First *note*."], ["b", "Second."]]);
});

test("board helper applies castling, en passant and promotion", async () => {
  const { parseBoard, applyUci, squareIndex } = await import("../lib/chess-board.ts");
  const at = (board, square) => board[squareIndex(square)];
  const castled = applyUci(parseBoard("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1"), "e1g1");
  assert.equal(at(castled, "g1"), "K");
  assert.equal(at(castled, "f1"), "R");
  assert.equal(at(castled, "h1"), null);
  const long = applyUci(parseBoard("r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1"), "e8c8");
  assert.equal(at(long, "c8"), "k");
  assert.equal(at(long, "d8"), "r");
  assert.equal(at(long, "a8"), null);
  const passant = applyUci(parseBoard("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1"), "e5d6");
  assert.equal(at(passant, "d6"), "P");
  assert.equal(at(passant, "d5"), null);
  const promoted = applyUci(parseBoard("4k3/P7/8/8/8/8/7p/4K3 w - - 0 1"), "a7a8n");
  assert.equal(at(promoted, "a8"), "N");
  assert.equal(at(applyUci(promoted, "h2h1q"), "h1"), "q");
});

test("exported chess runs are internally consistent", () => {
  for (const cohort of ["v2", "v3"]) {
    const data = JSON.parse(readFileSync(`public/blog/data/chessllm-${cohort}.json`, "utf8"));
    assert.equal(data.cohort, cohort);
    for (const f of data.forfeits) {
      assert.ok(!f.legalMoves.includes(f.response.trim().toLowerCase()), "forfeit reply was a bare legal move");
      const game = data.games.find((g) => g.bot === f.bot && g.id === String(f.game));
      assert.equal(game?.termination, "invalid_move");
      assert.equal(game.forfeit.ply, f.ply);
    }
    for (const m of data.models) {
      const games = data.games.filter((g) => g.bot === m.id);
      assert.equal(games.length, m.games);
      assert.equal(m.wins + m.draws + m.losses, m.completed);
      assert.equal(m.forfeits, games.filter((g) => g.termination === "invalid_move").length);
      assert.equal(Object.values(m.outcome).reduce((a, b) => a + b, 0), m.decisions);
    }
    for (const g of data.games)
      for (let i = 1; i < g.plies.length; i++) assert.equal(g.plies[i].n, g.plies[i - 1].n + 1);
  }
});

test("v3 recovers every v2 forfeit with the move its author intended", async () => {
  const { resolveMove } = await import("../lib/move-resolver.ts");
  const v2 = JSON.parse(readFileSync("public/blog/data/chessllm-v2.json", "utf8"));
  assert.ok(v2.forfeits.length > 0);
  for (const f of v2.forfeits) assert.equal(resolveMove(f.response, f.legalMoves).move, f.lastToken);
});

test("move resolver matches the Python harness on tricky replies", async () => {
  const { resolveMove } = await import("../lib/move-resolver.ts");
  const start = "g1h3 g1f3 b1c3 b1a3 h2h3 g2g3 f2f3 e2e3 d2d3 c2c3 b2b3 a2a3 h2h4 g2g4 f2f4 e2e4 d2d4 c2c4 b2b4 a2a4".split(" ");
  const promotion = ["a7a8q", "a7a8r", "a7a8b", "a7a8n", "h1g1", "h1g2", "h1h2"];
  // Expected values produced by chess_llm_bench.core.moves.resolve_move.
  const cases = [
    [" e2e4 ", "e2e4", "strict"],
    ["E2E4", "e2e4", "strict"],
    ["{\"move\": \"g1f3\"}", "g1f3", "json"],
    ["{\"move\":\"E7E5\"}", null, "json"],
    ["Kc2", null, "invalid"],
    ["I like e2e4", null, "invalid"],
    ["Analysis.\n\ne2e4", "e2e4", "final_line"],
    ["Analysis.\n\n`e2e4`", "e2e4", "final_line"],
    ["Thinking\nFinal move: g1f3", "g1f3", "marked_final"],
    ["best move = e2e4.", "e2e4", "marked_final"],
    ["```\ne2e4\n```", "e2e4", "code_block"],
    ["Options:\n```\ne2e4\ng1f3\n```", null, "invalid"],
    ["e2e4 or d2d4", null, "invalid"],
    ["e2e5", null, "strict"],
    ["{\"move\": \"e2e5\"}", null, "json"],
    ["", null, "invalid"],
    ["Qualitatively:\n\nf1b1", null, "final_line"],
    ["move: b1c3", "b1c3", "marked_final"],
    ["UCI: a7a8q", "a7a8q", "marked_final"],
    ["{\"mv\":\"e2e4\"}", null, "invalid"],
    ["text\n```uci\ng1f3\n```", "g1f3", "code_block"]
  ];
  for (const [reply, move, method] of cases) {
    const r = resolveMove(reply, reply.includes("a7a8q") ? promotion : start);
    assert.deepEqual([r.move, r.method], [move, method], JSON.stringify(reply));
  }
});
