"use client";

import { useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useState } from "react";
import { GraduationCap, Calendar, MapPin } from "lucide-react";

type EducationItem = {
  degree: string;
  institution: string;
  location: string;
  period: string;
  details: string[];
};

const educationItems: EducationItem[] = [
  {
    degree: "Masters in Computer Science - Thesis",
    institution: "University of Ottawa",
    location: "Ottawa, ON",
    period: "Jan 2025 – Dec 2026",
    details: [
      "Supervisor: Vida Dujmovic",
      "Received over $52,000 in research scholarships",
    ],
  },
  {
    degree: "Bachelor of Applied Science in Software Engineering",
    institution: "University of Ottawa",
    location: "Ottawa, ON",
    period: "Sept 2020 – Dec 2024",
    details: [
      "Relevant Coursework: Data Structures & Algorithms, Embedded Systems, Databases, Discrete Math, Real-Time Systems Design, Enterprise Architecture",
    ],
  },
];

export function Education() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      ref={sectionRef}
      id="education"
      className="relative py-32 overflow-hidden"
    >
      <div className="container mx-auto px-6 md:px-12">
        {/* Section Title */}
        <div ref={titleRef} className="relative mb-20">
          <div className="flex items-center">
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 1, ease: [0.55, 0.45, 0.16, 1] }}
              className="text-section text-white font-light"
            >
              ED
            </motion.span>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.55, 0.45, 0.16, 1] }}
              className="flex flex-col items-center mx-2 md:mx-4"
            >
              <span className="arabic-bracket text-lg md:text-xl">「</span>
              <span className="font-arabic text-xl md:text-3xl text-[hsl(42,45%,75%)]">
                تعليم
              </span>
              <span className="arabic-bracket text-lg md:text-xl">」</span>
            </motion.div>

            <motion.span
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 1, ease: [0.55, 0.45, 0.16, 1] }}
              className="text-section text-white font-light"
            >
              U
            </motion.span>
          </div>
        </div>

        {/* Education Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-0 md:left-8 top-0 bottom-0 w-px bg-[hsl(0,0%,15%)]" />

            {educationItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative pl-8 md:pl-20 pb-16 last:pb-0"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Timeline dot */}
                <motion.div
                  className="absolute left-0 md:left-8 top-1 w-2 h-2 -ml-[3px] md:-ml-1 rounded-full bg-[hsl(0,0%,25%)] border-2 border-black"
                  animate={{
                    backgroundColor: hoveredIndex === index ? "hsl(42,45%,75%)" : "hsl(0,0%,25%)",
                    scale: hoveredIndex === index ? 1.5 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Beam on hover */}
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      className="absolute left-0 md:left-8 top-1 w-px bg-[hsl(42,45%,75%)] -ml-[1px] md:ml-0 origin-top"
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.4, ease: [0.55, 0.45, 0.16, 1] }}
                    />
                  )}
                </AnimatePresence>

                {/* Period */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-3 h-3 text-[hsl(42,45%,75%)]" />
                  <span className="font-mono text-xs tracking-wider text-[hsl(0,0%,50%)]">
                    {item.period}
                  </span>
                </div>

                {/* Degree */}
                <h3 className="text-xl md:text-2xl font-light text-white mb-2 group-hover:text-[hsl(42,45%,75%)] transition-colors">
                  {item.degree}
                </h3>

                {/* Institution */}
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-4 h-4 text-[hsl(0,0%,50%)]" />
                  <span className="text-[hsl(0,0%,70%)]">{item.institution}</span>
                  <span className="text-[hsl(0,0%,30%)]">•</span>
                  <MapPin className="w-3 h-3 text-[hsl(0,0%,50%)]" />
                  <span className="text-[hsl(0,0%,50%)]">{item.location}</span>
                </div>

                {/* Details */}
                <ul className="space-y-2">
                  {item.details.map((detail, detailIndex) => (
                    <li
                      key={detailIndex}
                      className="text-sm text-[hsl(0,0%,55%)] leading-relaxed"
                    >
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
