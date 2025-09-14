"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Trash2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for combining class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- BubbleParticle Component ---
const BubbleParticle = ({ delay = 0 }: { delay?: number }) => {
  const randomX = Math.random() * 100 - 50;
  const randomSize = Math.random() * 8 + 4;
  const randomDuration = Math.random() * 3 + 2;
  const randomDistance = -150 - Math.random() * 100;

  return (
    <motion.div
      className="absolute rounded-full bg-gradient-to-b from-white/60 to-white/10 dark:from-blue-400/20 dark:to-purple-400/5"
      style={{
        width: randomSize,
        height: randomSize,
        bottom: -10,
        left: `calc(50% + ${randomX}px)`,
        boxShadow: "0 0 5px rgba(255, 255, 255, 0.2)",
      }}
      initial={{ y: 0, opacity: 0, scale: 0.5 }}
      animate={{
        y: [0, randomDistance],
        opacity: [0, 0.7, 0.9, 0],
        scale: [0.5, 1, 1.2, 0],
        x: [0, randomX / 2, randomX],
      }}
      transition={{
        duration: randomDuration,
        times: [0, 0.7, 0.9, 1],
        ease: "easeOut",
        delay: delay,
        repeat: Number.POSITIVE_INFINITY,
        repeatDelay: Math.random() * 2,
      }}
    />
  );
};

// --- TypingCursor Component ---
const TypingCursor = () => {
  return (
    <motion.span
      className="inline-block w-[2px] h-[14px] ml-[1px] bg-black dark:bg-white align-middle"
      animate={{ opacity: [1, 0, 1] }}
      transition={{
        duration: 0.8,
        repeat: Number.POSITIVE_INFINITY,
        times: [0, 0.5, 1],
        ease: "linear",
      }}
    />
  );
};

// --- Message Type Definition ---
interface Message {
  id: number;
  text: string;
  type: "question" | "answer";
}

// --- API History Item Type Definition ---
interface ApiHistoryItem {
  role: "user" | "assistant";
  content: string;
}

