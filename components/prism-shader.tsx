"use client";

import { useEffect, useRef, useState } from "react";
import {
  clock,
  compute,
  effect,
  frameLoop,
  init,
  sampler,
  storage,
  surface,
  target,
} from "vgpu";
import type { FrameLoopHandle, Target } from "vgpu";
import prismShader from "@/shaders/prism.wgsl";
import spectrumShader from "@/shaders/prism-spectrum.wgsl";
import brightPassShader from "@/shaders/prism-bright-pass.wgsl";
import blurShader from "@/shaders/prism-blur.wgsl";
import compositeShader from "@/shaders/prism-composite.wgsl";

type PrismController = {
  setTheme: (theme: number, background: readonly [number, number, number]) => void;
};

type RenderTargets = {
  scene: Target;
  bloomA: Target;
  bloomB: Target;
};

const HDR_FORMAT = "rgba16float" as const;
const CLEAR: readonly [number, number, number, number] = [0, 0, 0, 0];
// 32 wavelengths, one PathSample each: entry, waypoint, exit, landing, tint,
// entry reflection.
const SPECTRUM_BYTES = 32 * 6 * 16;

function destroyTargets(targets: RenderTargets | undefined) {
  if (!targets) return;
  targets.scene.color.destroy();
  targets.bloomA.color.destroy();
  targets.bloomB.color.destroy();
}

function srgbToLinear(channel: number) {
  return channel <= 0.04045
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

// The panel paints the page's own colour behind the glass, so the shader needs
// the page background in the same linear space it works in.
function readPageBackground(): [number, number, number] {
  const fallback: [number, number, number] = [0.917, 0.928, 0.949];
  if (typeof window === "undefined") return fallback;

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--background")
    .trim();
  const hsl = raw.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!hsl) return fallback;

  const hue = Number(hsl[1]) / 360;
  const saturation = Number(hsl[2]) / 100;
  const lightness = Number(hsl[3]) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const offset = lightness - chroma / 2;
  const channel = (shift: number) => {
    const t = (hue + shift / 3) % 1;
    const wrapped = t < 0 ? t + 1 : t;
    if (wrapped < 1 / 6) return chroma * (6 * wrapped) + offset;
    if (wrapped < 1 / 2) return chroma + offset;
    if (wrapped < 2 / 3) return chroma * (6 * (2 / 3 - wrapped)) + offset;
    return offset;
  };
  return [
    srgbToLinear(channel(1)),
    srgbToLinear(channel(0)),
    srgbToLinear(channel(-1)),
  ];
}

function readThemeMode(): number {
  if (typeof window === "undefined") return 0;
  const root = document.documentElement;
  if (root.classList.contains("dark")) return 1;
  if (root.classList.contains("light")) return 0;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? 1 : 0;
}

