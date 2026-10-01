"use client";

import { useId, useState } from "react";

export type Point = { x: number; y: number };
type Series = {
  name: string;
  points: Point[];
  color?: string;
  dashed?: boolean;
  line?: boolean;
};
export function Plot({
  series,
  xLabel,
  yLabel,
  formatX = (n) => n.toFixed(0),
  formatY = (n) => n.toFixed(2),
  bars = false,
  scatter = false,
  threshold,
  thresholdLabel = "Threshold",
}: {
  series: Series[];
  xLabel: string;
  yLabel: string;
  formatX?: (n: number) => string;
  formatY?: (n: number) => string;
  bars?: boolean;
  scatter?: boolean;
  threshold?: number;
  thresholdLabel?: string;
}) {
  const id = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const all = series.flatMap((s) => s.points);
  if (!all.length)
    return <p className="ml-note">No observations in this range.</p>;
  const minX = Math.min(...all.map((p) => p.x)),
    maxX = Math.max(...all.map((p) => p.x));
  const rawMin = Math.min(...all.map((p) => p.y)),
    rawMax = Math.max(...all.map((p) => p.y));
  const pad = (rawMax - rawMin || 1) * 0.08;
  const minY = bars ? Math.min(0, rawMin) : rawMin - pad,
    maxY = rawMax + pad;
  const sx = (x: number) => 58 + ((x - minX) / (maxX - minX || 1)) * 554;
  const sy = (y: number) => 238 - ((y - minY) / (maxY - minY || 1)) * 212;
  const primary = series[0].points;
  const cursor =
    primary[
      Math.min(selected ?? Math.floor(primary.length / 2), primary.length - 1)
    ];
  const inspect = (clientX: number, left: number, width: number) => {
    const value =
      minX + ((((clientX - left) / width) * 640 - 58) / 554) * (maxX - minX);
    let nearest = 0;
    primary.forEach((p, i) => {
      if (Math.abs(p.x - value) < Math.abs(primary[nearest].x - value))
        nearest = i;
    });
    setSelected(nearest);
  };
  const barWidth = Math.max(2, (550 / primary.length) * 0.85);
  return (
    <div className="ml-plot-wrap">
      <div className="ml-chart-readout" aria-live="polite">
        <span>
          {xLabel} <b>{formatX(cursor.x)}</b>
        </span>
        <span>
          {yLabel} <b>{formatY(cursor.y)}</b>
        </span>
      </div>
      <svg
        viewBox="0 0 640 278"
        role="graphics-document"
        tabIndex={0}
        aria-label={`${series.map((s) => s.name).join(", ")}. ${xLabel} versus ${yLabel}. Use left and right arrow keys to inspect points.`}
        onPointerMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          inspect(e.clientX, box.left, box.width);
        }}
        onPointerDown={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          inspect(e.clientX, box.left, box.width);
        }}
        onKeyDown={(e) => {
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
            e.preventDefault();
            setSelected(
              e.key === "Home"
                ? 0
                : e.key === "End"
                  ? primary.length - 1
                  : Math.max(
                      0,
                      Math.min(
                        primary.length - 1,
                        (selected ?? 0) + (e.key === "ArrowRight" ? 1 : -1),
                      ),
                    ),
            );
          }
        }}
      >
        <defs>
          <clipPath id={id}>
            <rect x="56" y="20" width="560" height="220" />
          </clipPath>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => {
          const value = minY + ((maxY - minY) * i) / 4;
          return (
            <g key={i}>
              <line
                x1="58"
                x2="612"
                y1={sy(value)}
                y2={sy(value)}
                className="ml-grid-line"
              />
              <text x="48" y={sy(value) + 3} textAnchor="end">
                {formatY(value)}
              </text>
            </g>
          );
        })}
        {[0, 1, 2, 3, 4].map((i) => {
          const value = minX + ((maxX - minX) * i) / 4;
          return (
            <text
              key={i}
              x={sx(value)}
              y="262"
              textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}
            >
              {formatX(value)}
            </text>
          );
        })}
        <g clipPath={`url(#${id})`}>
          {series.map((s, j) => (
            <g
              key={s.name}
              style={{
                color:
                  s.color ?? (j === 0 ? "var(--ml-gold)" : "var(--ml-blue)"),
              }}
            >
              {bars && !s.line ? (
                s.points.map((p, i) => (
                  <rect
                    key={i}
                    x={sx(p.x) - barWidth / 2}
                    y={sy(p.y)}
                    width={barWidth}
                    height={Math.max(0, sy(0) - sy(p.y))}
                    className="ml-bar"
                    opacity={
                      threshold !== undefined && p.x >= threshold ? 1 : 0.55
                    }
                  />
                ))
              ) : scatter ? (
                s.points.map((p, i) => (
                  <circle
                    key={i}
                    cx={sx(p.x)}
                    cy={sy(p.y)}
                    r={i === selected ? 5 : 2.2}
                    fill="currentColor"
                    opacity={i === selected ? 1 : 0.35}
                  />
                ))
              ) : (
                <path
                  className="ml-line"
                  pathLength="1"
                  d={s.points
                    .map(
                      (p, i) =>
                        `${i ? "L" : "M"}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`,
                    )
                    .join(" ")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={j === 0 ? 2 : 1.4}
                  opacity={j > 1 ? 0.35 : 1}
                  strokeDasharray={s.dashed ? "5 5" : undefined}
                />
              )}
            </g>
          ))}
          {threshold !== undefined && (
            <line
              x1={sx(threshold)}
              x2={sx(threshold)}
              y1="20"
              y2="238"
              className="ml-threshold"
            />
          )}
          {selected !== null && (
            <>
              <line
                x1={sx(cursor.x)}
                x2={sx(cursor.x)}
                y1="20"
                y2="238"
                className="ml-cursor"
              />
              <circle
                cx={sx(cursor.x)}
                cy={sy(cursor.y)}
                r="4"
                className="ml-dot"
              />
            </>
          )}
        </g>
      </svg>
      <div className="ml-legend">
        {series.length <= 3 ? (
          series.map((s, i) => (
            <span key={s.name}>
              <i
                style={{
                  background:
                    s.color ?? (i === 0 ? "var(--ml-gold)" : "var(--ml-blue)"),
                }}
              />
              {s.name}
            </span>
          ))
        ) : (
          <span>All {series.length} paths share the same parameters</span>
        )}
        {threshold !== undefined && (
          <span>
            <i className="ml-legend-threshold" />
            {thresholdLabel} {formatX(threshold)}
          </span>
        )}
        <small>Drag or use ← → to inspect</small>
      </div>
    </div>
  );
}
