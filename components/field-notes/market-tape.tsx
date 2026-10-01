"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { randomSource } from "@/lib/market-math";
import { SecretRoom } from "./secret-room";

const WINDOW = 96;
const MU = 0.12;
const TICK_MS = 110;

/** The same seeded opening path on server and client, so hydration matches. */
function openingPath(sigma: number) {
  const rng = randomSource(7);
  const path = [100];
  for (let i = 1; i < WINDOW; i++) {
    const s = sigma / 100;
    path.push(path[i - 1] * Math.exp((MU - s * s / 2) / 252 + (s / Math.sqrt(252)) * rng.normal()));
  }
  return path;
}
const normal = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

type Tape = { path: number[]; jumps: number[]; tick: number };

/**
 * The markets article's title card: a live geometric Brownian motion tape.
 * Volatility is a slider, a shock is a compound-Poisson jump, and the title's
 * letters move with the most recent returns.
 */
export function MarketsHero({ title }: { title: string }) {
  const [sigma, setSigma] = useState(21.4);
  const [tape, setTape] = useState<Tape>(() => ({ path: openingPath(21.4), jumps: [], tick: WINDOW - 1 }));
  const [shocks, setShocks] = useState(0);
  const [secret, setSecret] = useState(false);
  const [live, setLive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef(sigma);
  useEffect(() => {
    sigmaRef.current = sigma;
  }, [sigma]);

  // Run only while visible, and never for readers who asked for less motion.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      const s = sigmaRef.current / 100;
      setTape((t) => {
        const last = t.path[t.path.length - 1];
        const next = last * Math.exp((MU - s * s / 2) / 252 + (s / Math.sqrt(252)) * normal());
        return { path: [...t.path.slice(1), next], jumps: t.jumps, tick: t.tick + 1 };
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [live]);
  useEffect(
    () => () => {
      delete document.documentElement.dataset.marketEnergy;
    },
    [],
  );

  function shock() {
    const count = Math.min(3, shocks + 1);
    setShocks(count);
    setTape((t) => {
      const last = t.path[t.path.length - 1];
      const next = last * Math.exp(-(0.09 + 0.06 * Math.random()));
      return { path: [...t.path.slice(1), next], jumps: [...t.jumps, t.tick + 1], tick: t.tick + 1 };
    });
    // The first interactive figure listens for this and applies its own stress scenario.
    document.documentElement.dataset.marketEnergy = String(count);
    window.dispatchEvent(new CustomEvent("field-note-shock", { detail: count }));
  }
  function reset() {
    setShocks(0);
    setSecret(false);
    setSigma(21.4);
    setTape({ path: openingPath(21.4), jumps: [], tick: WINDOW - 1 });
    delete document.documentElement.dataset.marketEnergy;
    window.dispatchEvent(new CustomEvent("field-note-shock", { detail: 0 }));
  }

  const { path, jumps, tick } = tape;
  const returns = useMemo(() => path.slice(1).map((p, i) => Math.log(p / path[i])), [path]);
  const w = 248,
    h = 118;
  const lo = Math.min(...path, 100),
    hi = Math.max(...path, 100);
  const pad = (hi - lo) * 0.12 || 1;
  const x = (i: number) => (i / (WINDOW - 1)) * w;
  const y = (v: number) => 6 + (1 - (v - lo + pad) / (hi - lo + 2 * pad)) * (h - 12);
  const line = path.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const first = tick - (WINDOW - 1);
  const visibleJumps = jumps.filter((j) => j > first).map((j) => j - first);
  const recent = returns.slice(-60);
  const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
  const realized =
    Math.sqrt(recent.reduce((a, r) => a + (r - mean) ** 2, 0) / Math.max(1, recent.length - 1)) * Math.sqrt(252) * 100;
  const peak = Math.max(...path);
  const last = path[path.length - 1];
  const drawdown = (1 - last / peak) * 100;
  // One return per letter; a daily sigma of 1.35% moves a letter about 3px.
  const daily = 0.214 / Math.sqrt(252);
  const wave = returns.slice(-10);
  const whisper =
    shocks >= 3
      ? "Three shocks in a row. Fancy forecasting the next tick?"
      : shocks > 0
        ? "A jump: the compound-Poisson shock Z from the article. Brownian motion alone can’t do that."
        : sigma === 0
          ? "σ = 0: a perfectly predictable market. The economists would like a word."
          : sigma >= 55
            ? "Turbulence setting. Please keep your assumptions inside the model."
            : "A live GBM tape, μ = 12%. Drag σ, or knock the market over.";

  return (
    <div className={`fn-living-title fn-living-markets mh-shocks-${shocks}`}>
      <div>
        <h1 aria-label={title}>
          When markets
          <br />
          <button className="fn-title-word mh-word" onClick={shock} aria-label="Shock the market">
            {"misbehave.".split("").map((letter, i) => {
              const r = wave[i] ?? 0;
              const dy = Math.max(-16, Math.min(16, (-r / daily) * 4));
              return (
                <span key={i} style={{ transform: `translateY(${dy.toFixed(1)}px)` }}>
                  {letter}
                </span>
              );
            })}
          </button>
        </h1>
        <p className="fn-title-whisper" aria-live="polite">
          {whisper}
          {shocks >= 3 && (
            <>
              {" "}
              <button className="mh-link" onClick={() => setSecret(!secret)}>
                {secret ? "close the forecasting desk" : "open the forecasting desk →"}
              </button>
            </>
          )}
        </p>
      </div>
      <div className="mh-card" ref={cardRef}>
        <div className="mh-card-top">
          <span>
            <i className={live ? "is-live" : ""} /> SIM · GBM
          </span>
          <span>day {tick + 1}</span>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Simulated price ${last.toFixed(1)}, annual volatility ${sigma.toFixed(0)} percent`}>
          <line x1="0" x2={w} y1={y(100)} y2={y(100)} className="mh-base" />
          <text x="2" y={y(100) - 3} className="mh-base-label">
            100
          </text>
          <path d={`${line} L${w},${h} L0,${h} Z`} className="mh-area" />
          <path d={line} className="mh-line" />
          {visibleJumps.map((j) =>
            j > 0 ? (
              <g key={j + first}>
                <line x1={x(j - 1)} x2={x(j)} y1={y(path[j - 1])} y2={y(path[j])} className="mh-jump" />
                <circle cx={x(j)} cy={y(path[j])} r="2.6" className="mh-jump-dot" />
              </g>
            ) : null,
          )}
          <circle cx={x(WINDOW - 1)} cy={y(last)} r="3.2" className="mh-now" />
          <circle cx={x(WINDOW - 1)} cy={y(last)} r="3.2" className={`mh-now-ring ${live ? "is-live" : ""}`} />
        </svg>
        <dl className="mh-stats">
          <div>
            <dt>price</dt>
            <dd>{last.toFixed(1)}</dd>
          </div>
          <div>
            <dt>realised vol</dt>
            <dd>{realized.toFixed(0)}%</dd>
          </div>
          <div>
            <dt>drawdown</dt>
            <dd>{drawdown.toFixed(1)}%</dd>
          </div>
        </dl>
        <label className="mh-slider">
          <span>σ {sigma.toFixed(0)}%</span>
          <input
            type="range"
            min={0}
            max={60}
            step={1}
            value={sigma}
            onChange={(e) => setSigma(Number(e.target.value))}
            aria-label="Annual volatility"
          />
        </label>
        <div className="mh-actions">
          <button className="mh-shock" onClick={shock} disabled={shocks >= 3}>
            Shock ↯ <small>{shocks}/3</small>
          </button>
          {shocks > 0 && (
            <button className="mh-reset" onClick={reset}>
              reset ↺
            </button>
          )}
        </div>
      </div>
      {secret && (
        <div className="fn-header-secret">
          <SecretRoom kind="markets" revealed />
        </div>
      )}
    </div>
  );
}
