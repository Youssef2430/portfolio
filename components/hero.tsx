"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const { scrollY } = useScroll();
  const backgroundScale = useTransform(scrollY, [0, 500], [1.1, 1]);
  const textY = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Staggered letter animation
  const letterVariants = {
    hidden: { opacity: 0, y: 150 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5 + i * 0.1,
        duration: 1.2,
        ease: [0.55, 0.45, 0.16, 1],
      },
    }),
  };

  const arabicVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 1.2,
        duration: 1,
        ease: [0.55, 0.45, 0.16, 1],
      },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.8,
        duration: 0.8,
        ease: [0.55, 0.45, 0.16, 1],
      },
    },
  };

  const scrollIndicatorVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 2.5,
        duration: 1,
      },
    },
  };

  const initials = ["Y", "C", "A", "Y"];

  return (
    <section
      ref={containerRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background with parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ scale: backgroundScale }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_70%)]" />
      </motion.div>

      {/* Main content */}
      <motion.div
        className="relative z-10 w-full px-8 md:px-16"
        style={{ y: textY, opacity }}
      >
        {/* Giant initials with Arabic in center */}
        <div className="flex items-center justify-center">
          {/* Left letters - Y C */}
          <div className="flex items-baseline">
            {initials.slice(0, 2).map((letter, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={letterVariants}
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                className="text-massive text-white font-light select-none"
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Arabic name in center */}
          <motion.div
            variants={arabicVariants}
            initial="hidden"
            animate={mounted ? "visible" : "hidden"}
            className="flex flex-col items-center mx-4 md:mx-8"
          >
            <span className="arabic-bracket text-2xl md:text-4xl mb-2">「</span>
            <span className="font-arabic text-3xl md:text-5xl lg:text-6xl text-[hsl(42,45%,75%)] leading-tight">
              يوسف
            </span>
            <span className="font-arabic text-3xl md:text-5xl lg:text-6xl text-[hsl(42,45%,75%)] leading-tight">
              شواي
            </span>
            <span className="arabic-bracket text-2xl md:text-4xl mt-2">」</span>
          </motion.div>

          {/* Right letters - A Y */}
          <div className="flex items-baseline">
            {initials.slice(2).map((letter, i) => (
              <motion.span
                key={i + 2}
                custom={i + 2}
                variants={letterVariants}
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                className="text-massive text-white font-light select-none"
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <motion.div
          variants={subtitleVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          className="text-center mt-12 md:mt-16"
        >
          <p className="font-mono text-xs md:text-sm tracking-[0.3em] text-[hsl(0,0%,65%)] uppercase">
            YOUSSEF [CHOUAY] ↓
          </p>
          <p className="mt-4 text-sm md:text-base text-[hsl(0,0%,65%)] font-light max-w-md mx-auto">
            software engineer, AI researcher and graph theory enthusiast
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        variants={scrollIndicatorVariants}
        initial="hidden"
        animate={mounted ? "visible" : "hidden"}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="font-mono text-[10px] tracking-[0.2em] text-[hsl(0,0%,45%)] uppercase mb-4">
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-[hsl(0,0%,45%)] to-transparent scroll-indicator" />
      </motion.div>

      {/* Year indicator - right side */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block"
      >
        <span className="font-mono text-[10px] tracking-[0.2em] text-[hsl(0,0%,35%)] writing-mode-vertical">
          2025
        </span>
      </motion.div>
    </section>
  );
}