// --- Main AskInput Component ---
export function AskInput() {
  // States
  const [isVisible, setIsVisible] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextId, setNextId] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showBubbles, setShowBubbles] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const isStreamingRef = useRef(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<any[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // --- Load/Save Messages & Visibility Checks ---
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    const savedNextId = localStorage.getItem("chatNextId");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
        setIsTyping(false);
      } catch (e) {
        console.error("Failed to parse saved messages", e);
        localStorage.removeItem("chatMessages");
      }
    }
    if (savedNextId) {
      try {
        setNextId(JSON.parse(savedNextId));
      } catch (e) {
        console.error("Failed to parse saved nextId", e);
        localStorage.removeItem("chatNextId");
      }
    }
  }, []);

  useEffect(() => {
    const messagesToSave = messages.filter(
      (msg) => msg.text || msg.type === "question",
    );
    if (messagesToSave.length > 0)
      localStorage.setItem("chatMessages", JSON.stringify(messagesToSave));
    else localStorage.removeItem("chatMessages");
    localStorage.setItem("chatNextId", JSON.stringify(nextId));
  }, [messages, nextId]);

  useEffect(() => {
    const checkFooterVisibility = () => {
      const footer = document.querySelector("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const mobileOffset = window.innerWidth < 640 ? 150 : 100;
        setIsVisible(!(footerRect.top < window.innerHeight + mobileOffset));
      }
    };
    window.addEventListener("scroll", checkFooterVisibility);
    window.addEventListener("resize", checkFooterVisibility);
    checkFooterVisibility();
    return () => {
      window.removeEventListener("scroll", checkFooterVisibility);
      window.removeEventListener("resize", checkFooterVisibility);
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom of messages
    if (messagesEndRef.current && messages.length > 0) {
      const parent = messagesEndRef.current.parentElement;
      if (parent) {
        // Use scrollTop instead of scrollIntoView to avoid page scroll issues
        parent.scrollTop = parent.scrollHeight;
      }
    }
  }, [messages]);

  // Clean implementation to prevent scroll-to-top on mobile input focus
  useEffect(() => {
    // Simple function to prevent iOS from scrolling to focused input
    const preventScrollOnFocus = () => {
      // Store the current scroll position
      const scrollPosition = window.pageYOffset;

      // Use a short timeout to reset scroll after browser's default behavior
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 0);
    };

    // Only apply to the input element
    if (inputRef.current) {
      inputRef.current.addEventListener("focus", preventScrollOnFocus);
    }

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener("focus", preventScrollOnFocus);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isExpanded &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target) &&
        submitButtonRef.current &&
        !submitButtonRef.current.contains(target)
      ) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, inputRef, submitButtonRef, chatContainerRef]);

  useEffect(() => {
    if (isExpanded) setShowBubbles(true);
    else {
      const timer = setTimeout(() => setShowBubbles(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Cleanup intervals and animation frame on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // --- Vanishing Animation Functions ---

  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = inputRef.current.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const computedStyles = getComputedStyle(inputRef.current);
    const fontSize = Number.parseFloat(computedStyles.fontSize);
    const fontFamily = computedStyles.fontFamily;
    const color = computedStyles.color;
    const paddingLeft = Number.parseFloat(computedStyles.paddingLeft);
    const paddingTop = Number.parseFloat(computedStyles.paddingTop);

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.fillText(inputValue, paddingLeft, paddingTop + fontSize * 0.75);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = imageData.data;
    const newData: any[] = [];

    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const index = (y * canvas.width + x) * 4;
        if (pixelData[index + 3]! > 128) {
          // Check alpha channel
          newData.push({
            x: x / dpr,
            y: y / dpr,
            originX: x / dpr,
            originY: y / dpr,
            color: [
              pixelData[index],
              pixelData[index + 1],
              pixelData[index + 2],
              pixelData[index + 3],
            ],
          });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color, originX, originY }) => ({
      x,
      y,
      originX,
      originY,
      r: Math.random() * 1.5 + 0.5,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
      opacity: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`,
    }));
  }, [inputValue]);

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width * dpr, rect.height * dpr);

    let particlesRemaining = false;
    for (let i = newDataRef.current.length - 1; i >= 0; i--) {
      const p = newDataRef.current[i];
      if (!p || p.opacity <= 0) continue;

      particlesRemaining = true;
      p.x += p.vx;
      p.y += p.vy;
      p.opacity -= 0.008; // Slower fade
      p.r = Math.max(0, p.r - 0.01); // Slower shrink
      p.vx *= 0.99; // Slightly less resistance
      p.vy *= 0.99;

      const rgb = p.color.match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (rgb) {
        ctx.fillStyle = `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${Math.max(0, p.opacity)})`;
        ctx.beginPath();
        ctx.arc(p.x * dpr, p.y * dpr, p.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      if (p.opacity <= 0 || p.r <= 0) {
        newDataRef.current.splice(i, 1);
      }
    }

    if (particlesRemaining) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Animation Finished
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationFrameRef.current = null;
      // Set animating false first, then focus in a microtask
      setAnimating(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // console.log("Input focused after animation");
        }
      }, 0);
    }
  };

  // Redraw canvas when input value changes (only if not animating)
  useEffect(() => {
    if (!animating) {
      draw();
    }
  }, [inputValue, draw, animating]);

  // --- Core Logic Functions ---

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim() || isStreamingRef.current || animating) return;

      const currentInput = inputValue;

      setAnimating(true);
      draw(); // Draw the text that will vanish

      // Clear input visually *before* starting animation
      setInputValue("");

      if (newDataRef.current.length === 0) {
        // If no particles, skip animation loop but still manage state and focus
        setTimeout(() => {
          setAnimating(false);
          if (inputRef.current) inputRef.current.focus(); // Focus if animation skipped
        }, 100);
      } else {
        // Start the animation loop
        if (animationFrameRef.current)
          cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(animate);
      }

      // --- Chat Logic (runs concurrently) ---
      setApiError(null);

      const questionId = nextId;
      const newUserMessage: Message = {
        id: questionId,
        text: currentInput,
        type: "question",
      };
      const answerId = nextId + 1;
      const placeholderAnswer: Message = {
        id: answerId,
        text: "",
        type: "answer",
      };

      setMessages((prev) => [...prev, newUserMessage, placeholderAnswer]);
      setNextId((prev) => prev + 2);

      if (!isExpanded) setIsExpanded(true);

      const history: ApiHistoryItem[] = messages
        .filter((msg) => msg.text)
        .map((msg) => ({
          role: msg.type === "question" ? "user" : "assistant",
          content: msg.text,
        }));
      history.push({ role: "user", content: currentInput });

      setIsTyping(true);
      isStreamingRef.current = true;

      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

      // --- API Call ---
      try {
        const response = await fetch("/api/ask", {
          // MAKE SURE THIS API ROUTE EXISTS
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: currentInput, history }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const fullText = data.response;

        if (typeof fullText !== "string") {
          throw new Error("Invalid response format from API.");
        }

        // --- Typing Effect ---
        let index = 0;
        const typingSpeed = 30;
        typingIntervalRef.current = setInterval(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === answerId
                ? { ...msg, text: fullText.substring(0, index + 1) }
                : msg,
            ),
          );
          index++;
          if (index >= fullText.length) {
            if (typingIntervalRef.current)
              clearInterval(typingIntervalRef.current);
            setIsTyping(false);
            isStreamingRef.current = false;
            // Optional: refocus after typing if needed
            // setTimeout(() => { if (inputRef.current && document.activeElement !== inputRef.current) inputRef.current.focus(); }, 0);
          }
        }, typingSpeed);
      } catch (error) {
        console.error("API call or typing effect failed:", error);
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred.";
        setApiError(`Failed to get response: ${errorMessage}`);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === answerId
              ? { ...msg, text: "Sorry, an error occurred." }
              : msg,
          ),
        );
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        setIsTyping(false);
        isStreamingRef.current = false;
        // Focus on error if animation didn't already handle it
        setTimeout(() => {
          if (inputRef.current && document.activeElement !== inputRef.current)
            inputRef.current.focus();
        }, 0);
      }
    },
    [
      // Keep dependencies updated
      inputValue,
      messages,
      nextId,
      isExpanded,
      animating,
      draw,
      animate,
      setMessages,
      setNextId,
      setIsExpanded,
      setApiError,
      setIsTyping,
    ],
  );

  const clearMessages = () => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    setMessages([]);
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatNextId");
    setNextId(0);
    setApiError(null);
    setIsTyping(false);
    isStreamingRef.current = false;
    // Ensure focus returns after clearing
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 0);
  };

  if (!isVisible) return null;

  // --- JSX Rendering ---
  return (
    <motion.div
      className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 w-[98%] sm:w-full max-w-xl px-3 sm:px-6 z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Bubble particles */}
      {showBubbles && (
        <div className="absolute inset-x-0 bottom-0 h-20 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <BubbleParticle key={i} delay={i * 0.2} />
          ))}
        </div>
      )}

      {/* Messages container */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={chatContainerRef}
            className="relative mb-3 sm:mb-4 max-h-[70vh] sm:max-h-[400px] overflow-hidden rounded-2xl sm:rounded-3xl glass-card p-2.5 sm:p-4 pointer-events-auto"
            initial={{ opacity: 0, y: 60, scale: 0.8, height: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1, height: "auto" }}
            exit={{ opacity: 0, y: 60, scale: 0.8, height: 0 }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 180,
              mass: 0.8,
            }}
          >
            {/* Header */}
            <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-white/60 dark:via-blue-400/30 to-transparent rounded-full hidden sm:block"></div>
            <div className="flex justify-between items-center mb-2.5 sm:mb-4 pb-2 border-b border-gray-100/50 dark:border-gray-700/20">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Conversation with Youssef
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={clearMessages}
                  className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-blue-500/10 transition-colors active:scale-95 touch-manipulation"
                  aria-label="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-blue-500/10 transition-colors active:scale-95 touch-manipulation"
                  aria-label="Close conversation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* Messages Area */}
            <div className="overflow-y-auto max-h-[55vh] sm:max-h-[280px] pr-2 space-y-3 sm:space-y-4 scrollbar-thin overscroll-contain -mr-2 pr-4 pb-1">
              {apiError && (
                <motion.div
                  className="text-center text-red-600 dark:text-red-400 text-xs sm:text-sm p-2 bg-red-100/50 dark:bg-red-900/30 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {apiError}
                </motion.div>
              )}
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    layout
                    className={`flex ${message.type === "question" ? "justify-end" : "justify-start"} mb-1 sm:mb-0`}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{
                      type: "spring",
                      damping: 20,
                      stiffness: 200,
                      mass: 0.5,
                    }}
                  >
                    <div
                      className={cn(
                        "relative max-w-[90%] sm:max-w-[80%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-2.5 text-[15px] sm:text-sm whitespace-pre-wrap break-words leading-relaxed",
                        message.type === "question"
                          ? "glass-card-strong text-card-foreground rounded-tr-none"
                          : "glass-card text-card-foreground rounded-tl-none",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0 left-1/4 w-1/2 h-0.5 bg-gradient-to-r from-transparent to-transparent rounded-full",
                          message.type === "question"
                            ? "via-white/30"
                            : "via-white/50 dark:via-blue-400/20",
                          "hidden sm:block", // Hide decorative element on mobile for cleaner look
                        )}
                      ></div>
                      <p>
                        {message.text}
                        {message.type === "answer" &&
                          index === messages.length - 1 &&
                          isTyping && <TypingCursor />}
                        {message.type === "answer" &&
                          index === messages.length - 1 &&
                          isTyping &&
                          !message.text && <span>&nbsp;</span>}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="relative h-[52px] sm:h-14 overflow-hidden rounded-full bg-white/70 dark:bg-zinc-900/50 backdrop-blur-lg pl-4 pr-2 sm:pl-6 sm:pr-3 flex items-center border border-white/50 dark:border-blue-500/20 shadow-[0_8px_30px_rgba(0,0,0,0.12),_0_0_10px_rgba(120,120,255,0.1)] pointer-events-auto"
      >
        {/* Canvas for vanishing effect */}
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 w-full h-full pointer-events-none z-[5]",
            animating ? "opacity-100" : "opacity-0",
            "transition-opacity duration-100 ease-out", // Faster transition for canvas visibility
          )}
          aria-hidden="true"
        />
        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            if (!animating) setInputValue(e.target.value);
          }}
          onFocus={(e) => {
            if (!isExpanded) setIsExpanded(true);
            // Prevent default scrolling behavior
            e.preventDefault();
            // Store current scroll position
            const scrollY = window.scrollY;
            // Set timeout to restore scroll position after browserUse the input's focus method with preventScroll option to avoid scrolling
            e.currentTarget.focus({ preventScroll: true });
          }}
          placeholder="Ask me anything..."
          className={cn(
            "relative z-10 w-full h-full px-4 sm:px-6 pr-12",
            "bg-transparent border-none focus:outline-none focus:ring-0",
            "text-base sm:text-sm leading-normal placeholder-gray-500 dark:placeholder-gray-400",
            "min-h-[44px] py-2.5 sm:py-2", // Taller input for better touch targets on mobile
            // Make text transparent when animating and particles exist
            animating && newDataRef.current.length > 0
              ? "text-transparent dark:text-transparent caret-transparent"
              : "text-black dark:text-white",
            "transition-colors duration-100", // Transition text color change
            "touch-manipulation", // Improve touch behavior
          )}
          disabled={isStreamingRef.current} // Only disable during API call stream
          autoComplete="off"
          enterKeyHint="send"
          spellCheck="true"
          // onFocus handled above - removing duplicate handler
        />
        {/* Submit Button */}
        <button
          ref={submitButtonRef}
          type="submit"
          disabled={!inputValue.trim() || isStreamingRef.current || animating} // Disable during stream OR animation
          className={cn(
            "absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 z-20",
            "h-10 w-10 sm:h-8 sm:w-8 rounded-full",
            "bg-black dark:bg-gray-700",
            "transition duration-200 flex items-center justify-center",
            "active:scale-95 touch-manipulation", // Better touch feedback
            "hover:bg-gray-800 dark:hover:bg-gray-600",
            "tap-highlight-transparent", // Remove tap highlight on mobile
            "disabled:bg-gray-300 dark:disabled:bg-zinc-700/50",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          )}
          aria-label="Send message"
        >
          <Send className="h-[18px] w-[18px] sm:h-4 sm:w-4 text-gray-300 dark:text-white/90" />
        </button>
      </form>

      {/* CSS for scrollbar styling */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
          margin: 5px 0;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.4);
          border-radius: 20px;
          border: 1px solid transparent;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(155, 155, 155, 0.4) transparent;
        }
        .break-words {
          word-break: break-word;
          overflow-wrap: break-word;
        }

        /* iOS-specific fixes to prevent auto-scrolling */
        @supports (-webkit-touch-callout: none) {
          input[type="text"],
          input,
          textarea,
          select {
            font-size: 16px; /* Prevents zoom */
            -webkit-user-select: text; /* Better touch handling */
            user-select: text;
          }
          /* Prevent scroll anchoring behavior */
          * {
            overflow-anchor: none;
          }
          /* Additional fixes for iOS focus behavior */
          body {
            position: relative;
            width: 100%;
            height: 100%;
          }
          .fixed {
            position: fixed !important;
          }
          /* Additional iOS fixes */
          .scrollbar-thin {
            -webkit-overflow-scrolling: auto; /* Prevent momentum scrolling */
          }
        }
        .tap-highlight-transparent {
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        }
      `}</style>
    </motion.div>
  );
}
