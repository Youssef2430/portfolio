"use client"

import { useState, useEffect, useRef } from "react"

type GlitchTextProps = {
  japanese: string
  english: string
  className?: string
  index?: number // For staggered animations on load
  autoAnimate?: boolean // Whether to animate on load
}

export function GlitchText({ japanese, english, className = "", index = 0, autoAnimate = true }: GlitchTextProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [isGlitching, setIsGlitching] = useState(false)
  const [showEnglish, setShowEnglish] = useState(false)
  const [glitchText, setGlitchText] = useState(japanese)
  const [initialAnimationDone, setInitialAnimationDone] = useState(false)
  const glitchIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMobileRef = useRef(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      isMobileRef.current = window.innerWidth < 768
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Function to generate random glitch characters
  const generateGlitchText = (from: string, to: string, progress: number) => {
    const result = []
    const maxLength = Math.max(from.length, to.length)

    for (let i = 0; i < maxLength; i++) {
      // If we're past the transition point for this character, use the target character
      if (i / maxLength < progress) {
        result.push(i < to.length ? to[i] : "")
      } else {
        // Otherwise use the source character or a glitch character
        if (Math.random() > 0.7) {
          // Random glitch characters - mix of symbols, letters, and Japanese-like characters
          const glitchChars =
            "!@#$%^&*()_+-=[]{}|;:,./<>?abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ日本語文字"
          result.push(glitchChars[Math.floor(Math.random() * glitchChars.length)])
        } else {
          result.push(i < from.length ? from[i] : "")
        }
      }
    }

    return result.join("")
  }

  const startGlitchAnimation = (fromText: string, toText: string, onComplete?: () => void) => {
    // Clear any existing interval
    if (glitchIntervalRef.current) {
      clearInterval(glitchIntervalRef.current)
    }

    setIsGlitching(true)

    let progress = 0
    const duration = 800 // ms
    const interval = 50 // ms
    const steps = duration / interval

    glitchIntervalRef.current = setInterval(() => {
      progress += 1 / steps
      setGlitchText(generateGlitchText(fromText, toText, progress))

      if (progress >= 1) {
        if (glitchIntervalRef.current) {
          clearInterval(glitchIntervalRef.current)
          glitchIntervalRef.current = null
        }
        setGlitchText(toText)
        setIsGlitching(false)
        onComplete?.()
      }
    }, interval)
  }

  // Initial animation sequence on page load
  useEffect(() => {
    if (autoAnimate && !initialAnimationDone) {
      // Stagger the animations based on index
      const delay = 500 + index * 300

      const timer = setTimeout(() => {
        // First animate to English
        startGlitchAnimation(japanese, english, () => {
          // Then after a pause, animate back to Japanese
          setTimeout(() => {
            startGlitchAnimation(english, japanese, () => {
              setInitialAnimationDone(true)
            })
          }, 800)
        })
      }, delay)

      return () => {
        clearTimeout(timer)
        if (glitchIntervalRef.current) {
          clearInterval(glitchIntervalRef.current)
        }
      }
    }
  }, [autoAnimate, initialAnimationDone, japanese, english, index])

  const handleMouseEnter = () => {
    if (initialAnimationDone && !isGlitching) {
      setIsHovering(true)
      if (!showEnglish) {
        startGlitchAnimation(japanese, english, () => setShowEnglish(true))
      }
    }
  }

  const handleMouseLeave = () => {
    if (initialAnimationDone && !isGlitching) {
      setIsHovering(false)
      if (showEnglish) {
        startGlitchAnimation(english, japanese, () => setShowEnglish(false))
      }
    }
  }

  // Handle touch events for mobile
  const handleTouchStart = () => {
    if (isMobileRef.current && initialAnimationDone && !isGlitching) {
      if (!showEnglish) {
        startGlitchAnimation(japanese, english, () => setShowEnglish(true))
      } else {
        startGlitchAnimation(english, japanese, () => setShowEnglish(false))
      }
    }
  }

  return (
    <span
      className={`block relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      <span className={isGlitching ? "inline-block glitch-effect" : "inline-block"}>{glitchText}</span>

      <style jsx>{`
        .glitch-effect {
          position: relative;
        }
        
        .glitch-effect::before,
        .glitch-effect::after {
          content: "${glitchText}";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          clip: rect(0, 0, 0, 0);
        }
        
        .glitch-effect::before {
          left: 2px;
          text-shadow: -1px 0 #ff00ff;
          animation: glitch-anim-1 0.2s infinite linear alternate-reverse;
        }
        
        .glitch-effect::after {
          left: -2px;
          text-shadow: 1px 0 #00ffff;
          animation: glitch-anim-2 0.3s infinite linear alternate-reverse;
        }
        
        @keyframes glitch-anim-1 {
          0% {
            clip: rect(2px, 9999px, 56px, 0);
          }
          20% {
            clip: rect(25px, 9999px, 28px, 0);
          }
          40% {
            clip: rect(12px, 9999px, 70px, 0);
          }
          60% {
            clip: rect(46px, 9999px, 3px, 0);
          }
          80% {
            clip: rect(23px, 9999px, 42px, 0);
          }
          100% {
            clip: rect(16px, 9999px, 87px, 0);
          }
        }
        
        @keyframes glitch-anim-2 {
          0% {
            clip: rect(42px, 9999px, 5px, 0);
          }
          20% {
            clip: rect(12px, 9999px, 60px, 0);
          }
          40% {
            clip: rect(63px, 9999px, 24px, 0);
          }
          60% {
            clip: rect(34px, 9999px, 92px, 0);
          }
          80% {
            clip: rect(15px, 9999px, 38px, 0);
          }
          100% {
            clip: rect(24px, 9999px, 53px, 0);
          }
        }
      `}</style>
    </span>
  )
}
