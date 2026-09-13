"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { PrismFallback } from "@/components/prism-fallback";
import Image from "next/image";
import Link from "next/link";
import { projects, type ProjectDetail } from "@/lib/project-data";
import {
  hasProjectSignatureTransition,
  startProjectSignatureTransition,
} from "@/components/project-signature-transition";

const PrismShader = dynamic(
  () => import("@/components/prism-shader").then((module) => module.PrismShader),
  { ssr: false, loading: () => <PrismFallback /> },
);

const getAspectRatioValue = (ratio?: string) => {
  if (!ratio) return 742 / 273;

  const [width, height] = ratio.split("/").map((part) => Number(part.trim()));
  if (!width || !height) return 742 / 273;

  return width / height;
};

type HoverPreview = NonNullable<ProjectDetail["hoverPreview"]>;

function HoverPreviewShot({
  preview,
  title,
  sizes,
}: {
  preview: HoverPreview;
  title: string;
  sizes: string;
}) {
  const fitClass = preview.fit === "contain" ? "object-contain" : "object-cover";
  const deviceShotClass = preview.device === "browser" ? "" : "device-shot";
  const className = `${deviceShotClass} ${fitClass}`.trim();
  const style = preview.objectPosition
    ? { objectPosition: preview.objectPosition }
    : undefined;

  return (
    <>
      <Image
        src={preview.src}
        alt={`${title} app screenshot`}
        fill
        sizes={sizes}
        className={preview.darkSrc ? `${className} dark:hidden` : className}
        style={style}
      />
      {preview.darkSrc && (
        <Image
          src={preview.darkSrc}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          className={`${className} hidden dark:block`}
          style={style}
        />
      )}
    </>
  );
}

