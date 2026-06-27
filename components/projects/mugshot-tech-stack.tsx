/**
 * Mugshot "built with" strip: mirrors the AtlasLLM / Clui tech tooltip: a row
 * of overlapping rounded marks that lift and reveal a name + role pill on hover.
 *
 * Apple's frameworks don't ship public brand logos, so each mark is a clean
 * representative glyph (Swift uses its own logo path; the rest use lucide icons)
 * rendered in currentColor so they inherit the strip's hover state.
 */

import {
  type LucideIcon,
  LayoutDashboard,
  ScanEye,
  ImageIcon,
  Sparkles,
  LayoutGrid,
  HeartPulse,
  Images,
} from "lucide-react";

type Tech = {
  name: string;
  tag: string;
  Icon?: LucideIcon;
  path?: string;
};

const TECHS: Tech[] = [
  {
    name: "Swift",
    tag: "Language",
    // simple-icons "swift"
    path: "M17.69 17.772c-2.526 1.498-6.024 1.65-9.522.146-2.829-1.215-5.207-3.36-6.95-5.882 0 0 .727.518.852.6 0 0 4.62 3.196 8.07 2.93 0 0-2.42-1.79-4.184-3.93 0 0-1.183-1.418-2.143-2.946 0 0 2.292 1.93 4.99 3.46 0 0-1.42-1.79-2.45-3.66 0 0 1.83 2.06 4.32 3.59-.97-2.07-1.6-4.39-1.18-7.49 0 0 1.86 3.4 3.71 5.34 0 0 .51-1.36.51-2.39 0 0 1.62 2.71 1.62 4.74 0 0 .86-.66 1.46-1.32 0 0 .42 2.46-1.32 4.5 0 0 1.5-.36 2.05-.6 0 0-.84 1.92-3.6 3.04.01.01 1.39.18 3.2-.05 0 0-1.39 1.05-3.05 1.66.79.05 1.62.04 2.49-.05 0 0-1.21.78-2.65 1.16z",
  },
  { name: "SwiftUI", tag: "UI", Icon: LayoutDashboard },
  { name: "Vision", tag: "Cutout & OCR", Icon: ScanEye },
  { name: "Core Image", tag: "Imaging", Icon: ImageIcon },
  { name: "Apple Intelligence", tag: "On-device model", Icon: Sparkles },
  { name: "WidgetKit", tag: "Widgets", Icon: LayoutGrid },
  { name: "HealthKit", tag: "Health sync", Icon: HeartPulse },
  { name: "PhotosUI", tag: "Photo import", Icon: Images },
];

export function MugshotTechStack() {
  return (
    <div className="flex pl-2">
      {TECHS.map((t) => (
        <div
          key={t.name}
          className="group relative -ml-3 transition-[z-index] duration-0 first:ml-0 hover:z-30"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-border bg-[hsl(var(--mug-card))] text-foreground/70 shadow-[0_4px_14px_-6px_rgba(35,27,20,0.35)] transition-all duration-300 ease-out group-hover:-translate-y-2.5 group-hover:border-[hsl(var(--gold))]/50 group-hover:text-[hsl(var(--gold))] group-hover:shadow-[0_16px_30px_-12px_rgba(35,27,20,0.45)]">
            {t.path ? (
              <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden>
                <path d={t.path} />
              </svg>
            ) : t.Icon ? (
              <t.Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden />
            ) : null}
          </div>
          {/* tooltip: left-anchored so it never clips at the row's edge */}
          <div className="pointer-events-none absolute bottom-full left-0 z-20 mb-2.5 flex translate-y-1 items-center gap-2 whitespace-nowrap rounded-full bg-foreground py-1.5 pl-4 pr-1.5 text-background opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="mug-rounded text-xs font-bold">{t.name}</span>
            <span className="mug-rounded rounded-full bg-background/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-background/70">
              {t.tag}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
