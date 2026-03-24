import type React from "react";
export type ProjectDetail = {
  id: string;
  title: string;
  category: string;
  description: string[];
  image: string;
  imageLink?: string;
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
    image: "/clui_tasks_audio.jpeg?height=600&width=800",
    imageLink: "/clui_context_usage.jpeg?height=600&width=800",
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
    image: "/atlasllm-welcome.png?height=600&width=800",
    imageLink: "/atlasllm-conv.png?height=600&width=800",
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
  //   image: "/chessllm.png?height=600&width=800",
  //   imageLink: "/chessllm-github.png?height=600&width=800",
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
    id: "geegees-intramural",
    title: "GeeGee's Intramural website",
    category: "Personal Project",
    description: [
      "Built a GeeGees Intramural Sports Hub from scratch using Next.js + TypeScript/Tailwind UI, SSR pages for leagues/teams/schedules, and slick Chart.js visualizations—delivering an accessible, responsive experience for thousands of students.",
      "Designed a high-throughput Rust + Actix-web API backed by SQLx/PostgreSQL that streams real-time standings, Elo ratings, and predictive match analytics with sub 20ms latency.",
      "Drove concurrency with async/await and strict type-safety to create a modular, fault-tolerant codebase that scales gracefully under heavy traffic.",
    ],
    image: "/geegeeshub.png?height=600&width=800",
    imageLink: "/geegeeshub-roadmap.jpeg?height=600&width=800",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Rust",
      "Actix-web",
      "PostgreSQL",
      "Chart.js",
    ],
    timeline: "May 2023 - Present",
    contributors: ["Youssef Chouay"],
    link: "https://www.geegeeshub.com/",
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
  //   image: "/glassUI.png?height=600&width=800",
  //   imageLink: "/ledgerUI-github.png?height=600&width=800",
  //   technologies: [
  //     "Swift",
  //     "SwiftUI",
  //     "SwiftData",
  //     "NaturalLanguage",
  //     "Charts",
  //     "macOS",
  //   ],
  //   timeline: "Jul 2025 – Present",
  //   contributors: ["Youssef Chouay"],
  //   link: "https://github.com/Youssef2430/ledgerUI",
  //   size: "small",
  // },
  {
    id: "nlp-phishing-detection",
    title: "NLP Phishing Detection",
    category: "Bell Canada Research Project",
    description: [
      "Built a phishing detection system using NLP and computer vision (CNNs) for website classification and clustering, achieving 98.4% accuracy.",
      "Developed a Chrome extension to integrate phishing detection directly into email clients and implemented an automated pipeline with AWS S3 for retraining on new phishing data.",
    ],
    image: "/capstone-example.png?height=600&width=800",
    imageLink: "/capstone-activity.jpeg?height=600&width=800",
    technologies: [
      "Python",
      "TensorFlow",
      "NLP",
      "Computer Vision",
      "AWS S3",
      "Chrome Extension API",
    ],
    timeline: "Jan 2023 - Dec 2023",
    contributors: ["Youssef Chouay", "Bell Canada Research Team"],
    link: "https://github.com/capstone-2024-T91/Image-Processing-and-NLP-for-Brand-Protection",
    size: "large",
  },
];

export function getProjectById(id: string): ProjectDetail | undefined {
  return projects.find((project) => project.id === id);
}
