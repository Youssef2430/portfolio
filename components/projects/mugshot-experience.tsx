"use client";

import { type CSSProperties, type ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Scissors,
  Sparkles,
  CalendarHeart,
  HeartPulse,
  Camera,
  Brain,
} from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { SerializableProject } from "@/components/project-detail";
import { MugshotTechStack } from "@/components/projects/mugshot-tech-stack";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Primitives ────────────────────────────────────────────────── */

function Label({ index, children }: { index?: string; children: ReactNode }) {
  return (
    <span className="mug-rounded inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--foreground-subtle))]">
      {index && (
        <span className="inline-flex items-center gap-2.5 text-[hsl(var(--gold))]">
          {index}
          <span className="inline-block h-px w-7 bg-gradient-to-r from-[hsl(var(--gold))] to-transparent" />
        </span>
      )}
      {children}
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ResilientImage({
  src,
  fallbackSrc,
  alt,
  className,
  sizes,
  fill,
  width,
  height,
  style,
  decorative = false,
}: {
  src: string;
  fallbackSrc?: string | string[];
  alt: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  style?: CSSProperties;
  decorative?: boolean;
}) {
  const fallbacks = Array.isArray(fallbackSrc)
    ? fallbackSrc
    : fallbackSrc
      ? [fallbackSrc]
      : [];
  const sources = [src, ...fallbacks];
  const [sourceIndex, setSourceIndex] = useState(0);
  const currentSrc = sources[sourceIndex] ?? src;

  return (
    <Image
      src={currentSrc}
      alt={decorative ? "" : alt}
      aria-hidden={decorative || undefined}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      style={style}
      onError={() => {
        setSourceIndex((index) => Math.min(index + 1, sources.length - 1));
      }}
    />
  );
}

/* A warm ceramic phone bezel around a single product screenshot. */
function Phone({
  src,
  darkSrc,
  fallbackSrc,
  darkFallbackSrc,
  alt,
  className = "",
}: {
  src: string;
  darkSrc?: string;
  fallbackSrc?: string | string[];
  darkFallbackSrc?: string | string[];
  alt: string;
  className?: string;
}) {
  return (
    <div className={`mug-phone relative rounded-[2.4rem] p-[7px] ${className}`}>
      <div className="relative aspect-[1206/2622] overflow-hidden rounded-[2rem] bg-[hsl(var(--mug-card))]">
        <ResilientImage
          src={src}
          fallbackSrc={fallbackSrc}
          alt={alt}
          fill
          sizes="(max-width: 768px) 60vw, 18rem"
          className={darkSrc ? "object-cover object-top dark:hidden" : "object-cover object-top"}
        />
        {darkSrc && (
          <ResilientImage
            src={darkSrc}
            fallbackSrc={darkFallbackSrc ?? fallbackSrc ?? src}
            alt={alt}
            decorative
            fill
            sizes="(max-width: 768px) 60vw, 18rem"
            className="hidden object-cover object-top dark:block"
          />
        )}
      </div>
    </div>
  );
}

function ImageSticker({
  src,
  fallbackSrc,
  className = "",
  rotate = 0,
  width,
  height,
}: {
  src: string;
  fallbackSrc?: string | string[];
  className?: string;
  rotate?: number;
  width: number;
  height: number;
}) {
  return (
    <ResilientImage
      src={src}
      fallbackSrc={fallbackSrc}
      alt=""
      decorative
      width={width}
      height={height}
      className={`mug-sticker pointer-events-none absolute h-auto object-contain ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  );
}

/* The app icon, swapped for its dark-mode variant with the site theme. */
function AppIcon({ className = "" }: { className?: string }) {
  return (
    <>
      <Image
        src="/mugshot/icon.png"
        alt="Mugshot app icon"
        width={120}
        height={120}
        className={`${className} dark:hidden`}
      />
      <Image
        src="/mugshot/icon-dark.png"
        alt=""
        aria-hidden
        width={120}
        height={120}
        className={`hidden ${className} dark:block`}
      />
    </>
  );
}

/* A scattered die-cut sticker for the scrapbook collages. */
function Sticker({
  src,
  className = "",
  rotate = 0,
  width = 120,
}: {
  src: string;
  className?: string;
  rotate?: number;
  width?: number;
}) {
  return (
    <Image
      src={src}
      alt=""
      aria-hidden
      width={width}
      height={width * 2}
      className={`mug-sticker pointer-events-none absolute h-auto object-contain ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  );
}

/* ── Real product data ─────────────────────────────────────────── */

const DRINKS = [
  "Espresso",
  "Latte",
  "Iced Latte",
  "Cold Brew",
  "Cappuccino",
  "Flat White",
  "Americano",
  "Cortado",
  "Mocha",
  "Matcha Latte",
  "Chai Latte",
  "Nitro Cold Brew",
];

const PERSONAS = [
  { name: "Certified Caffeine Fiend", note: "25+ cups in a month" },
  { name: "Iced Latte Loyalist", note: "one drink rules them all" },
  { name: "The Marathoner", note: "4 cups in a single day" },
  { name: "The Explorer", note: "spread across the menu" },
  { name: "Steady Sipper", note: "coffee, no fuss" },
];

/* ── The presentation ──────────────────────────────────────────── */

export function MugshotExperience({ project }: { project: SerializableProject }) {
  return (
    <main className="mugshot-theme min-h-screen overflow-clip bg-background text-foreground">
      <div className="grain-overlay" />
      <Navbar />

      {/* ── Opener ── */}
      <section className="mug-paper relative overflow-hidden px-6 pt-32 md:px-12 md:pt-40">
        <div className="relative z-[1] mx-auto max-w-6xl">
          <HeroStickerField />

          <Link
            href="/#work"
            className="group mug-rounded inline-flex items-center text-xs font-bold uppercase tracking-[0.15em] text-[hsl(var(--foreground-muted))] transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Work
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mt-12 flex items-center gap-3.5"
          >
            <AppIcon className="h-11 w-11 rounded-[12px] shadow-[0_8px_20px_-10px_rgba(35,27,20,0.6)] md:h-12 md:w-12" />
            <span className="mug-display text-2xl font-semibold tracking-tight md:text-3xl">
              Mugshot
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="mug-display mt-8 max-w-3xl text-5xl md:text-7xl"
          >
            A coffee journal built on <em>stickers</em>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="mug-rounded mt-6 max-w-xl text-lg font-medium leading-relaxed text-[hsl(var(--foreground-soft))] md:text-xl"
          >
            Mugshot photographs a cup, cuts it into a sticker, estimates its
            caffeine, and records it on a calendar day. The capture, the cutout,
            and the drink analysis all run on device.
          </motion.p>

          {/* meta strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mug-rounded mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--foreground-subtle))]"
          >
            <span>iOS · SwiftUI</span>
            <span>On-device · No account</span>
            <span>Solo build · {project.timeline ?? "Recent"}</span>
          </motion.div>

          {/* hero: the home calendar, with die-cut stickers spilling around it */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
            className="relative mt-16 flex items-end justify-center pb-10"
          >
            <Sticker
              src="/mugshot/stickers/matcha.png"
              width={120}
              rotate={-14}
              className="left-[2%] top-[6%] hidden w-[88px] md:block lg:w-[104px]"
            />
            <Sticker
              src="/mugshot/stickers/dalgona.png"
              width={120}
              rotate={10}
              className="right-[5%] top-[2%] hidden w-[84px] md:block lg:w-[100px]"
            />
            <Sticker
              src="/mugshot/stickers/latte-top.png"
              width={120}
              rotate={-8}
              className="left-[8%] bottom-[18%] hidden w-[76px] lg:block"
            />
            <Sticker
              src="/mugshot/stickers/boba.png"
              width={120}
              rotate={12}
              className="right-[8%] bottom-[14%] hidden w-[60px] lg:block"
            />
            <Sticker
              src="/mugshot/stickers/coldbrew.png"
              width={120}
              rotate={-16}
              className="right-[18%] top-[26%] hidden w-[58px] sm:block lg:w-[70px]"
            />
            <Sticker
              src="/mugshot/stickers/espresso-top.png"
              width={120}
              rotate={18}
              className="left-[18%] top-[34%] hidden w-[60px] sm:block lg:w-[78px]"
            />
            <Sticker
              src="/mugshot/stickers/strawberry.png"
              width={120}
              rotate={-19}
              className="right-[20%] bottom-[30%] hidden w-[46px] md:block"
            />
            <Sticker
              src="/mugshot/stickers/caramel.png"
              width={120}
              rotate={14}
              className="left-[25%] bottom-[7%] hidden w-[54px] md:block"
            />

            <div className="relative z-[1] w-[64%] max-w-[300px]">
              <Phone
                src="/mugshot/home-light.PNG"
                darkSrc="/mugshot/home-dark.PNG"
                alt="Mugshot's monthly sticker calendar"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Overview ── */}
      <section className="px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <Label>Overview</Label>
          </Reveal>
          <div className="space-y-6 lg:col-span-8">
            <Reveal>
              <p className="mug-rounded text-lg font-medium leading-relaxed text-foreground/90 md:text-xl">
                Mugshot is an iOS coffee journal and caffeine tracker. The core
                loop is: photograph a cup, the app cuts it into a die-cut
                sticker and estimates the caffeine, then you place that sticker
                on a calendar day.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mug-rounded text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                Three tabs: a Home calendar, Statistics, and Settings. It also
                covers a daily caffeine meter, home-screen widgets, a weekly
                logging goal, optional reminders, Apple Health sync, and
                shareable daily and monthly recaps. There is no account and
                nothing leaves the device.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-wrap gap-2 pt-2">
                {DRINKS.map((d) => (
                  <span
                    key={d}
                    className="mug-rounded rounded-full border border-border bg-[hsl(var(--mug-card))] px-3 py-1.5 text-xs font-bold tracking-wide text-[hsl(var(--foreground-soft))]"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 01 A calendar you collect ── */}
      <section className="border-t border-border px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Label index="01">A calendar you collect</Label>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="mug-rounded text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                Home is a monthly board of tappable sticker tiles. Open a day and
                the stickers grow into a board you can drag to arrange, with a
                receipt-style log of every cup: drink, time, and caffeine,
                stacked underneath.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <div className="grid grid-cols-1 items-end gap-8 sm:grid-cols-2 lg:gap-12">
              <div>
                <div className="mx-auto w-[78%] max-w-[300px]">
                  <Phone
                    src="/mugshot/home-light.PNG"
                    darkSrc="/mugshot/home-dark.PNG"
                    alt="The monthly sticker calendar with today highlighted"
                  />
                </div>
                <Caption>
                  Sticker calendar: each day is a tile, today gets the roast
                  pill, and a caffeine meter sits below.
                </Caption>
              </div>
              <div>
                <div className="mx-auto w-[78%] max-w-[300px]">
                  <Phone
                    src="/mugshot/day-light.PNG"
                    darkSrc="/mugshot/day-dark.PNG"
                    fallbackSrc={[
                      "/mugshot/day-light.png",
                      "/mugshot/day.png",
                      "/mugshot/home-light.PNG",
                    ]}
                    darkFallbackSrc={[
                      "/mugshot/day-dark.png",
                      "/mugshot/day.png",
                      "/mugshot/home-dark.PNG",
                    ]}
                    alt="Day detail with a drag-to-arrange sticker board and receipt log"
                  />
                </div>
                <Caption>
                  Day detail: a drag-to-arrange sticker board over a
                  receipt-style log of each cup.
                </Caption>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 02 The gentle meter ── */}
      <section className="border-t border-border px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Label index="02">Caffeine estimation</Label>
              <h2 className="mug-display mt-5 text-3xl text-foreground md:text-5xl">
                How the <em>meter</em> is computed
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="mug-rounded text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                Caffeine is estimated per drink: 65&nbsp;mg a shot, about 120 for a
                latte, 200 for cold brew, then adjusted by serving-size, shot
                count, and decaf controls. The daily limit defaults to
                400&nbsp;mg. A five-hour half-life is used to estimate how much
                caffeine is still active at a given time.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <MeterCard />
          </Reveal>
        </div>
      </section>

      {/* ── 03 Widgets ── */}
      <section className="border-t border-border px-6 py-20 md:px-12 md:py-28">
        <div className="relative mx-auto max-w-6xl">
          <div className="relative min-h-[740px] overflow-hidden rounded-[28px] border border-border bg-[hsl(var(--mug-card))] px-5 py-10 md:min-h-[760px] md:px-10 md:py-12 lg:min-h-[520px]">
            <div className="mug-dots absolute inset-0 opacity-45" />
            <ImageSticker
              src="/mugshot/widgets/today-caffeine.png"
              width={1062}
              height={500}
              rotate={3}
              className="-right-10 bottom-10 w-[430px] sm:right-6 md:bottom-14 md:w-[520px] lg:-right-3 lg:top-24 lg:w-[470px] xl:w-[540px]"
            />
            <ImageSticker
              src="/mugshot/widgets/active-caffeine.png"
              width={505}
              height={503}
              rotate={-8}
              className="bottom-4 left-8 w-[150px] md:bottom-12 md:left-[48%] md:w-[190px] lg:left-[60%] lg:w-[205px] xl:w-[220px]"
            />
            <Sticker
              src="/mugshot/stickers/coldbrew.png"
              width={120}
              rotate={-17}
              className="-right-6 top-7 w-[54px] md:right-8 md:top-12 md:w-[72px]"
            />
            <Sticker
              src="/mugshot/stickers/caramel.png"
              width={120}
              rotate={14}
              className="bottom-24 right-9 w-[52px] md:right-[18%] md:bottom-9 md:w-[66px]"
            />

            <div className="relative z-[1] max-w-[410px]">
              <Reveal>
                <Label index="03">Home-screen widgets</Label>
                <h2 className="mug-display mt-5 text-3xl text-foreground md:text-5xl">
                  The meter outside <em>the app</em>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mug-rounded mt-7 max-w-[430px] text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                  WidgetKit snapshots reuse the same caffeine model as the app.
                  The wide widget shows today&apos;s total, cups, streak, and
                  daily limit. The compact widget keeps active caffeine visible
                  at a glance.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 Stats & Wrapped ── */}
      <section className="border-t border-border px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Label index="04">Stats &amp; share cards</Label>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="mug-rounded text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                The Statistics tab aggregates totals, daily averages, the
                most-popular drink, and a lifetime trend across week, month, and
                year. The monthly Wrapped recap derives a coffee persona from
                those numbers. Daily and monthly recap exports turn the same
                logs into shareable cards.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <ShareCardCollage />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap gap-2.5">
              {PERSONAS.map((p) => (
                <span
                  key={p.name}
                  className="mug-rounded inline-flex items-center gap-2 rounded-full border border-border bg-[hsl(var(--mug-card))] px-3.5 py-2 text-xs font-bold text-[hsl(var(--foreground-soft))]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
                  {p.name}
                  <span className="font-medium text-[hsl(var(--foreground-subtle))]">
                    · {p.note}
                  </span>
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 05 Under the hood ── */}
      <section className="border-t border-border px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Label index="05">Under the hood</Label>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7">
              <p className="mug-rounded text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                Capturing a sticker runs two passes concurrently: the cutout and
                the drink analysis, so the &ldquo;Making sticker&rdquo; moment
                stays short. Everything that follows is local, resilient, and
                private by default.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <FlowDiagram />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-4">
                <div className="mx-auto w-[72%] max-w-[260px]">
                  <Phone
                    src="/mugshot/settings-light.PNG"
                    darkSrc="/mugshot/settings-dark.PNG"
                    alt="Mugshot settings screen for appearance, caffeine goal, logging goal, reminders, and Health sync"
                  />
                </div>
              </div>
              <div className="lg:col-span-8">
                <Label>Controls</Label>
                <p className="mug-rounded mt-4 max-w-2xl text-base leading-relaxed text-[hsl(var(--foreground-soft))] md:text-lg">
                  Settings keep the tracker practical: appearance modes,
                  caffeine goal controls, weekly logging targets, gentle
                  reminders, and Apple Health sync all live in one quiet panel.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Built with ── */}
      <section className="border-t border-border px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10">
            <Label>Built with</Label>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="pt-10">
              <MugshotTechStack />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Outro ── */}
      <section className="px-6 pb-28 md:px-12">
        <div className="mx-auto max-w-6xl border-t border-border pt-14">
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <AppIcon className="h-8 w-8 rounded-[9px]" />
              <span className="mug-display text-lg font-semibold tracking-tight">
                Mugshot
              </span>
            </div>
            <p className="mug-rounded max-w-sm text-sm font-medium leading-relaxed text-[hsl(var(--foreground-subtle))]">
              An iOS coffee journal and caffeine tracker, built solo in SwiftUI.
              Capture, sticker, and calendar. All on device.
            </p>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <Link
              href="/#work"
              className="group mug-rounded inline-flex items-center text-sm font-bold uppercase tracking-[0.1em] text-[hsl(var(--foreground-muted))] transition-colors hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              All Projects
            </Link>
            <span className="font-arabic text-sm text-[hsl(var(--gold))] opacity-60">
              「قهوة」
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ── Helpers ───────────────────────────────────────────────────── */

function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="mug-rounded mx-auto mt-5 max-w-[300px] text-center text-sm font-medium leading-relaxed text-[hsl(var(--foreground-soft))]">
      {children}
    </p>
  );
}

function HeroStickerField() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
      <Sticker
        src="/mugshot/stickers/berry.png"
        width={120}
        rotate={-18}
        className="-left-8 top-24 w-[66px] lg:w-[82px]"
      />
      <Sticker
        src="/mugshot/stickers/mocha.png"
        width={120}
        rotate={17}
        className="right-8 top-28 w-[64px] lg:right-20 lg:w-[78px]"
      />
      <Sticker
        src="/mugshot/stickers/lowball.png"
        width={120}
        rotate={9}
        className="left-[46%] top-10 w-[54px] lg:w-[66px]"
      />
      <Sticker
        src="/mugshot/stickers/cup-top.png"
        width={120}
        rotate={-9}
        className="-right-8 top-[43%] w-[86px] lg:w-[104px]"
      />
      <Sticker
        src="/mugshot/stickers/espresso-top.png"
        width={120}
        rotate={20}
        className="-left-10 top-[52%] w-[72px] lg:w-[90px]"
      />
      <Sticker
        src="/mugshot/stickers/strawberry.png"
        width={120}
        rotate={-23}
        className="right-[26%] top-[58%] w-[48px] lg:w-[58px]"
      />
      <Sticker
        src="/mugshot/stickers/caramel.png"
        width={120}
        rotate={16}
        className="left-[12%] top-[77%] w-[58px] lg:w-[70px]"
      />
      <Sticker
        src="/mugshot/stickers/coldbrew.png"
        width={120}
        rotate={-15}
        className="right-[10%] top-[76%] w-[60px] lg:w-[74px]"
      />
    </div>
  );
}

function ShareCardCollage() {
  return (
    <div className="relative min-h-[860px] overflow-hidden rounded-[28px] border border-border bg-[hsl(var(--mug-card))] p-5 md:min-h-[720px] md:p-8 lg:min-h-[620px]">
      <div className="mug-dots absolute inset-0 opacity-40" />
      <ImageSticker
        src="/mugshot/recaps/daily-card.png"
        width={656}
        height={1057}
        rotate={-7}
        className="left-4 top-10 w-[185px] sm:w-[220px] md:left-8 md:w-[250px] lg:left-7 lg:top-20 lg:w-[245px]"
      />
      <ImageSticker
        src="/mugshot/recaps/monthly-card.png"
        width={656}
        height={1057}
        rotate={6}
        className="right-3 top-[310px] w-[190px] sm:w-[225px] md:right-8 md:top-24 md:w-[255px] lg:right-6 lg:top-16 lg:w-[250px]"
      />
      <Sticker
        src="/mugshot/stickers/matcha.png"
        width={120}
        rotate={12}
        className="left-[48%] top-[22%] w-[58px] md:left-[37%] md:top-[12%] md:w-[76px]"
      />
      <Sticker
        src="/mugshot/stickers/dalgona.png"
        width={120}
        rotate={-16}
        className="right-[18%] bottom-24 w-[62px] md:right-[32%] md:bottom-20 md:w-[82px]"
      />

      <div className="relative z-[1] mx-auto grid max-w-4xl grid-cols-1 items-end gap-8 pt-[470px] sm:pt-[520px] md:grid-cols-2 md:pt-[360px] lg:pt-0">
        <div className="mx-auto w-[76%] max-w-[250px] lg:translate-y-20">
          <Phone
            src="/mugshot/review-light.PNG"
            darkSrc="/mugshot/review-dark.PNG"
            alt="Statistics dashboard with totals, averages and most popular drink"
          />
          <Caption>
            Period totals, daily averages and the month&apos;s favorite drink.
          </Caption>
        </div>
        <div className="mx-auto w-[76%] max-w-[250px] lg:-translate-y-4">
          <Phone
            src="/mugshot/wrapped-light.PNG"
            darkSrc="/mugshot/wrapped-dark.PNG"
            alt="Monthly Wrapped recap card with a coffee persona"
          />
          <Caption>
            Wrapped turns monthly logs into a shareable recap.
          </Caption>
        </div>
      </div>
    </div>
  );
}

/* A recreated "Caffeine today" meter, in Mugshot's own hand. */
function MeterCard() {
  const total = 247;
  const limit = 400;
  const active = 92;
  const pct = Math.round((total / limit) * 100);

  return (
    <div className="rounded-[28px] border border-border bg-[hsl(var(--mug-card))] p-7 shadow-[0_28px_64px_-44px_rgba(35,27,20,0.5)] md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mug-rounded text-[11px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
            Caffeine today
          </span>
          <div className="mt-2 flex items-end gap-4">
            <span className="mug-numeral text-6xl text-[hsl(var(--gold))] md:text-7xl">
              {total}
              <span className="mug-rounded ml-1 text-xl font-extrabold text-[hsl(var(--foreground-subtle))] md:text-2xl">
                mg
              </span>
            </span>
          </div>
        </div>
        <div className="mug-rounded flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--mug-soft))] px-3 py-1.5 text-xs font-bold text-[hsl(var(--foreground-soft))]">
            <HeartPulse className="h-3.5 w-3.5 text-[hsl(var(--mug-sage))]" />≈ {active}{" "}
            mg still active
          </span>
          <span className="rounded-full bg-[hsl(var(--mug-soft))] px-3 py-1.5 text-xs font-bold text-[hsl(var(--foreground-soft))]">
            3 cups logged
          </span>
        </div>
      </div>

      <div className="mt-7 h-3 w-full overflow-hidden rounded-full bg-[hsl(var(--mug-soft))]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--mug-mocha))] to-[hsl(var(--gold))]"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EASE }}
        />
      </div>
      <div className="mug-rounded mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--foreground-subtle))]">
        <span>{limit - total} mg left today</span>
        <span>Limit {limit} mg</span>
      </div>
    </div>
  );
}

