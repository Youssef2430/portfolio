"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Trash2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ReactMarkdown from "react-markdown";

// Utility function for combining class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Loading Cube Component (Conductor style) ---
const LoadingCube = () => {
  // 3x3 grid of dots
  const dots = Array.from({ length: 9 });

  return (
    <div className="flex items-center gap-3 py-1">
      <div className="grid grid-cols-3 gap-[3px] w-[18px] h-[18px]">
        {dots.map((_, i) => (
          <motion.div
            key={i}
            className="w-[4px] h-[4px] rounded-[1px] bg-[hsl(var(--gold))]"
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      <span className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
        thinking...
      </span>
    </div>
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
    // Scroll to bottom when new messages are added (user query or after AI finishes)
    if (messagesEndRef.current && messages.length > 0) {
      const parent = messagesEndRef.current.parentElement;
      if (parent) {
        parent.scrollTop = parent.scrollHeight;
      }
    }
  }, [messages.length]);

  // Clean implementation to prevent scroll-to-top on mobile input focus
  useEffect(() => {
    const preventScrollOnFocus = () => {
      const scrollPosition = window.pageYOffset;
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 0);
    };

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
      p.opacity -= 0.008;
      p.r = Math.max(0, p.r - 0.01);
      p.vx *= 0.99;
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationFrameRef.current = null;
      setAnimating(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
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
      draw();

      setInputValue("");

      if (newDataRef.current.length === 0) {
        setTimeout(() => {
          setAnimating(false);
          if (inputRef.current) inputRef.current.focus();
        }, 100);
      } else {
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
        setTimeout(() => {
          if (inputRef.current && document.activeElement !== inputRef.current)
            inputRef.current.focus();
        }, 0);
      }
    },
    [
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
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 0);
  };

  if (!isVisible) return null;

  // --- JSX Rendering ---
  return (
    <motion.div
      className="fixed bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 w-[95%] sm:w-full max-w-lg px-4 sm:px-6 z-40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Messages container */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={chatContainerRef}
            className="relative mb-3 sm:mb-4 max-h-[65vh] sm:max-h-[400px] overflow-hidden bg-black border border-[hsl(var(--border))] rounded-lg pointer-events-auto"
            initial={{ opacity: 0, y: 40, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 40, height: 0 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 200,
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Conversation
                </span>
                <span className="text-[hsl(var(--gold))] opacity-50">「</span>
                <span className="text-[hsl(var(--gold))] font-arabic text-base">محادثة</span>
                <span className="text-[hsl(var(--gold))] opacity-50">」</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearMessages}
                  className="p-2 text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--muted))] transition-all duration-300 active:scale-95"
                  aria-label="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--muted))] transition-all duration-300 active:scale-95"
                  aria-label="Close conversation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="overflow-y-auto max-h-[50vh] sm:max-h-[300px] p-4 space-y-4 scrollbar-thin">
              {apiError && (
                <motion.div
                  className="text-center text-red-400 text-xs font-mono p-3 bg-red-900/20 border border-red-900/50"
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
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      type: "spring",
                      damping: 25,
                      stiffness: 300,
                    }}
                  >
                    <div
                      className={cn(
                        "relative max-w-[85%] sm:max-w-[80%] px-4 py-3 text-sm whitespace-pre-wrap break-words leading-relaxed",
                        message.type === "question"
                          ? "bg-[hsl(var(--gold))] text-black rounded-[20px] rounded-br-[4px]"
                          : "bg-[hsl(var(--card))] text-white border border-[hsl(var(--border))] rounded-[20px] rounded-bl-[4px]",
                      )}
                    >
                      {message.type === "answer" && (
                        <span className="block text-[10px] text-[hsl(var(--gold))] uppercase tracking-widest mb-1.5 font-mono">
                          Youssef&apos;s AI
                        </span>
                      )}
                      {message.type === "answer" &&
                        index === messages.length - 1 &&
                        isTyping &&
                        !message.text ? (
                        <LoadingCube />
                      ) : message.type === "answer" ? (
                        <div className="text-sm leading-relaxed [&_strong]:font-semibold [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded [&_code]:text-[hsl(var(--gold))] [&_a]:text-[hsl(var(--gold))] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:ml-0 [&_p+p]:mt-2">
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{message.text}</p>
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
        className="relative h-14 overflow-hidden bg-black border border-[hsl(var(--border))] rounded-lg flex items-center pointer-events-auto transition-all duration-300 hover:border-[hsl(var(--gold))/0.3]"
      >
        {/* Canvas for vanishing effect */}
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 w-full h-full pointer-events-none z-[5]",
            animating ? "opacity-100" : "opacity-0",
            "transition-opacity duration-100 ease-out",
          )}
          aria-hidden="true"
        />

        {/* Arabic decoration */}
        <div className="absolute left-4 text-[hsl(var(--gold))] opacity-40 font-arabic text-sm pointer-events-none">
          「
        </div>

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
            e.preventDefault();
            e.currentTarget.focus({ preventScroll: true });
          }}
          placeholder="Ask me anything..."
          className={cn(
            "relative z-10 w-full h-full pl-8 pr-14",
            "bg-transparent border-none focus:outline-none focus:ring-0",
            "text-sm font-mono placeholder:text-[hsl(var(--muted-foreground))] placeholder:font-mono placeholder:text-xs placeholder:uppercase placeholder:tracking-wider",
            animating && newDataRef.current.length > 0
              ? "text-transparent caret-transparent"
              : "text-white",
            "transition-colors duration-100",
          )}
          disabled={isStreamingRef.current}
          autoComplete="off"
          enterKeyHint="send"
          spellCheck="true"
        />

        {/* Arabic decoration */}
        <div className="absolute right-14 text-[hsl(var(--gold))] opacity-40 font-arabic text-sm pointer-events-none">
          」
        </div>

        {/* Submit Button */}
        <button
          ref={submitButtonRef}
          type="submit"
          disabled={!inputValue.trim() || isStreamingRef.current || animating}
          className={cn(
            "absolute right-0 top-0 bottom-0 z-20",
            "w-14 border-l border-[hsl(var(--border))]",
            "bg-transparent hover:bg-[hsl(var(--gold))]",
            "transition-all duration-300 flex items-center justify-center group",
            "active:scale-95",
            "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent",
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:text-black transition-colors duration-300" />
        </button>
      </form>

      {/* Hint text */}
      <motion.p
        className="text-center mt-3 text-[10px] font-mono text-[hsl(var(--muted-foreground))] uppercase tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Ask Youssef&apos;s AI anything
      </motion.p>

      {/* CSS for scrollbar styling */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: hsl(var(--muted));
          border-radius: 0;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: hsl(var(--gold));
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--muted)) transparent;
        }
        .break-words {
          word-break: break-word;
          overflow-wrap: break-word;
        }

        /* iOS-specific fixes */
        @supports (-webkit-touch-callout: none) {
          input[type="text"],
          input,
          textarea,
          select {
            font-size: 16px;
            -webkit-user-select: text;
            user-select: text;
          }
          * {
            overflow-anchor: none;
          }
        }
      `}</style>
    </motion.div>
  );
}
