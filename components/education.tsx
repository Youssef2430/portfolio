"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { SectionHeading } from "./section-heading";
import { useState, useEffect, useRef } from "react";
import { ParallaxSection } from "./parallax-section";
import { LinkPreview } from "./ui/link-preview";

type EducationItem = {
  degree: string;
  institution: string;
  location: string;
  period: string;
  details: string[];
  highlights?: Array<{
    name: string;
    url: string;
    previewImage: string;
  }>;
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
    highlights: [
      {
        name: "Vida Dujmovic",
        url: "https://en.wikipedia.org/wiki/Vida_Dujmovi%C4%87",
        previewImage:
          "/placeholder.svg?height=400&width=640&text=Vida+Dujmovic",
      },
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
        <LinkPreview key={`highlight-${index}`} url={highlight.url}>
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

export function Education() {
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

  return (
    <section id="education" className="py-24 sm:py-32">
      <ParallaxSection offset={20}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading japanese="教育" english="Education" />

          <div ref={ref} className="space-y-12">
            {educationItems.map((item, index) => (
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
                <h3 className="text-xl font-medium mb-1">{item.degree}</h3>
                <div className="text-gray-600 dark:text-gray-300 mb-2">
                  {item.institution}, {item.location}
                </div>
                <ul className="space-y-1">
                  {item.details.map((detail, detailIndex) => (
                    <li
                      key={detailIndex}
                      className="text-gray-600 dark:text-gray-400"
                    >
                      {/* • {detail} */}
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
