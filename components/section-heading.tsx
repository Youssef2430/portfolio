"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";

type SectionHeadingProps = {
  japanese: string;
  english: string;
  id?: string;
};

export function SectionHeading({ japanese, english, id }: SectionHeadingProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [isHovering, setIsHovering] = useState(false);

  return (
    <div ref={ref} id={id} className="mb-12">
      <motion.h2
        className="text-3xl font-light tracking-tight mb-2 relative inline-block"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{ cursor: isHovering ? "default" : "pointer" }}
      >
        {japanese}
        <AnimatePresence>
          {isHovering && (
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 bg-white dark:bg-black border border-black dark:border-white rounded-sm px-3 py-1 shadow-sm whitespace-nowrap z-50"
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <span className="text-sm text-black dark:text-white font-medium tracking-wide">
                {english}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.h2>
      <motion.div
        className="h-px w-16 bg-black dark:bg-white"
        initial={{ width: 0 }}
        animate={inView ? { width: 64 } : { width: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </div>
  );
}
