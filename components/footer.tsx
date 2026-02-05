"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Github, Linkedin, Mail, ArrowUpRight } from "lucide-react";

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  const yearOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.15]);

  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      className="relative min-h-[60vh] flex flex-col justify-end overflow-hidden bg-black"
    >
      {/* Large decorative year */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ opacity: yearOpacity }}
      >
        <span className="footer-year text-white">
          {currentYear}
        </span>
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 md:px-12 pb-12">
        {/* Main footer content */}
        <div className="border-t border-[hsl(0,0%,15%)] pt-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
            {/* Left side - Name and tagline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, ease: [0.55, 0.45, 0.16, 1] }}
            >
              <h2 className="text-3xl md:text-5xl font-light text-white mb-4">
                YOUSSEF CHOUAY
              </h2>
              <p className="font-arabic text-xl text-[hsl(42,45%,75%)]">
                「يوسف شواي」
              </p>
              <p className="mt-4 font-mono text-xs tracking-wider text-[hsl(0,0%,45%)] uppercase">
                Software Engineer & AI Researcher
              </p>
            </motion.div>

            {/* Right side - Links and social */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.55, 0.45, 0.16, 1] }}
              className="flex flex-col md:flex-row gap-12"
            >
              {/* Navigation */}
              <div>
                <h3 className="font-mono text-[10px] tracking-[0.2em] text-[hsl(0,0%,35%)] uppercase mb-4">
                  Navigation
                </h3>
                <ul className="space-y-2">
                  {["Home", "Work", "Info"].map((item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase()}`}
                        className="text-sm text-[hsl(0,0%,60%)] hover:text-white transition-colors link-hover"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-mono text-[10px] tracking-[0.2em] text-[hsl(0,0%,35%)] uppercase mb-4">
                  Connect
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://github.com/Youssef2430"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[hsl(0,0%,60%)] hover:text-white transition-colors group"
                    >
                      <Github className="w-4 h-4" />
                      <span>GitHub</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://linkedin.com/in/youssef-chouay"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[hsl(0,0%,60%)] hover:text-white transition-colors group"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:ychou031@uottawa.ca"
                      className="flex items-center gap-2 text-sm text-[hsl(0,0%,60%)] hover:text-white transition-colors group"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Bottom bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-16 pt-8 border-t border-[hsl(0,0%,10%)]"
          >
            <p className="font-mono text-[10px] tracking-wider text-[hsl(0,0%,35%)]">
              YOUSSEF CHOUAY © {currentYear}
            </p>

            <div className="flex items-center gap-4">
              <span className="font-arabic text-sm text-[hsl(42,45%,75%)] opacity-60">
                صُنع بإتقان
              </span>
              <span className="font-mono text-[10px] tracking-wider text-[hsl(0,0%,35%)]">
                •
              </span>
              <span className="font-mono text-[10px] tracking-wider text-[hsl(0,0%,35%)]">
                CRAFTED WITH INTENTION
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Vertical Arabic text decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.3 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block"
      >
        <span className="arabic-vertical text-2xl">
          「عني」
        </span>
      </motion.div>
    </footer>
  );
}
