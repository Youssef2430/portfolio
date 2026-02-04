import { NextResponse } from "next/server";
import { PostHog } from "posthog-node";

// --- PostHog Server-Side Client ---
const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  flushAt: 1, // Flush immediately for API routes
  flushInterval: 0,
});

// --- Configuration ---
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Default model - can be easily switched for cost/speed tradeoffs
// Options: google/gemini-2.0-flash-001, anthropic/claude-3.5-haiku, meta-llama/llama-3.3-70b-instruct, etc.
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

// --- Validate Environment Variables ---
if (!OPENROUTER_API_KEY) {
  console.warn("Missing OPENROUTER_API_KEY - API will fail");
}

// --- Define Types ---
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: OpenRouterUsage;
}

// Metrics tracking interface
export interface QueryMetrics {
  id: string;
  timestamp: string;
  model: string;
  question: string;
  answer: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  queryResponseTimeMs: number;
  timeToFirstTokenMs: number | null;
  estimatedCost: number | null;
  generationId: string | null;
}

// Model pricing (per 1M tokens) - update as needed
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "google/gemini-3-flash-preview": { input: 0.15, output: 0.6 },
  "google/gemini-2.0-flash-lite-preview-02-05:free": { input: 0, output: 0 },
  "google/gemini-2.0-flash-001": { input: 0.1, output: 0.4 },
  "anthropic/claude-3.5-haiku": { input: 0.8, output: 4 },
  "anthropic/claude-3.5-sonnet": { input: 3, output: 15 },
  "meta-llama/llama-3.3-70b-instruct": { input: 0.3, output: 0.3 },
  "openai/gpt-4o-mini": { input: 0.15, output: 0.6 },
  "openai/gpt-4o": { input: 2.5, output: 10 },
};

