# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production (runs TypeScript checks — errors fail the build)
npm run build

# Start production server
npm start

# Run linting (ESLint 9 flat config — `next lint` was removed in Next 16)
npm run lint

# Populate/refresh Supabase database with embeddings (optional, legacy RAG)
npm run populate-db
```

### Testing and Development
```bash
# Check TypeScript errors
npx tsc --noEmit
```

## Environment Setup

Create `.env` (or `.env.local`) with:
```bash
# Required for AI chat functionality (the /api/ask route calls OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key

# Optional analytics / logging
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Only needed for the legacy populate-db script
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

## Architecture Overview

This is a Next.js 16 portfolio website with App Router, showcasing Youssef's work with an integrated AI chat system.

### Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript, React 19)
- **Styling**: Tailwind CSS v3 with custom animations
- **Animations**: Framer Motion v12 for smooth interactions
- **AI/Chat**: OpenRouter (`app/api/ask/route.ts`) with a hardcoded context prompt
- **Logging**: OpenTelemetry logs exported to PostHog (`instrumentation.ts`)
- **Analytics**: PostHog + Vercel Analytics

### Key Architectural Patterns

#### 1. Component Architecture
- **Server Components**: Pages are server components (`app/page.tsx`, blog and
  project pages) so metadata and SSG work; interactivity lives in client
  components under `components/`
- **Client Components**: Marked with `"use client"` for interactive features
  (e.g. `components/page-transition.tsx`, `components/project-detail.tsx`)
- **Component Composition**: Modular sections (Hero, About, Projects, etc.)

#### 2. AI Chat System (`components/ask-input.tsx`)
- **Streaming UI**: Real-time typing effects with particle animations
- **Context Management**: Persistent chat history in localStorage
- **Responsive Design**: Mobile-optimized with touch handling

#### 3. API Routes (`app/api/ask/route.ts`)
- **Provider**: OpenRouter chat completions (POST = non-streaming, GET = SSE streaming)
- **Abuse protection**: model whitelist, per-IP rate limiting, message/history
  length caps, role sanitization (no client-supplied system prompts)
- **Errors**: generic messages to clients; details only in server logs
- **Metrics**: token usage and cost logged via OpenTelemetry to PostHog

#### 4. Data Management
- **Project Data**: Centralized in `lib/project-data.ts` with TypeScript types
- **Blog Data**: Metadata in `lib/blog-data.ts`, markdown content in `blogs/*.md`
  read server-side via `lib/blog-content.ts`
- **Static Assets**: Images in `public/`; blog animations are MP4 (not GIF)

### SEO
- `app/sitemap.ts` and `app/robots.ts` are generated routes
- `app/opengraph-image.tsx` renders the default OG image
- Blog posts and project pages have per-page `generateMetadata`
- `app/not-found.tsx` and `app/error.tsx` handle error states

### File Structure Patterns

```
app/                   # Next.js App Router
  api/ask/             # AI chat API endpoint (OpenRouter)
  api/music/preview/   # Deezer preview proxy
  blog/                # Blog index + [slug] pages (SSG)
  projects/[id]/       # Project pages (SSG, server metadata + client view)
  layout.tsx           # Root layout with providers + metadata
  page.tsx             # Main portfolio page (server component)
  providers.tsx        # PostHog analytics setup
  sitemap.ts, robots.ts, opengraph-image.tsx, not-found.tsx, error.tsx

components/            # Reusable UI components (all actively used)
  ask-input.tsx        # AI chat interface (complex)
  page-transition.tsx  # Client wrapper for home page animations
  project-detail.tsx   # Client view for project pages
  [section].tsx        # Other portfolio sections

lib/                   # Utilities and data
  project-data.ts      # Centralized project information
  blog-data.ts         # Blog post metadata
  blog-content.ts      # Server-side markdown reading
  utils.ts             # Helper functions

blogs/                 # Markdown content for blog posts
scripts/               # populateSupabase.js (legacy RAG seeding)
```

### Key Development Guidelines

#### Component Development
- Use TypeScript interfaces for all props and data structures
- Keep pages as server components; push `"use client"` to leaf components
- Follow the existing animation patterns using Framer Motion
- Note: `framer-motion` v12 requires `Variants` type annotations on
  standalone variant objects (ease arrays must infer as bezier tuples)

#### API Development
- All API routes should use proper TypeScript typing
- Never return upstream/internal error details to clients
- Use environment variables for all external service configurations

#### Styling Guidelines
- Use Tailwind utility classes for consistent design
- Create custom animations in `tailwind.config.ts` when needed
- Maintain mobile-first responsive design principles
- Use the established color scheme and dark mode patterns

### Deployment Notes

- Deployed on Vercel; standard server build (NOT static export)
- Next.js image optimization is enabled (no `unoptimized` flag)
- TypeScript errors fail the build; lint runs separately via `npm run lint`
- `/travels` is rewritten to the static site at `public/travels/index.html`
