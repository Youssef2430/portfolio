"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  FileText,
  Monitor,
  Moon,
  Sun,
  Home,
  UserRound,
  GraduationCap,
  BriefcaseBusiness,
  FolderGit2,
} from "lucide-react";

const navLinks = [
  { href: "#home", label: "HOME", arabic: "الرئيسية", icon: Home },
  { href: "#about", label: "INFO", arabic: "معلومات", icon: UserRound },
  {
    href: "#education",
    label: "EDUCATION",
    arabic: "تعليم",
    icon: GraduationCap,
  },
  {
    href: "#experience",
    label: "EXPERIENCE",
    arabic: "خبرة",
    icon: BriefcaseBusiness,
  },
  { href: "#work", label: "WORKS", arabic: "أعمال", icon: FolderGit2 },
];

const themeCycle = ["system", "light", "dark"] as const;

function ThemeToggle({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme =
    mounted && themeCycle.includes(theme as (typeof themeCycle)[number])
      ? (theme as (typeof themeCycle)[number])
      : "system";
  const nextTheme =
    themeCycle[(themeCycle.indexOf(currentTheme) + 1) % themeCycle.length];
  const Icon =
    currentTheme === "light" ? Sun : currentTheme === "dark" ? Moon : Monitor;
  const label = currentTheme[0].toUpperCase() + currentTheme.slice(1);
  const nextLabel = nextTheme[0].toUpperCase() + nextTheme.slice(1);
  const ariaLabel = mounted
    ? `Theme: ${label}. Switch to ${nextLabel}.`
    : "Theme";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className={`inline-flex h-9 w-9 items-center justify-center text-foreground/80 transition-colors duration-300 hover:text-gold focus-visible:outline-none focus-visible:text-gold ${className}`}
      aria-label={ariaLabel}
      title={mounted ? `Theme: ${label}` : "Theme"}
    >
      {mounted ? <Icon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
    </button>
  );
}

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

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const closeMenuAbovePhone = () => {
      if (window.innerWidth >= 640) setMobileMenuOpen(false);
    };

    window.addEventListener("resize", closeMenuAbovePhone);
    return () => window.removeEventListener("resize", closeMenuAbovePhone);
  }, [mobileMenuOpen]);

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
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${
          scrolled
            ? "border-border/70 bg-background/85 py-3 shadow-sm backdrop-blur-md"
            : "border-border/20 bg-background/55 py-5 backdrop-blur-sm"
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.55, 0.45, 0.16, 1] }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="flex items-center justify-between gap-3">
            {/* Logo */}
            <Link
              href="/"
              className="shrink-0 text-foreground font-light text-base tracking-[0.1em] hover:text-gold transition-colors sm:text-lg"
            >
              YCAY
            </Link>

            {/* Compact Navigation */}
            <nav
              className="hidden flex-1 items-center justify-center gap-1 sm:flex md:hidden"
              aria-label="Primary navigation"
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeSection === link.href.replace("#", "");

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`nav-link inline-flex h-9 w-9 items-center justify-center ${
                      isActive ? "active" : ""
                    }`}
                    aria-label={link.label}
                    title={link.label}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">{link.label}</span>
                  </a>
                );
              })}

              <a
                href="/data/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link inline-flex h-9 w-9 items-center justify-center"
                aria-label="CV"
                title="CV"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">CV</span>
              </a>
            </nav>

            {/* Desktop Navigation */}
            <nav
              className="hidden flex-1 items-center justify-center gap-2 md:flex lg:gap-4 xl:flex-none xl:justify-start xl:gap-12"
              aria-label="Primary navigation"
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeSection === link.href.replace("#", "");

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`nav-link inline-flex h-10 w-10 items-center justify-center xl:h-auto xl:w-auto ${
                      isActive ? "active" : ""
                    }`}
                    aria-label={link.label}
                    title={link.label}
                  >
                    <Icon className="h-4 w-4 xl:hidden" aria-hidden="true" />
                    <span className="hidden xl:inline">{link.label}</span>
                  </a>
                );
              })}

              {/* Resume link */}
              <a
                href="/data/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link inline-flex h-10 w-10 items-center justify-center gap-2 xl:h-auto xl:w-auto"
                aria-label="CV"
                title="CV"
              >
                <FileText className="h-4 w-4 xl:h-3 xl:w-3" aria-hidden="true" />
                <span className="hidden xl:inline">CV</span>
              </a>
            </nav>

            <div className="hidden shrink-0 items-center gap-4 md:flex">
              <ThemeToggle />
              <span className="font-mono text-[10px] tracking-[0.15em] text-foreground/50">
                [2025]
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-foreground transition-colors hover:text-gold sm:hidden"
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
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-background text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex min-h-full flex-col items-center justify-center px-6 py-24">
              <nav className="flex flex-col items-center space-y-6">
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
                      <span className="text-3xl font-light text-foreground tracking-wider transition-colors group-hover:text-gold">
                        {link.label}
                      </span>
                      <span className="font-arabic text-base text-[hsl(var(--gold))] mt-1">
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
                    <span className="text-3xl font-light text-foreground tracking-wider transition-colors group-hover:text-gold">
                      CV
                    </span>
                    <span className="font-arabic text-base text-[hsl(var(--gold))] mt-1">
                      السيرة
                    </span>
                  </a>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: (navLinks.length + 1) * 0.1 }}
                  className="pt-4"
                >
                  <ThemeToggle className="h-11 w-11" />
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
