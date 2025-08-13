"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { X, Code, Server, Database, Crown } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ParallaxSection } from "./parallax-section";
import { projects } from "@/lib/project-data";

// Project header component for bento grid
function ProjectHeader({ image, title }: { image: string; title: string }) {
  return (
    <div className="relative w-full h-40 overflow-hidden rounded-lg">
      <Image
        src={image || "/placeholder.svg"}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover/bento:scale-105"
      />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

export function Projects() {
  const [activeProject, setActiveProject] = useState<
    (typeof projects)[0] | null
  >(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="projects" className="py-24 sm:py-32">
      <ParallaxSection offset={15}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading japanese="プロジェクト" english="Projects" />

          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BentoGrid className="max-w-5xl mx-auto">
                {projects.map((project, index) => (
                  <BentoGridItem
                    key={index}
                    title={project.title}
                    description={
                      <span className="text-sm">
                        {project.description[0].substring(0, 100)}
                        {project.description[0].length > 100 ? "..." : ""}
                      </span>
                    }
                    header={
                      <ProjectHeader
                        image={project.image}
                        title={project.title}
                      />
                    }
                    icon={
                      <div className="flex items-center space-x-1">
                        {project.id === "chess-llm-benchmark" ? (
                          <Crown className="h-4 w-4 text-neutral-500" />
                        ) : project.id === "nlp-phishing-detection" ? (
                          <Code className="h-4 w-4 text-neutral-500" />
                        ) : project.id === "geegees-intramural" ? (
                          <Server className="h-4 w-4 text-neutral-500" />
                        ) : (
                          <Database className="h-4 w-4 text-neutral-500" />
                        )}
                        <span className="text-xs text-neutral-500">
                          {project.category}
                        </span>
                      </div>
                    }
                    className={`${project.size === "large" ? "md:col-span-2" : "md:col-span-1"}`}
                    onClick={() => {
                      // Instead of showing modal, we'll navigate to the project page
                      window.location.href = `/projects/${project.id}`;
                    }}
                  />
                ))}
              </BentoGrid>
            </motion.div>
          </div>

          <AnimatePresence>
            {activeProject && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveProject(null)}
              >
                <motion.div
                  className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black border border-gray-200 dark:border-gray-800"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 z-10"
                    onClick={() => setActiveProject(null)}
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative h-64 md:h-full">
                      <Image
                        src={activeProject.image || "/placeholder.svg"}
                        alt={activeProject.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 md:p-8">
                      <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
                        <h2 className="text-2xl font-medium mb-1">
                          {activeProject.title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activeProject.category}
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            Project Brief
                          </h3>
                          <div className="space-y-2">
                            {activeProject.description.map((paragraph, idx) => (
                              <p
                                key={idx}
                                className="text-sm text-gray-600 dark:text-gray-300"
                              >
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            Technologies
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {activeProject.technologies.map((tech, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {activeProject.timeline && (
                          <div>
                            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                              Timeline
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {activeProject.timeline}
                            </p>
                          </div>
                        )}

                        {activeProject.contributors && (
                          <div>
                            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                              Contributors
                            </h3>
                            <div className="space-y-1">
                              {activeProject.contributors.map(
                                (contributor, idx) => (
                                  <p
                                    key={idx}
                                    className="text-sm text-gray-600 dark:text-gray-300"
                                  >
                                    {contributor}
                                  </p>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {activeProject.link && (
                          <div>
                            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                              Links
                            </h3>
                            <a
                              href={activeProject.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-black dark:text-white underline hover:no-underline"
                            >
                              View Project
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ParallaxSection>
    </section>
  );
}
