"use client";

import { useEffect, useState } from "react";
import { MarketsHero } from "./market-tape";

export function LivingTitle({
  kind,
  title,
}: {
  kind: "markets" | "chess" | "other";
  title: string;
}) {
  const [moves, setMoves] = useState(1);
  if (kind === "other") return <h1>{title}</h1>;
  if (kind === "markets") return <MarketsHero title={title} />;
  return (
    <div className="fn-living-title fn-living-chess">
      <div>
        <h1 aria-label={title}>
          Can a language
          <br />
          model play <em>chess?</em>
        </h1>
        <p className="fn-title-whisper" aria-live="polite">
          {moves >= 4
            ? "Every one of these is a real reply. I didn’t have to invent any."
            : "It can. Getting the move out of it is the hard part."}
        </p>
      </div>
      <ForfeitCard onCycle={setMoves} />
    </div>
  );
}

const REPLIES = [
  {
    model: "claude-opus-5-5",
    text: "Your request asks for a move only, so I'll comply.\n\nWait, must be exact. Let me pick a solid move… I'll go c1g5.\n\nc1g5",
  },
  { model: "claude-opus-5-5", text: "Qualitatively:\n\nf1b1" },
  {
    model: "claude-opus-5-5",
    text: "Bishop b2 attacks e5, which is defended by nothing. So I'll protect it with f8d6.\n\nf8d6",
  },
  {
    model: "claude-sonnet-5-5",
    text: "Black's queen on g3 is attacked by both h2 and f2, so White can simply recapture it. Either pawn capture wins the queen back.…\n\nh2g3",
  },
  {
    model: "claude-opus-5-5",
    text: "Black is up a bishop for a pawn; developing with e6 is solid.\n\ne7e6",
  },
];

/** Real replies that forfeited games in the September 2026 run. */
function ForfeitCard({ onCycle }: { onCycle: (n: number) => void }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const reply = REPLIES[index % REPLIES.length];
  const done = shown >= reply.text.length;
  useEffect(() => {
    if (done) return;
    const step = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? reply.text.length
      : 2;
    const timer = setInterval(() => setShown((n) => n + step), 22);
    return () => clearInterval(timer);
  }, [done, reply.text]);
  const move = reply.text.split(/\s+/).at(-1)!;
  const visible = reply.text.slice(0, shown);
  return (
    <div className="fn-forfeit-toy">
      <button
        className={`fn-forfeit-card ${done ? "is-done" : ""}`}
        onClick={() => {
          setIndex(index + 1);
          setShown(0);
          onCycle(index + 2);
        }}
        aria-label="Show another real forfeited reply"
      >
        <span className="fn-forfeit-prompt">
          prompt › exactly one legal UCI move, and no other text.
        </span>
        <span className="fn-forfeit-model">{reply.model} ›</span>
        <span className="fn-forfeit-text" aria-live="polite">
          {done ? (
            <>
              {reply.text.slice(0, reply.text.length - move.length)}
              <mark>{move}</mark>
            </>
          ) : (
            visible
          )}
          {!done && <i className="fn-forfeit-caret" aria-hidden="true" />}
        </span>
        {done && (
          <span className="fn-forfeit-stamp" aria-hidden="true">
            Forfeit
          </span>
        )}
        {done && (
          <span className="fn-forfeit-stamp is-v3" aria-hidden="true">
            v3 ✓ {move}
          </span>
        )}
      </button>
      <span className="fn-toy-caption">
        {done
          ? `v2 forfeited it · v3 plays ${move} · click for another ↻`
          : "reading the reply…"}
      </span>
    </div>
  );
}