function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number | null {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return null;

  const inputCost = (promptTokens / 1_000_000) * pricing.input;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

// System prompt with Youssef's context
const SYSTEM_PROMPT = `You are an AI assistant answering questions about Youssef based *primarily* on the provided context and the ongoing conversation. If the context doesn't contain the answer, state that you don't have that information based on the provided details. Refer to previous messages if relevant.

IMPORTANT: Keep responses SHORT and COMPACT. Use 2-3 sentences max for simple questions. Avoid bullet points and long lists unless specifically asked. Be direct and to the point.
Context about Youssef:
--- START CONTEXT ---
Youssef Chouay is a software engineer and AI researcher pursuing a Master's in Computer Science at the University of Ottawa (Jan 2025–Dec 2026) under Prof. Vida Dujmović; he has received over $52,000 in research scholarships.
He completed a BASc in Software Engineering (Sept 2020–Dec 2024) with coursework in DS&A, Embedded Systems, Databases, Discrete Math, Real-Time Systems Design, and Enterprise Architecture.
Since May 2024, he's an AI Researcher at Canada's National Research Council. He was first author on a peer-reviewed IEEE EPEC 2025 paper presenting live-building results for an AI agent layer for BAS; he built Python/LangChain agents that cut data-processing time and operator workload by 49%, a SQLite-backed ingestion pipeline for real-time BAS streams, and—through partnerships with Delta Controls and Carleton University—achieved a 56% maintenance-cost reduction via automated fault detection, predictive maintenance, and real-time alerts. He also built an enhanced, multi-agent utilities chatbot that explains bills, simulates alternative rate plans, and diagnoses anomalies by linking AMI data with weather/holidays/tariffs. The system includes a retrieval-augmented policy/tariff QA layer with deterministic function calling and inline citations, plus a time-series engine (seasonal decomposition + change-point detection) that flags spikes, persistent baseload, and overnight leaks and generates plain-English "why it happened" narratives and savings playbooks.
Previously at Wind River Systems (Sept 2022–Aug 2023), he delivered an Angular/TypeScript/Django Automation Dashboard with PostgreSQL used by programs at NASA, Airbus, and Ford, and improved query/UI performance by over 90% through API and DB optimizations.
As a University of Ottawa Software Developer (May 2022–Apr 2024), he redesigned the university search engine (PHP/MySQL/Apache), improving response times by 80% and saving $30,000+ annually; he also shipped PHP/Bash/Cron automations that further boosted search speed by 54% and streamlined data migration.
Teaching Assistant (Sept 2023–present): supports graduate ML for Bio-informatics and undergraduate courses including Data Structures & Algorithms, Design & Analysis of Algorithms, Programming Paradigms, and Discrete Structures.
Selected projects:
• NLP Phishing Detection (Bell Canada Research): CNN-based website classifier (98.4% accuracy), Chrome extension integration, and an AWS S3-driven retraining pipeline.
• GeeGees Intramural Sports Hub: Next.js/TypeScript/Tailwind app with a Rust + Actix-web API (SQLx/PostgreSQL) streaming real-time standings, Elo ratings, and predictive analytics with sub-20 ms latency; built with async/await and strict type safety for scalable concurrency.
• Distributed File Storage System (Go): Engineered a fault-tolerant, gRPC/Protocol Buffers-backed storage network using consistent hashing and replication, reducing transfer latency by 35 %.

Skills: Python, Java, Go, Rust, C/C++, JavaScript/TypeScript, HTML/CSS, SQL, LaTeX; plus AWS CDK, React, Node.js, TensorFlow, Docker, Kubernetes, Firebase, Jira, Git, Mockito, Flask.
--- END CONTEXT ---
--- START META ADDENDUM ---
Funding: $52,000+ in research scholarships. Publications: First-author, peer-reviewed IEEE EPEC 2025 paper (live-building BAS results).
Impact (by the numbers):
    49% cut in data-processing time & operator workload (BAS agents).
    56% reduction in maintenance costs (predictive maintenance + alerts).
    90% faster queries/UI (Automation Dashboard).
    80% faster university search + $30k/yr savings.
    98.4% phishing-classifier accuracy.
    Sub-20 ms real-time API latency (Rust + Actix).
Experience snapshot: Research & industry roles since 2022 (NRC, Wind River, uOttawa; TA since 2023).
Market value: $120k+.
--- END META ADDENDUM ---`;

// --- API Route Handler ---
export async function POST(req: Request) {
  const requestStartTime = Date.now();

  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    // --- Get message, history, and optional model override ---
    const { message, history, model: requestedModel } = (await req.json()) as {
      message: string;
      history?: ChatMessage[];
      model?: string;
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }

    const conversationHistory: ChatMessage[] = Array.isArray(history)
      ? history
      : [];

    const model = requestedModel || DEFAULT_MODEL;

    // --- Construct the full message list for the LLM ---
    const messagesForAPI: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    // --- Call OpenRouter API ---
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://youssefchouay.com",
        "X-Title": "Youssef Chouay Portfolio",
      },
      body: JSON.stringify({
        model,
        messages: messagesForAPI,
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    const queryResponseTimeMs = Date.now() - requestStartTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      return NextResponse.json(
        { error: "Failed to get response from AI", details: errorText },
        { status: response.status }
      );
    }

    const data: OpenRouterResponse = await response.json();

    // Extract generation ID from response headers for detailed metrics lookup
    const generationId = response.headers.get("x-openrouter-generation-id");

    // Extract response content
    const responseContent = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Build metrics object
    const metrics: QueryMetrics = {
      id: data.id || `gen-${Date.now()}`,
      timestamp: new Date().toISOString(),
      model: data.model || model,
      question: message,
      answer: responseContent,
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
      queryResponseTimeMs,
      timeToFirstTokenMs: null, // Only available with streaming
      estimatedCost: calculateCost(
        model,
        data.usage?.prompt_tokens || 0,
        data.usage?.completion_tokens || 0
      ),
      generationId,
    };

    // Track successful query in PostHog
    posthog.capture({
      distinctId: "api-user", // Anonymous tracking for API calls
      event: "ai_chat_query",
      properties: {
        // Query details
        question: message.substring(0, 500), // Truncate for privacy
        answer_length: responseContent.length,
        conversation_length: conversationHistory.length,

        // Model & Performance
        model: metrics.model,
        response_time_ms: metrics.queryResponseTimeMs,

        // Token usage
        prompt_tokens: metrics.promptTokens,
        completion_tokens: metrics.completionTokens,
        total_tokens: metrics.totalTokens,

        // Cost tracking
        estimated_cost_usd: metrics.estimatedCost,

        // Metadata
        generation_id: metrics.generationId,
        timestamp: metrics.timestamp,
      },
    });

    // Ensure PostHog flushes before response
    await posthog.flush();

    return NextResponse.json({
      response: responseContent,
      metrics: {
        model: metrics.model,
        promptTokens: metrics.promptTokens,
        completionTokens: metrics.completionTokens,
        totalTokens: metrics.totalTokens,
        responseTimeMs: metrics.queryResponseTimeMs,
        estimatedCost: metrics.estimatedCost,
      },
    });
  } catch (error: unknown) {
    // Track errors in PostHog
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    posthog.capture({
      distinctId: "api-user",
      event: "ai_chat_error",
      properties: {
        error_message: errorMessage,
        error_type: error instanceof Error ? error.name : "Unknown",
        model: DEFAULT_MODEL,
        timestamp: new Date().toISOString(),
      },
    });
    await posthog.flush();

    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

// --- Streaming endpoint for real-time responses ---
export async function GET(req: Request) {
  const url = new URL(req.url);
  const message = url.searchParams.get("message");
  const historyParam = url.searchParams.get("history");
  const requestedModel = url.searchParams.get("model");

  const requestStartTime = Date.now();
  let timeToFirstToken: number | null = null;

  if (!OPENROUTER_API_KEY) {
    return new Response("OpenRouter API key not configured", { status: 500 });
  }

  if (!message) {
    return new Response("Message is required", { status: 400 });
  }

  let conversationHistory: ChatMessage[] = [];
  if (historyParam) {
    try {
      conversationHistory = JSON.parse(historyParam);
    } catch {
      // Ignore parse errors, use empty history
    }
  }

  const model = requestedModel || DEFAULT_MODEL;

  const messagesForAPI: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: message },
  ];

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://youssefchouay.com",
        "X-Title": "Youssef Chouay Portfolio",
      },
      body: JSON.stringify({
        model,
        messages: messagesForAPI,
        max_tokens: 200,
        temperature: 0.3,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }

    const generationId = response.headers.get("x-openrouter-generation-id");

    // Create a TransformStream to process SSE and track metrics
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let fullResponse = "";
    let promptTokens = 0;
    let completionTokens = 0;

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              // Send final metrics
              const queryResponseTimeMs = Date.now() - requestStartTime;
              const metrics = {
                type: "metrics",
                model,
                promptTokens,
                completionTokens,
                totalTokens: promptTokens + completionTokens,
                responseTimeMs: queryResponseTimeMs,
                timeToFirstTokenMs: timeToFirstToken,
                estimatedCost: calculateCost(model, promptTokens, completionTokens),
                generationId,
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(metrics)}\n\n`));
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              // Track time to first token
              if (timeToFirstToken === null && parsed.choices?.[0]?.delta?.content) {
                timeToFirstToken = Date.now() - requestStartTime;
              }

              // Accumulate response
              if (parsed.choices?.[0]?.delta?.content) {
                fullResponse += parsed.choices[0].delta.content;
              }

              // Extract usage if available (usually in final chunk)
              if (parsed.usage) {
                promptTokens = parsed.usage.prompt_tokens || promptTokens;
                completionTokens = parsed.usage.completion_tokens || completionTokens;
              }

              // Forward the chunk
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            } catch {
              // Forward unparseable lines as-is
              controller.enqueue(encoder.encode(`${line}\n`));
            }
          }
        }
      },
    });

    const reader = response.body?.getReader();
    if (!reader) {
      return new Response("No response body", { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const writer = transformStream.writable.getWriter();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              await writer.close();
              break;
            }
            await writer.write(value);
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    // Pipe through transform and return
    const transformedStream = stream.pipeThrough(transformStream);

    return new Response(transformedStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Generation-Id": generationId || "",
      },
    });
  } catch (error) {
    console.error("Streaming error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
