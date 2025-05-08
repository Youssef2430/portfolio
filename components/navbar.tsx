"use client";

import type React from "react"; // Keep React import if needed elsewhere

import { useState, useEffect } from "react";
import Link from "next/link";
import { MoonIcon, SunIcon, Menu, X, FileText } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { GlitchText } from "./glitch-text";

type NavLinkProps = {
  href: string;
  japanese: string;
  english: string;
  onClick?: () => void;
  isMobile?: boolean;
};

function NavLink({
  href,
  japanese,
  english,
  onClick,
  isMobile = false,
}: NavLinkProps) {
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      // Smooth scroll to the element
      element.scrollIntoView({ behavior: "smooth" });

      // Update URL without triggering a page reload
      window.history.pushState(null, "", href);

      // Call onClick if provided (for mobile menu)
      if (onClick) onClick();
    }
  };

  return (
    <Link
      href={href}
      className="text-sm tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
    >
      {/* Show English text for mobile, Japanese for desktop */}
      {isMobile ? english : japanese}

      {/* Only show tooltip on desktop */}
      {!isMobile && (
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
      )}
    </Link>
  );
}

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResumeHovered, setIsResumeHovered] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#education", japanese: "教育", english: "Education" },
    { href: "#experience", japanese: "経験", english: "Experience" },
    { href: "#projects", japanese: "プロジェクト", english: "Projects" },
    { href: "#skills", japanese: "スキル", english: "Skills" },
    { href: "#about", japanese: "私について", english: "About Me" },
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Function to handle smooth scrolling for links
  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    isMobileClick: boolean = false,
  ) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", href); // Update URL without reload
      if (isMobileClick) {
        closeMobileMenu(); // Close mobile menu after clicking a link
      }
    }
  };

  // Resume URL - replace with actual URL when available
  const resumeUrl = "data/resume.pdf";

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-black/90 backdrop-blur-md"
          : "border-transparent bg-white/50 dark:bg-black/50 backdrop-blur-sm"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Site Title */}
          <div className="flex-1">
            <Link
              href="/"
              className="text-base sm:text-lg font-medium tracking-wider inline-block" // Use inline-block for GlitchText
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                closeMobileMenu();
              }}
            >
              {/* Apply GlitchText to the title */}
              <GlitchText
                japanese="YOUSSEF CHOUAY"
                english="ユーセフ・チュワイ"
                index={-1} // Animate first
                autoAnimate={true}
                className="font-medium" // Maintain font weight
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <NavLink
                key={index}
                href={link.href}
                japanese={link.japanese}
                english={link.english}
                onClick={closeMobileMenu}
                isMobile={true}
              />
              // <a
              //   key={index}
              //   href={link.href}
              //   className="text-sm tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              //   onClick={(e) => handleSmoothScroll(e, link.href)}
              // >
              //   <GlitchText
              //     japanese={link.japanese}
              //     english={link.english}
              //     index={index} // Stagger animation
              //     autoAnimate={true}
              //   />
              // </a>
            ))}

            {/* Resume/CV Link (Tooltip remains) */}
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="View Resume"
              onMouseEnter={() => setIsResumeHovered(true)}
              onMouseLeave={() => setIsResumeHovered(false)}
            >
              <FileText className="h-5 w-5" />
              <AnimatePresence>
                {isResumeHovered && (
                  <motion.div
                    className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 bg-white dark:bg-black border border-black dark:border-white rounded-sm px-3 py-1 shadow-sm whitespace-nowrap z-50"
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <span className="text-sm text-black dark:text-white font-medium tracking-wide">
                      Resume
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </a>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mounted && (
                  <motion.div
                    key={theme === "dark" ? "dark" : "light"}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === "dark" ? (
                      <SunIcon className="h-5 w-5" />
                    ) : (
                      <MoonIcon className="h-5 w-5" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </nav>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center">
            {/* Resume/CV Link for Mobile */}
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="View Resume"
            >
              <FileText className="h-4 w-4" />
            </a>

            {/* Theme Toggle for Mobile */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mounted && (
                  <motion.div
                    key={theme === "dark" ? "dark" : "light"}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === "dark" ? (
                      <SunIcon className="h-4 w-4" />
                    ) : (
                      <MoonIcon className="h-4 w-4" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link, index) => (
                  <NavLink
                    key={index}
                    href={link.href}
                    japanese={link.japanese}
                    english={link.english}
                    onClick={closeMobileMenu}
                    isMobile={true}
                  />
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
