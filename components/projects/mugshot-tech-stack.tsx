/** Mugshot technology grid. Names and roles remain visible on every screen size. */

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
    <div className="study-tech-list" role="list">
      {TECHS.map((t) => (
        <div
          key={t.name}
          className="study-tech-item" role="listitem"
        >
          <div className="study-tech-icon">
            {t.path ? (
              <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden>
                <path d={t.path} />
              </svg>
            ) : t.Icon ? (
              <t.Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden />
            ) : null}
          </div>
          {/* Visible name and role. */}
          <div className="study-tech-label">
            <span>{t.name}</span>
            <span>
              {t.tag}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
