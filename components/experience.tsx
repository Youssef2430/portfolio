"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { SectionHeading } from "./section-heading"
import { useState } from "react"
import { ParallaxSection } from "./parallax-section"

type ExperienceItem = {
  role: string
  company: string
  location: string
  period: string
  details: string[]
}

const experiences: ExperienceItem[] = [
  {
    role: "Artificial Intelligence Researcher",
    company: "National Research Council",
    location: "Ottawa, ON",
    period: "May 2024 – Present",
    details: [
      "Designed and deployed systems in Python using LangChain, enabling seamless communication between Building Automation Systems (BAS) and reducing data processing times and workload by 49%.",
      "Used a SQLite to efficiently process, integrate, and manage real-time data streams from BAS.",
      "Partnered with Delta Controls and Carleton University to deliver AI-powered building agents, achieving a 56% reduction in maintenance costs by automating issue detection, predictive maintenance, and real-time alerts.",
    ],
  },
  {
    role: "Junior Software Engineer",
    company: "Wind River Systems",
    location: "Ottawa, ON",
    period: "Sept 2022 – Aug 2023",
    details: [
      "Designed and implemented an Automation Dashboard using Angular, TypeScript, and Django, with a PostgreSQL database, to streamline the management and analysis of services used by industry leaders such as NASA, Airbus, and Ford.",
      "Achieved over 90% faster query execution and UI responsiveness by optimizing API endpoints, implementing efficient database queries, and reducing frontend rendering times.",
    ],
  },
  {
    role: "Software Developer",
    company: "University of Ottawa",
    location: "Ottawa, ON",
    period: "May 2022 – Apr 2024",
    details: [
      "Redesigned and optimized the university's search engine using PHP, MySQL, and Apache, improving query response times by 80%, benefiting over 5,000+ students and saving the university over $30,000 annually.",
      "Developed and deployed automation scripts using PHP, Bash, and Cron jobs to enhance search speed by 54% and streamline data migration workflows.",
    ],
  },
  {
    role: "Teaching Assistant",
    company: "University of Ottawa",
    location: "Ottawa, ON",
    period: "Sept 2023 – Present",
    details: [
      "Assisted in teaching Graduate classes such as Machine Learning for Bio-informatics and Undergraduate ones like Data Structures & Algorithms, Design & Analysis of Algorithms, Programming Paradigms and Discrete Structures.",
    ],
  },
]

export function Experience() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [beamAnimating, setBeamAnimating] = useState<boolean>(false)

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index)
    setBeamAnimating(true)
  }

  const handleMouseLeave = () => {
    setBeamAnimating(true)
    setTimeout(() => {
      setHoveredIndex(null)
      setBeamAnimating(false)
    }, 300)
  }

  return (
    <section id="experience" className="py-24 sm:py-32">
      <ParallaxSection offset={15}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading japanese="経験" english="Experience" />

          <div ref={ref} className="space-y-16">
            {experiences.map((item, index) => (
              <motion.div
                key={index}
                className="relative pl-8 border-l border-gray-200 dark:border-gray-800"
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <motion.div
                  className="absolute top-0 left-0 w-3 h-3 -ml-1.5 border border-black dark:border-white rounded-full"
                  initial={{ backgroundColor: "transparent" }}
                  animate={{
                    backgroundColor: hoveredIndex === index ? "currentColor" : "transparent",
                    borderColor: "currentColor",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ color: "var(--primary)" }}
                />

                {/* Improved beam effect */}
                <AnimatePresence onExitComplete={() => setBeamAnimating(false)}>
                  {hoveredIndex === index && (
                    <motion.div
                      className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-black dark:bg-white"
                      initial={{ scaleY: 0, originY: 0 }}
                      animate={{ scaleY: 1 }}
                      exit={{ scaleY: 0, originY: 1 }}
                      transition={{
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.05,
                      }}
                      style={{ backgroundColor: "var(--primary)" }}
                    />
                  )}
                </AnimatePresence>

                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{item.period}</div>
                <h3 className="text-xl font-medium mb-1">{item.role}</h3>
                <div className="text-gray-600 dark:text-gray-300 mb-2">
                  {item.company}, {item.location}
                </div>
                <ul className="space-y-1">
                  {item.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="text-gray-600 dark:text-gray-400">
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </ParallaxSection>
    </section>
  )
}
