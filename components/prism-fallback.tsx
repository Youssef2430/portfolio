"use client";

import { useId } from "react";

/** A lightweight first paint, also retained when GPU rendering is unavailable. */
export function PrismFallback() {
  const id = useId();

  return (
    <svg
      viewBox="0 0 760 400"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
      role="img"
      aria-label="A glass prism splitting light into a spectrum"
    >
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="currentColor" stopOpacity="0.03" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id={`${id}-spectrum`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#ef8669" />
          <stop offset="0.22" stopColor="#e8bb60" />
          <stop offset="0.45" stopColor="#8bc997" />
          <stop offset="0.65" stopColor="#7abbd4" />
          <stop offset="1" stopColor="#a18bd1" />
        </linearGradient>
        <linearGradient id={`${id}-fade`}>
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="0.2" stopColor="white" />
          <stop offset="0.75" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-mask`}>
          <rect width="760" height="400" fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        <path d="M 760 278 L 423 195" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <path d="M 306 198 L 0 237 L 0 340 Z" fill={`url(#${id}-spectrum)`} opacity="0.3" />
        <path d="M 380 70 L 239 312 L 521 312 Z" fill={`url(#${id}-glass)`} stroke="currentColor" strokeOpacity="0.3" strokeLinejoin="round" />
        <path d="M 380 86 L 253 304 L 507 304 Z M 380 70 L 380 86 M 239 312 L 253 304 M 521 312 L 507 304" fill="none" stroke="currentColor" strokeOpacity="0.14" />
        <path d="M 306 198 L 423 195" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      </g>
    </svg>
  );
}
