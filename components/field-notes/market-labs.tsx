"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { RotateCcw, Play, Pause } from "lucide-react";
import { simulateGBM } from "@/lib/field-notes";
import {
  correlation,
  covariance,
  histogram,
  mean,
  normalQuantile,
  randomSource,
  rollingVolatility,
  simulateMarket,
  tailRisk,
  variance,
} from "@/lib/market-math";
import { Plot } from "./chart";
import type { LabKind } from "./lazy-market-lab";

const pct = (n: number) => `${n.toFixed(1)}%`;
const fixed = (n: number) => n.toFixed(2);
const integer = (n: number) => Math.round(n).toLocaleString("en-US");
function Range({
  label,
  value,
  set,
  min,
  max,
  step = 1,
  format = integer,
}: {
  label: string;
  value: number;
  set: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (n: number) => string;
}) {
  const id = useId();
  return (
    <label className="ml-range" htmlFor={id}>
      <span>
        {label}
        <output>{format(value)}</output>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
      />
    </label>
  );
}
function Tabs({
  tabs,
  value,
  set,
}: {
  tabs: string[];
  value: number;
  set: (n: number) => void;
}) {
  return (
    <div className="ml-tabs" aria-label="Chart views">
      {tabs.map((tab, i) => (
        <button key={tab} aria-pressed={value === i} onClick={() => set(i)}>
          {tab}
        </button>
      ))}
    </div>
  );
}
function Shell({
  number,
  title,
  description,
  children,
  footer,
  rerun,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
  rerun?: () => void;
}) {
  return (
    <section className="ml-lab" aria-label={title}>
      <header className="ml-header">
        <div>
          <span className="ml-eyebrow">{number} / Interactive figure</span>
          <h3>{title}</h3>
        </div>
        {rerun && (
          <button
            className="ml-icon-button"
            onClick={rerun}
            aria-label={`Resample ${title}`}
            title="Generate a new sample"
          >
            <RotateCcw size={15} />
          </button>
        )}
      </header>
      <p className="ml-description">{description}</p>
      {children}
      <footer className="ml-footer">{footer}</footer>
    </section>
  );
}
function Paths() {
  const [sigma, setSigma] = useState(
      () =>
        21.4 + Number(document.documentElement.dataset.marketEnergy || 0) * 10,
    ),
    [seed, setSeed] = useState(17),
    [shock, setShock] = useState(
      () => Number(document.documentElement.dataset.marketEnergy || 0) > 0,
    ),
    [day, setDay] = useState(252),
    [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () =>
        setDay((d) => {
          if (d >= 252) {
            setPlaying(false);
            return 252;
          }
          return Math.min(252, d + 3);
        }),
      35,
    );
    return () => clearInterval(timer);
  }, [playing]);
  useEffect(() => {
    const onShock = (event: Event) => {
      const energy = (event as CustomEvent<number>).detail;
      setShock(energy > 0);
      setSigma(energy ? 21.4 + energy * 10 : 21.4);
    };
    window.addEventListener("field-note-shock", onShock);
    return () => window.removeEventListener("field-note-shock", onShock);
  }, []);
  const paths = useMemo(
    () =>
      simulateGBM(sigma / 100, seed).map((p) =>
        p.map((v, i) => v * (shock && i >= 126 ? 0.8 : 1)),
      ),
    [sigma, seed, shock],
  );
  return (
    <Shell
      number="01"
      title="Simulating a year of prices"
      description="Change volatility, replay the year, or apply the same 20% shock to every path on day 126."
      rerun={() => setSeed((s) => s + 1)}
      footer={
        <>
          Eight GBM paths. S₀ = 100, μ = 12%, 252 trading days. The shock is a
          fixed stress scenario. Axes fit the visible data.
        </>
      }
    >
      <Plot
        series={paths.map((p, i) => ({
          name: `Path ${i + 1}`,
          points: p.slice(0, day + 1).map((y, x) => ({ x, y })),
        }))}
        xLabel="Day"
        yLabel="Price"
        formatY={integer}
      />
      <div className="ml-controls">
        <Range
          label="Annual volatility"
          value={sigma}
          set={setSigma}
          min={0}
          max={60}
          step={0.1}
          format={pct}
        />
        <Range
          label="Trading day"
          value={day}
          set={(n) => {
            setPlaying(false);
            setDay(n);
          }}
          min={1}
          max={252}
        />
      </div>
      <div className="ml-actions">
        <button
          onClick={() => {
            if (day === 252) setDay(1);
            setPlaying(!playing);
          }}
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}
          {playing ? "Pause" : "Replay year"}
        </button>
        <button aria-pressed={shock} onClick={() => setShock(!shock)}>
          {shock ? "Remove shock" : "Apply shock ↯"}
        </button>
        <span>Seed {seed}</span>
      </div>
      {sigma === 0 && (
        <div className="ml-discovery">
          <span>Hidden experiment found</span>
          <strong>You switched off randomness.</strong>
          <p>
            All eight paths now coincide. Try the shock with σ = 0: a surprise
            can still move a deterministic model.
          </p>
          <button
            onClick={() => {
              setShock(true);
              setDay(1);
              setPlaying(true);
            }}
          >
            Run that experiment ↗
          </button>
        </div>
      )}
    </Shell>
  );
}
function Foundations() {
  const [tab, setTab] = useState(0),
    [sigma, setSigma] = useState(21.4),
    [seed, setSeed] = useState(17);
  const data = useMemo(() => {
    const paths = simulateGBM(sigma / 100, seed, 12);
    const rng = randomSource(seed);
    const returns = Array.from(
      { length: 5000 },
      () =>
        ((0.12 - (sigma / 100) ** 2 / 2) / 252 +
          (sigma / 100 / Math.sqrt(252)) * rng.normal()) *
        100,
    );
    const terminal = Array.from(
      { length: 5000 },
      () =>
        100 *
        Math.exp(0.12 - (sigma / 100) ** 2 / 2 + (sigma / 100) * rng.normal()),
    );
    const returnBins = histogram(returns),
      terminalBins = histogram(terminal);
    const returnMean = ((0.12 - (sigma / 100) ** 2 / 2) / 252) * 100,
      returnStd = sigma / Math.sqrt(252);
    const returnTheory = returnBins.map((p) => ({
      x: p.x,
      y:
        (returns.length *
          (returnBins[1].x - returnBins[0].x) *
          Math.exp(-0.5 * ((p.x - returnMean) / returnStd) ** 2)) /
        (returnStd * Math.sqrt(2 * Math.PI)),
    }));
    const terminalTheory = terminalBins.map((p) => ({
      x: p.x,
      y:
        (terminal.length *
          (terminalBins[1].x - terminalBins[0].x) *
          Math.exp(
            -0.5 *
              ((Math.log(p.x / 100) - 0.12 + (sigma / 100) ** 2 / 2) /
                (sigma / 100)) **
                2,
          )) /
        (((p.x * sigma) / 100) * Math.sqrt(2 * Math.PI)),
    }));
    return {
      paths,
      returns,
      terminal,
      returnBins,
      returnTheory,
      terminalBins,
      terminalTheory,
    };
  }, [sigma, seed]);
  const tabs = [
    "Price paths",
    "Daily returns",
    "Final prices",
    "Rolling volatility",
  ];
  return (
    <Shell
      number="02"
      title="What GBM produces"
      description="The same assumptions, viewed as prices, daily changes, and distributions. Change σ to regenerate all four views."
      rerun={() => setSeed((s) => s + 1)}
      footer={
        <>
          Computed locally. Distribution views use 5,000 draws; rolling
          volatility uses a 20-day sample window on the first path. Counts are
          observations per bin.
        </>
      }
    >
      <Tabs tabs={tabs} value={tab} set={setTab} />
      {tab === 0 && (
        <Plot
          key="paths"
          series={data.paths.map((p, i) => ({
            name: `Path ${i + 1}`,
            points: p.map((y, x) => ({ x, y })),
          }))}
          xLabel="Day"
          yLabel="Price"
          formatY={integer}
        />
      )}
      {tab === 1 && (
        <Plot
          key="returns"
          bars
          series={[
            { name: "Simulated daily log-returns", points: data.returnBins },
            { name: "Normal model", points: data.returnTheory, line: true },
          ]}
          xLabel="Return"
          yLabel="Count"
          formatX={pct}
          formatY={integer}
        />
      )}
      {tab === 2 && (
        <Plot
          key="terminal"
          bars
          series={[
            { name: "Prices after 252 days", points: data.terminalBins },
            {
              name: "Lognormal model",
              points: data.terminalTheory,
              line: true,
            },
          ]}
          xLabel="Final price"
          yLabel="Count"
          formatY={integer}
        />
      )}
      {tab === 3 && (
        <Plot
          key="rolling"
          series={[
            {
              name: "20-day estimate",
              points: rollingVolatility(data.paths[0]),
            },
            {
              name: "Model σ",
              dashed: true,
              points: [
                { x: 20, y: sigma },
                { x: 252, y: sigma },
              ],
            },
          ]}
          xLabel="Day"
          yLabel="Annualized σ"
          formatY={pct}
        />
      )}
      <Range
        label="Annual volatility"
        value={sigma}
        set={setSigma}
        min={1}
        max={60}
        step={0.1}
        format={pct}
      />
    </Shell>
  );
}
function Conditional() {
  const [r, setR] = useState(0),
    [tab, setTab] = useState(0);
  const expected = (x: number) =>
    Math.exp(-3.5 + 15 * Math.abs(x / 100) + 0.045) * 100;
  const logMean = -3.5 + 15 * Math.abs(r / 100);
  const density = Array.from({ length: 160 }, (_, i) => {
    const v = 0.003 + i * 0.0009;
    return {
      x: v * 100,
      y:
        Math.exp(-((Math.log(v) - logMean) ** 2) / 0.18) /
        (v * 0.3 * Math.sqrt(2 * Math.PI)) /
        100,
    };
  });
  return (
    <Shell
      number="03"
      title="Sector volatility given a market move"
      description="Compare equal positive and negative returns. This model responds to their magnitude, so the conditional distributions match."
      footer={
        <>
          α = −3.5, β = 15, τ = 0.3. These are illustrative sector parameters,
          not fitted estimates.
        </>
      }
    >
      <Tabs
        tabs={["Conditional distribution", "Expected volatility"]}
        value={tab}
        set={setTab}
      />
      {tab === 0 ? (
        <Plot
          key="density"
          series={[
            { name: `Given a ${pct(r)} market return`, points: density },
          ]}
          xLabel="Sector volatility"
          yLabel="Density / %-point"
          formatX={pct}
        />
      ) : (
        <Plot
          key="expectation"
          series={[
            {
              name: "Conditional expectation",
              points: Array.from({ length: 101 }, (_, i) => ({
                x: -5 + i / 10,
                y: expected(-5 + i / 10),
              })),
            },
          ]}
          xLabel="Market return"
          yLabel="Expected σ"
          formatX={pct}
          formatY={pct}
          threshold={r}
          thresholdLabel="Selected return"
        />
      )}
      <Range
        label="Market log-return"
        value={r}
        set={setR}
        min={-5}
        max={5}
        step={0.1}
        format={pct}
      />
      <div className="ml-statline">
        Expected sector volatility <strong>{expected(r).toFixed(2)}%</strong>
      </div>
    </Shell>
  );
}
function Diagnostics() {
  const [tab, setTab] = useState(0),
    [seed, setSeed] = useState(42),
    [beta, setBeta] = useState(15);
  const rows = useMemo(() => simulateMarket(seed, 1400, beta), [seed, beta]);
  const arrays = [
    rows.map((p) => p.r),
    rows.map((p) => p.v),
    rows.map((p) => p.z),
  ];
  const names = ["Market R", "Sector V", "Shock Z"];
  const pair = tab === 0 ? [0, 1] : tab === 1 ? [0, 2] : [1, 2];
  return (
    <Shell
      number="04"
      title="Dependence diagnostics"
      description="Change sector sensitivity or draw another sample. A near-zero correlation can hide the U-shaped relationship in the first view."
      rerun={() => setSeed((s) => s + 1)}
      footer={
        <>
          1,400 independently generated daily scenarios. Shocks have Poisson
          intensity 0.05. Sample correlations fluctuate; independence is imposed
          by the simulator.
        </>
      }
    >
      <Tabs
        tabs={[
          "Market / sector",
          "Market / shock",
          "Sector / shock",
          "Correlation",
          "Covariance",
        ]}
        value={tab}
        set={setTab}
      />
      {tab < 3 ? (
        <>
          <Plot
            key={tab}
            scatter
            series={[
              {
                name: `${names[pair[0]]} vs ${names[pair[1]]}`,
                points: arrays[pair[0]].map((x, i) => ({
                  x: x * 100,
                  y: arrays[pair[1]][i] * 100,
                })),
              },
            ]}
            xLabel={names[pair[0]]}
            yLabel={names[pair[1]]}
            formatX={pct}
            formatY={pct}
          />
          <div className="ml-statline">
            Sample Pearson correlation{" "}
            <strong>
              {correlation(arrays[pair[0]], arrays[pair[1]]).toFixed(4)}
            </strong>
          </div>
        </>
      ) : (
        <div className="ml-matrix-wrap">
          <table className="ml-matrix">
            <caption>
              {tab === 3
                ? "Sample correlation matrix"
                : "Sample covariance matrix (decimal units)"}
            </caption>
            <thead>
              <tr>
                <th scope="col">Variable</th>
                {names.map((n) => (
                  <th scope="col" key={n}>
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {names.map((n, i) => (
                <tr key={n}>
                  <th scope="row">{n}</th>
                  {names.map((m, j) => {
                    const value =
                      tab === 3
                        ? correlation(arrays[i], arrays[j])
                        : covariance(arrays[i], arrays[j]);
                    return (
                      <td
                        key={m}
                        style={{
                          background: `hsl(var(--gold) / ${0.03 + 0.25 * Math.abs(correlation(arrays[i], arrays[j]))})`,
                        }}
                      >
                        {tab === 3 ? value.toFixed(3) : value.toExponential(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ml-note">
            The off-diagonal shock entries approach zero as sample size grows.
            The market and sector variables remain dependent even when their
            linear correlation is small.
          </p>
        </div>
      )}
      <Range
        label="Sector sensitivity β"
        value={beta}
        set={setBeta}
        min={0}
        max={30}
      />
    </Shell>
  );
}
type HistoryData = { observations: { date: string; close: number }[] };
function History() {
  const [data, setData] = useState<HistoryData | null>(null),
    [error, setError] = useState(false),
    [tab, setTab] = useState(0),
    [year, setYear] = useState("All"),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/blog/data/sp500-monthly.json", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [retry]);
  const rows =
    data?.observations.filter(
      (r) => year === "All" || r.date.startsWith(year),
    ) ?? [];
  const returns = rows
    .slice(1)
    .map((r, i) => ({ x: i + 1, y: Math.log(r.close / rows[i].close) * 100 }));
  const date = (x: number) =>
    rows[Math.max(0, Math.min(rows.length - 1, Math.round(x)))]?.date.slice(
      0,
      7,
    ) ?? "";
  return (
    <Shell
      number="05"
      title="S&P 500, 2020–2024"
      description="Explore monthly index levels and changes. Choose a year to inspect a shorter window."
      footer={
        <>
          Monthly data from{" "}
          <a
            href="https://github.com/datasets/s-and-p-500"
            target="_blank"
            rel="noreferrer"
          >
            Shiller / FRED via datasets
          </a>
          . This is a separate historical series, not the original daily
          calibration sample. Monthly averaging smooths daily extremes.
          Volatility uses six monthly changes, annualized with √12.
        </>
      }
    >
      {error ? (
        <div className="ml-loading">
          <p>Could not load the historical data.</p>
          <button
            onClick={() => {
              setError(false);
              setRetry((n) => n + 1);
            }}
          >
            Retry
          </button>
        </div>
      ) : !data ? (
        <div className="ml-loading" role="status">
          Loading 60 monthly observations…
        </div>
      ) : (
        <>
          <div className="ml-year-filter">
            {["All", "2020", "2021", "2022", "2023", "2024"].map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                aria-pressed={year === y}
              >
                {y}
              </button>
            ))}
          </div>
          <Tabs
            tabs={[
              "Index level",
              "Log-returns",
              "Distribution",
              "Rolling volatility",
            ]}
            value={tab}
            set={setTab}
          />
          {tab === 0 && (
            <Plot
              key={`prices-${year}`}
              series={[
                {
                  name: "Monthly S&P 500",
                  points: rows.map((r, x) => ({ x, y: r.close })),
                },
              ]}
              xLabel="Month"
              yLabel="Index"
              formatX={date}
              formatY={integer}
            />
          )}
          {tab === 1 && (
            <Plot
              key={`returns-${year}`}
              series={[{ name: "Monthly log-return", points: returns }]}
              xLabel="Month"
              yLabel="Return"
              formatX={date}
              formatY={pct}
            />
          )}
          {tab === 2 && (
            <Plot
              key={`hist-${year}`}
              bars
              series={[
                {
                  name: "Monthly return distribution",
                  points: histogram(
                    returns.map((r) => r.y),
                    year === "All" ? 18 : 6,
                  ),
                },
              ]}
              xLabel="Log-return"
              yLabel="Count"
              formatX={pct}
              formatY={integer}
            />
          )}
          {tab === 3 && (
            <Plot
              key={`vol-${year}`}
              series={[
                {
                  name: "6-month realized volatility",
                  points: rollingVolatility(
                    rows.map((r) => r.close),
                    6,
                    12,
                  ),
                },
              ]}
              xLabel="Month"
              yLabel="Annualized σ"
              formatX={date}
              formatY={pct}
            />
          )}
        </>
      )}
    </Shell>
  );
}
function Risk() {
  const [seed, setSeed] = useState(42),
    [confidence, setConfidence] = useState(95),
    [samples, setSamples] = useState(6000),
    [tab, setTab] = useState(0),
    [weight, setWeight] = useState(0.5);
  const rows = useMemo(() => simulateMarket(seed, samples), [seed, samples]);
  const losses = useMemo(
    () => rows.map((r) => -r.r - weight * r.logV + 0.3 * Math.abs(r.z)),
    [rows, weight],
  );
  const risk = useMemo(
    () => tailRisk(losses, confidence / 100),
    [losses, confidence],
  );
  const sorted = useMemo(() => [...losses].sort((a, b) => a - b), [losses]);
  const convergence = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const n = Math.max(50, Math.round((samples * (i + 1)) / 24));
        const r = tailRisk(losses.slice(0, n), confidence / 100);
        return { n, ...r };
      }),
    [losses, confidence, samples],
  );
  const contributions = [
    variance(rows.map((r) => r.r)),
    weight ** 2 * variance(rows.map((r) => r.logV)),
    0.09 * variance(rows.map((r) => Math.abs(r.z))),
    2 *
      weight *
      covariance(
        rows.map((r) => r.r),
        rows.map((r) => r.logV),
      ) -
      0.6 *
        covariance(
          rows.map((r) => r.r),
          rows.map((r) => Math.abs(r.z)),
        ) -
      0.6 *
        weight *
        covariance(
          rows.map((r) => r.logV),
          rows.map((r) => Math.abs(r.z)),
        ),
  ];
  return (
    <Shell
      number="06"
      title="Simulated loss and tail risk"
      description="Change the sample size, confidence level, or sector exposure. Every result is recalculated from the simulated scenarios."
      rerun={() => setSeed((s) => s + 1)}
      footer={
        <>
          Loss L = −R − w₂ log(V) + 0.3|Z|. Values are model loss units, not
          money or percentage losses. These new browser estimates supersede the
          old static figures. Seed {seed}.
        </>
      }
    >
      <Tabs
        tabs={[
          "Loss distribution",
          "Tail probability",
          "Convergence",
          "Variance breakdown",
          "Q–Q plot",
        ]}
        value={tab}
        set={setTab}
      />
      {tab === 0 && (
        <Plot
          key="loss"
          bars
          series={[{ name: "Simulated losses", points: histogram(losses, 42) }]}
          xLabel="Loss"
          yLabel="Count"
          formatX={fixed}
          formatY={integer}
          threshold={risk.valueAtRisk}
          thresholdLabel="VaR"
        />
      )}
      {tab === 1 && (
        <Plot
          key="tail"
          series={[
            {
              name: "P(loss exceeds x)",
              points: sorted
                .filter(
                  (_, i) => i % Math.max(1, Math.floor(samples / 180)) === 0,
                )
                .map((x) => ({
                  x,
                  y: (100 * losses.filter((l) => l > x).length) / samples,
                })),
            },
          ]}
          xLabel="Loss"
          yLabel="Exceedance"
          formatX={fixed}
          formatY={pct}
          threshold={risk.valueAtRisk}
          thresholdLabel="VaR"
        />
      )}
      {tab === 2 && (
        <Plot
          key="convergence"
          series={[
            {
              name: "VaR",
              points: convergence.map((r) => ({ x: r.n, y: r.valueAtRisk })),
            },
            {
              name: "Expected shortfall",
              points: convergence.map((r) => ({
                x: r.n,
                y: r.expectedShortfall,
              })),
            },
          ]}
          xLabel="Samples"
          yLabel="Loss units"
          formatX={integer}
          formatY={fixed}
        />
      )}
      {tab === 3 && (
        <div className="ml-attribution">
          {["Market", "Sector", "Shock", "Cross terms"].map((name, i) => (
            <div key={name}>
              <span>{name}</span>
              <div>
                <i
                  style={{
                    width: `${Math.max(0.4, Math.abs((contributions[i] / variance(losses)) * 100))}%`,
                  }}
                />
              </div>
              <strong>
                {((contributions[i] / variance(losses)) * 100).toFixed(2)}%
              </strong>
            </div>
          ))}
          <p className="ml-note">
            Includes all empirical covariance cross terms, which can be
            negative. Terms involving the independent shock fluctuate around
            zero in a finite sample.
          </p>
        </div>
      )}
      {tab === 4 && (
        <Plot
          key="qq"
          scatter
          series={[
            {
              name: "Standardized loss quantiles",
              points: Array.from({ length: 150 }, (_, i) => {
                const p = (i + 0.5) / 150;
                return {
                  x: normalQuantile(p),
                  y:
                    (sorted[Math.floor(p * (sorted.length - 1))] -
                      mean(losses)) /
                    Math.sqrt(variance(losses)),
                };
              }),
            },
          ]}
          xLabel="Normal quantile"
          yLabel="Observed quantile"
          formatX={fixed}
          formatY={fixed}
        />
      )}
      <div className="ml-risk-stats">
        <div>
          <span>{confidence}% VaR</span>
          <strong>{risk.valueAtRisk.toFixed(4)}</strong>
        </div>
        <div>
          <span>Expected shortfall</span>
          <strong>{risk.expectedShortfall.toFixed(4)}</strong>
        </div>
      </div>
      <div className="ml-controls">
        <Range
          label="Confidence"
          value={confidence}
          set={setConfidence}
          min={90}
          max={99}
          format={pct}
        />
        <Range
          label="Sector weight w₂"
          value={weight}
          set={setWeight}
          min={0}
          max={1}
          step={0.05}
          format={fixed}
        />
      </div>
      <Range
        label="Simulated scenarios"
        value={samples}
        set={setSamples}
        min={500}
        max={10000}
        step={500}
      />
    </Shell>
  );
}
export default function MarketLabs({ kind }: { kind: LabKind }) {
  switch (kind) {
    case "paths":
      return <Paths />;
    case "foundations":
      return <Foundations />;
    case "conditional":
      return <Conditional />;
    case "diagnostics":
      return <Diagnostics />;
    case "history":
      return <History />;
    case "risk":
      return <Risk />;
  }
}
