"use client";

import { useState } from "react";
import { knightMoves, randomSource } from "@/lib/market-math";

function KnightTour() {
  const [route, setRoute] = useState([0]),
    [hint, setHint] = useState(false);
  const current = route[route.length - 1];
  const legal = knightMoves(current, route);
  const suggestion = [...legal].sort(
    (a, b) =>
      knightMoves(a, [...route, a]).length -
      knightMoves(b, [...route, b]).length,
  )[0];
  const won = route.length === 36,
    stuck = !legal.length && !won;
  return (
    <div className="fn-secret-game">
      <div className="fn-game-intro">
        <span className="ml-eyebrow">Bonus level / Knight’s tour</span>
        <h3>36 squares. No repeats.</h3>
        <p>
          Visit every square using knight moves. The numbered squares are your
          trail. You can undo a move if you get stuck.
        </p>
      </div>
      <div
        className="fn-tour-grid"
        role="group"
        aria-label="Six by six knight tour"
      >
        {Array.from({ length: 36 }, (_, i) => (
          <button
            key={i}
            disabled={!legal.includes(i)}
            onClick={() => {
              setRoute([...route, i]);
              setHint(false);
            }}
            aria-label={`${"abcdef"[i % 6]}${6 - Math.floor(i / 6)}${i === current ? ", knight" : route.includes(i) ? ", visited" : legal.includes(i) ? ", legal destination" : ""}`}
            className={`${(Math.floor(i / 6) + (i % 6)) % 2 ? "is-dark" : ""} ${route.includes(i) ? "is-visited" : ""} ${hint && i === suggestion ? "is-hint" : ""}`}
          >
            {i === current
              ? "♞"
              : route.includes(i)
                ? route.indexOf(i) + 1
                : legal.includes(i)
                  ? "·"
                  : ""}
          </button>
        ))}
      </div>
      <p className="fn-game-status" role="status">
        {won
          ? "Complete. The knight is requesting a vacation."
          : stuck
            ? `Stranded at ${route.length}/36. Undo and try another route.`
            : `${route.length}/36 visited · ${legal.length} possible moves`}
      </p>
      <div className="ml-actions">
        <button
          disabled={route.length === 1}
          onClick={() => {
            setRoute(route.slice(0, -1));
            setHint(false);
          }}
        >
          ← Undo
        </button>
        <button disabled={!legal.length} onClick={() => setHint(!hint)}>
          Hint
        </button>
        <button
          onClick={() => {
            setRoute([0]);
            setHint(false);
          }}
        >
          Start over
        </button>
      </div>
      {hint && (
        <p className="ml-note">
          Try the outlined square. It has the fewest onward moves, so visiting
          it now may avoid a dead end.
        </p>
      )}
    </div>
  );
}
function PredictionGame() {
  const [seed, setSeed] = useState(77),
    [guesses, setGuesses] = useState<boolean[]>([]);
  const rng = randomSource(seed);
  const ticks = Array.from({ length: 10 }, () => rng.uniform() > 0.5);
  const score = guesses.filter((g, i) => g === ticks[i]).length;
  const finished = guesses.length === 10;
  return (
    <div className="fn-secret-game">
      <div className="fn-game-intro">
        <span className="ml-eyebrow">The forecasting desk</span>
        <h3>The next tick?</h3>
        <p>
          Ten coin-flip returns. Choose up or down before each one is revealed.
          No model, no hints, just your forecasting career.
        </p>
      </div>
      <div className="fn-tick-tape" aria-label="Revealed returns">
        {ticks.map((up, i) => (
          <span
            key={i}
            className={
              i < guesses.length
                ? guesses[i] === up
                  ? "is-right"
                  : "is-wrong"
                : ""
            }
          >
            {i < guesses.length ? (up ? "↗" : "↘") : "·"}
          </span>
        ))}
      </div>
      <p className="fn-game-status" role="status">
        {finished
          ? `${score}/10 correct. ${score > 7 ? "A good streak. It still does not change the odds of the next tick." : "The expected score is 5/10. Randomness makes no promises about this round."}`
          : `${guesses.length}/10 revealed · ${score} correct`}
      </p>
      <div className="ml-actions">
        <button
          disabled={finished}
          onClick={() => setGuesses([...guesses, true])}
        >
          ↗ Up
        </button>
        <button
          disabled={finished}
          onClick={() => setGuesses([...guesses, false])}
        >
          ↘ Down
        </button>
        <button
          onClick={() => {
            setSeed(seed + 31);
            setGuesses([]);
          }}
        >
          New round
        </button>
      </div>
    </div>
  );
}
export function SecretRoom({
  kind,
  revealed = false,
}: {
  kind: "markets" | "chess" | "other";
  revealed?: boolean;
}) {
  const [open, setOpen] = useState(revealed);
  return (
    <div className="fn-secret-room">
      <button
        className="fn-secret-door"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {kind === "chess" ? "♞" : "♧"}{" "}
        <span>{open ? "Close after-hours room" : "Staff only"}</span>
      </button>
      {open && (kind === "chess" ? <KnightTour /> : <PredictionGame />)}
    </div>
  );
}