function FlowDiagram() {
  const steps = [
    {
      Icon: Camera,
      label: "01",
      title: "Capture",
      caption: "Camera or library",
      detail: "A cup photo enters with local metadata and the selected day.",
      chips: ["Photo", "Timestamp"],
    },
    {
      Icon: Scissors,
      label: "02",
      title: "Lift the sticker",
      caption: "best tier first",
      detail: "Vision tries the clean cutout, then flood-fill and rounded crop fallbacks step in.",
      chips: ["Vision", "Flood-fill", "Crop"],
    },
    {
      Icon: Brain,
      label: "03",
      title: "Read the drink",
      caption: "on-device model",
      detail: "The drink name, size, shots, and caffeine estimate are resolved locally.",
      chips: ["Name", "Shots", "Caffeine"],
    },
    {
      Icon: CalendarHeart,
      label: "04",
      title: "Save and refresh",
      caption: "local first",
      detail: "The image, JSON entry, widget snapshot, and optional Health sync update together.",
      chips: ["JSON", "WidgetKit", "Health"],
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-border bg-[hsl(var(--mug-card))] p-5 shadow-[0_28px_64px_-44px_rgba(35,27,20,0.42)] md:p-8">
      <div className="mug-dots absolute inset-0 opacity-45" />
      <Sticker
        src="/mugshot/stickers/boba.png"
        width={120}
        rotate={-12}
        className="right-5 top-5 w-[52px] md:w-[70px]"
      />
      <Sticker
        src="/mugshot/stickers/latte-top.png"
        width={120}
        rotate={11}
        className="bottom-5 left-5 w-[58px] md:w-[78px]"
      />

      <div className="relative grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <FlowStep key={step.title} {...step} isLast={index === steps.length - 1} />
        ))}
      </div>

      <div className="relative mt-5 grid grid-cols-1 gap-2.5 md:grid-cols-3">
        {[
          ["Atomic backup", "Manifest protects the image and entry"],
          ["Widget refresh", "Snapshots update after save"],
          ["Private by default", "No account and no server round trip"],
        ].map(([title, body]) => (
          <div
            key={title}
            className="mug-rounded rounded-2xl border border-border bg-[hsl(var(--mug-soft))]/75 p-4"
          >
            <p className="text-sm font-extrabold text-foreground">{title}</p>
            <p className="mt-1 text-xs font-bold leading-snug text-[hsl(var(--foreground-subtle))]">
              {body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowStep({
  Icon,
  title,
  caption,
  detail,
  chips,
  label,
  isLast,
}: {
  Icon: typeof Camera;
  title: string;
  caption: string;
  detail: string;
  chips: string[];
  label: string;
  isLast: boolean;
}) {
  return (
    <div className="relative rounded-[24px] border border-border bg-[hsl(var(--mug-card))]/90 p-4 shadow-[0_18px_38px_-34px_rgba(35,27,20,0.5)]">
      {!isLast && (
        <span className="mug-rounded absolute -right-2 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-[hsl(var(--mug-card))] text-[hsl(var(--gold))] shadow-sm lg:flex">
          →
        </span>
      )}
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--mug-soft))] text-[hsl(var(--gold))] shadow-sm">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <span className="mug-rounded text-[10px] font-extrabold uppercase tracking-[0.14em] text-[hsl(var(--foreground-subtle))]">
            {label} · {caption}
          </span>
          <p className="mug-rounded mt-1 text-base font-extrabold tracking-tight text-foreground">
            {title}
          </p>
        </div>
      </div>
      <p className="mug-rounded mt-4 min-h-[72px] text-sm font-medium leading-relaxed text-[hsl(var(--foreground-soft))]">
        {detail}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip}
            className="mug-rounded rounded-full bg-[hsl(var(--mug-soft))] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[hsl(var(--foreground-subtle))]"
          >
            {chip}
          </span>
        ))}
      </div>
      {!isLast && (
        <p className="mug-rounded mt-3 text-center text-lg text-[hsl(var(--foreground-faint))] lg:hidden">
          ↓
        </p>
      )}
    </div>
  );
}
