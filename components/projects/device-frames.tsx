"use client";

import Image from "next/image";

/**
 * Minimal, theme-aware device skeletons for product screenshots.
 * Pure CSS — no external dependencies.
 */

const BEZEL = "#1c1c1e";

type ShotProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
};

export function MacBook({ src, alt, priority, sizes = "(max-width: 768px) 100vw, 56rem" }: ShotProps) {
  return (
    <div className="mx-auto w-full">
      <div
        className="relative rounded-[14px] p-[10px] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.55)] ring-1 ring-foreground/10"
        style={{ background: BEZEL }}
      >
        <span className="absolute left-1/2 top-[4px] z-10 h-1 w-1 -translate-x-1/2 rounded-full bg-white/25" />
        <div className="relative aspect-[16/10] overflow-hidden rounded-[5px] bg-card">
          <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover object-top" />
        </div>
      </div>
      {/* base / hinge */}
      <div className="relative mx-auto -mt-px h-[13px] w-[112%] -translate-x-[5.36%] rounded-b-[12px] bg-gradient-to-b from-[#c4c5c9] to-[#9a9ca1] ring-1 ring-black/10">
        <div className="absolute left-1/2 top-0 h-[6px] w-[88px] -translate-x-1/2 rounded-b-[7px] bg-[#7d7f84]" />
      </div>
    </div>
  );
}

export function IPad({ src, alt, sizes = "(max-width: 768px) 100vw, 36rem" }: ShotProps) {
  return (
    <div className="mx-auto w-full">
      <div
        className="relative rounded-[26px] p-[12px] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.55)] ring-1 ring-foreground/10"
        style={{ background: BEZEL }}
      >
        <span className="absolute left-1/2 top-[5px] z-10 h-1 w-1 -translate-x-1/2 rounded-full bg-white/25" />
        <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-card">
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" />
        </div>
      </div>
    </div>
  );
}

export function IPhone({ src, alt, sizes = "(max-width: 768px) 60vw, 18rem" }: ShotProps) {
  return (
    <div className="mx-auto w-full">
      <div
        className="relative rounded-[44px] p-[10px] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.55)] ring-1 ring-foreground/10"
        style={{ background: BEZEL }}
      >
        {/* dynamic island */}
        <span className="absolute left-1/2 top-[14px] z-10 h-[22px] w-[78px] -translate-x-1/2 rounded-full bg-black" />
        <div className="relative aspect-[9/18] overflow-hidden rounded-[36px] bg-card">
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" />
        </div>
      </div>
    </div>
  );
}
