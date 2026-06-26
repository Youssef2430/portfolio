"use client";

import Image from "next/image";

/**
 * Minimal device skeletons for product screenshots.
 * Pure CSS, no external dependencies.
 *
 * `src` is a base path (no suffix); the light/dark captures at
 * `${src}-light.png` and `${src}-dark.png` are swapped with the theme via the
 * `.dark` class, so there is no flash and no client theme read.
 */

const BEZEL = "#1c1c1e";

type ShotProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
};

function ThemeShot({
  src,
  alt,
  objectClass,
  priority,
  sizes,
}: ShotProps & { objectClass: string }) {
  return (
    <>
      <Image
        src={`${src}-light.png`}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`${objectClass} dark:hidden`}
      />
      <Image
        src={`${src}-dark.png`}
        alt=""
        aria-hidden
        fill
        priority={priority}
        sizes={sizes}
        className={`hidden ${objectClass} dark:block`}
      />
    </>
  );
}

export function MacBook({ src, alt, priority, sizes = "(max-width: 768px) 100vw, 56rem" }: ShotProps) {
  return (
    <div className="mx-auto w-full">
      {/* lid - thin uniform bezel, big rounded corners (modern MBP) */}
      <div
        className="relative rounded-[18px] p-[8px] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.55)] ring-1 ring-black/20"
        style={{ background: BEZEL }}
      >
        <div className="relative aspect-[294/183] overflow-hidden rounded-[11px] bg-card">
          <ThemeShot src={src} alt={alt} priority={priority} sizes={sizes} objectClass="object-cover" />
          {/* camera notch */}
          <div
            className="absolute left-1/2 top-0 z-10 h-[15px] w-[26%] max-w-[170px] -translate-x-1/2 rounded-b-[9px]"
            style={{ background: BEZEL }}
            aria-hidden
          >
            <span className="absolute left-1/2 top-[5px] h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-white/25" />
          </div>
        </div>
      </div>
      {/* bottom lid with centre indent — dark aluminium, not bright silver */}
      <div className="relative mx-auto -mt-[2px] h-[10px] w-[104%] -translate-x-[1.92%] rounded-b-[10px] bg-gradient-to-b from-[#4a4a4d] to-[#1c1c1e] ring-1 ring-black/30">
        <div className="absolute left-1/2 top-0 h-[5px] w-[15%] max-w-[120px] -translate-x-1/2 rounded-b-[7px] bg-[#2a2a2c]" />
      </div>
    </div>
  );
}

export function IPad({ src, alt, sizes = "(max-width: 768px) 100vw, 36rem" }: ShotProps) {
  return (
    <div className="mx-auto w-full">
      <div
        className="relative rounded-[24px] p-[10px] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.55)] ring-1 ring-black/20"
        style={{ background: BEZEL }}
      >
        <span className="absolute left-1/2 top-[5px] z-10 h-1 w-1 -translate-x-1/2 rounded-full bg-white/25" />
        <div className="relative aspect-[1030/773] overflow-hidden rounded-[16px] bg-card">
          <ThemeShot src={src} alt={alt} sizes={sizes} objectClass="object-cover" />
        </div>
      </div>
    </div>
  );
}

export function IPhone({ src, alt, sizes = "(max-width: 768px) 60vw, 18rem" }: ShotProps) {
  return (
    <div className="mx-auto w-full">
      {/* iPhone Pro - thin bezel, Dynamic Island */}
      <div
        className="relative rounded-[46px] p-[9px] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.55)] ring-1 ring-black/20"
        style={{ background: BEZEL }}
      >
        <span className="absolute left-1/2 top-[16px] z-10 h-[24px] w-[84px] -translate-x-1/2 rounded-full bg-black" />
        <div className="relative aspect-[383/818] overflow-hidden rounded-[38px] bg-card">
          <ThemeShot src={src} alt={alt} sizes={sizes} objectClass="object-cover" />
        </div>
      </div>
    </div>
  );
}
