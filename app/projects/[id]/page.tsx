"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Calendar, Users } from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getProjectById, type ProjectDetail } from "@/lib/project-data";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.6]);

  useEffect(() => {
    if (params.id) {
      const projectData = getProjectById(params.id as string);
      if (projectData) {
        setProject(projectData);
      } else {
        router.push("/#work");
      }
      setLoading(false);
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <main ref={containerRef} className="min-h-screen bg-black text-white">
      {/* Grain overlay */}
      <div className="grain-overlay" />

      <Navbar />

      {/* Hero Section with Project Image */}
      <section className="relative h-[70vh] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ scale: imageScale, opacity: imageOpacity }}
        >
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        </motion.div>

        {/* Back button */}
        <div className="absolute top-32 left-6 md:left-12 z-10">
          <Link
            href="/#work"
            className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Work
          </Link>
        </div>

        {/* Project Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.55, 0.45, 0.16, 1] }}
            >
              <span className="font-mono text-xs tracking-[0.2em] text-[hsl(42,45%,75%)] uppercase mb-4 block">
                {project.category}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white max-w-4xl">
                {project.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Project Content */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            {/* Meta Grid */}
            <motion.div
              ref={titleRef}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, ease: [0.55, 0.45, 0.16, 1] }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pb-16 border-b border-[hsl(0,0%,15%)]"
            >
              {project.timeline && (
                <div>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-[hsl(0,0%,40%)] uppercase mb-2 block">
                    Timeline
                  </span>
                  <span className="flex items-center gap-2 text-sm text-white">
                    <Calendar className="w-4 h-4 text-[hsl(42,45%,75%)]" />
                    {project.timeline}
                  </span>
                </div>
              )}

              {project.contributors && project.contributors.length > 0 && (
                <div>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-[hsl(0,0%,40%)] uppercase mb-2 block">
                    Team
                  </span>
                  <span className="flex items-center gap-2 text-sm text-white">
                    <Users className="w-4 h-4 text-[hsl(42,45%,75%)]" />
                    {project.contributors.length} contributor{project.contributors.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {project.link && (
                <div className="col-span-2 md:col-span-1 md:col-start-4">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-[hsl(0,0%,40%)] uppercase mb-2 block">
                    View Project
                  </span>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[hsl(42,45%,75%)] hover:text-white transition-colors group"
                  >
                    <span>Open Link</span>
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              )}
            </motion.div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
              {/* Main Content - Description */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="lg:col-span-3 space-y-8"
              >
                <div>
                  <h2 className="font-mono text-xs tracking-[0.2em] text-[hsl(0,0%,40%)] uppercase mb-6">
                    Overview
                  </h2>
                  <div className="space-y-6">
                    {project.description.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className="text-lg leading-relaxed text-[hsl(0,0%,70%)]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Sidebar - Tech & Contributors */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="lg:col-span-2 space-y-12"
              >
                {/* Technologies */}
                <div>
                  <h2 className="font-mono text-xs tracking-[0.2em] text-[hsl(0,0%,40%)] uppercase mb-6">
                    Technologies
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-2 text-xs font-mono uppercase tracking-wider bg-white/5 text-[hsl(0,0%,70%)] border border-white/10 hover:border-[hsl(42,45%,75%)]/30 hover:text-white transition-all cursor-default"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contributors */}
                {project.contributors && project.contributors.length > 0 && (
                  <div>
                    <h2 className="font-mono text-xs tracking-[0.2em] text-[hsl(0,0%,40%)] uppercase mb-6">
                      Contributors
                    </h2>
                    <ul className="space-y-3">
                      {project.contributors.map((contributor, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-[hsl(0,0%,70%)]"
                        >
                          {contributor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* External Link Card */}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-6 border border-[hsl(0,0%,15%)] hover:border-[hsl(42,45%,75%)]/30 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block font-mono text-[10px] tracking-[0.2em] text-[hsl(0,0%,40%)] uppercase mb-1">
                          External Link
                        </span>
                        <span className="text-white group-hover:text-[hsl(42,45%,75%)] transition-colors">
                          View on GitHub
                        </span>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-[hsl(0,0%,40%)] group-hover:text-[hsl(42,45%,75%)] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                  </a>
                )}
              </motion.div>
            </div>

            {/* Secondary Image */}
            {project.imageLink && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="mt-24"
              >
                <div className="relative aspect-[16/9] overflow-hidden border border-[hsl(0,0%,15%)]">
                  <Image
                    src={project.imageLink}
                    alt={`${project.title} additional view`}
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
            )}

            {/* Navigation Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mt-24 pt-12 border-t border-[hsl(0,0%,15%)]"
            >
              <div className="flex items-center justify-between">
                <Link
                  href="/#work"
                  className="inline-flex items-center text-sm text-[hsl(0,0%,50%)] hover:text-white transition-colors group"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                  All Projects
                </Link>

                <span className="font-arabic text-sm text-[hsl(42,45%,75%)] opacity-60">
                  「مشروع」
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
