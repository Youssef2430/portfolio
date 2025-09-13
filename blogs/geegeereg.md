# GeeGees Sports Platform — One Project, Three Engines (and why I can’t stop building it)

> uOttawa intramurals were chaos. I’m a player, a builder, and a shameless optimizer—so I turned my frustration into a platform.

I’m Youssef. I study CS at the University of Ottawa, work part‑time at the NRC, and play (a lot of) volleyball and basketball. Between classes, research, and games, I was constantly juggling five tabs, three spreadsheets, and “who’s subbing tonight?” texts. That pain turned into a project I’ve fallen in love with: an end‑to‑end, privacy‑respecting sports stack for students—scraper → API → web app—that makes intramurals feel as polished as pro sports.

This is the story of how those three pieces fit together, why I’m obsessed with the details, and what’s next.

---

## TL;DR (what I actually built)

* **GeeGees Hub (web)** — Next.js + React + TypeScript UI with real‑time matchups, trending teams, playoff brackets, and an actually useful calendar.
* **GeeGeesRec API (backend)** — Rust + Actix Web + PostgreSQL serving standings, schedules, playoffs, and analytics in **sub‑50ms**.
* **GeeGees Hub Scraper (ingest)** — Playwright‑powered CLI with a beautiful TUI to turn messy registration sites into clean JSON.
* **Philosophy** — Fast, accessible, resilient, and fun to use. When the data source flakes, the product shouldn’t.

---

## Why this matters to me

I live this data. I practice, I scout, I drag my friends to late games across campus. I also care about craft—clean APIs, accessible UI, and systems that don’t fall apart when a server hiccups. Building this wasn’t just a dev exercise; it made my campus life calmer and my teams better informed. It also scratched the builder itch: I love seeing a tight feedback loop between code and real‑world experience.

---

## The architecture at a glance

```
ActiveNet & friends → Scraper (Playwright + TUI)
                     → Clean JSON → GeeGeesRec API (Rust/Actix + SQLx/Postgres)
                                         → GeeGees Hub (Next.js 15 / React 19)
```

**Ingest** pulls structured data with respectful concurrency. **API** normalizes, indexes, and computes standings/trends. **UI** turns it into a fast, delightful experience with thoughtful loading, error states, and animations.

---

## Ingest: the Scraper that respects your terminal

A lot of scrapers are throwaway scripts. Mine’s a proper **CLI with a TUI**: live progress bars, per‑task spinners, ETA, and clean error reporting. It prefers **API endpoints over HTML** for speed and stability, runs with **concurrency limits**, and outputs predictable **hierarchical JSON** (sport → league → team). It’s weirdly satisfying to watch.

**Why I cared:** ingestion quality sets the ceiling for everything else. If your ingest is flaky, your UI becomes a liar. I’d rather spend an extra week on a great pipeline than paper over bad data with UI tricks.

---

## Core: the Rust API that doesn’t blink on game night

I rebuilt the backend in **Rust (Actix Web + SQLx + Postgres)** for a reason: sports are bursty. When a dozen games finish at once, you need realtime standings and playoff updates without timeouts.

Highlights:

* **Sub‑50ms endpoints** even under load, thanks to SQL‑first calculations (win %s, point diffs, bracket progression) and proper indexes.
* **Environment‑aware CORS** (lenient in dev, strict in prod) so shipping doesn’t become a build‑day panic.
* **Zero‑downtime deploys**; games don’t wait for maintenance windows.

**Why I cared:** I want fearless refactors and production confidence. Rust’s type system and SQLx’s compile‑time checks let me sleep before playoffs.

---

## Experience: the Hub where students actually find stuff

The **Next.js 15 + React 19** frontend is opinionated: quick, accessible, and visually coherent. I use server vs client components with intent, custom hooks for data fetching (SWR‑like), and a design system that keeps the app consistent.

Features students love:

* **Featured matchups** with live **win‑probability rings** and recent form.
* **Trending teams** driven by an **Elo‑style** momentum model—not just win streaks.
* **Playoff brackets** that update in real time.
* **Drop‑in calendar** that answers “where and when” without Slack archaeology.

**Why I cared:** this is for my friends and teammates. If the page stutters or a keyboard user gets stuck, I feel it personally.

---

## Hard problems I had to earn

* **Messy, changing data** → robust fallbacks and idempotent updates so the app is never empty, just honest about state.
* **State boundaries** → server state (cached API data) vs client state (UI). Fewer re‑renders, more flow.
* **Performance with motion** → memoized charts and lazy‑loaded heavy components to keep the UI playful *and* fast.

---

## What I learned (and keep applying)

* **Rust for web** is not just fast—it’s *predictably* fast. Ownership forces better designs.
* **SQL belongs in the database.** Let Postgres compute; ship smaller payloads.
* **React maturity**: error boundaries, transitions, and progressive enhancement are non‑negotiable.
* **DX matters**: a good CLI and clean contracts make future me (and future collaborators) faster.

---

## Roadmap (the fun part)

**Near‑term**

* WebSockets for live scores
* Redis caching + rate limiting
* Team captain tools (rosters, comms)
* Better filters/search across sports & times

**Mid‑term**

* GraphQL endpoint + mobile SDK
* Analytics dashboard for players/leagues
* Referee portal & incident tracking
* Fantasy mode (because why not?)

**Long‑term**

* Multi‑university support
* Video highlights & alumni layer
* Smarter notifications and voice interfaces

---

## Why I’m still excited

This project blends everything I care about: performance, accessibility, beautiful UIs, and making student life easier. It’s also *mine*—born from late games, long bus rides, and too many coffees. Every release makes campus sports feel a little more professional and a lot more human.

If you want to try it, contribute, or throw feature ideas at me, I’m all ears. See you on the court—and in the commit history.
