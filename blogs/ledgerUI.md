# Building LedgerGlass: Why I Built a Privacy-First Finance App for macOS, How It Works, and What’s Next

If you’ve ever tried to keep a clean pulse on your personal finances without handing everything to a cloud service, you know the trade-offs: great charts usually come with account scraping, background syncing, or “trust us with your data.” I wanted the opposite, a beautiful, modern, Mac-native experience that keeps every byte on my machine.

LedgerGlass is that itch scratched: a SwiftUI app that turns bank CSVs into an insight-rich, privacy-first personal ledger. It uses SwiftData for storage and Apple’s NaturalLanguage embeddings for on-device categorization. No servers, no keys, no tracking.


## TL;DR
- A native macOS app (SwiftUI + SwiftData) that imports bank CSVs and visualizes spending, cash flows, and subscriptions.
- On-device ML categorization with NaturalLanguage — works offline, respects privacy.
- New Subscriptions Calendar with color-coded amounts and month navigation.
- Thoughtful design system, light/dark themes, and modern macOS ergonomics.
- Next up: bank statement support (OFX/QFX/MT940/PDF) with reconciliation, plus budgets/alerts, forecasting, multi-currency with FX, iCloud sync (opt-in, E2E), and deeper rules/automation.


## Why I built it
- Privacy by default: I wanted a ledger that never ships my transactions to a third party.
- Delightful by design: Financial software should feel calm and responsive, not transactional and clunky.
- Learn the latest Apple stack: SwiftData, SwiftUI’s modern navigation, NaturalLanguage embeddings, and Charts.
- Own my data: CSV import/export with simple backups, and no vendor lock-in.


## What I set out to build (constraints I kept)
- Offline-first. Everything runs locally; network is optional and never required.
- Mac-native. Embrace SwiftUI, SwiftData, menus, keyboard shortcuts, and system conventions.
- Human-readable storage. CSV in, CSV (or more) out.
- Fast enough to be fun. Import, recategorize, and navigate without waiting spinners.


## From servers to SwiftUI: the confusing (and oddly refreshing) part

Most of my work lives in the land of APIs, data pipelines, and agents — spin up a service, define clean boundaries, ship JSON, scale horizontally, measure. Building a macOS app flipped that on its head in a good way.

What felt confusing at first:
- **State everywhere, all at once.** Coming from stateless requests, juggling `@State`, `@StateObject`, `@Environment`, and `@Query` felt like learning a new traffic system. The fix: be ruthless about where state lives and push heavier work into services.
- **App lifecycle & scenes.** Servers boot once and run forever; apps wake, sleep, and juggle windows. Understanding `App` vs `Scene` vs `WindowGroup`, and when to persist vs recompute, took a minute.
- **Sandboxing & file access.** In backend land, you read files. On macOS, you *ask politely*. Security-scoped bookmarks, open panels, and user intent are the rules. It’s extra steps — and it’s the whole point of local-first trust.
- **Keyboard-first ergonomics.** I’m used to CLI speed; making a GUI that’s actually faster with shortcuts, focus rings, and command menus was a design problem, not just a tech problem.
- **Latency mindset.** A server can hide a 200 ms hop; a desktop UI can’t. Every parse, every fetch, every redraw has to *feel instant*.

Why it was fresh:
- **Tighter feedback loop.** SwiftUI previews + small view models = build–run–fix cycles that feel like a REPL for UI.
- **Ownership.** No glue services, no brittle web layers, just the app, the data, the user.
- **Craft.** Tiny hover states, elastic grids, and consistent spacing make software feel calm. You can *feel* the quality when it’s right.

This stretch from “API brain” to “app brain” is exactly why I wanted to do LedgerGlass native. It forced better boundaries (models/services/views), more empathy for interaction, and a deeper respect for platform patterns.


## How LedgerGlass works

### Architecture at a glance
- SwiftData models: Account, CategoryEntity, TransactionEntity, SubscriptionEntity.
- Services:
  - CSVParsing: delimiter detection, robust quoted fields, type/amount inference.
  - ImportService: orchestrates mapping, account creation, categorization, and subscription detection.
  - OnDeviceCategorizer: NaturalLanguage embeddings to map transactions to user categories.
  - AgentService: post-import enrichment (categorize + recurring detection).
  - AnalyticsService: cash-flow, spending breakdowns, category-aware totals.