export function PrismShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<PrismController | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let gpu: Awaited<ReturnType<typeof init>> | undefined;
    let loop: FrameLoopHandle | undefined;
    let removePointerListeners: (() => void) | undefined;
    let observer: IntersectionObserver | undefined;
    let themeObserver: MutationObserver | undefined;
    let renderTargets: RenderTargets | undefined;

    void (async () => {
      try {
        gpu = await init();
        if (disposed) {
          gpu.dispose();
          return;
        }

        const canvasSurface = surface(gpu, canvas, {
          dpr: [1, 1.5],
          alphaMode: "premultiplied",
        });
        const sharedSampler = sampler(gpu, {
          minFilter: "linear",
          magFilter: "linear",
        });
        const initialTheme = readThemeMode();
        const background = readPageBackground();

        const params = {
          resolution: canvasSurface.size,
          pointer: [0.5, 0.5] as [number, number],
          background: [...background, 1] as [number, number, number, number],
          time: 0,
          theme: initialTheme,
          yaw: 0,
          pitch: 0,
          energy: 1,
          reveal: 0,
          beam_aim: 0,
          beam_height: 0,
        };

        // The spectral paths are traced once per frame into this buffer, not
        // once per pixel: 32 threads do the optics, every fragment reads it.
        const paths = storage(gpu, SPECTRUM_BYTES, "read-write");
        const spectrum = compute(gpu, spectrumShader, {
          label: "prism-spectral-paths",
          set: { params, paths },
        });
        const scene = effect(gpu, prismShader, {
          label: "prism-glass",
          set: { params, paths },
        });
        const brightPass = effect(gpu, brightPassShader, {
          label: "prism-bright-pass",
          set: { samp: sharedSampler },
        });
        const blurH = effect(gpu, blurShader, {
          label: "prism-bloom-horizontal",
          set: { samp: sharedSampler, blur: { texelSize: [1, 1], direction: [1, 0] } },
        });
        const blurV = effect(gpu, blurShader, {
          label: "prism-bloom-vertical",
          set: { samp: sharedSampler, blur: { texelSize: [1, 1], direction: [0, 1] } },
        });
        const composite = effect(gpu, compositeShader, {
          label: "prism-hdr-composite",
          set: {
            samp: sharedSampler,
            composite: {
              bloom_strength: 0.9,
              theme: initialTheme,
              background: [...background, 1],
            },
          },
        });

        const createTargets = (size: readonly [number, number]): RenderTargets => {
          const full: [number, number] = [
            Math.max(1, Math.floor(size[0])),
            Math.max(1, Math.floor(size[1])),
          ];
          const bloomHeight = Math.max(1, Math.min(300, full[1]));
          const bloomSize: [number, number] = [
            Math.max(1, Math.round((bloomHeight * full[0]) / full[1])),
            bloomHeight,
          ];
          return {
            scene: target(gpu!, { size: full, format: HDR_FORMAT }),
            bloomA: target(gpu!, { size: bloomSize, format: HDR_FORMAT }),
            bloomB: target(gpu!, { size: bloomSize, format: HDR_FORMAT }),
          };
        };

        const bindTargets = (targets: RenderTargets) => {
          scene.set({ params: { resolution: targets.scene.size } });
          brightPass.set({ src: targets.scene });
          blurH.set({ src: targets.bloomA, blur: { texelSize: targets.bloomA.texelSize } });
          blurV.set({ src: targets.bloomB, blur: { texelSize: targets.bloomB.texelSize } });
          composite.set({ scene: targets.scene, bloom: targets.bloomA });
        };

        const replaceTargets = (size: readonly [number, number]) => {
          const previous = renderTargets;
          renderTargets = createTargets(size);
          bindTargets(renderTargets);
          destroyTargets(previous);
        };

        replaceTargets(canvasSurface.size);
        const initialTargets = renderTargets!;
        await Promise.all([
          scene.compile(initialTargets.scene),
          brightPass.compile(initialTargets.bloomA),
          blurH.compile(initialTargets.bloomB),
          blurV.compile(initialTargets.bloomA),
          composite.compile({ colors: [canvasSurface.format] }),
        ]);
        if (disposed) return;

        controllerRef.current = {
          setTheme(theme, page) {
            const value = { theme, background: [...page, 1] as const };
            scene.set({ params: value });
            spectrum.set({ params: value });
            composite.set({
              composite: {
                theme,
                background: value.background,
                bloom_strength: theme > 0.5 ? 0.9 : 0.42,
              },
            });
          },
        };

        // next-themes changes the root class. Watching the DOM directly avoids
        // losing a theme change while the async WebGPU pipelines are compiling.
        // Re-syncing immediately after compilation also fixes that startup race.
        const syncTheme = () => {
          controllerRef.current?.setTheme(readThemeMode(), readPageBackground());
        };
        syncTheme();
        themeObserver = new MutationObserver(syncTheme);
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });

        let pointer = [0.5, 0.5] as [number, number];
        let pointerTarget = [0.5, 0.5] as [number, number];
        let energy = 1;
        let activePointer: number | undefined;
        let lastPointer = [0, 0] as [number, number];
        const orbit = { yaw: 0, pitch: 0 };
        const orbitTarget = { yaw: 0, pitch: 0 };
        const orbitDrag = { yaw: 0, pitch: 0 };
        // Persistent optical controls are separate from the prism's restrained
        // parallax. Horizontal drag changes incidence; vertical drag moves the
        // strike point. Negative incidence crosses the critical angle and
        // reveals a genuine internal-reflection path from the compute tracer.
        const lightDrag = { incidence: 0, aim: 0 };

        const updateOrbitTarget = () => {
          // Pointer motion supplies restrained parallax; dragging adds a small
          // deliberate offset, but the prism always stays close to head-on.
          const pointerYaw = (0.5 - pointerTarget[0]) * 0.075;
          const pointerPitch = (pointerTarget[1] - 0.5) * 0.045;
          orbitTarget.yaw = Math.max(
            -0.14,
            Math.min(0.14, orbitDrag.yaw + pointerYaw),
          );
          orbitTarget.pitch = Math.max(
            -0.085,
            Math.min(0.085, orbitDrag.pitch + pointerPitch),
          );
        };

        const updatePointerTarget = (event: PointerEvent) => {
          const bounds = canvas.getBoundingClientRect();
          pointerTarget = [
            Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
            Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
          ];
          updateOrbitTarget();
        };
        const handlePointerDown = (event: PointerEvent) => {
          if (!event.isPrimary || activePointer !== undefined) return;
          activePointer = event.pointerId;
          lastPointer = [event.clientX, event.clientY];
          energy = 1.4;
          try {
            canvas.setPointerCapture(event.pointerId);
          } catch {
            // Synthetic automation events have no browser-managed pointer to capture.
          }
          updatePointerTarget(event);
        };
        const handlePointerMove = (event: PointerEvent) => {
          updatePointerTarget(event);
          energy = Math.max(energy, 1.18);
          if (event.pointerId !== activePointer) return;
          const deltaX = event.clientX - lastPointer[0];
          const deltaY = event.clientY - lastPointer[1];
          lastPointer = [event.clientX, event.clientY];
          lightDrag.incidence = Math.max(
            -3.65,
            Math.min(3.65, lightDrag.incidence - deltaX * 0.018),
          );
          lightDrag.aim = Math.max(
            -0.95,
            Math.min(0.95, lightDrag.aim - deltaY * 0.006),
          );
          orbitDrag.yaw = Math.max(
            -0.075,
            Math.min(0.075, orbitDrag.yaw - deltaX * 0.00055),
          );
          orbitDrag.pitch = Math.max(
            -0.045,
            Math.min(0.045, orbitDrag.pitch + deltaY * 0.0005),
          );
          updateOrbitTarget();
        };
        const handlePointerEnd = (event: PointerEvent) => {
          if (event.pointerId !== activePointer) return;
          if (canvas.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
          }
          activePointer = undefined;
        };
        const handlePointerLeave = () => {
          if (activePointer === undefined) {
            pointerTarget = [0.5, 0.5];
            updateOrbitTarget();
          }
        };
        const handleDoubleClick = () => {
          orbitDrag.yaw = 0;
          orbitDrag.pitch = 0;
          lightDrag.incidence = 0;
          lightDrag.aim = 0;
          pointerTarget = [0.5, 0.5];
          updateOrbitTarget();
          energy = 1.4;
        };

        canvas.addEventListener("pointerdown", handlePointerDown);
        canvas.addEventListener("pointermove", handlePointerMove);
        canvas.addEventListener("pointerup", handlePointerEnd);
        canvas.addEventListener("pointercancel", handlePointerEnd);
        canvas.addEventListener("pointerleave", handlePointerLeave);
        canvas.addEventListener("dblclick", handleDoubleClick);
        removePointerListeners = () => {
          canvas.removeEventListener("pointerdown", handlePointerDown);
          canvas.removeEventListener("pointermove", handlePointerMove);
          canvas.removeEventListener("pointerup", handlePointerEnd);
          canvas.removeEventListener("pointercancel", handlePointerEnd);
          canvas.removeEventListener("pointerleave", handlePointerLeave);
          canvas.removeEventListener("dblclick", handleDoubleClick);
        };

        const gpuClock = clock(gpu);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let visible = false;
        let sceneTime = 0;
        observer = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
          },
          { rootMargin: "120px 0px", threshold: 0.01 },
        );
        observer.observe(canvas);

        loop = frameLoop(
          gpu,
          (frame) => {
            if (!visible || !renderTargets) return;

            if (
              renderTargets.scene.size[0] !== canvasSurface.size[0] ||
              renderTargets.scene.size[1] !== canvasSurface.size[1]
            ) {
              replaceTargets(canvasSurface.size);
            }
            const targets = renderTargets!;

            // Frame-rate independent, and quick enough that the spectrum feels
            // attached to the cursor rather than dragged along behind it.
            const step = Math.min(gpuClock.deltaTime, 0.1);
            const pointerBlend = 1 - Math.exp(-11 * step);
            pointer = [
              pointer[0] + (pointerTarget[0] - pointer[0]) * pointerBlend,
              pointer[1] + (pointerTarget[1] - pointer[1]) * pointerBlend,
            ];
            const orbitBlend = 1 - Math.exp(-13 * step);
            orbit.yaw += (orbitTarget.yaw - orbit.yaw) * orbitBlend;
            orbit.pitch += (orbitTarget.pitch - orbit.pitch) * orbitBlend;
            energy += (1 - energy) * 0.055;
            sceneTime += reduceMotion ? 0 : gpuClock.deltaTime;
            const reveal = reduceMotion ? 1 : Math.min(1, sceneTime / 1.4);
            const smoothReveal = reveal * reveal * (3 - 2 * reveal);

            // The two axes are the two things you can do to a prism with a lamp.
            //
            // Across: the angle of incidence, normalised to [-1, 1] and mapped
            // in the shader onto a real sweep from 14 to 76 degrees. The left
            // third of the panel sits inside the critical-angle regime, where
            // the exit face reflects and the beam takes an extra leg through
            // the solid; the middle is minimum deviation, the widest spectrum;
            // the right is grazing, where most of the light bounces off the
            // face instead of entering.
            //
            // Down: where on that face the beam strikes, which changes the path
            // length through the body and eventually which face it leaves by.
            const clampUnit = (value: number) => Math.max(-1, Math.min(1, value));
            const frameParams = {
              time: sceneTime,
              pointer,
              yaw: orbit.yaw,
              pitch: orbit.pitch,
              energy,
              reveal: smoothReveal,
              beam_aim: (0.5 - pointer[1]) * 1.9 + lightDrag.aim,
              beam_height: clampUnit((pointer[0] - 0.5) * 2.15 + lightDrag.incidence),
            };
            scene.set({ params: frameParams });
            spectrum.set({ params: frameParams });

            // Submits ahead of this frame's render pass, so the fragment shader
            // reads paths traced for the pointer position it is drawing.
            spectrum.dispatch(1);

            frame.pass({ target: targets.scene, clear: CLEAR }, (pass) => pass.draw(scene));
            frame.pass({ target: targets.bloomA, clear: CLEAR }, (pass) => pass.draw(brightPass));
            frame.pass({ target: targets.bloomB, clear: CLEAR }, (pass) => pass.draw(blurH));
            frame.pass({ target: targets.bloomA, clear: CLEAR }, (pass) => pass.draw(blurV));
            frame.pass({ target: canvasSurface, clear: CLEAR }, (pass) => pass.draw(composite));
          },
          { fps: reduceMotion ? 20 : 60 },
        );

        setReady(true);
      } catch (error) {
        console.error("Unable to start the vGPU prism", error);
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      controllerRef.current = null;
      observer?.disconnect();
      themeObserver?.disconnect();
      removePointerListeners?.();
      loop?.stop();
      destroyTargets(renderTargets);
      gpu?.dispose();
    };
  }, []);

  return (
    <div
      className="prism-stage relative h-full w-full"
      data-ready={ready}
      data-failed={failed}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full cursor-grab touch-none transition-opacity duration-1000 active:cursor-grabbing"
        style={{ opacity: ready ? 1 : 0 }}
        aria-label="Interactive glass prism. Move to aim the beam, drag horizontally to change its incidence and discover internal reflections, drag vertically to move the strike point, and double-click to reset."
      />

      {failed ? (
        <p
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/50"
          role="status"
        >
          WebGPU unavailable — enable hardware acceleration
        </p>
      ) : null}
    </div>
  );
}
