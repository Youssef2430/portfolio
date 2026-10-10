import { NextResponse } from "next/server";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { loggerProvider } from "@/instrumentation";
import { citedIds } from "@/lib/citations";
import { buildGuidePrompt } from "@/lib/guide-knowledge";
import { getSiteKnowledge, pagesOrigin } from "@/lib/site-knowledge";

// --- PostHog Logger ---
const logger = loggerProvider.getLogger("ai-chat-api");

// --- Configuration ---
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Default model - can be easily switched for cost/speed tradeoffs. Chosen in
// October 2026 over GPT-6 Luna and Claude Haiku 5.5 on a small eval of site
// questions: all accurate, this one the fastest with the most natural links.
const DEFAULT_MODEL = "deepseek/deepseek-v4.1-flash";

// --- Validate Environment Variables ---
if (!OPENROUTER_API_KEY) {
  console.warn("Missing OPENROUTER_API_KEY - API will fail");
}

// --- Abuse limits ---
// Only models with known pricing may be requested by the client; anything
// else silently falls back to the default so the endpoint can't be used to
// run arbitrary (expensive) models on our OpenRouter key.
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_HISTORY_CONTENT_LENGTH = 4000;
// Answers stay short; the headroom is for the citation links and the odd list.
const MAX_ANSWER_TOKENS = 750;
// Answers come straight from the sources in the prompt, so thinking first
// only adds latency. Every model in MODEL_PRICING accepts this.
const REASONING = { effort: "none" };

// Per-IP sliding-window rate limit. In-memory, so it's per serverless
// instance, best-effort protection, not a hard guarantee.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitBuckets = new Map<string, number[]>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateLimitBuckets.get(ip) ?? []).filter(
    (t) => t > windowStart
  );

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitBuckets.set(ip, timestamps);
    return true;
  }

  timestamps.push(now);
  rateLimitBuckets.set(ip, timestamps);

  // Keep the map from growing unbounded on long-lived instances
  if (rateLimitBuckets.size > 10_000) {
    for (const [key, value] of rateLimitBuckets) {
      if (value.every((t) => t <= windowStart)) rateLimitBuckets.delete(key);
    }
  }

  return false;
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

// Model pricing (per 1M tokens, OpenRouter list prices, October 2026) - update as needed
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "deepseek/deepseek-v4.1-flash": { input: 0.3, output: 1.2 },
  "openai/gpt-6-luna": { input: 0.1, output: 0.5 },
  "anthropic/claude-haiku-5.5": { input: 0.1, output: 0.5 },
};

const ALLOWED_MODELS = new Set(Object.keys(MODEL_PRICING));

function resolveModel(requested: string | null | undefined): string {
  return requested && ALLOWED_MODELS.has(requested) ? requested : DEFAULT_MODEL;
}

// Drop anything that isn't a plain user/assistant message (clients must not
// inject system prompts), truncate oversized content, keep only recent turns.
function sanitizeHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_HISTORY_CONTENT_LENGTH),
    }));
}

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

// The system prompt is built per question from what the site displays (see
// lib/guide-knowledge.ts), with field note excerpts that match the question.
async function buildMessages(req: Request, message: string, history: ChatMessage[]) {
  const knowledge = await getSiteKnowledge(pagesOrigin(req.url));
  // Follow-ups like "tell me more" lean on the previous turn: its question
  // for retrieval, and the chapters its answer cited.
  const previousQuestion = history.findLast((m) => m.role === "user")?.content ?? "";
  const previousAnswer = history.findLast((m) => m.role === "assistant")?.content ?? "";
  const { prompt, passageIds } = buildGuidePrompt(knowledge, {
    query: `${previousQuestion}\n${message}`,
    today: new Date(),
    continuing: citedIds(previousAnswer),
  });
  const messages: ChatMessage[] = [
    { role: "system", content: prompt },
    ...history,
    { role: "user", content: message },
  ];
  return { messages, passageIds };
}

// --- API Route Handler ---
export async function POST(req: Request) {
  const requestStartTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Service unavailable" },
        { status: 503 }
      );
    }

    if (isRateLimited(getClientIp(req))) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    // --- Get message, history, and optional model override ---
    const { message, history, model: requestedModel } = (await req.json()) as {
      message: string;
      history?: ChatMessage[];
      model?: string;
    };

    if (
      !message ||
      typeof message !== "string" ||
      message.length > MAX_MESSAGE_LENGTH
    ) {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }

    const conversationHistory = sanitizeHistory(history);
    const model = resolveModel(requestedModel);

    // --- Construct the full message list for the LLM ---
    const { messages: messagesForAPI, passageIds } = await buildMessages(
      req,
      message,
      conversationHistory
    );

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
        max_tokens: MAX_ANSWER_TOKENS,
        temperature: 0.3,
        reasoning: REASONING,
      }),
    });

    const queryResponseTimeMs = Date.now() - requestStartTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to get response from AI" },
        { status: 502 }
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

    // Log LLM conversation with full question and answer
    logger.emit({
      body: "LLM conversation",
      severityNumber: SeverityNumber.INFO,
      attributes: {
        request_id: requestId,
        question: message,
        answer: responseContent,
        model: metrics.model,
        prompt_tokens: metrics.promptTokens,
        completion_tokens: metrics.completionTokens,
        total_tokens: metrics.totalTokens,
        response_time_ms: metrics.queryResponseTimeMs,
        estimated_cost_usd: metrics.estimatedCost,
        generation_id: metrics.generationId,
        conversation_length: conversationHistory.length,
        retrieved_passages: passageIds.join(","),
      },
    });

    // Ensure logs flush before response
    await loggerProvider.forceFlush();

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
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    // Log error
    logger.emit({
      body: "AI chat error",
      severityNumber: SeverityNumber.ERROR,
      attributes: {
        request_id: requestId,
        error_type: error instanceof Error ? error.name : "Unknown",
        error_message: errorMessage,
      },
    });

    await loggerProvider.forceFlush();

    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
  const requestId = `stream-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  if (!OPENROUTER_API_KEY) {
    return new Response("Service unavailable", { status: 503 });
  }

  if (isRateLimited(getClientIp(req))) {
    return new Response("Too many requests. Please slow down.", {
      status: 429,
    });
  }

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return new Response("Invalid message", { status: 400 });
  }

  let conversationHistory: ChatMessage[] = [];
  if (historyParam) {
    try {
      conversationHistory = sanitizeHistory(JSON.parse(historyParam));
    } catch {
      // Ignore parse errors, use empty history
    }
  }

  const model = resolveModel(requestedModel);

  try {
    const { messages: messagesForAPI } = await buildMessages(
      req,
      message,
      conversationHistory
    );

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
        max_tokens: MAX_ANSWER_TOKENS,
        temperature: 0.3,
        reasoning: REASONING,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter streaming error:", response.status, errorText);
      return new Response("Failed to get response from AI", { status: 502 });
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

    if (!response.body) {
      return new Response("No response body", { status: 500 });
    }

    // Pipe the upstream SSE body through the transform and return
    const transformedStream = response.body.pipeThrough(transformStream);

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
