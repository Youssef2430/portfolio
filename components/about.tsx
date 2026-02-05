"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen py-32 overflow-hidden"
    >
      {/* Background */}
      <motion.div className="absolute inset-0 z-0" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[hsl(220,20%,6%)] to-black" />
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        {/* Main intro - Mason Wong style */}
        <div ref={titleRef} className="max-w-6xl mx-auto">
          {/* YCAY IS THE FOLIO OF */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 1, ease: [0.55, 0.45, 0.16, 1] }}
            className="mb-8"
          >
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-tight">
                YCAY
              </span>
              <span className="font-mono text-[10px] md:text-xs tracking-[0.2em] text-[hsl(0,0%,40%)] uppercase">
                [HOME]
              </span>
              <span className="text-2xl md:text-4xl lg:text-5xl font-light text-[hsl(0,0%,50%)] tracking-tight">
                IS THE FOLIO OF
              </span>
            </div>
          </motion.div>

          {/* YOUSSEF [ يوسف شواي ] CHOUAY */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{
              duration: 1,
              delay: 0.1,
              ease: [0.55, 0.45, 0.16, 1],
            }}
            className="mb-16"
          >
            <div className="flex flex-wrap items-baseline gap-x-4">
              <span className="text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-tight">
                YOUSSEF
              </span>
              <span className="text-2xl md:text-4xl lg:text-5xl font-light text-[hsl(0,0%,40%)] tracking-tight">
                [
              </span>
              <span className="font-arabic text-3xl md:text-5xl lg:text-6xl text-[hsl(42,45%,75%)]">
                يوسف شواي
              </span>
              <span className="text-2xl md:text-4xl lg:text-5xl font-light text-[hsl(0,0%,40%)] tracking-tight">
                ]
              </span>
              <span className="text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-tight">
                CHOUAY ↓
              </span>
            </div>
          </motion.div>

          {/* Divider dot */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={
              isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }
            }
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-20"
          >
            <div className="w-2 h-2 rounded-full bg-[hsl(42,45%,75%)]" />
          </motion.div>

          {/* Role description - large typography */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{
              duration: 1,
              delay: 0.4,
              ease: [0.55, 0.45, 0.16, 1],
            }}
            className="max-w-5xl mx-auto mb-20"
          >
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-light text-white tracking-tight leading-tight mb-4">
                SOFTWARE ENGINEER, RESEARCHER
              </h2>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className="font-arabic text-2xl md:text-4xl text-[hsl(42,45%,75%)] italic">
                  and
                </span>
                <span className="text-3xl md:text-5xl lg:text-6xl font-light text-white tracking-tight">
                  GRAPH THEORY ENTHUSIAST
                </span>
              </div>
            </div>
          </motion.div>

          {/* Bio section - two columns */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{
              duration: 1,
              delay: 0.5,
              ease: [0.55, 0.45, 0.16, 1],
            }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto"
          >
            {/* Left column - Current role */}
            <div>
              <div className="mb-8">
                <p className="font-mono text-xs tracking-[0.15em] text-[hsl(0,0%,50%)] uppercase">
                  AI RESEARCHER{" "}
                  <span className="text-[hsl(42,45%,75%)]">@</span> NATIONAL
                  RESEARCH COUNCIL
                </p>
                <p className="font-mono text-xs tracking-[0.15em] text-[hsl(0,0%,40%)] uppercase mt-1">
                  BASED IN OTTAWA, CANADA
                </p>
              </div>

              <p className="text-[hsl(0,0%,70%)] leading-relaxed">
                I'm a software engineer and researcher with a passion for
                creating elegant, efficient solutions to complex problems.
                Growing up curious about the world and my surroundings, I've
                always wanted to understand how they worked.
              </p>
            </div>

            {/* Right column - Philosophy */}
            <div>
              <div className="mb-8">
                <p className="font-mono text-xs tracking-[0.15em] text-[hsl(0,0%,50%)] uppercase">
                  M.SC COMPUTER SCIENCE{" "}
                  <span className="text-[hsl(42,45%,75%)]">@</span> UOTTAWA
                </p>
                <p className="font-mono text-xs tracking-[0.15em] text-[hsl(0,0%,40%)] uppercase mt-1">
                  FOCUS: GRAPH THEORY
                </p>
              </div>

              <p className="text-[hsl(0,0%,70%)] leading-relaxed">
                I've kept that approach and mindset throughout my whole life and
                I'm slowly chipping the iceberg of knowledge hoping to make a
                big enough dent to make my younger self proud. Currently
                pursuing a Master's in Computer Science with a focus on Graph
                Theory, and working as an AI researcher for the Canadian
                National Research Council. I'm constantly exploring new
                technologies and ways to contribute.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
