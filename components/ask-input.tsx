"use client"

import type React from "react"

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export function AskInput() {
  const placeholders = [
    "What projects has Youssef worked on?",
    "What are Youssef's skills?",
    "Where did Youssef study?",
    "What experience does Youssef have?",
    "Tell me about Youssef's AI research",
  ]

  const [response, setResponse] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  // Check if we're near the footer to hide the input
  useEffect(() => {
    const checkFooterVisibility = () => {
      const footer = document.querySelector("footer")
      if (footer) {
        const footerRect = footer.getBoundingClientRect()
        const windowHeight = window.innerHeight

        // If footer is visible or close to being visible, hide the input
        if (footerRect.top < windowHeight + 100) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
      }
    }

    window.addEventListener("scroll", checkFooterVisibility)
    // Initial check
    checkFooterVisibility()

    return () => {
      window.removeEventListener("scroll", checkFooterVisibility)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Optional: handle input changes
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("query") as string

    // Simulate a response - in a real app, this would call an API
    setTimeout(() => {
      if (query.toLowerCase().includes("project")) {
        setResponse(
          "Youssef has worked on several projects including NLP Phishing Detection, GeeGee's Intramural website, and a Distributed File Storage System.",
        )
      } else if (query.toLowerCase().includes("skill")) {
        setResponse(
          "Youssef's skills include Python, Java, Go, Rust, C/C++, JavaScript/TypeScript, and various frameworks like React, Node.js, and TensorFlow.",
        )
      } else if (query.toLowerCase().includes("study") || query.toLowerCase().includes("education")) {
        setResponse(
          "Youssef studied at the University of Ottawa, completing a Bachelor of Applied Science in Software Engineering and is currently pursuing a Masters in Computer Science.",
        )
      } else if (query.toLowerCase().includes("experience") || query.toLowerCase().includes("work")) {
        setResponse(
          "Youssef has worked as an AI Researcher at the National Research Council, a Junior Software Engineer at Wind River Systems, and a Software Developer at the University of Ottawa.",
        )
      } else {
        setResponse(
          "Youssef is a software engineer and AI researcher with a passion for creating elegant, efficient solutions to complex problems.",
        )
      }
    }, 500)
  }

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-xl px-4 z-40"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <PlaceholdersAndVanishInput placeholders={placeholders} onChange={handleChange} onSubmit={onSubmit} />

      {response && (
        <motion.div
          className="mt-4 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-gray-800 dark:text-gray-200">{response}</p>
          <button
            onClick={() => setResponse(null)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
