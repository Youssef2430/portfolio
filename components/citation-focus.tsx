"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  hasProjectSignatureTransition,
  startProjectSignatureTransition,
} from "@/components/project-signature-transition";

const CITATION_EVENT = "portfolio:citation";
/** Sent before a cited element is looked up, so sections can reveal it (open a tab, etc.). */
export const CITATION_REVEAL_EVENT = "portfolio:citation-reveal";

type CitationDetail = { href: string; projectId?: string };

/** Go to a cited part of the site and point at it. */
export function followCitation(detail: CitationDetail) {
  window.dispatchEvent(new CustomEvent<CitationDetail>(CITATION_EVENT, { detail }));
}

const WAIT_FOR_TARGET_MS = 10_000;
/** How long the target must hold its position before we scroll to it. */
const SETTLE_MS = 200;
const MAX_SETTLE_MS = 2000;
const FLASH_MS = 2600;

function flash(target: HTMLElement) {
  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }
  target.focus({ preventScroll: true });
  const inset = target.getBoundingClientRect().width > window.innerWidth - 48;
  target.classList.remove("citation-flash", "citation-flash-inset");
  void target.offsetWidth; // restart the animation when the same source is cited again
  target.classList.add("citation-flash", ...(inset ? ["citation-flash-inset"] : []));
  return window.setTimeout(
    () => target.classList.remove("citation-flash", "citation-flash-inset"),
    FLASH_MS,
  );
}

export function CitationFocusProvider() {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = Boolean(useReducedMotion());
  const pendingRef = useRef<{ path: string; id: string } | null>(null);
  const cancelRef = useRef<() => void>(() => {});

  const reveal = useCallback(
    (id: string, { smooth }: { smooth: boolean }) => {
      cancelRef.current();
      window.dispatchEvent(new CustomEvent(CITATION_REVEAL_EVENT, { detail: { id } }));
      const started = performance.now();
      let foundAt = 0;
      let stableSince = 0;
      let lastPosition = NaN;
      let frame = 0;
      let timer = 0;
      const cleanups: (() => void)[] = [];

      const land = (target: HTMLElement) => {
        const behavior = smooth && !reduceMotion ? "smooth" : "instant";
        target.scrollIntoView({ behavior, block: "start" });
        timer = flash(target);
        // Content can still shift while the scroll runs (a lab mounting above
        // the target). Line up once more when it ends, unless the reader has
        // taken over the scrolling.
        const realign = () => {
          const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
          if (Math.abs(target.getBoundingClientRect().top - margin) > 24)
            target.scrollIntoView({ behavior: "instant", block: "start" });
          stop();
        };
        const stop = () => {
          window.removeEventListener("scrollend", realign);
          window.clearTimeout(fallback);
          for (const type of ["wheel", "touchstart", "keydown"]) window.removeEventListener(type, stop);
        };
        const fallback = window.setTimeout(realign, behavior === "smooth" ? 1500 : 600);
        window.addEventListener("scrollend", realign);
        for (const type of ["wheel", "touchstart", "keydown"]) window.addEventListener(type, stop, { passive: true });
        cleanups.push(stop);
      };

      // The target may mount late (a tab switch, a new page), a project
      // transition covers the page until it finishes, and content above it may
      // still be loading. Wait for it to exist, be uncovered, and hold still.
      const step = (now: number) => {
        const target = document.getElementById(id);
        if (target && !document.querySelector("[data-project-loader]")) {
          const position = target.getBoundingClientRect().top + window.scrollY;
          foundAt ||= now;
          if (position !== lastPosition) {
            lastPosition = position;
            stableSince = now;
          }
          if (now - stableSince >= SETTLE_MS || now - foundAt >= MAX_SETTLE_MS) {
            land(target);
            return;
          }
        }
        if (now - started < WAIT_FOR_TARGET_MS) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
      cancelRef.current = () => {
        cancelAnimationFrame(frame);
        window.clearTimeout(timer);
        for (const cleanup of cleanups) cleanup();
      };
    },
    [reduceMotion],
  );

  useEffect(() => {
    const follow = (event: Event) => {
      const detail = (event as CustomEvent<CitationDetail>).detail;
      if (!detail?.href) return;
      const url = new URL(detail.href, window.location.origin);
      const id = decodeURIComponent(url.hash.slice(1));
      if (url.pathname === window.location.pathname) {
        if (id) reveal(id, { smooth: true });
        return;
      }
      pendingRef.current = id ? { path: url.pathname, id } : null;
      const destination = url.pathname + url.hash;
      if (detail.projectId && hasProjectSignatureTransition(detail.projectId))
        startProjectSignatureTransition(detail.projectId, destination);
      else router.push(destination);
    };
    window.addEventListener(CITATION_EVENT, follow);
    return () => window.removeEventListener(CITATION_EVENT, follow);
  }, [router, reveal]);

  useEffect(() => {
    const pending = pendingRef.current;
    if (pending?.path !== pathname) return;
    pendingRef.current = null;
    reveal(pending.id, { smooth: false });
  }, [pathname, reveal]);

  useEffect(() => () => cancelRef.current(), []);

  return null;
}
