"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, FileText } from "lucide-react";

const navLinks = [
  { href: "#home", label: "HOME", arabic: "الرئيسية" },
  { href: "#about", label: "INFO", arabic: "معلومات" },
  { href: "#education", label: "EDUCATION", arabic: "تعليم" },
  { href: "#experience", label: "EXPERIENCE", arabic: "خبرة" },
  { href: "#work", label: "WORKS", arabic: "أعمال" },
];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = ["home", "about", "education", "experience", "work"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", href);
    }

    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 mix-blend-difference transition-all duration-500 ${
          scrolled ? "py-4" : "py-6"
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.55, 0.45, 0.16, 1] }}
      >
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="text-white font-light text-lg tracking-[0.1em] hover:opacity-70 transition-opacity"
            >
              YCAY
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-12">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`nav-link ${
                    activeSection === link.href.replace("#", "") ? "active" : ""
                  }`}
                >
                  {link.label}
                </a>
              ))}

              {/* Resume link */}
              <a
                href="/data/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link flex items-center gap-2"
              >
                <FileText className="w-3 h-3" />
                CV
              </a>
            </nav>

            {/* Year indicator */}
            <div className="hidden md:block">
              <span className="font-mono text-[10px] tracking-[0.15em] text-white/50">
                [2025]
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <nav className="flex flex-col items-center space-y-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <a
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="flex flex-col items-center group"
                    >
                      <span className="text-4xl font-light text-white tracking-wider">
                        {link.label}
                      </span>
                      <span className="font-arabic text-lg text-[hsl(42,45%,75%)] mt-1">
                        {link.arabic}
                      </span>
                    </a>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                >
                  <a
                    href="/data/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center group"
                  >
                    <span className="text-4xl font-light text-white tracking-wider">
                      CV
                    </span>
                    <span className="font-arabic text-lg text-[hsl(42,45%,75%)] mt-1">
                      السيرة
                    </span>
                  </a>
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
