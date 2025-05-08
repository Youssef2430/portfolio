"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";
import { GlitchText } from "./glitch-text";

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
        <span className="mt-2">{english}</span>
        {/* <GlitchText
          japanese={japanese}
          english={english}
          className="mt-2"
          index={0}
        /> */}
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
