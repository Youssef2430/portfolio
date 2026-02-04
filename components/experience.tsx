"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Briefcase, Calendar, MapPin, ArrowUpRight } from "lucide-react";

type ExperienceItem = {
  role: string;
  company: string;
  companyUrl: string;
  location: string;
  period: string;
  details: string[];
};

const experiences: ExperienceItem[] = [
  {
    role: "Artificial Intelligence Researcher",
    company: "National Research Council",
    companyUrl: "https://nrc.canada.ca/en",
    location: "Ottawa, ON",
    period: "May 2024 – Present",
    details: [
      "Designed and deployed systems in Python using LangChain, enabling seamless communication between Building Automation Systems (BAS) and reducing data processing times and workload by 49%.",
      "Used a SQLite to efficiently process, integrate, and manage real-time data streams from BAS.",
      "Partnered with Delta Controls and Carleton University to deliver AI-powered building agents, achieving a 56% reduction in maintenance costs.",
    ],
  },
  {
    role: "Junior Software Engineer",
    company: "Wind River Systems",
    companyUrl: "https://www.windriver.com/",
    location: "Ottawa, ON",
    period: "Sept 2022 – Aug 2023",
    details: [
      "Designed and implemented an Automation Dashboard using Angular, TypeScript, and Django, with a PostgreSQL database.",
      "Achieved over 90% faster query execution and UI responsiveness by optimizing API endpoints and reducing frontend rendering times.",
    ],
  },
  {
    role: "Software Developer",
    company: "University of Ottawa",
    companyUrl: "https://www.uottawa.ca/en",
    location: "Ottawa, ON",
    period: "May 2022 – Apr 2024",
    details: [
      "Redesigned and optimized the university's search engine using PHP, MySQL, and Apache, improving query response times by 80%.",
      "Developed automation scripts using PHP, Bash, and Cron jobs to enhance search speed by 54%.",
    ],
  },
  {
    role: "Teaching Assistant",
    company: "University of Ottawa",
    companyUrl: "https://www.uottawa.ca/en",
    location: "Ottawa, ON",
    period: "Sept 2023 – Present",
    details: [
      "Assisted in teaching Graduate classes (Machine Learning for Bio-informatics) and Undergraduate courses (Data Structures & Algorithms, Design & Analysis of Algorithms, Programming Paradigms).",
    ],
  },
];

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative py-32 overflow-hidden"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(220,30%,5%)] to-transparent opacity-50" />

      <div className="relative container mx-auto px-6 md:px-12">
        {/* Section Title */}
        <div ref={titleRef} className="relative mb-20">
          <div className="flex items-center">
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 1, ease: [0.55, 0.45, 0.16, 1] }}
              className="text-section text-white font-light"
            >
              EX
            </motion.span>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.55, 0.45, 0.16, 1] }}
              className="flex flex-col items-center mx-2 md:mx-4"
            >
              <span className="arabic-bracket text-lg md:text-xl">「</span>
              <span className="font-arabic text-xl md:text-3xl text-[hsl(42,45%,75%)]">
                خبرة
              </span>
              <span className="arabic-bracket text-lg md:text-xl">」</span>
            </motion.div>

            <motion.span
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 1, ease: [0.55, 0.45, 0.16, 1] }}
              className="text-section text-white font-light"
            >
              P
            </motion.span>
          </div>
        </div>

        {/* Experience Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-0 md:left-8 top-0 bottom-0 w-px bg-[hsl(0,0%,15%)]" />

            {experiences.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
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

                {/* Role */}
                <h3 className="text-xl md:text-2xl font-light text-white mb-2">
                  {item.role}
                </h3>

                {/* Company */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Briefcase className="w-4 h-4 text-[hsl(0,0%,50%)]" />
                  <a
                    href={item.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[hsl(42,45%,75%)] hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {item.company}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <span className="text-[hsl(0,0%,30%)]">•</span>
                  <MapPin className="w-3 h-3 text-[hsl(0,0%,50%)]" />
                  <span className="text-[hsl(0,0%,50%)]">{item.location}</span>
                </div>

                {/* Details */}
                <ul className="space-y-3">
                  {item.details.map((detail, detailIndex) => (
                    <li
                      key={detailIndex}
                      className="text-sm text-[hsl(0,0%,55%)] leading-relaxed pl-4 border-l border-[hsl(0,0%,20%)]"
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
