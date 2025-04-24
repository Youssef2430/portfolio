"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

type NavLinkProps = {
  href: string
  japanese: string
  english: string
}

function NavLink({ href, japanese, english }: NavLinkProps) {
  const [isHovering, setIsHovering] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const targetId = href.replace("#", "")
    const element = document.getElementById(targetId)

    if (element) {
      // Smooth scroll to the element
      element.scrollIntoView({ behavior: "smooth" })

      // Update URL without triggering a page reload
      window.history.pushState(null, "", href)
    }
  }

  return (
    <Link
      href={href}
      className="text-sm tracking-widest hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
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
            <span className="text-sm text-black dark:text-white font-medium tracking-wide">{english}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  )
}

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1">
            <Link
              href="/"
              className="text-lg font-medium tracking-wider"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
            >
              YOUSSEF CHOUAY
            </Link>
          </div>
          <nav className="flex items-center space-x-8">
            <NavLink href="#education" japanese="教育" english="Education" />
            <NavLink href="#experience" japanese="経験" english="Experience" />
            <NavLink href="#projects" japanese="プロジェクト" english="Projects" />
            <NavLink href="#skills" japanese="スキル" english="Skills" />
            <NavLink href="#about" japanese="私について" english="About Me" />
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
                    {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </nav>
        </div>
      </div>
    </motion.header>
  )
}
