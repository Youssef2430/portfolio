"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Trash2, Info } from "lucide-react";

// --- BubbleParticle Component (remains the same) ---
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

// --- TypingCursor Component (remains the same) ---
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

export function AskInput() {
  const [isVisible, setIsVisible] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextId, setNextId] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showBubbles, setShowBubbles] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null); // <-- Add ref for submit button
  const isStreamingRef = useRef(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages from localStorage on mount (remains the same)
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    const savedNextId = localStorage.getItem("chatNextId");

    if (savedMessages) {
      try {
        const parsedMessages: Message[] = JSON.parse(savedMessages);
        setMessages(parsedMessages);
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

  // Save messages to localStorage whenever they change (remains the same)
  useEffect(() => {
    const messagesToSave = messages.filter(
      (msg) => msg.text || msg.type === "question",
    );
    if (messagesToSave.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messagesToSave));
    }
    localStorage.setItem("chatNextId", JSON.stringify(nextId));
  }, [messages, nextId]);

  // Check footer visibility (remains the same)
  useEffect(() => {
    const checkFooterVisibility = () => {
      const footer = document.querySelector("footer");
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        setIsVisible(!(footerRect.top < windowHeight + 100));
      }
    };
    window.addEventListener("scroll", checkFooterVisibility);
    checkFooterVisibility();
    return () => window.removeEventListener("scroll", checkFooterVisibility);
  }, []);

  // Scroll to bottom (remains the same)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- MODIFIED: Handle click outside ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        isExpanded &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(target) && // Click is outside the message container
        inputRef.current &&
        !inputRef.current.contains(target) && // Click is not the input field
        submitButtonRef.current &&
        !submitButtonRef.current.contains(target) // Click is not the submit button
      ) {
        setIsExpanded(false); // Only close if click is outside all these elements
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // Add refs to dependency array
  }, [isExpanded, inputRef, submitButtonRef, chatContainerRef]); // <-- Added refs

  // Show/hide bubbles (remains the same)
  useEffect(() => {
    if (isExpanded) {
      setShowBubbles(true);
    } else {
      const timer = setTimeout(() => setShowBubbles(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Cleanup interval on unmount (remains the same)
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  // Handle API Call and Typing Effect (remains the same)
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim() || isStreamingRef.current) return;

      const currentInput = inputValue;
      setInputValue("");
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
      setNextId(nextId + 2);

      if (!isExpanded) {
        setIsExpanded(true);
      }

      const history: ApiHistoryItem[] = messages.map((msg) => ({
        role: msg.type === "question" ? "user" : "assistant",
        content: msg.text,
      }));
      history.push({ role: "user", content: currentInput });

      setIsTyping(true);
      isStreamingRef.current = true;

      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }

      try {
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: currentInput, history }),
        });

        if (!response.ok) {
          throw new Error(
            `API Error (${response.status}): ${await response.text()}`,
          );
        }

        const data = await response.json();
        const fullText = data.response;

        if (typeof fullText !== "string") {
          throw new Error("Invalid response format from API.");
        }

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
            if (typingIntervalRef.current) {
              clearInterval(typingIntervalRef.current);
              typingIntervalRef.current = null;
            }
            setIsTyping(false);
            isStreamingRef.current = false;
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
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
        isStreamingRef.current = false;
      }
    },
    [
      inputValue,
      messages,
      nextId,
      isExpanded,
      setMessages,
      setNextId,
      setIsExpanded,
      setApiError,
      setIsTyping,
    ],
  );

  // Clear messages (remains the same)
  const clearMessages = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setMessages([]);
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatNextId");
    setNextId(0);
    setApiError(null);
    setIsTyping(false);
    isStreamingRef.current = false;
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
      {/* Bubble particles (remains the same) */}
      {showBubbles && (
        <>
          {Array.from({ length: 15 }).map((_, i) => (
            <BubbleParticle key={i} delay={i * 0.2} />
          ))}
        </>
      )}

      {/* Messages container (remains the same) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={chatContainerRef}
            className="relative mb-4 max-h-[60vh] sm:max-h-[400px] overflow-hidden rounded-3xl bg-white/70 dark:bg-zinc-900/50 backdrop-blur-lg p-3 sm:p-4 border border-white/50 dark:border-blue-500/20 shadow-[0_8px_30px_rgba(0,0,0,0.12),_0_0_10px_rgba(120,120,255,0.1)]"
            initial={{ opacity: 0, y: 60, scale: 0.8, height: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1, height: "auto" }}
            exit={{ opacity: 0, y: 60, scale: 0.8, height: 0 }}
            transition={{
              type: "spring",
              damping: 12,
              stiffness: 150,
              mass: 0.8,
            }}
          >
            {/* Header and messages content remains the same */}
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
                    className={`flex ${message.type === "question" ? "justify-end" : "justify-start"}`}
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
                      className={`relative max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 ${
                        message.type === "question"
                          ? "bg-gradient-to-br from-black to-gray-800 text-white dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 rounded-tr-none shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
                          : "bg-gradient-to-br from-white/90 to-gray-100/90 text-black dark:from-gray-800/80 dark:to-gray-900/80 dark:text-gray-200 rounded-tl-none shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
                      }`}
                    >
                      <div
                        className={`absolute top-0 left-1/4 w-1/2 h-0.5 bg-gradient-to-r from-transparent ${message.type === "question" ? "via-white/30" : "via-white/50 dark:via-blue-400/20"} to-transparent rounded-full`}
                      ></div>
                      <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
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
        className="relative bg-white/90 dark:bg-zinc-800/80 backdrop-blur-sm h-10 sm:h-12 rounded-full overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.1),_0_0_0_1px_rgba(255,255,255,0.1)]"
      >
        <input
          ref={inputRef} // Ref already exists
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about Youssef..."
          className="w-full h-full px-3 sm:px-6 pr-10 sm:pr-12 bg-transparent border-none focus:outline-none focus:ring-0 text-xs sm:text-base"
          disabled={isStreamingRef.current}
        />
        <button
          ref={submitButtonRef} // <-- Attach the ref here
          type="submit"
          disabled={!inputValue.trim() || isStreamingRef.current}
          className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-full disabled:bg-gray-100/80 bg-black dark:bg-gray-700 dark:disabled:bg-zinc-700/30 transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300 dark:text-white/90" />
        </button>
      </form>

      {/* CSS for scrollbar styling (remains the same) */}
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
        .break-words {
          word-break: break-word; /* Ensure long words wrap */
        }
      `}</style>
    </motion.div>
  );
}