- Views: Dashboard, Transactions, Subscriptions (List + Calendar), Settings, Category Manager.
- Design: a lightweight design system for colors, typography, spacing, and modern button components.

### Import pipeline
1) You drop in a CSV from your bank.
2) The parser detects delimiters and handles quoted fields.
3) Amounts are inferred from common bank patterns (Amount, Credit/Debit, Type columns).
4) Accounts/transactions are created, then enrichment runs: categorization + recurring detection.

### On-device categorization (NaturalLanguage)
- I embed category names/descriptions and compute similarity to each transaction.
- You can correct categories; those improvements are reflected immediately (and influence heuristics).
- No API keys, no network calls.

### Subscription detection
- Looks for cadence (weekly, monthly, yearly, etc.) plus amount consistency.
- Tracks lastDate + period to project future billing dates.
- Feeds the Subscriptions Calendar so you can “see the month” at a glance.

### Subscriptions Calendar (new)
- macOS-style monthly grid with weekday headers and today highlighting.
- Uses all available space; cells scale to the window.
- Color-coded by total expected charges for the day:
  - Green < 50, Yellow 50–100, Orange 100–200, Red 200+
- Currency symbol matches your Settings.
- Click a day to view all charges due on that date.

### Dashboard
- Stacked category bars per month with a spending trend line.
- 90-day spending breakdown and quick stats.
- Light/dark themes with thoughtful contrast.

### Transactions
- Fast search, filter pills, context actions.
- CSV import is a first-class citizen.
- Re-label all with one action if you adjust categories.

### Settings
- Manage Categories (inline editing, color picker, kind selection).
- Preferred currency (reflected across the app, including the calendar).
- Re-run enrichment & Re-label All.
- Erase All Data: clears the SwiftData store (useful after schema changes).

> Screenshots (from the repo’s `screenshots/` folder):
>
> - `dashboard-light-dark.png` — Dashboard
> - `transactions.png` — Transactions
> - `subscriptions-list.png` — Subscriptions List
> - `subscriptions-calendar.png` — Subscriptions Calendar (color-coded)


## What I learned

### SwiftData in a real app
- Schema changes are pleasant… until they aren’t. I added defaults and an Erase-All-Data escape hatch for stubborn migrations.
- Fetching with `@Query` makes SwiftUI views feel reactive; still, I prefer isolating heavier computations in services.

### NaturalLanguage embeddings are practical
- For finance categorization, embeddings + a small rules layer go a long way.
- Descriptive category names/descriptions materially improve accuracy.
- Deterministic heuristics + similarity scores > heuristics alone.

### SwiftUI Layout on macOS
- Using `GeometryReader` to size calendar cells to the available space made the calendar feel “native.”
- Swapping a segmented control for custom buttons gave better consistency with the design system.
- Small hover/press states add a lot of perceived quality.

### Sandboxing realities
- Security-scoped URLs mean: always pick files through the open panel.
- It’s worth it for local-first peace of mind.

### Developer ergonomics
- Xcode 16’s build/test pipeline is fast enough to keep the loop tight.
- A tiny design system (colors/typography/spacing) beats inline one-offs — easier to refactor and theme.

### The mindset shift
- Treat services like micro-backends *inside* the app: pure inputs/outputs, no view logic.
- Budget every millisecond the user can feel.
- Design hot paths first (import, search, recategorize) and make them keyboard-native.

## Closing thoughts
LedgerGlass is my answer to a simple question: can personal finance software be beautiful, fast, and private by default? Building it with the latest Apple stack has been both a joy and a learning lab — and yes, jumping from APIs/web to macOS was confusing at first, in the same way switching sports feels clumsy for a week and then suddenly clicks. If you have ideas, requests, or tough CSVs (or statements), I’d love to hear from you — open an issue, share a screenshot, or suggest a rule set.

Most of all, I hope LedgerGlass helps you see your money more clearly, without giving it away.
