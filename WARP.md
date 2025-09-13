# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Populate/refresh Supabase database with embeddings
npm run populate-db
```

### Testing and Development
```bash
# Check TypeScript errors
npx tsc --noEmit

# Format code with Prettier (if configured)
npx prettier --write .

# Check bundle size
npm run build && npx @next/bundle-analyzer
```

## Environment Setup

Create `.env.local` file with:
```bash
# Required for AI chat functionality
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Optional analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## Architecture Overview

This is a modern Next.js 14 portfolio website with App Router, showcasing Youssef's work with an integrated AI chat system.

### Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Custom components with Radix UI primitives
- **Animations**: Framer Motion for smooth interactions
- **AI/Chat**: OpenAI GPT-4 with RAG (Retrieval-Augmented Generation)
- **Database**: Supabase (PostgreSQL with vector embeddings)
- **Analytics**: PostHog for user tracking

### Key Architectural Patterns

#### 1. Component Architecture
- **Server Components**: Default for pages and static content
- **Client Components**: Marked with `"use client"` for interactive features
- **Custom Hooks**: `use-mobile.tsx`, `use-toast.ts` for reusable logic
- **Component Composition**: Modular sections (Hero, About, Projects, etc.)

#### 2. AI Chat System (`components/ask-input.tsx`)
- **RAG Pipeline**: Semantic search via Supabase vector matching
- **Streaming UI**: Real-time typing effects with particle animations
- **Context Management**: Persistent chat history in localStorage
- **Responsive Design**: Mobile-optimized with touch handling

#### 3. API Routes (`app/api/ask/route.ts`)
- **Vector Search**: Uses OpenAI embeddings + Supabase similarity matching
- **Fallback Content**: Hardcoded context when RAG is disabled
- **Error Handling**: Comprehensive error boundaries and logging
- **Rate Limiting**: Built-in OpenAI API management

#### 4. Data Management
- **Project Data**: Centralized in `lib/project-data.ts` with TypeScript types
- **Static Assets**: Images in `public/` directory
- **Database Population**: Automated script (`scripts/populateSupabase.js`)

### Development Patterns

#### Styling Approach
- **Design System**: Custom Tailwind config with consistent spacing/colors
- **Dark Mode**: Built-in theme switching via `next-themes`
- **Animations**: Custom keyframes for skill pulses, glitch effects
- **Mobile-First**: Responsive design with touch optimization

#### Performance Optimizations
- **Image Optimization**: Next.js Image component with proper sizing
- **Bundle Splitting**: Automatic code splitting via App Router
- **Static Generation**: SSG for portfolio content where possible
- **Lazy Loading**: Intersection Observer for section animations

#### State Management
- **Local State**: React useState/useRef for component state
- **Persistent State**: localStorage for chat history
- **Global State**: Context providers for theme and analytics

### File Structure Patterns

```
app/                   # Next.js App Router
  api/ask/            # AI chat API endpoint
  layout.tsx          # Root layout with providers
  page.tsx            # Main portfolio page
  providers.tsx       # PostHog analytics setup

components/           # Reusable UI components
  ask-input.tsx      # AI chat interface (complex)
  hero.tsx           # Hero section with animations
  projects.tsx       # Project showcase with modals
  [section].tsx      # Other portfolio sections

lib/                 # Utilities and data
  project-data.ts    # Centralized project information
  utils.ts           # Helper functions

scripts/             # Development tools
  populateSupabase.js # Database seeding script
```

### Key Development Guidelines

#### Component Development
- Use TypeScript interfaces for all props and data structures
- Implement proper error boundaries for client components
- Follow the existing animation patterns using Framer Motion
- Maintain consistent spacing and typography scales

#### API Development
- All API routes should use proper TypeScript typing
- Implement comprehensive error handling and logging
- Use environment variables for all external service configurations
- Follow the RAG pattern for any new AI-powered features

#### Styling Guidelines
- Use Tailwind utility classes for consistent design
- Create custom animations in `tailwind.config.ts` when needed
- Maintain mobile-first responsive design principles
- Use the established color scheme and dark mode patterns

#### Performance Considerations
- Optimize images using Next.js Image component
- Use dynamic imports for heavy client-side components
- Implement proper loading states for async operations
- Monitor bundle size when adding new dependencies

### Deployment Notes

The application is configured for static export with:
- `images.unoptimized: true` for static hosting
- ESLint and TypeScript errors ignored during builds (development convenience)
- All API routes require proper environment variable configuration

### Database Schema (Supabase)

The `documents` table structure:
```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1536)
);

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
) RETURNS TABLE (content TEXT, similarity FLOAT);
```

Run `npm run populate-db` to seed the database with portfolio content embeddings.