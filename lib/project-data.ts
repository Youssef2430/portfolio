import type React from "react";
export type ProjectDetail = {
  id: string;
  title: string;
  category: string;
  description: string[];
  image: string;
  imageLink?: string;
  hoverPreview?: {
    device: "mac" | "iphone" | "browser" | "tv" | "watch";
    src: string;
    darkSrc?: string;
    fit?: "cover" | "contain";
    objectPosition?: string;
    aspectRatio?: string;
  };
  technologies: string[];
  /** Section anchors on the case study page, in reading order. */
  chapters?: { id: string; label: string }[];
  timeline?: string;
  contributors?: string[];
  link?: string;
  size?: "small" | "large";
  icon?: React.ReactNode;
};

export const projects: ProjectDetail[] = [
  {
    id: "glui",
    title: "GLUI",
    category: "macOS Agent Workspace",
    description: [
      "Evolved Clui into GLUI, a floating macOS workspace for Claude Code, Codex, and OpenCode, with a new burgundy identity, native Liquid Glass, and a compact interface for conversations, tools, and approvals.",
      "Integrated the Electron and React pill with T3 Code’s Orchestrator V2 runtime through isolated preload and private IPC, bringing durable conversations, agent handoffs, branching, queued prompts, and restart recovery into the overlay.",
      "Extended the Clui CC foundation with local voice transcription, attachments, a shared skills directory, and native CLI continuation using existing agent authentication. Current releases support Apple Silicon, with Clui v0.1.17 preserved for Intel Macs.",
    ],
    image: "/glui/social.png",
    hoverPreview: {
      device: "mac",
      src: "/glui/social.png",
      objectPosition: "center",
    },
    technologies: [
      "Electron",
      "React",
      "TypeScript",
      "Zustand",
      "Orchestrator V2",
      "SQLite",
      "AppKit",
      "Liquid Glass",
      "Claude Code",
      "Codex",
      "OpenCode",
      "Local Voice Transcription",
    ],
    chapters: [
      { id: "idea", label: "Why it exists" },
      { id: "experience", label: "Using it" },
      { id: "architecture", label: "How it works" },
      { id: "get-started", label: "Install" },
    ],
    timeline: "Recent",
    contributors: ["Youssef Chouay"],
    link: "https://github.com/yssf-c/glui",
    size: "large",
  },
  {
    id: "ramelli",
    title: "Ramelli",
    category: "Full-Stack SaaS Platform",
    description: [
      "Built a multi-model AI chat platform with a Turborepo monorepo using Next.js 14, Convex, Cloudflare R2 and Redis, supporting 30+ LLMs across 9 providers through a unified OpenRouter abstraction, generating over $3,000 in profit.",
      "Engineered a custom DAG-based workflow orchestration engine powering agentic research pipelines (deep research, pro search) with parallel task fan-out, typed event-driven state, retry/timeout policies, and Langfuse tracing per generation.",
      "Integrated Clerk for authentication and subscription billing, atomic Redis Lua scripts for thread-safe credit deduction, and a production observability stack spanning Sentry, PostHog, Axiom, and OpenTelemetry for error tracking, product analytics, and distributed tracing.",
    ],
    image: "/ramelli/macbook-light.png",
    imageLink: "/ramelli/ipad-light.png",
    hoverPreview: {
      device: "mac",
      src: "/ramelli/macbook-light.png",
      darkSrc: "/ramelli/macbook-dark.png",
      objectPosition: "center top",
    },
    technologies: [
      "Next.js 14",
      "TypeScript",
      "Convex",
      "Redis",
      "Turborepo",
      "OpenRouter",
      "Clerk",
      "Vercel AI SDK",
      "Langfuse",
      "Sentry",
      "PostHog",
      "OpenTelemetry",
      "Cloudflare R2",
      "Zustand",
      "Radix UI",
    ],
    chapters: [
      { id: "overview", label: "The idea" },
      { id: "workflow", label: "The research engine" },
      { id: "product", label: "On every screen" },
      { id: "models", label: "The models" },
    ],
    timeline: "Recent",
    contributors: ["Youssef Chouay"],
    link: "https://ramelli.chat/chat",
    size: "large",
  },
  {
    id: "gallery-glow",
    title: "Gallery Glow",
    category: "Apple TV Art Gallery",
    description: [
      "A private art gallery for Apple TV, pairing classic paintings with ambient gradients and a different free artwork every day.",
      "Built in SwiftUI for tvOS, with remote-friendly focus navigation, light and dark appearances, and a Top Shelf extension that brings the collection to the Apple TV home screen.",
      "Integrated a one-time Lifetime unlock with StoreKit, alongside full-screen artwork and five animated ambient scenes.",
    ],
    image: "/gallery-glow/home-light.webp",
    hoverPreview: {
      device: "tv",
      src: "/gallery-glow/home-light.webp",
      darkSrc: "/gallery-glow/home-dark.webp",
      fit: "contain",
      aspectRatio: "16 / 9",
    },
    technologies: ["Swift", "SwiftUI", "tvOS", "StoreKit", "TVServices"],
    chapters: [
      { id: "collection", label: "Inside the app" },
      { id: "craft", label: "Behind the frame" },
    ],
    timeline: "2026",
    contributors: ["Youssef Chouay"],
    link: "https://yssf-c.github.io/Gallery-Glow/",
    size: "large",
  },
  {
    id: "biketrack",
    title: "BikeTrack",
    category: "Apple Watch Training App",
    description: [
      "An Apple Watch app that brings your equipment’s power and cadence together with live heart rate, training zones, and workout summaries.",
      "Connected compatible bikes and treadmills over Core Bluetooth, with a separate RideCore Swift package for Bluetooth packet parsing and workout analytics.",
      "Built a native SwiftUI interface with editable heart-rate and power zones, and HealthKit workout recording for Apple Health and Fitness. Free and open source, with no account or subscription.",
    ],
    image: "/biketrack/social.jpg",
    hoverPreview: { device: "watch", src: "/biketrack/heart.webp", fit: "contain" },
    technologies: ["Swift", "SwiftUI", "watchOS", "Core Bluetooth", "HealthKit", "Swift Package Manager"],
    chapters: [
      { id: "experience", label: "On the watch" },
      { id: "engineering", label: "How it’s built" },
    ],
    timeline: "2026",
    contributors: ["Youssef Chouay"],
    link: "https://yssf-c.github.io/BikeTrack/",
    size: "small",
  },
  // {
  //   id: "chess-llm-benchmark",
  //   title: "Chess LLM Benchmark",
  //   category: "AI/ML Research Project",
  //   description: [
  //     "Engineered a sophisticated chess LLM evaluation framework using Python and asyncio that rigorously benchmarks large language models against Stockfish at calibrated ELO ratings, providing unprecedented insights into AI chess capabilities and strategic reasoning.",
  //     "Implemented an advanced prompt engineering system with persistent game-state memory that enables LLMs to maintain full contextual awareness throughout matches, reducing illegal move rates by 40% and dramatically improving strategic decision-making quality.",
  //     "Architected a high-performance, provider-agnostic system supporting OpenAI GPT, Anthropic Claude, and Google Gemini models with robust error handling, real-time performance metrics, and comprehensive PGN analysis for competitive intelligence and model comparison.",
  //   ],
  //   image: "/chessllm.png",
  //   imageLink: "/chessllm-github.png",
  //   technologies: [
  //     "Python",
  //     "asyncio",
  //     "Stockfish",
  //     "OpenAI API",
  //     "Anthropic API",
  //     "Google AI API",
  //     "PGN Analysis",
  //     "Prompt Engineering",
  //     "ELO Rating System",
  //   ],
  //   timeline: "Recent",
  //   contributors: ["Youssef Chouay"],
  //   link: "https://github.com/yourusername/chessLLM",
  //   size: "large",
  // },
  {
    id: "mugshot",
    title: "Mugshot",
    category: "iOS Application",
    description: [
      "A quiet coffee journal for iPhone and iPad. Photograph a cup, save it to your calendar, and get to know your coffee habits.",
      "Built with SwiftUI and on-device Vision for drink suggestions and photo cutouts. Local storage, WidgetKit, and optional Apple Health sync keep the daily ritual close.",
    ],
    image: "/mugshot/icon.png",
    imageLink: "/mugshot/wrapped-light.PNG",
    hoverPreview: {
      device: "iphone",
      src: "/mugshot/calendar-light.webp",
      darkSrc: "/mugshot/calendar-dark.webp",
      objectPosition: "center top",
    },
    technologies: [
      "Swift",
      "SwiftUI",
      "Vision",
      "Core Image",
      "WidgetKit",
      "HealthKit",
    ],
    chapters: [
      { id: "ritual", label: "How it works" },
      { id: "craft", label: "How it’s built" },
    ],
    timeline: "Jun 2026",
    contributors: ["Youssef Chouay"],
    link: "https://yssf-c.github.io/Mugshot/",
    size: "small",
  },
  // {
  //   id: "ledgerglass",
  //   title: "LedgerGlass, Privacy-First macOS Finance App",
  //   category: "Personal Project",
  //   description: [
  //     "Built a Mac-native, privacy-first personal finance app with SwiftUI and SwiftData; imports bank CSVs and keeps all data fully on-device.",
  //     "Implemented on-device categorization using Apple’s NaturalLanguage embeddings with a light rules layer for accurate, offline labeling.",
  //     "Designed a color-coded Subscriptions Calendar and analytics dashboards (cash-flow, category breakdowns) with fast, keyboard-first ergonomics.",
  //   ],
  //   image: "/glassUI.png",
  //   imageLink: "/ledgerUI-github.png",
  //   technologies: [
  //     "Swift",
  //     "SwiftUI",
  //     "SwiftData",
  //     "NaturalLanguage",
  //     "Charts",
  //     "macOS",
  //   ],
  //   timeline: "Jul 2025 - Present",
  //   contributors: ["Youssef Chouay"],
  //   link: "https://github.com/yssf-c/ledgerUI",
  //   size: "small",
  // },
  {
    id: "nlp-phishing-detection",
    title: "NLP Phishing Detection",
    category: "Bell Canada Research Project",
    description: [
      "Built a phishing-email detector with fine-tuned DistilBERT and RoBERTa classifiers, plus OpenAI, Claude, and Ollama inference adapters behind one model-selection interface.",
      "Shipped a Flask API that preloads the models at startup, exposes GET /detect_phishing, and was containerized with Docker for deployment on a Hetzner VPS behind Nginx and Let's Encrypt SSL.",
      "Connected the backend to a Manifest V3 Chrome extension that reads the open Gmail message, sends the cleaned email body to the detector, and injects a Safe or Caution badge directly into the inbox UI.",
    ],
    image: "/NLP-phishing/capstone-light.png",
    imageLink: "/NLP-phishing/capstone-phishing-light.png",
    hoverPreview: {
      device: "browser",
      src: "/NLP-phishing/capstone-light.png",
      darkSrc: "/NLP-phishing/capstone-dark.png",
      fit: "contain",
      objectPosition: "center top",
      aspectRatio: "16 / 9",
    },
    technologies: [
      "Python",
      "Transformers",
      "PyTorch",
      "RoBERTa",
      "DistilBERT",
      "NLP",
      "OpenAI",
      "Anthropic",
      "Ollama",
      "Flask",
      "Docker",
      "Nginx",
      "Chrome Extension API"
    ],
    chapters: [
      { id: "overview", label: "In the inbox" },
      { id: "scanner", label: "Try a message" },
      { id: "pipeline", label: "The system" },
      { id: "models", label: "The models" },
    ],
    timeline: "Jan 2024 - Dec 2024",
    contributors: ["Youssef Chouay", "Group 30 Capstone Team"],
    link: "https://github.com/capstone-2024-T91/Image-Processing-and-NLP-for-Brand-Protection",
    size: "large",
  },
];

export function getProjectById(id: string): ProjectDetail | undefined {
  return projects.find((project) => project.id === id);
}
