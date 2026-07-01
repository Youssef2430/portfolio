import type React from "react";
export type ProjectDetail = {
  id: string;
  title: string;
  category: string;
  description: string[];
  image: string;
  imageLink?: string;
  hoverPreview?: {
    device: "mac" | "iphone" | "browser";
    src: string;
    darkSrc?: string;
    fit?: "cover" | "contain";
    objectPosition?: string;
    aspectRatio?: string;
  };
  technologies: string[];
  timeline?: string;
  contributors?: string[];
  link?: string;
  size?: "small" | "large";
  icon?: React.ReactNode;
};

export const projects: ProjectDetail[] = [
  {
    id: "clui",
    title: "Clui",
    category: "Desktop Application",
    description: [
      "Built a macOS floating desktop overlay for the Claude Code CLI using Electron 35, React 19, and Zustand, providing a transparent always-on-top chat interface with multi-tab session management, toggled via a global hotkey.",
      "Engineered a custom permission approval system with a local HTTP hook server intercepting tool calls (Bash, Edit, Write), featuring per-launch secrets, per-run tokens, 5-minute auto-deny timeouts, and a renderer-driven Allow/Deny card UI for granular tool authorization.",
      "Integrated a skills marketplace fetching plugin catalogs from Anthropic GitHub repos, voice input via Whisper transcription, file/screenshot attachments, conversation history resumption, slash commands, live todo tracking, and auto-updates via GitHub Releases.",
    ],
    image: "/clui_tasks_audio.jpeg",
    imageLink: "/clui_context_usage.jpeg",
    hoverPreview: {
      device: "mac",
      src: "/clui/home-light.jpeg",
      darkSrc: "/clui/home-dark.jpeg",
      objectPosition: "center",
    },
    technologies: [
      "Electron 35",
      "React 19",
      "TypeScript",
      "Zustand",
      "Tailwind CSS 4",
      "Framer Motion",
      "Vite",
      "node-pty",
      "Claude Code CLI",
      "Radix UI",
      "Phosphor Icons",
      "electron-updater",
      "react-markdown",
      "Whisper",
    ],
    timeline: "Recent",
    contributors: ["Youssef Chouay"],
    link: "https://github.com/Youssef2430/clui",
    size: "large",
  },
  {
    id: "atlasllm",
    title: "AtlasLLM",
    category: "Full-Stack SaaS Platform",
    description: [
      "Built a multi-model AI chat platform with a Turborepo monorepo using Next.js 14, Convex, Cloudflare R2 and Redis, supporting 30+ LLMs across 9 providers through a unified OpenRouter abstraction, generating over $3,000 in profit.",
      "Engineered a custom DAG-based workflow orchestration engine powering agentic research pipelines (deep research, pro search) with parallel task fan-out, typed event-driven state, retry/timeout policies, and Langfuse tracing per generation.",
      "Integrated Clerk for authentication and subscription billing, atomic Redis Lua scripts for thread-safe credit deduction, and a production observability stack spanning Sentry, PostHog, Axiom, and OpenTelemetry for error tracking, product analytics, and distributed tracing.",
    ],
    image: "/atlasllm-welcome.png",
    imageLink: "/atlasllm-conv.png",
    hoverPreview: {
      device: "mac",
      src: "/atlasllm/macbook-light.png",
      darkSrc: "/atlasllm/macbook-dark.png",
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
    timeline: "Recent",
    contributors: ["Youssef Chouay"],
    link: "https://atlasllm.chat/",
    size: "large",
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
      "Built a SwiftUI iOS coffee journal where the core loop is take a photo, let the app cut it into a die-cut sticker, then drop that sticker onto a calendar day: a warm cafe-scrapbook take on caffeine tracking.",
      "Wrote an on-device sticker pipeline: Vision foreground lift on iOS 17+, a classical flood-fill background remover, and a rounded-crop fallback, plus an Apple Intelligence Foundation Model that names the drink and estimates its caffeine.",
      "Persisted everything locally as JSON and image files with an atomic backup manifest, refreshed WidgetKit snapshots after each save, and added optional HealthKit caffeine sync, a daily-limit meter, and a shareable monthly Wrapped recap.",
    ],
    image: "/mugshot/icon.png",
    imageLink: "/mugshot/wrapped-light.PNG",
    hoverPreview: {
      device: "iphone",
      src: "/mugshot/home-light.PNG",
      darkSrc: "/mugshot/home-dark.PNG",
      objectPosition: "center top",
    },
    technologies: [
      "Swift",
      "SwiftUI",
      "Vision",
      "Core Image",
      "Apple Intelligence",
      "WidgetKit",
      "HealthKit",
    ],
    timeline: "Jun 2026",
    contributors: ["Youssef Chouay"],
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
  //   link: "https://github.com/Youssef2430/ledgerUI",
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
    timeline: "Jan 2024 - Dec 2024",
    contributors: ["Youssef Chouay", "Group 30 Capstone Team"],
    link: "https://github.com/capstone-2024-T91/Image-Processing-and-NLP-for-Brand-Protection",
    size: "large",
  },
];

export function getProjectById(id: string): ProjectDetail | undefined {
  return projects.find((project) => project.id === id);
}
