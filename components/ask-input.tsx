"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Trash2 } from "lucide-react";

// Enhanced bubble particle component with popping effect
const BubbleParticle = ({ delay = 0 }: { delay?: number }) => {
  const randomX = Math.random() * 100 - 50; // Random X position between -50 and 50
  const randomSize = Math.random() * 8 + 4; // Random size between 4 and 12
  const randomDuration = Math.random() * 3 + 2; // Random duration between 2 and 5 seconds
  const randomDistance = -150 - Math.random() * 100; // Random float distance (higher up)

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
        y: [0, randomDistance], // Float all the way up
        opacity: [0, 0.7, 0.9, 0], // Fade in then out
        scale: [0.5, 1, 1.2, 0], // Pop at the end
        x: [0, randomX / 2, randomX], // Drift sideways
      }}
      transition={{
        duration: randomDuration,
        times: [0, 0.7, 0.9, 1], // Control timing of keyframes
        ease: "easeOut",
        delay: delay,
        repeat: Number.POSITIVE_INFINITY,
        repeatDelay: Math.random() * 2,
      }}
    />
  );
};

// Typing cursor component
const TypingCursor = () => {
  return (
    <motion.span
      className="inline-block w-[2px] h-[14px] ml-[1px] bg-black dark:bg-white align-middle"
      animate={{ opacity: [1, 0, 1] }}
      transition={{
        duration: 0.8,
        repeat: Number.POSITIVE_INFINITY,
        ease: "steps(3)",
      }}
    />
  );
};

