"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Education } from "@/components/education";
import { Experience } from "@/components/experience";
import { Projects } from "@/components/projects";
import { BlogSection } from "@/components/blog-section";
import { CurrentListen } from "@/components/current-listen";
import { Footer } from "@/components/footer";
import { AskInput } from "@/components/ask-input";

// Page transition component
function PageTransition({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            className="page-transition"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.8, ease: [0.55, 0.45, 0.16, 1] }}
            style={{ transformOrigin: "top" }}
          />
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {children}
      </motion.div>
    </>
  );
}

// Smooth scroll handler
function useSmoothScroll() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');

      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute("href");
        if (href) {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            window.history.pushState(null, "", href);
          }
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
}

export default function Home() {
  useSmoothScroll();

  return (
    <PageTransition>
      <main className="relative z-10 min-h-screen bg-black">
        {/* Grain overlay */}
        <div className="grain-overlay" />

        {/* Navigation */}
        <Navbar />

        {/* Sections */}
        <div id="home">
          <Hero />
        </div>

        <About />

        <Education />

        <Experience />

        <Projects />

        <BlogSection />

        <CurrentListen />

        <Footer />

        {/* Floating chat input */}
        <AskInput />
      </main>
    </PageTransition>
  );
}
