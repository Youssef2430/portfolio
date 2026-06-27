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
  shotClass,
  priority,
  sizes,
}: ShotProps & { objectClass: string; shotClass?: string }) {
  return (
    <>
      <Image
        src={`${src}-light.png`}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`device-shot ${shotClass ?? ""} ${objectClass} dark:hidden`}
      />
      <Image
        src={`${src}-dark.png`}
        alt=""
        aria-hidden
        fill
        priority={priority}
        sizes={sizes}
        className={`device-shot ${shotClass ?? ""} hidden ${objectClass} dark:block`}
      />
    </>
  );
}

export function MacBook({ src, alt, priority, sizes = "(max-width: 768px) 100vw, 56rem" }: ShotProps) {
  return (
    <div className="mx-auto w-full">
      <div className="device-frame device-frame-mac relative rounded-[22px] p-[9px] md:p-[10px]">
        <div className="device-screen relative aspect-[294/183] overflow-hidden rounded-[14px]">
          <ThemeShot
            src={src}
            alt={alt}
            priority={priority}
            sizes={sizes}
            objectClass="object-cover"
            shotClass="device-shot-mac"
          />
          {/* camera notch */}
          <div className="absolute left-1/2 top-0 z-20 h-[15px] w-[15%] min-w-[84px] max-w-[128px] -translate-x-1/2 rounded-b-[10px] bg-[#09090a] shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]" aria-hidden>
            <span className="absolute left-1/2 top-[5px] h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-white/25" />
          </div>
        </div>
      </div>
      <div className="macbook-base relative mx-auto -mt-px h-[14px] w-full rounded-b-[16px]">
        <div className="macbook-base-indent absolute left-1/2 top-0 h-[6px] w-[18%] max-w-[136px] -translate-x-1/2 rounded-b-[9px]" />
      </div>
    </div>
  );
}

export function IPad({ src, alt, sizes = "(max-width: 768px) 100vw, 36rem" }: ShotProps) {
  return (
    <div className="mx-auto w-full">
      <div className="device-frame device-frame-tablet relative rounded-[28px] p-[10px] md:p-[11px]">
        <span className="absolute left-1/2 top-[5px] z-20 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-black/30 dark:bg-white/25" />
        <div className="device-screen relative aspect-[1030/773] overflow-hidden rounded-[17px]">
          <ThemeShot
            src={src}
            alt={alt}
            sizes={sizes}
            objectClass="object-cover"
            shotClass="device-shot-tablet"
          />
        </div>
      </div>
    </div>
  );
}

export function IPhone({ src, alt, sizes = "(max-width: 768px) 60vw, 18rem" }: ShotProps) {
  return (
    <div className="mx-auto w-full">
      <div className="device-frame device-frame-phone relative rounded-[50px] p-[8px] md:p-[9px]">
        <span className="absolute left-1/2 top-[16px] z-20 h-[24px] w-[84px] -translate-x-1/2 rounded-full bg-[#050505] shadow-[0_1px_0_rgba(255,255,255,0.10)]" />
        <div className="device-screen relative aspect-[383/818] overflow-hidden rounded-[40px]">
          <ThemeShot
            src={src}
            alt={alt}
            sizes={sizes}
            objectClass="object-cover"
            shotClass="device-shot-phone"
          />
        </div>
      </div>
    </div>
  );
}