export function AskInput() {
  const [isVisible, setIsVisible] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; type: "question" | "answer" }>
  >([]);
  const [nextId, setNextId] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState("");
  const [fullResponseText, setFullResponseText] = useState("");
  const [showBubbles, setShowBubbles] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    const savedNextId = localStorage.getItem("chatNextId");

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    }

    if (savedNextId) {
      try {
        setNextId(JSON.parse(savedNextId));
      } catch (e) {
        console.error("Failed to parse saved nextId", e);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    localStorage.setItem("chatNextId", JSON.stringify(nextId));
  }, [messages, nextId]);

  // Check if we're near the footer to hide the input
  useEffect(() => {
    const checkFooterVisibility = () => {
      const footer = document.querySelector("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // If footer is visible or close to being visible, hide the input
        if (footerRect.top < windowHeight + 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener("scroll", checkFooterVisibility);
    // Initial check
    checkFooterVisibility();

    return () => {
      window.removeEventListener("scroll", checkFooterVisibility);
    };
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTypingText]);

  // Handle click outside to close expanded chat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  // Show bubbles when chat is expanded
  useEffect(() => {
    if (isExpanded) {
      setShowBubbles(true);
    } else {
      // Delay hiding bubbles to allow exit animation
      const timer = setTimeout(() => {
        setShowBubbles(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Enhanced typing effect function for more human-like typing
  const typeText = useCallback((text: string) => {
    setIsTyping(true);
    setFullResponseText(text);
    setCurrentTypingText("");

    // Split text into words and punctuation
    const words = text.split(/(\s+|\.|,|!|\?|:|;)/g).filter(Boolean);
    let currentIndex = 0;
    let currentPosition = 0;

    const typeNextChunk = () => {
      if (currentIndex < words.length) {
        const word = words[currentIndex];
        setCurrentTypingText((prev) => prev + word);
        currentIndex++;
        currentPosition += word.length;

        // Calculate next delay based on what was just typed
        let nextDelay = 0;

        // Longer pause after punctuation
        if (/[.!?]/.test(word)) {
          nextDelay = 300 + Math.random() * 200; // 300-500ms pause after sentence end
        }
        // Medium pause after comma, colon, semicolon
        else if (/[,;:]/.test(word)) {
          nextDelay = 150 + Math.random() * 100; // 150-250ms pause after comma
        }
        // Short pause after space
        else if (/\s+/.test(word)) {
          nextDelay = 40 + Math.random() * 30; // 40-70ms pause after space
        }
        // Variable typing speed for words
        else {
          // Faster for short words, slower for longer words
          const baseDelay = Math.min(40, 10 + word.length * 5);
          nextDelay = baseDelay + Math.random() * 20; // Add some randomness
        }

        typingTimeoutRef.current = setTimeout(typeNextChunk, nextDelay);
      } else {
        setIsTyping(false);
        // Add the fully typed message to the messages array
        setMessages((prev) => {
          const updatedMessages = [...prev];
          // Replace the last message with the full message
          if (
            updatedMessages.length > 0 &&
            updatedMessages[updatedMessages.length - 1].type === "answer"
          ) {
            updatedMessages[updatedMessages.length - 1].text = text;
          }
          return updatedMessages;
        });
      }
    };

    // Add initial thinking delay before starting to type
    setTimeout(
      () => {
        typeNextChunk();
      },
      300 + Math.random() * 200,
    ); // 300-500ms initial thinking delay

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user question
    const questionId = nextId;
    setMessages((prev) => [
      ...prev,
      { id: questionId, text: inputValue, type: "question" },
    ]);
    setNextId(nextId + 1);
    setInputValue("");

    // Expand the chat if it's not already expanded
    setIsExpanded(true);

    // Add a placeholder for the answer that will be typed
    setMessages((prev) => [
      ...prev,
      { id: nextId + 1, text: "", type: "answer" },
    ]);
    setNextId(nextId + 2);

    // Generate response
    setTimeout(() => {
      let responseText = "";

      if (inputValue.toLowerCase().includes("project")) {
        responseText =
          "Youssef has worked on several projects including NLP Phishing Detection, GeeGee's Intramural website, and a Distributed File Storage System.";
      } else if (inputValue.toLowerCase().includes("skill")) {
        responseText =
          "Youssef's skills include Python, Java, Go, Rust, C/C++, JavaScript/TypeScript, and various frameworks like React, Node.js, and TensorFlow.";
      } else if (
        inputValue.toLowerCase().includes("study") ||
        inputValue.toLowerCase().includes("education")
      ) {
        responseText =
          "Youssef studied at the University of Ottawa, completing a Bachelor of Applied Science in Software Engineering and is currently pursuing a Masters in Computer Science.";
      } else if (
        inputValue.toLowerCase().includes("experience") ||
        inputValue.toLowerCase().includes("work")
      ) {
        responseText =
          "Youssef has worked as an AI Researcher at the National Research Council, a Junior Software Engineer at Wind River Systems, and a Software Developer at the University of Ottawa.";
      } else {
        responseText =
          "Youssef is a software engineer and AI researcher with a passion for creating elegant, efficient solutions to complex problems.";
      }

      // Start typing effect
      typeText(responseText);
    }, 500);
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatNextId");
    setNextId(0);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-xl px-4 sm:px-6 z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Bubble particles */}
      {showBubbles && (
        <>
          {Array.from({ length: 15 }).map((_, i) => (
            <BubbleParticle key={i} delay={i * 0.2} />
          ))}
        </>
      )}

      {/* Messages container */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={chatContainerRef}
            className="relative mb-4 max-h-[60vh] sm:max-h-[400px] overflow-hidden rounded-3xl bg-white/70 dark:bg-zinc-900/50 backdrop-blur-lg p-3 sm:p-4 border border-white/50 dark:border-blue-500/20 shadow-[0_8px_30px_rgba(0,0,0,0.12),_0_0_10px_rgba(120,120,255,0.1)]"
            initial={{
              opacity: 0,
              y: 60,
              scale: 0.8,
              height: 0,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              y: 60,
              scale: 0.8,
              height: 0,
            }}
            transition={{
              type: "spring",
              damping: 12,
              stiffness: 150,
              mass: 0.8,
            }}
          >
            {/* Bubble shine effect */}
            <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-white/60 dark:via-blue-400/30 to-transparent rounded-full"></div>

            <div className="flex justify-between items-center mb-3 sm:mb-4 pb-2 border-b border-gray-100/50 dark:border-gray-700/20">
              <h3 className="text-xs sm:text-sm font-medium">
                Conversation with Youssef
              </h3>
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={clearMessages}
                  className="p-1 sm:p-1.5 rounded-full hover:bg-white/30 dark:hover:bg-blue-500/10 transition-colors"
                  aria-label="Clear conversation"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 sm:p-1.5 rounded-full hover:bg-white/30 dark:hover:bg-blue-500/10 transition-colors"
                  aria-label="Close conversation"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[50vh] sm:max-h-[280px] pr-2 space-y-3 sm:space-y-4 scrollbar-thin">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.type === "question" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{
                      type: "spring",
                      damping: 20,
                      stiffness: 300,
                      mass: 0.8,
                    }}
                  >
                    <div
                      className={`relative max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 ${
                        message.type === "question"
                          ? "bg-gradient-to-br from-black to-gray-800 text-white dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 rounded-tr-none shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
                          : "bg-gradient-to-br from-white/90 to-gray-100/90 text-black dark:from-gray-800/80 dark:to-gray-900/80 dark:text-gray-200 rounded-tl-none shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
                      }`}
                    >
                      {/* Bubble shine effect */}
                      <div
                        className={`absolute top-0 left-1/4 w-1/2 h-0.5 bg-gradient-to-r from-transparent ${message.type === "question" ? "via-white/30" : "via-white/50 dark:via-blue-400/20"} to-transparent rounded-full`}
                      ></div>

                      {/* Message text with cursor effect during typing */}
                      {message.type === "answer" &&
                      index === messages.length - 1 &&
                      isTyping ? (
                        <p className="text-xs sm:text-sm whitespace-pre-wrap">
                          {currentTypingText}
                          <TypingCursor />
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm whitespace-pre-wrap">
                          {message.text}
                        </p>
                      )}
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
        className="relative bg-white/90 dark:bg-zinc-800/80 backdrop-blur-sm h-10 sm:h-12 rounded-full overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.1),_0_0_0_1px_rgba(255,255,255,0.1)]"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about Youssef..."
          className="w-full h-full px-3 sm:px-6 pr-10 sm:pr-12 bg-transparent border-none focus:outline-none focus:ring-0 text-xs sm:text-base"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-full disabled:bg-gray-100/80 bg-black dark:bg-gray-700 dark:disabled:bg-zinc-700/30 transition duration-200 flex items-center justify-center"
        >
          <Send className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300 dark:text-white/90" />
        </button>
      </form>

      {/* Add CSS for scrollbar styling */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.5);
          border-radius: 20px;
        }
      `}</style>
    </motion.div>
  );
}
