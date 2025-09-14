# Building chessLLM: Why I Built an AI Chess Arena for Modern LLMs, How It Works, and What’s Next

Could Claude beat GPT-4 at chess? Does Gemini actually climb an ELO ladder—or just vibe its way through openings? I wanted a real answer, not Reddit lore. So I built **chessLLM**: a clean, terminal-first benchmark that lets modern language models battle each other (and real engines) in a controlled arena with budgets, telemetry, and receipts.

If you’ve seen my LedgerGlass app, you know how I work: minimal surface area, no mysterious black boxes, and ruthless attention to cost and UX. chessLLM follows the same philosophy—except the “UI” is a beautiful terminal board and a live dashboard that makes evaluation feel like a sport.

---

## TL;DR

- **What**: A Python CLI that benchmarks LLMs via head-to-head chess games, with smart opponent selection and strict move validation.
- **How**: Two modes—**pure prompts** vs **agent reasoning** with a lightweight analysis toolkit and structured workflows.
- **Why**: I wanted a scientific, repeatable way to compare models; anecdotes weren’t cutting it.
- **Nice bits**: Real-time board + stats, PGN logging, historical leaderboards, and **built-in cost tracking** (because I hate surprises).
- **Who**: Runs providers I use daily—OpenAI, Anthropic, Google—plus Stockfish for grounding and sanity checks.
- **Next**: Opening books, tournament brackets, MCTS-style planning, and multi-agent collaboration.

---

## Why I built it (and why this is my kind of project)

I’m a grad student at uOttawa and a part-time software engineer at Canada’s NRC. My weeks are a weird blend of academic rigor, production constraints, and building small tools that actually ship. That lens shaped this project:

- **I needed real evaluation, not vibes.** If I’m going to say “Model A > Model B for structured reasoning,” I want a dataset, not a hunch.
- **I care about costs.** I track expenses obsessively (LedgerGlass changed how I think about spend), so chessLLM tells me exactly what each game costs—per model, per move, per run.
- **I love terminal UIs.** A tight CLI with great ergonomics beats a heavy web stack when iteration speed matters.
- **I’m curious about agents—practically.** Not “agents that can do everything.” Just… do they help on a bounded task like chess selection? Answer: yes, dramatically.

---

## What I set out to build (constraints that kept me honest)

- **Terminal-first.** Unicode pieces, smooth live updates, useful keyboard shortcuts. No browser. No CSS tantrums.
- **Provider-agnostic.** One clean interface for multiple vendors. Swap models without rewriting logic.
- **Cost-aware.** Live budget limits, spending breakdowns, and “stop before my wallet cries” safeguards.
- **Engine-grade validation.** All moves are verified; Stockfish can be your sparring partner at calibrated ELOs.
- **Reproducible.** Everything’s logged as PGN with full config so you can rerun, compare, and publish.

---

## From web apps to terminal chess (and why it was addictive)

Most of my recent stuff is web + APIs. Flipping to a terminal app felt like a dopamine cheat code:

- **Immediate feedback.** Run → see a board animate → watch two AIs argue over the center.
- **Focus.** No React state or CSS breakpoints—just logic, data, and performance.
- **Async that actually sings.** Concurrent calls, UI refreshes, and game state all play nicely with modern Python.
- **Performance as craft.** Shaving milliseconds off rendering and batching calls feels like tuning a game engine.

---

## How chessLLM works

### Architecture at a glance
- **Core models**: `BotSpec`, `GameRecord`, `LadderStats`, `LiveState` keep data types explicit and debuggable.
- **Engine layer**: Stockfish handles legality + optional opponent play at specific ELOs.
- **LLM layer**: Unified clients for OpenAI/Anthropic/Google plus a random baseline.
- **Game manager**: Orchestrates turns, logs PGNs, tracks timing/costs, and updates the live dashboard.
- **Agent system**: Optional reasoning pass with lightweight evaluation and scored move selection.
- **Storage**: SQLite-backed history, leaderboards, and spend analytics.

### Two ways to play

**Traditional prompting (default)**
1. Send FEN → ask for a UCI move in strict format
2. Parse → validate → apply → repeat

**Agent mode (`--use-agent`)**
1. Observe the position with quick heuristics (material, structure, king safety, center, activity)
2. Generate all legal moves and score them
3. Adjust strategy by phase (opening/middlegame/endgame)
4. Pick the move with a confidence score and emit a compact reasoning trace

### The analysis toolkit (simple, on purpose)
- **Position**: center control, piece activity, king safety, pawn structure, development
- **Material**: standard piece values + imbalance tracking
- **Move classes**: captures, checks, castling, development, tactical, defensive
- **Endgames**: king activity, pawn race progress, coordination
- **Threats**: detect/defend simple tactics without overfitting

### Real-time terminal UI
- Unicode board with last-move highlights and coordinates
- Live ELO, win-rate, timers, token/cost meters
- Opponent picker: random, 600-ELO Stockfish, or full ladder climbing

### Performance analytics
- Historical leaderboards + ELO deltas
- PGN logs with metadata
- Timing per move and per provider
- Cost reports that make budgeting easy to reason about

---

## Patterns that held up

### AsyncIO that stays readable
- Concurrent provider calls without starving the UI
- Graceful recovery if a model suggests an illegal move or times out

### Terminal UIs can be beautiful
- `rich` makes dashboards feel like a real app, not a log dump
- Frame rates that feel smooth but not noisy

### LLM chess behavior emerges fast
- Tiny format tweaks can make/break parsing stability
- Context management matters with long games
- **Agent > raw prompts** once positions get even slightly tactical

### Engines keep us honest
- Stockfish is a rock—fast, fair, and great for grounding difficulty
- ELO calibration gives “levels” that are meaningful, not arbitrary

### Python patterns I reach for
- Dataclasses for clarity and serialization
- Type hints across async boundaries
- Factory methods for model clients and agents
- Env-driven config + CLI flags for everything that matters

---

## The agent “oh wow” moment

Side-by-side runs made it obvious:

**Prompts only (struggles)**
- Illegal moves happen more than you’d expect
- Decisions feel unprincipled in messy middlegames
- Notation/formatting errors are a tax you keep paying

**Agent mode (wins)**
- Structured scoring leads to saner, repeatable choices
- Quick threat checks catch blunders before they happen
- Confidence scores + traces make debugging feel like analysis, not guesswork

I ship tools for people who care about control and observability; this was the first time I felt that same “observability” applied to a model’s *thinking* in a game loop.

---

## Roadmap

**Short-term (next month)**
- Opening book support
- Elimination brackets with seeds
- Custom evaluation hooks
- Batch runs for large experiments

**Quarter-scale**
- Stronger evaluation via Leela-style nets
- MCTS-like lookahead for the agent path
- Multi-agent collaboration (committee of styles)
- Deeper stats: opening repertoires, tactical motifs, endgames

**Exploratory**
- Learn-from-own-games mode
- “Play like X” style transfer
- Puzzle-only benchmarks
- Real-time commentary streams
- Cross-domain strategy experiments (Go, poker, etc.)
