"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowDownIcon } from "lucide-react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"

type KanjiProps = {
  japanese: string
  english: string
}

function KanjiText({ japanese, english }: KanjiProps) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <span
      className="block mt-2 relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {japanese}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 bg-white dark:bg-black border border-black dark:border-white rounded-sm px-3 py-1 shadow-sm z-10"
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <span className="text-sm text-black dark:text-white font-medium tracking-wide">{english}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

export function Hero() {
  const [scrolled, setScrolled] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parallax effect using Framer Motion
  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150])
  const textY = useTransform(scrollY, [0, 500], [0, -50])
  const opacityText = useTransform(scrollY, [0, 300], [1, 0.3])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative h-screen flex flex-col justify-center items-center pt-16 overflow-hidden"
    >
      <motion.div className="absolute inset-0 overflow-hidden" style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-5"></div>
      </motion.div>

      <motion.div
        className="relative z-10 text-center space-y-6 max-w-3xl mx-auto px-4"
        style={{ y: textY, opacity: opacityText }}
      >
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tighter"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <KanjiText japanese="コード" english="Code" />
          <KanjiText japanese="創造性" english="Creativity" />
          <KanjiText japanese="調和" english="Harmony" />
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-light max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Software Engineer & AI Researcher crafting elegant solutions through code, where engineering meets artistry.
        </motion.p>
      </motion.div>

      <motion.div
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-500 ${
          scrolled ? "opacity-0" : "opacity-100"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <a
          href="#education"
          className="flex flex-col items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById("education")?.scrollIntoView({ behavior: "smooth" })
          }}
        >
          <span className="mb-2">Explore</span>
          <ArrowDownIcon className="h-4 w-4 animate-bounce" />
        </a>
      </motion.div>
    </section>
  )
}
