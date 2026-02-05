"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/lib/project-data";

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // Constellation data
  const nodes = [
    { id: 0, x: 30, y: 50, r: 5, color: "gold", opacity: 0.9, delay: 0.1, pulse: true },
    { id: 1, x: 85, y: 85, r: 8, color: "gold", opacity: 1, delay: 0.2, pulse: true },
    { id: 2, x: 150, y: 40, r: 4, color: "white", opacity: 0.7, delay: 0.3, pulse: false },
    { id: 3, x: 130, y: 130, r: 6, color: "gold", opacity: 0.8, delay: 0.4, pulse: true },
    { id: 4, x: 210, y: 95, r: 5, color: "white", opacity: 0.5, delay: 0.5, pulse: false },
    { id: 5, x: 270, y: 55, r: 3, color: "gold", opacity: 0.6, delay: 0.6, pulse: false },
    { id: 6, x: 55, y: 165, r: 4, color: "white", opacity: 0.4, delay: 0.7, pulse: false },
    { id: 7, x: 180, y: 150, r: 3, color: "gold", opacity: 0.5, delay: 0.8, pulse: false },
  ];

  const edges = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 3, to: 6 },
    { from: 3, to: 7 },
    { from: 4, to: 7 },
  ];

  const isNodeConnected = (nodeId: number) => {
    if (hoveredNode === null) return false;
    if (nodeId === hoveredNode) return true;
    return edges.some(
      (e) =>
        (e.from === hoveredNode && e.to === nodeId) ||
        (e.to === hoveredNode && e.from === nodeId)
    );
  };

  const isEdgeConnected = (from: number, to: number) => {
    if (hoveredNode === null) return false;
    return from === hoveredNode || to === hoveredNode;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const activeProject = projects.find((p) => p.id === hoveredProject);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative py-16 md:py-24 bg-black noise-bg overflow-hidden"
    >
      {/* Floating Image - follows cursor, offset to the right */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            key={activeProject.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed pointer-events-none z-50"
            style={{
              left: mousePosition.x + 120,
              top: mousePosition.y - 100,
            }}
          >
            <div className="relative w-[240px] md:w-[280px] aspect-[4/3] overflow-hidden shadow-2xl">
              <Image
                src={activeProject.image}
                alt={activeProject.title}
                fill
                className="object-cover"
                sizes="280px"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Left Column - Decorative Design Element */}
          <div className="space-y-8">
            {/* Interactive Geometric Constellation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-48 md:h-64"
            >
              <svg
                className="absolute inset-0 w-full h-full cursor-pointer"
                viewBox="0 0 300 200"
                fill="none"
                preserveAspectRatio="xMinYMin meet"
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Glow filter definitions */}
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-strong" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <radialGradient id="nodeGradient" cx="30%" cy="30%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="1" />
                  </radialGradient>
                </defs>

                {/* Connecting lines */}
                {edges.map((edge, i) => {
                  const fromNode = nodes[edge.from];
                  const toNode = nodes[edge.to];
                  const isActive = isEdgeConnected(edge.from, edge.to);
                  return (
                    <motion.line
                      key={`edge-${i}`}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={isActive ? "hsl(var(--gold))" : "hsl(var(--gold))"}
                      strokeWidth={isActive ? 2 : 1}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={
                        isInView
                          ? {
                              pathLength: 1,
                              opacity: isActive ? 0.9 : 0.25,
                            }
                          : { pathLength: 0, opacity: 0 }
                      }
                      transition={{
                        pathLength: { duration: 0.8, delay: 0.2 + i * 0.08, ease: "easeOut" },
                        opacity: { duration: 0.3 },
                        strokeWidth: { duration: 0.2 },
                      }}
                      filter={isActive ? "url(#glow)" : undefined}
                    />
                  );
                })}

                {/* Ambient pulse rings for main nodes */}
                {nodes
                  .filter((n) => n.pulse)
                  .map((node) => (
                    <motion.circle
                      key={`pulse-${node.id}`}
                      cx={node.x}
                      cy={node.y}
                      r={node.r + 8}
                      fill="none"
                      stroke="hsl(var(--gold))"
                      strokeWidth="1"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={
                        isInView
                          ? {
                              scale: [0.8, 1.2, 0.8],
                              opacity: [0.1, 0.3, 0.1],
                            }
                          : { scale: 0.5, opacity: 0 }
                      }
                      transition={{
                        duration: 3,
                        delay: node.delay + 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}

                {/* Hover glow ring */}
                {hoveredNode !== null && (
                  <motion.circle
                    cx={nodes[hoveredNode].x}
                    cy={nodes[hoveredNode].y}
                    r={nodes[hoveredNode].r + 15}
                    fill="none"
                    stroke="hsl(var(--gold))"
                    strokeWidth="2"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.5 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    filter="url(#glow-strong)"
                  />
                )}

                {/* Interactive nodes */}
                {nodes.map((node) => {
                  const isActive = isNodeConnected(node.id);
                  const isHovered = hoveredNode === node.id;
                  const fillColor =
                    node.color === "gold" ? "hsl(var(--gold))" : "white";

                  return (
                    <motion.g key={`node-${node.id}`}>
                      {/* Outer glow on hover */}
                      {isHovered && (
                        <motion.circle
                          cx={node.x}
                          cy={node.y}
                          r={node.r * 2}
                          fill={fillColor}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.15 }}
                          transition={{ duration: 0.2 }}
                          filter="url(#glow-strong)"
                        />
                      )}

                      {/* Main node circle */}
                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r={node.r}
                        fill={node.color === "gold" ? "url(#nodeGradient)" : fillColor}
                        style={{ cursor: "pointer" }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={
                          isInView
                            ? {
                                scale: isHovered ? 1.4 : isActive ? 1.2 : 1,
                                opacity: isHovered ? 1 : isActive ? 1 : node.opacity,
                              }
                            : { scale: 0, opacity: 0 }
                        }
                        transition={{
                          scale: { type: "spring", stiffness: 300, damping: 20 },
                          opacity: { duration: 0.3 },
                        }}
                        filter={isHovered ? "url(#glow-strong)" : isActive ? "url(#glow)" : undefined}
                        onMouseEnter={() => setHoveredNode(node.id)}
                      />
                    </motion.g>
                  );
                })}
              </svg>
            </motion.div>

            {/* Intro Text */}
            <div className="space-y-6 max-w-sm">
              {/* Title with mixed typography */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="flex items-baseline gap-2 flex-wrap"
                >
                  <span className="font-condensed text-2xl md:text-3xl text-white uppercase">
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
                  className="block font-condensed text-2xl md:text-3xl text-white uppercase"
                >
                  DIGITAL EXPERIENCES
                </motion.span>
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed font-mono"
              >
                Engineering is a bridge between logic and creativity. My goal is to
                build solutions that are not just functional, but elegant—quietly
                threading innovation into every line of code.
              </motion.p>

              {/* Button with Sticker on Hover */}
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
                  {/* Sticker that slides up on hover - label tape style with teeth edges */}
                  <div className="absolute inset-0 flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none">
                    <div className="relative rotate-[-4deg]">
                      {/* Teeth edge top */}
                      <div
                        className="absolute -top-[6px] left-0 right-0 h-[6px]"
                        style={{
                          background: `linear-gradient(135deg, hsl(var(--gold)) 33.33%, transparent 33.33%) -6px 0, linear-gradient(225deg, hsl(var(--gold)) 33.33%, transparent 33.33%) -6px 0`,
                          backgroundSize: '6px 6px',
                          backgroundRepeat: 'repeat-x'
                        }}
                      />
                      {/* Label body */}
                      <div className="bg-[hsl(var(--gold))] px-6 py-2 shadow-lg">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-black whitespace-nowrap">
                          Coming Soon
                        </span>
                      </div>
                      {/* Teeth edge bottom */}
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
            {/* Section Label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="bracket-label">Selected Works</span>
            </motion.div>

            {/* Projects List */}
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
                    onMouseEnter={() => setHoveredProject(project.id)}
                    onMouseLeave={() => setHoveredProject(null)}
                    onMouseMove={handleMouseMove}
                  >
                    {/* Slide-up text animation container */}
                    <div className="overflow-hidden relative">
                      {/* Original text (outline) - defines container height */}
                      <h3 className="works-title-xs works-title-outline transition-transform duration-300 ease-out group-hover/title:-translate-y-full">
                        {project.title}
                      </h3>
                      {/* Duplicate text (filled) - positioned below, slides up into view */}
                      <h3
                        className="works-title-xs text-white absolute top-full left-0 transition-transform duration-300 ease-out group-hover/title:-translate-y-full"
                        aria-hidden="true"
                      >
                        {project.title}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
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
