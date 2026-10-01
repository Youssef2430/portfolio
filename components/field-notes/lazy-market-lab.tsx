"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
export type LabKind =
  | "paths"
  | "foundations"
  | "conditional"
  | "diagnostics"
  | "history"
  | "risk";
const Lab = dynamic(() => import("./market-labs"), {
  loading: () => <div className="ml-loading">Preparing the chart…</div>,
  ssr: false,
});
export function MarketLab({ kind }: { kind: LabKind }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="ml-lazy">
      {ready ? (
        <Lab kind={kind} />
      ) : (
        <button className="ml-loading" onClick={() => setReady(true)}>
          Load interactive {kind} chart <span>↗</span>
        </button>
      )}
    </div>
  );
}
