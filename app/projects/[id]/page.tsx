"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ParallaxSection } from "@/components/parallax-section"
import { getProjectById, type ProjectDetail } from "@/lib/project-data"
import ProjectPin from "@/components/project-pin"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      const projectData = getProjectById(params.id as string)
      if (projectData) {
        setProject(projectData)
      } else {
        // Project not found, redirect to projects section
        router.push("/#projects")
      }
      setLoading(false)
    }
  }, [params.id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <button
          onClick={() => router.push("/#projects")}
          className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </button>

        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-light tracking-tight mb-2">{project.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{project.category}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div>
                <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
                  <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      Technologies
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {project.timeline && (
                    <div>
                      <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Timeline
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{project.timeline}</p>
                    </div>
                  )}

                  {project.contributors && (
                    <div>
                      <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Contributors
                      </h2>
                      <div className="space-y-1">
                        {project.contributors.map((contributor, idx) => (
                          <p key={idx} className="text-sm text-gray-600 dark:text-gray-300">
                            {contributor}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.link && (
                    <div>
                      <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Links
                      </h2>
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-black dark:text-white underline hover:no-underline"
                      >
                        View Project <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                    Project Brief
                  </h2>
                  <div className="space-y-4">
                    {project.description.map((paragraph, idx) => (
                      <p key={idx} className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* 3D Pin Component */}
                <ParallaxSection offset={10}>
                  <div className="mt-12">
                    <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                      Project Link
                    </h2>
                    <ProjectPin
                      title={project.title}
                      description={project.description[0].substring(0, 100) + "..."}
                      href={project.link || "#"}
                      image={project.image}
                    />
                  </div>
                </ParallaxSection>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
