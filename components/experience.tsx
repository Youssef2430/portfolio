"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { SectionHeading } from "./section-heading";
import { useState, useEffect, useRef } from "react";
import { ParallaxSection } from "./parallax-section";
import { LinkPreview } from "./ui/link-preview";
import type React from "react";

type ExperienceItem = {
  role: string;
  company: string;
  companyUrl: string;
  companyPreviewImage: string;
  location: string;
  period: string;
  details: string[];
  highlights?: Array<{
    name: string;
    url: string;
    previewImage: string;
  }>;
};

const experiences: ExperienceItem[] = [
  {
    role: "Artificial Intelligence Researcher",
    company: "National Research Council",
    companyUrl: "https://nrc.canada.ca/en",
    companyPreviewImage:
      "/placeholder.svg?height=400&width=640&text=National+Research+Council",
    location: "Ottawa, ON",
    period: "May 2024 – Present",
    details: [
      "Designed and deployed systems in Python using LangChain, enabling seamless communication between Building Automation Systems (BAS) and reducing data processing times and workload by 49%.",
      "Used a SQLite to efficiently process, integrate, and manage real-time data streams from BAS.",
      "Partnered with Delta Controls and Carleton University to deliver AI-powered building agents, achieving a 56% reduction in maintenance costs by automating issue detection, predictive maintenance, and real-time alerts.",
    ],
    highlights: [
      {
        name: "Delta Controls",
        url: "https://www.deltacontrols.com/",
        previewImage:
          "/placeholder.svg?height=400&width=640&text=Delta+Controls",
      },
      {
        name: "Carleton University",
        url: "https://carleton.ca/",
        previewImage:
          "/placeholder.svg?height=400&width=640&text=Carleton+University",
      },
    ],
  },
  {
    role: "Junior Software Engineer",
    company: "Wind River Systems",
    companyUrl: "https://www.windriver.com/",
    companyPreviewImage:
      "/placeholder.svg?height=400&width=640&text=Wind+River+Systems",
    location: "Ottawa, ON",
    period: "Sept 2022 – Aug 2023",
    details: [
      "Designed and implemented an Automation Dashboard using Angular, TypeScript, and Django, with a PostgreSQL database, to streamline the management and analysis of services used by industry leaders such as NASA, Airbus, and Ford.",
      "Achieved over 90% faster query execution and UI responsiveness by optimizing API endpoints, implementing efficient database queries, and reducing frontend rendering times.",
    ],
    highlights: [
      {
        name: "NASA",
        url: "https://www.nasa.gov/",
        previewImage: "/placeholder.svg?height=400&width=640&text=NASA",
      },
      {
        name: "Airbus",
        url: "https://www.airbus.com/",
        previewImage: "/placeholder.svg?height=400&width=640&text=Airbus",
      },
      {
        name: "Ford",
        url: "https://www.ford.com/",
        previewImage: "/placeholder.svg?height=400&width=640&text=Ford",
      },
    ],
  },
  {
    role: "Software Developer",
    company: "University of Ottawa",
    companyUrl: "https://www.uottawa.ca/en",
    companyPreviewImage:
      "/placeholder.svg?height=400&width=640&text=University+of+Ottawa",
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
    companyUrl: "https://www.uottawa.ca/en",
    companyPreviewImage:
      "/placeholder.svg?height=400&width=640&text=University+of+Ottawa",
    location: "Ottawa, ON",
    period: "Sept 2023 – Present",
    details: [
      "Assisted in teaching Graduate classes such as Machine Learning for Bio-informatics and Undergraduate ones like Data Structures & Algorithms, Design & Analysis of Algorithms, Programming Paradigms and Discrete Structures.",
    ],
  },
];

export function Experience() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [beamAnimating, setBeamAnimating] = useState<boolean>(false);
  const isMobileRef = useRef(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      isMobileRef.current = window.innerWidth < 768;
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    setBeamAnimating(true);
  };

  const handleMouseLeave = () => {
    setBeamAnimating(true);
    setTimeout(() => {
      setHoveredIndex(null);
      setBeamAnimating(false);
    }, 300);
  };

  // Toggle for touch devices
  const handleTouch = (index: number) => {
    if (isMobileRef.current) {
      if (hoveredIndex === index) {
        setBeamAnimating(true);
        setTimeout(() => {
          setHoveredIndex(null);
          setBeamAnimating(false);
        }, 300);
      } else {
        setHoveredIndex(index);
        setBeamAnimating(true);
      }
    }
  };

  // Function to highlight company names with link previews
  const highlightCompanyNames = (
    text: string,
    highlights?: Array<{ name: string; url: string; previewImage: string }>,
  ) => {
    if (!highlights || highlights.length === 0) return <span>{text}</span>;

    const result = text;
    const elements: React.JSX.Element[] = [];
    let lastIndex = 0;

    highlights.forEach((highlight, index) => {
      const startIndex = result.indexOf(highlight.name, lastIndex);
      if (startIndex !== -1) {
        // Add text before the highlight
        if (startIndex > lastIndex) {
          elements.push(
            <span key={`text-${index}-1`}>
              {result.substring(lastIndex, startIndex)}
            </span>,
          );
        }

        // Add the highlighted company name with link preview
        elements.push(
          <LinkPreview
            key={`highlight-${index}`}
            url={highlight.url}
            previewImage={highlight.previewImage}
          >
            <span className="font-medium text-black dark:text-white">
              {highlight.name}
            </span>
          </LinkPreview>,
        );

        lastIndex = startIndex + highlight.name.length;
      }
    });

    // Add any remaining text
    if (lastIndex < result.length) {
      elements.push(<span key="text-last">{result.substring(lastIndex)}</span>);
    }

    return <>{elements}</>;
  };

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
                onTouchStart={() => handleTouch(index)}
              >
                {/* Always filled circle */}
                <motion.div
                  className="absolute top-0 left-0 w-3 h-3 -ml-1.5 bg-black dark:bg-white rounded-full border border-black dark:border-white"
                  initial={{ scale: 1 }}
                  animate={{
                    scale: hoveredIndex === index ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Beam animation */}
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      className="absolute -left-0.5 top-0 h-full w-0.5 bg-black dark:bg-white origin-top"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      exit={{ scaleY: 0 }}
                      transition={{
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  )}
                </AnimatePresence>

                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {item.period}
                </div>
                <h3 className="text-xl font-medium mb-1">{item.role}</h3>
                <div className="text-gray-600 dark:text-gray-300 mb-2">
                  <LinkPreview
                    url={item.companyUrl}
                    previewImage={item.companyPreviewImage}
                  >
                    <span className="font-medium text-black dark:text-white">
                      {item.company}
                    </span>
                  </LinkPreview>
                  , {item.location}
                </div>
                <ul className="space-y-1">
                  {item.details.map((detail, detailIndex) => (
                    <li
                      key={detailIndex}
                      className="text-gray-600 dark:text-gray-400"
                    >
                      {item.highlights
                        ? highlightCompanyNames(detail, item.highlights)
                        : detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </ParallaxSection>
    </section>
  );
}
