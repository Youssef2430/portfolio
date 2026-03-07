# chessLLM: Pitting LLMs Against Each Other in Chess

Can Claude beat GPT-4 at chess? Does Gemini actually play principled openings, or is it just winging it? I got tired of guessing based on scattered Reddit threads, so I built **chessLLM**: a terminal-first arena where language models play real chess against each other and against engines, with move validation, cost tracking, and full game logs.

If you've seen my LedgerGlass app, the ethos is the same. Keep the surface area small, make everything observable, and never let costs surprise you. The difference here is that the "UI" is a terminal board and a live stats dashboard, and watching games play out feels more like a sport than a benchmark.

---

## The short version

- **What it is**: A Python CLI for head-to-head LLM chess, with strict move validation and smart opponent matching.
- **Two modes**: Plain prompting vs. agent-assisted reasoning, where the model gets a lightweight analysis toolkit and a structured decision process.
- **Why bother**: Anecdotes about which model is "smarter" weren't cutting it. I wanted repeatable data.
- **The details**: Real-time board rendering, PGN logging, historical leaderboards, and built-in cost tracking. Running models isn't free and I like knowing exactly what I'm spending.
- **Supported providers**: OpenAI, Anthropic, Google, plus Stockfish as a ground-truth sparring partner.
- **What's next**: Opening books, tournament brackets, MCTS-style planning, and multi-agent collaboration.

---

## Why this project

I'm a grad student at uOttawa and a part-time software engineer at Canada's NRC. My day-to-day swings between academic rigor and production constraints, and I tend to gravitate toward small tools that actually ship. A few things made this project feel right:

**I wanted real evaluation.** If I'm going to claim "Model A reasons better than Model B," I'd rather have a dataset than a gut feeling. Chess is bounded, well-defined, and hard enough to be interesting.

**I'm cost-conscious by nature.** LedgerGlass changed how I think about spending, and that carried over here. chessLLM tracks what each game costs per model, per move, per run.

**Terminal UIs are underrated.** A tight CLI with good ergonomics beats a heavy web stack when you care about iteration speed.

**I'm practically curious about agents.** Not "agents that can do everything," just whether a thin reasoning layer helps on a bounded task like move selection. Spoiler: it does, and by a lot.

---

## Design constraints

These kept the project from sprawling:

- **Terminal-first.** Unicode pieces, live updates, keyboard shortcuts. No browser required.
- **Provider-agnostic.** One interface, multiple vendors. Swapping models doesn't mean rewriting anything.
- **Cost-aware.** Budget limits, spending breakdowns, and automatic stops before things get expensive.
- **Engine-grade validation.** Every move is verified. Stockfish serves as both opponent and referee.
- **Reproducible.** Full PGN logs with config metadata, so any game can be rerun or shared.

---

## Why a terminal app was so satisfying

Most of my recent work has been web and APIs. Going back to the terminal felt different in a good way:

- **Immediate feedback.** Run a command, watch a board animate, see two AIs fight over the center.
- **No distractions.** No React state, no CSS breakpoints. Just logic, data, and performance.
- **Async done well.** Concurrent API calls, UI refreshes, and game state all cooperate nicely in modern Python.
- **Performance as craft.** Shaving time off rendering and batching calls scratches the same itch as tuning a game engine.

---

## How it works

### Architecture

- **Core models**: `BotSpec`, `GameRecord`, `LadderStats`, `LiveState`. Explicit types that stay easy to debug.
- **Engine layer**: Stockfish handles legality checks and optional opponent play at calibrated ELOs.
- **LLM layer**: Unified clients for OpenAI, Anthropic, and Google, plus a random baseline.
- **Game manager**: Orchestrates turns, logs PGNs, tracks timing and costs, and drives the live dashboard.
- **Agent system**: An optional reasoning pass with lightweight evaluation and scored move selection.
- **Storage**: SQLite-backed history, leaderboards, and spend analytics.

### Two modes of play

**Standard prompting (default)**
Send the position as FEN, ask for a UCI move in a strict format, parse it, validate it, apply it, repeat.

**Agent mode** (`--use-agent`)
Before choosing a move, the model runs a quick evaluation: material balance, pawn structure, king safety, center control, piece activity. It scores every legal move, adjusts for game phase, and picks the best one with a confidence score and a reasoning trace.

### What the analysis toolkit covers

It's deliberately simple:

- **Position**: center control, piece activity, king safety, pawn structure, development
- **Material**: standard piece values and imbalance tracking
- **Move classification**: captures, checks, castling, development, tactical, defensive
- **Endgames**: king activity, pawn races, piece coordination
- **Threats**: detect and defend basic tactics without overcomplicating things

### The terminal UI

- Unicode board with last-move highlights and coordinates
- Live ELO, win rate, move timers, and token/cost counters
- Opponent selection: random, Stockfish at a given ELO, or full ladder climbing

### Analytics

- Historical leaderboards with ELO deltas
- PGN logs with full metadata
- Per-move and per-provider timing
- Cost reports broken down however you want

---

## What held up well

**AsyncIO that stays readable.** Concurrent provider calls don't starve the UI, and recovery from illegal moves or timeouts is graceful.

**Terminal UIs can look great.** `rich` makes dashboards feel like a real application, not a wall of log lines.

**LLM chess behavior shows up fast.** Small format changes make or break parsing stability. Context management matters in long games. And agent mode consistently outperforms raw prompts once positions get even slightly tactical.

**Engines keep things honest.** Stockfish is fast, fair, and gives you meaningful difficulty levels instead of arbitrary ones.

**Python patterns I lean on.** Dataclasses for clarity, type hints across async boundaries, factory methods for model clients, and env-driven config with CLI overrides.

---

## The agent difference

Running the two modes side by side made this obvious:

**Prompts only.** Illegal moves happen more than you'd expect, decisions feel unprincipled in messy middlegames, and notation errors are a constant tax.

**Agent mode.** Structured scoring leads to more consistent choices, quick threat checks catch blunders before they happen, and confidence scores with reasoning traces turn debugging into actual analysis instead of guesswork.

I build tools for people who care about control and observability. This was the first time I felt that same idea apply to a model's thinking inside a game loop.
