"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { SectionHeading } from "./section-heading"
import { ParallaxSection } from "./parallax-section"

type SkillCategory = {
  category: string
  skills: string[]
}

const skillCategories: SkillCategory[] = [
  {
    category: "Programming Languages",
    skills: ["Python", "Java", "Go", "Rust", "C/C++", "JavaScript/TypeScript", "HTML/CSS", "SQL", "LaTeX"],
  },
  {
    category: "Frameworks & Tools",
    skills: [
      "AWS CDK",
      "React",
      "Node.js",
      "TensorFlow",
      "Docker",
      "Kubernetes",
      "Firebase",
      "Jira",
      "Git",
      "Mockito",
      "Flask",
    ],
  },
]

export function Skills() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="skills" className="py-24 sm:py-32">
      <ParallaxSection offset={10}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading japanese="スキル" english="Skills" />

          <div ref={ref} className="space-y-12">
            {skillCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <h3 className="text-xl font-medium mb-4">{category.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.span
                      key={skillIndex}
                      className="inline-block px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 + skillIndex * 0.05 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ParallaxSection>
    </section>
  )
}
