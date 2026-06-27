"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { motion, useInView, AnimatePresence, useAnimationFrame } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { projects, type ProjectDetail } from "@/lib/project-data";
import {
  hasProjectSignatureTransition,
  startProjectSignatureTransition,
} from "@/components/project-signature-transition";

// Seeded random for consistent values
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const getAspectRatioValue = (ratio?: string) => {
  if (!ratio) return 742 / 273;

  const [width, height] = ratio.split("/").map((part) => Number(part.trim()));
  if (!width || !height) return 742 / 273;

  return width / height;
};

interface NodePosition {
  x: number;
  y: number;
}

interface ConstellationNode {
  id: number;
  baseX: number;
  baseY: number;
  r: number;
  color: "gold" | "white" | "cream";
  opacity: number;
  delay: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitPhase: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  speed: number;
  length: number;
}

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
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [time, setTime] = useState(0);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [svgMousePos, setSvgMousePos] = useState<{ x: number; y: number } | null>(null);

  // Orion constellation - accurate star positions and relative brightness
  const nodes: ConstellationNode[] = useMemo(() => [
    // Betelgeuse (α Ori) - red supergiant, top left shoulder
    { id: 0, baseX: 70, baseY: 35, r: 8, color: "gold", opacity: 1, delay: 0.1, orbitRadius: 6, orbitSpeed: 0.0003, orbitPhase: 0 },
    // Bellatrix (γ Ori) - top right shoulder
    { id: 1, baseX: 200, baseY: 40, r: 5, color: "white", opacity: 0.9, delay: 0.15, orbitRadius: 5, orbitSpeed: 0.00035, orbitPhase: Math.PI / 2 },
    // Alnitak (ζ Ori) - left belt star
    { id: 2, baseX: 105, baseY: 95, r: 4, color: "white", opacity: 0.85, delay: 0.2, orbitRadius: 4, orbitSpeed: 0.0004, orbitPhase: Math.PI },
    // Alnilam (ε Ori) - middle belt star
    { id: 3, baseX: 140, baseY: 92, r: 5, color: "white", opacity: 0.95, delay: 0.25, orbitRadius: 4, orbitSpeed: 0.00038, orbitPhase: Math.PI / 3 },
    // Mintaka (δ Ori) - right belt star
    { id: 4, baseX: 175, baseY: 88, r: 4, color: "white", opacity: 0.8, delay: 0.3, orbitRadius: 4, orbitSpeed: 0.00042, orbitPhase: Math.PI * 1.5 },
    // Saiph (κ Ori) - bottom left foot
    { id: 5, baseX: 85, baseY: 165, r: 5, color: "white", opacity: 0.85, delay: 0.35, orbitRadius: 5, orbitSpeed: 0.00032, orbitPhase: Math.PI * 0.7 },
    // Rigel (β Ori) - blue supergiant, bottom right foot
    { id: 6, baseX: 190, baseY: 170, r: 7, color: "cream", opacity: 1, delay: 0.4, orbitRadius: 6, orbitSpeed: 0.00028, orbitPhase: Math.PI * 1.2 },
  ], []);

  // Orion constellation edges - traditional stick figure
  const edges = useMemo(() => [
    // Shoulders to belt
    { from: 0, to: 2, weight: 0.7 },  // Betelgeuse to Alnitak
    { from: 1, to: 4, weight: 0.7 },  // Bellatrix to Mintaka
    // Belt stars
    { from: 2, to: 3, weight: 1 },    // Alnitak to Alnilam
    { from: 3, to: 4, weight: 1 },    // Alnilam to Mintaka
    // Belt to feet
    { from: 2, to: 5, weight: 0.7 },  // Alnitak to Saiph
    { from: 4, to: 6, weight: 0.7 },  // Mintaka to Rigel
  ], []);

  // Background particles - distant twinkling stars (reduced count)
  const backgroundParticles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 3 + 1) * 300,
      y: seededRandom(i * 5 + 2) * 200,
      r: seededRandom(i * 7 + 3) * 0.8 + 0.3,
      baseOpacity: seededRandom(i * 11 + 4) * 0.2 + 0.05,
      twinkleSpeed: seededRandom(i * 13 + 5) * 0.002 + 0.001,
      twinklePhase: seededRandom(i * 17 + 6) * Math.PI * 2,
    }))
  , []);

  // Calculate node positions based on time (orbital motion)
  const getNodePosition = useCallback((node: ConstellationNode, t: number): NodePosition => {
    const angle = t * node.orbitSpeed + node.orbitPhase;
    const secondaryAngle = t * node.orbitSpeed * 0.7 + node.orbitPhase * 1.3;

    // Lissajous-like curve for more organic movement
    const x = node.baseX + Math.sin(angle) * node.orbitRadius + Math.sin(secondaryAngle * 1.5) * (node.orbitRadius * 0.3);
    const y = node.baseY + Math.cos(angle * 0.8) * node.orbitRadius * 0.7 + Math.cos(secondaryAngle) * (node.orbitRadius * 0.2);

    return { x, y };
  }, []);

  // Get all current node positions
  const nodePositions = useMemo(() => {
    return nodes.map(node => getNodePosition(node, time));
  }, [nodes, time, getNodePosition]);

  // Animation loop
  useAnimationFrame((t) => {
    if (isInView) {
      setTime(t);
    }
  });

  // Shooting star spawner
  useEffect(() => {
    if (!isInView) return;

    const spawnShootingStar = () => {
      const id = Date.now() + Math.random();
      const startX = seededRandom(id) * 150 + 20;
      const startY = seededRandom(id * 2) * 60 - 20;
      const angle = seededRandom(id * 3) * 25 + 25;
      const speed = seededRandom(id * 4) * 0.5 + 0.8;
      const length = seededRandom(id * 5) * 30 + 40;

      setShootingStars(prev => [...prev, { id, startX, startY, angle, speed, length }]);

      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== id));
      }, 1800);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        spawnShootingStar();
      }
    }, 4000);

    const timeout = setTimeout(spawnShootingStar, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isInView]);

  // Find closest node to cursor
  const closestNode = useMemo(() => {
    if (!svgMousePos) return null;

    let closest = 0;
    let minDist = Infinity;

    nodePositions.forEach((pos, index) => {
      const dx = pos.x - svgMousePos.x;
      const dy = pos.y - svgMousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closest = index;
      }
    });

    return closest;
  }, [svgMousePos, nodePositions]);

  // Active node is either directly hovered or closest to cursor
  const activeNode = hoveredNode ?? closestNode;

  const isNodeActive = useCallback((nodeId: number) => {
    if (activeNode === null) return false;
    if (nodeId === activeNode) return true;
    return edges.some(
      (e) =>
        (e.from === activeNode && e.to === nodeId) ||
        (e.to === activeNode && e.from === nodeId)
    );
  }, [activeNode, edges]);

  const isEdgeActive = useCallback((from: number, to: number) => {
    if (activeNode === null) return false;
    return from === activeNode || to === activeNode;
  }, [activeNode]);

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

  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 200;
    setSvgMousePos({ x, y });
  }, []);

  const handleSvgMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setSvgMousePos(null);
  }, []);

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

  // Get color value
  const getColorValue = (color: "gold" | "white" | "cream") => {
    switch (color) {
      case "gold": return "hsl(var(--gold))";
      case "cream": return "hsl(var(--cream))";
      default: return "hsl(var(--foreground))";
    }
  };

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

          {/* Left Column - Interactive Constellation */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-56 md:h-72"
            >
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 300 200"
                fill="none"
                preserveAspectRatio="xMidYMid meet"
                onMouseMove={handleSvgMouseMove}
                onMouseLeave={handleSvgMouseLeave}
              >
                <defs>
                  {/* Glow filters */}
                  <filter id="glow-soft" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-intense" x="-150%" y="-150%" width="400%" height="400%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Star gradients */}
                  <radialGradient id="nodeGradientGold" cx="30%" cy="30%">
                    <stop offset="0%" stopColor="hsl(var(--cream))" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="1" />
                  </radialGradient>
                  <radialGradient id="nodeGradientWhite" cx="30%" cy="30%">
                    <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="1" />
                    <stop offset="100%" stopColor="hsl(var(--foreground-soft))" stopOpacity="0.9" />
                  </radialGradient>
                  <radialGradient id="nodeGradientCream" cx="30%" cy="30%">
                    <stop offset="0%" stopColor="hsl(var(--cream))" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="hsl(var(--foreground-muted))" stopOpacity="0.9" />
                  </radialGradient>
                  <linearGradient id="shootingStarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="40%" stopColor="hsl(var(--foreground))" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="1" />
                  </linearGradient>
                </defs>

                {/* Background particles - distant stars */}
                {backgroundParticles.map((particle) => {
                  const twinkle = Math.sin(time * particle.twinkleSpeed + particle.twinklePhase);
                  const opacity = particle.baseOpacity * (0.5 + twinkle * 0.5);

                  return (
                    <circle
                      key={`bg-${particle.id}`}
                      cx={particle.x}
                      cy={particle.y}
                      r={particle.r * (0.9 + twinkle * 0.1)}
                      fill="hsl(var(--foreground))"
                      opacity={isInView ? opacity : 0}
                      style={{ transition: "opacity 0.5s" }}
                    />
                  );
                })}

                {/* Shooting stars - fly across and out of view */}
                <AnimatePresence>
                  {shootingStars.map((star) => {
                    const rad = (star.angle * Math.PI) / 180;
                    const distance = 350; // Long enough to exit the viewBox
                    const tailLength = 50;

                    return (
                      <motion.g key={star.id}>
                        {/* Trail */}
                        <motion.line
                          stroke="url(#shootingStarGrad)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          initial={{
                            x1: star.startX,
                            y1: star.startY,
                            x2: star.startX,
                            y2: star.startY,
                            opacity: 0,
                          }}
                          animate={{
                            x1: star.startX + Math.cos(rad) * distance,
                            y1: star.startY + Math.sin(rad) * distance,
                            x2: star.startX + Math.cos(rad) * (distance + tailLength),
                            y2: star.startY + Math.sin(rad) * (distance + tailLength),
                            opacity: [0, 0.8, 0.8, 0.8],
                          }}
                          transition={{ duration: 1.2 * star.speed, ease: "linear" }}
                          filter="url(#glow-soft)"
                        />
                        {/* Head */}
                        <motion.circle
                          r="2"
                          fill="hsl(var(--foreground))"
                          filter="url(#glow-soft)"
                          initial={{
                            cx: star.startX,
                            cy: star.startY,
                            opacity: 0,
                          }}
                          animate={{
                            cx: star.startX + Math.cos(rad) * (distance + tailLength),
                            cy: star.startY + Math.sin(rad) * (distance + tailLength),
                            opacity: [0, 1, 1, 1],
                          }}
                          transition={{ duration: 1.2 * star.speed, ease: "linear" }}
                        />
                      </motion.g>
                    );
                  })}
                </AnimatePresence>

                {/* Constellation edges - dynamic connections */}
                {edges.map((edge, i) => {
                  const fromPos = nodePositions[edge.from];
                  const toPos = nodePositions[edge.to];
                  const active = isEdgeActive(edge.from, edge.to);

                  // Calculate edge properties
                  const dx = toPos.x - fromPos.x;
                  const dy = toPos.y - fromPos.y;

                  // Pulse effect along the edge
                  const pulseOffset = (time * 0.001 + i * 0.5) % 1;

                  return (
                    <g key={`edge-${i}`}>
                      {/* Base edge */}
                      <motion.line
                        x1={fromPos.x}
                        y1={fromPos.y}
                        x2={toPos.x}
                        y2={toPos.y}
                        stroke="hsl(var(--gold))"
                        strokeWidth={active ? 1.5 : 0.8}
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{
                          opacity: active ? 0.8 : edge.weight * 0.3,
                          pathLength: 1,
                        }}
                        transition={{
                          pathLength: { duration: 1.2, delay: 0.3 + i * 0.1, ease: "easeOut" },
                          opacity: { duration: 0.2 },
                        }}
                        filter={active ? "url(#glow-soft)" : undefined}
                      />

                      {/* Energy pulse traveling along edge */}
                      {isInView && !active && (
                        <circle
                          cx={fromPos.x + dx * pulseOffset}
                          cy={fromPos.y + dy * pulseOffset}
                          r="1.5"
                          fill="hsl(var(--gold))"
                          opacity={0.4 * Math.sin(pulseOffset * Math.PI)}
                          filter="url(#glow-soft)"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Decorative frame corners */}
                <g stroke="hsl(var(--gold))" strokeWidth="0.5" opacity="0.25">
                  <path d="M 8 18 L 8 8 L 18 8" fill="none" />
                  <path d="M 282 8 L 292 8 L 292 18" fill="none" />
                  <path d="M 8 182 L 8 192 L 18 192" fill="none" />
                  <path d="M 282 192 L 292 192 L 292 182" fill="none" />
                </g>

                {/* Orion constellation nodes */}
                {nodes.map((node, index) => {
                  const pos = nodePositions[index];
                  const isClosest = activeNode === node.id;
                  const isConnected = isNodeActive(node.id);
                  const colorValue = getColorValue(node.color);
                  const gradientId = `nodeGradient${node.color.charAt(0).toUpperCase() + node.color.slice(1)}`;

                  // Subtle twinkle effect
                  const twinkle = Math.sin(time * 0.002 + node.delay * 10) * 0.1 + 1;

                  return (
                    <g key={`node-${node.id}`}>
                      {/* Glow halo */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={node.r * 2}
                        fill={colorValue}
                        opacity={isClosest ? 0.2 : isConnected ? 0.12 : 0.06}
                        filter="url(#glow-soft)"
                        style={{ transition: "opacity 0.2s" }}
                      />

                      {/* Main star */}
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r={node.r * (isClosest ? 1.3 : isConnected ? 1.15 : 1) * twinkle}
                        fill={`url(#${gradientId})`}
                        style={{ cursor: "pointer" }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: isClosest ? 1 : isConnected ? 1 : node.opacity,
                        }}
                        transition={{
                          scale: { duration: 0.6, delay: node.delay, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.2 },
                        }}
                        filter={isClosest || isConnected ? "url(#glow-soft)" : undefined}
                        onMouseEnter={() => setHoveredNode(node.id)}
                      />

                      {/* Inner core highlight */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={node.r * 0.35}
                        fill="hsl(var(--foreground))"
                        opacity={isClosest ? 0.8 : isConnected ? 0.6 : 0.4 * node.opacity}
                        style={{ transition: "opacity 0.2s" }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Constellation name label */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 origin-center"
              >
                <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))] opacity-50">
                  Orion
                </span>
              </motion.div>
            </motion.div>

            {/* Intro Text */}
            <div className="space-y-6 max-w-sm">
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
          <div>
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
