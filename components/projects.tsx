"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/project-data";

function ProjectCard({
  project,
  index,
}: {
  project: (typeof projects)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.55, 0.45, 0.16, 1],
      }}
      className="group"
    >
      <Link href={`/projects/${project.id}`} className="block">
        <div className="project-card">
          {/* Image container */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

            {/* Hover arrow */}
            <div className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-light text-white mb-2 group-hover:text-[hsl(42,45%,75%)] transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-[hsl(0,0%,50%)] uppercase tracking-wider">
                  {project.category}
                </p>
              </div>
              <span className="font-mono text-xs text-[hsl(0,0%,35%)]">
                {project.timeline?.split(" - ")[0] || "Recent"}
              </span>
            </div>

            {/* Technologies */}
            <div className="mt-4 flex flex-wrap gap-2">
              {project.technologies.slice(0, 4).map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider bg-white/5 text-[hsl(0,0%,60%)] border border-white/10"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider bg-white/5 text-[hsl(0,0%,60%)] border border-white/10">
                  +{project.technologies.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative min-h-screen py-32 overflow-hidden"
    >
      {/* Background gradient on scroll */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(150,30%,8%)] to-transparent opacity-50" />
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        {/* Section Title - Split Typography */}
        <div ref={titleRef} className="relative mb-24">
          <div className="flex items-center justify-center">
            {/* WO */}
            <motion.span
              initial={{ opacity: 0, x: -100 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
              transition={{ duration: 1, ease: [0.55, 0.45, 0.16, 1] }}
              className="text-section text-white font-light"
            >
              WO
            </motion.span>

            {/* Arabic in center */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.55, 0.45, 0.16, 1] }}
              className="flex flex-col items-center mx-4 md:mx-8"
            >
              <span className="arabic-bracket text-xl md:text-2xl">「</span>
              <span className="font-arabic text-2xl md:text-4xl text-[hsl(42,45%,75%)]">
                أعمال
              </span>
              <span className="arabic-bracket text-xl md:text-2xl">」</span>
            </motion.div>

            {/* RK */}
            <motion.span
              initial={{ opacity: 0, x: 100 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
              transition={{ duration: 1, ease: [0.55, 0.45, 0.16, 1] }}
              className="text-section text-white font-light"
            >
              RK
            </motion.span>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-8 font-mono text-xs tracking-[0.2em] text-[hsl(0,0%,45%)] uppercase"
          >
            Selected Projects
          </motion.p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* View all projects link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-sm tracking-wider text-[hsl(0,0%,50%)] hover:text-white transition-colors group"
          >
            <span>VIEW ALL WRITINGS</span>
            <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
