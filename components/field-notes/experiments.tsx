"use client";

import { useId, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { simulateGBM } from "@/lib/field-notes";

export function MarketPaths({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const [volatility, setVolatility] = useState(21.4);
  const [seed, setSeed] = useState(17);
  const [shock, setShock] = useState(false);
  const paths = useMemo(
    () =>
      simulateGBM(volatility / 100, seed).map((path) =>
        path.map((price, day) => price * (shock && day >= 126 ? 0.8 : 1)),
      ),
    [volatility, seed, shock],
  );
  // A fixed axis keeps changes in dispersion visually comparable across slider values.
  const max = Math.max(250, ...paths.flat());
  const x = (i: number) => 42 + (i / 252) * 550;
  const y = (v: number) => Number((186 - (v / max) * 166).toFixed(3));
  const ends = paths.map((p) => p[p.length - 1]);
  return (
    <div
      className={`fn-market ${compact ? "fn-market-compact" : "fn-experiment"}`}
    >
      {!compact && (
        <>
          <div className="fn-kicker">01 / Try the idea</div>
          <h2>
            Same starting point.
            <br />
            Different possible futures.
          </h2>
          <p>
            Move the volatility slider. The random draws stay the same, so you
            can see what σ changes.
          </p>
        </>
      )}
      <svg
        className="fn-path-chart"
        viewBox="0 0 620 218"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>
          Eight simulated geometric Brownian motion paths
        </title>
        <desc id={`${id}-desc`}>
          Starting at 100, with 12 percent annual drift and {volatility} percent
          annual volatility over 252 trading days.{" "}
          {shock &&
            "A fixed 20 percent downward shock is applied to every path on day 126."}
        </desc>
        {[0, 100, 200].map((v) => (
          <g key={v}>
            <line
              x1="42"
              x2="592"
              y1={y(v)}
              y2={y(v)}
              className="fn-chart-grid"
            />
            <text x="30" y={y(v) + 3} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {[0, 63, 126, 189, 252].map((d) => (
          <line
            key={d}
            x1={x(d)}
            x2={x(d)}
            y1="20"
            y2="186"
            className="fn-chart-grid"
          />
        ))}
        {shock && (
          <g>
            <line
              x1={x(126)}
              x2={x(126)}
              y1="12"
              y2="186"
              className="fn-shock-line"
            />
            <text x={x(126) + 8} y="14">
              −20% SHOCK
            </text>
          </g>
        )}
        {paths.map((path, i) => (
          <path
            key={i}
            d={path
              .map(
                (v, j) =>
                  `${j ? "L" : "M"}${x(j).toFixed(2)},${y(v).toFixed(2)}`,
              )
              .join(" ")}
            fill="none"
            className={i === 0 ? "fn-path-highlight" : "fn-path"}
          />
        ))}
        <text x="42" y="210">
          DAY 0
        </text>
        <text x="592" y="210" textAnchor="end">
          DAY 252
        </text>
      </svg>
      <label className="fn-slider" htmlFor={id}>
        <span>
          {compact ? "Turn up the uncertainty" : "Annual volatility · σ"}
        </span>
        <input
          id={id}
          type="range"
          min="0"
          max="60"
          step="0.1"
          value={volatility}
          onChange={(e) => setVolatility(Number(e.target.value))}
        />
        <output htmlFor={id}>{volatility.toFixed(1)}%</output>
      </label>
      {!compact && (
        <>
          <div className="fn-experiment-bottom">
            <span>
              Terminal range{" "}
              <strong>
                {Math.min(...ends).toFixed(0)}–{Math.max(...ends).toFixed(0)}
              </strong>{" "}
              / start 100
            </span>
            <div className="fn-sim-actions">
              <button
                onClick={() => setShock(!shock)}
                aria-pressed={shock}
                className="fn-button"
              >
                {shock ? "Undo shock" : "Add a shock ↯"}
              </button>
              <button
                onClick={() => setSeed((s) => s + 1)}
                className="fn-button"
              >
                <RotateCcw size={13} /> New paths
              </button>
            </div>
          </div>
          <p className="fn-caption">
            An illustrative GBM simulation, not historical prices. Eight paths,
            252 daily steps, μ = 12%. The vertical scale expands if a path
            exceeds 250.{" "}
            {shock &&
              "Stress overlay: every path drops 20% on day 126. This fixed intervention is separate from the article’s compound Poisson model."}
          </p>
        </>
      )}
      {volatility === 0 && (
        <p className="fn-secret" role="status">
          A perfectly predictable market. The economists would like a word.
        </p>
      )}
      {volatility >= 55 && (
        <p className="fn-secret" role="status">
          You found the turbulence setting. Please keep your assumptions inside
          the model.
        </p>
      )}
    </div>
  );
}

const backRank = ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"];
const whiteRank = ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"];
export function ChessBoard({
  move,
  compact = false,
}: {
  move?: string;
  compact?: boolean;
}) {
  const board: string[] = [
    ...backRank,
    ...Array(8).fill("♟"),
    ...Array(32).fill(""),
    ...Array(8).fill("♙"),
    ...whiteRank,
  ];
  const index = (square: string) =>
    (8 - Number(square[1])) * 8 + square.charCodeAt(0) - 97;
  if (move) {
    board[index(move.slice(2))] = board[index(move.slice(0, 2))];
    board[index(move.slice(0, 2))] = "";
  }
  return (
    <div
      className={`fn-chessboard ${compact ? "fn-chessboard-compact" : ""}`}
      role="img"
      aria-label={
        move
          ? `Chess starting position after ${move.slice(0, 2)} to ${move.slice(2)}.`
          : "Chess starting position, white to move."
      }
    >
      {board.map((piece, i) => (
        <span
          key={i}
          className={`${(Math.floor(i / 8) + (i % 8)) % 2 ? "fn-square-dark" : ""} ${move && (i === index(move.slice(0, 2)) || i === index(move.slice(2))) ? "fn-square-moved" : ""}`}
          aria-hidden="true"
        >
          {piece}
          {!compact && i % 8 === 0 && (
            <small className="fn-rank">{8 - Math.floor(i / 8)}</small>
          )}
          {!compact && i >= 56 && (
            <small className="fn-file">{"abcdefgh"[i % 8]}</small>
          )}
        </span>
      ))}
    </div>
  );
}
