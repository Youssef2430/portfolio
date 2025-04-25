"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

type LinkPreviewProps = {
  children: React.ReactNode
  url: string
  previewImage: string
  className?: string
}

export function LinkPreview({ children, url, previewImage, className }: LinkPreviewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (linkRef.current) {
      const rect = linkRef.current.getBoundingClientRect()
      setPosition({
        x: e.clientX - rect.left - rect.width / 2,
        y: -rect.height - 10,
      })
    }
  }

  return (
    <div className="relative inline-block">
      <a
        ref={linkRef}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("relative inline-flex items-center", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {children}
      </a>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute z-50 transform -translate-x-1/2 -translate-y-full pointer-events-none"
            style={{
              top: position.y,
              left: "50%",
              marginTop: "-80px", // Offset to position above the link
            }}
          >
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="w-64 h-40 relative">
                <Image src={previewImage || "/placeholder.svg"} alt="Website preview" fill className="object-cover" />
              </div>
              <div className="p-2 text-xs text-center text-gray-500 dark:text-gray-400 truncate">
                {url.replace(/^https?:\/\//, "")}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