function HoverProjectPreview({ project }: { project: ProjectDetail }) {
  const preview = project.hoverPreview ?? {
    device: "mac",
    src: project.image,
    fit: "cover",
  } satisfies HoverPreview;

  if (preview.device === "iphone") {
    return (
      <div className="w-[150px] md:w-[174px] drop-shadow-[0_34px_60px_rgba(18,22,31,0.28)] dark:drop-shadow-[0_34px_70px_rgba(0,0,0,0.6)]">
        <div className="device-frame device-frame-phone relative rounded-[34px] p-[5px] md:rounded-[40px] md:p-[6px]">
          <span
            className="absolute left-1/2 top-[11px] z-20 h-[16px] w-[56px] -translate-x-1/2 rounded-full bg-[#050505] shadow-[0_1px_0_rgba(255,255,255,0.10)] md:top-[13px] md:h-[19px] md:w-[66px]"
            aria-hidden
          />
          <div className="device-screen relative aspect-[383/818] overflow-hidden rounded-[29px] md:rounded-[34px]">
            <HoverPreviewShot preview={preview} title={project.title} sizes="174px" />
          </div>
        </div>
      </div>
    );
  }

  if (preview.device === "browser") {
    return (
      <div className="w-[340px] overflow-hidden rounded-[13px] border border-[hsl(var(--border))] bg-card shadow-[0_34px_72px_-34px_rgba(18,22,31,0.38)] md:w-[430px] dark:shadow-[0_34px_76px_-30px_rgba(0,0,0,0.72)]">
        <div className="flex h-8 items-center gap-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#fc625d]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#fdbc40]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#35cd4b]" />
          <div className="ml-2 h-4 flex-1 rounded-full border border-[hsl(var(--border))] bg-foreground/[0.03]" />
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[hsl(var(--foreground-subtle))]">
            Gmail
          </span>
        </div>
        <div
          className="relative bg-white dark:bg-[#111112]"
          style={{ aspectRatio: preview.aspectRatio ?? "742 / 273" }}
        >
          <HoverPreviewShot preview={preview} title={project.title} sizes="430px" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-[310px] md:w-[380px] drop-shadow-[0_34px_60px_rgba(18,22,31,0.25)] dark:drop-shadow-[0_34px_70px_rgba(0,0,0,0.62)]">
      <div className="device-frame device-frame-mac relative rounded-[16px] p-[6px] md:rounded-[20px] md:p-[8px]">
        <div className="device-screen relative aspect-[294/183] overflow-hidden rounded-[10px] md:rounded-[13px]">
          <HoverPreviewShot preview={preview} title={project.title} sizes="380px" />
          <div
            className="absolute left-1/2 top-0 z-20 h-[10px] w-[15%] min-w-[58px] max-w-[92px] -translate-x-1/2 rounded-b-[8px] bg-[#09090a] shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)] md:h-[13px]"
            aria-hidden
          >
            <span className="absolute left-1/2 top-[4px] h-[2px] w-[2px] -translate-x-1/2 rounded-full bg-white/25 md:top-[5px]" />
          </div>
        </div>
      </div>
      <div className="macbook-base relative mx-auto -mt-px h-[10px] w-full rounded-b-[12px] md:h-[12px] md:rounded-b-[14px]">
        <div className="macbook-base-indent absolute left-1/2 top-0 h-[4px] w-[18%] max-w-[104px] -translate-x-1/2 rounded-b-[7px] md:h-[5px]" />
      </div>
    </div>
  );
}

export function Projects() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const shouldLoadPrism = useInView(sectionRef, { once: true, margin: "300px" });

  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleProjectClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    projectId: string
  ) => {
    const isModifiedNavigation =
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

    if (isModifiedNavigation || !hasProjectSignatureTransition(projectId)) {
      return;
    }

    e.preventDefault();
    setHoveredProject(null);
    startProjectSignatureTransition(projectId, `/projects/${projectId}`);
  };

  const activeProject = projects.find((p) => p.id === hoveredProject);
  const activePreviewDevice = activeProject?.hoverPreview?.device ?? "mac";
  const browserPreviewWidth = 430;
  const browserPreviewHeight =
    32 +
    Math.round(
      browserPreviewWidth /
        getAspectRatioValue(activeProject?.hoverPreview?.aspectRatio)
    );
  const previewOffset = activePreviewDevice === "iphone"
    ? { x: 112, y: -180 }
    : activePreviewDevice === "browser"
      ? { x: 96, y: -92 }
    : { x: 120, y: -118 };
  const previewBounds = activePreviewDevice === "iphone"
    ? { width: 174, height: 358 }
    : activePreviewDevice === "browser"
      ? { width: browserPreviewWidth, height: browserPreviewHeight }
    : { width: 380, height: 254 };

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative py-16 md:py-24 bg-background noise-bg overflow-hidden"
    >
      {/* Top fade overlay */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-[2]"
        style={{
          background: `linear-gradient(to top, transparent 0%, hsl(var(--background)) 100%)`,
        }}
      />

      {/* Static noise with fade */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          maskImage: `linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)`,
          opacity: 0.06,
        }}
      />

      {/* Bottom fade overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[2]"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)`,
        }}
      />

      {/* Floating Image - follows cursor */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            key={activeProject.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed pointer-events-none z-50"
            data-project-hover-preview={activeProject.id}
            style={{
              left: `clamp(24px, ${mousePosition.x + previewOffset.x}px, calc(100vw - ${previewBounds.width}px - 24px))`,
              top: `clamp(24px, ${mousePosition.y + previewOffset.y}px, calc(100vh - ${previewBounds.height}px - 24px))`,
            }}
          >
            <HoverProjectPreview project={activeProject} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Left Column - Interactive vGPU prism */}
          <div className="relative z-0">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
              animate={isInView
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 18, scale: 0.985 }}
              transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative -mx-6 h-[19rem] w-[calc(100%+3rem)] md:-mx-12 md:h-[24rem] md:w-[calc(100%+6rem)] lg:-ml-20 lg:-mr-36 lg:h-[25rem] lg:w-[calc(100%+14rem)]"
            >
              {shouldLoadPrism ? <PrismShader /> : <PrismFallback />}
            </motion.div>

            {/* Intro Text */}
            <div className="relative z-10 -mt-7 max-w-sm space-y-6 md:-mt-10 lg:-mt-12">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="flex items-baseline gap-2 flex-wrap"
                >
                  <span className="font-condensed text-2xl md:text-3xl text-foreground uppercase">
                    QUIETLY
                  </span>
                  <span className="font-script text-3xl md:text-4xl text-[hsl(var(--gold))]">
                    powerful
                  </span>
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="block font-condensed text-2xl md:text-3xl text-foreground uppercase"
                >
                  DIGITAL EXPERIENCES
                </motion.span>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed font-mono"
              >
                Engineering is a bridge between logic and creativity. My goal is to
                build solutions that are not just functional, but elegant, quietly
                threading innovation into every line of code.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <div className="group relative inline-block">
                  <Link
                    href="#work"
                    className="relative inline-flex items-center px-4 py-2 border border-[hsl(var(--foreground))] font-mono text-xs uppercase tracking-wider text-[hsl(var(--foreground))]"
                  >
                    View All Projects
                  </Link>
                  <div className="absolute inset-0 flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none">
                    <div className="relative rotate-[-4deg]">
                      <div
                        className="absolute -top-[6px] left-0 right-0 h-[6px]"
                        style={{
                          background: `linear-gradient(135deg, hsl(var(--gold)) 33.33%, transparent 33.33%) -6px 0, linear-gradient(225deg, hsl(var(--gold)) 33.33%, transparent 33.33%) -6px 0`,
                          backgroundSize: '6px 6px',
                          backgroundRepeat: 'repeat-x'
                        }}
                      />
                      <div className="bg-[hsl(var(--gold))] px-6 py-2 shadow-lg">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--accent-foreground))] whitespace-nowrap">
                          Coming Soon
                        </span>
                      </div>
                      <div
                        className="absolute -bottom-[6px] left-0 right-0 h-[6px]"
                        style={{
                          background: `linear-gradient(315deg, hsl(var(--gold)) 33.33%, transparent 33.33%) 0 0, linear-gradient(45deg, hsl(var(--gold)) 33.33%, transparent 33.33%) 0 0`,
                          backgroundSize: '6px 6px',
                          backgroundRepeat: 'repeat-x'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column - Projects List */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="bracket-label">Selected Works</span>
            </motion.div>

            <div className="border-t border-[hsl(var(--border))]">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1 + index * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="border-b border-[hsl(var(--border))] py-3 md:py-4"
                >
                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-block group/title"
                    onClick={(e) => handleProjectClick(e, project.id)}
                    onMouseEnter={() => setHoveredProject(project.id)}
                    onMouseLeave={() => setHoveredProject(null)}
                    onMouseMove={(e) => {
                      setHoveredProject(project.id);
                      handleMouseMove(e);
                    }}
                  >
                    <div className="overflow-hidden relative">
                      <h3 className="works-title-xs works-title-outline transition-transform duration-300 ease-out group-hover/title:-translate-y-full">
                        {project.title}
                      </h3>
                      <h3
                        className="works-title-xs text-foreground absolute top-full left-0 transition-transform duration-300 ease-out group-hover/title:-translate-y-full"
                        aria-hidden="true"
                      >
                        {project.title}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex justify-between items-center"
            >
              <span className="bracket-label">
                Fueled by curiosity, shaped by code
              </span>
              <span className="bracket-label">
                YC © {new Date().getFullYear()}
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
