// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

// --- Configuration ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = "text-embedding-3-small";
const COMPLETION_MODEL = "gpt-4.1-nano"; // Or "gpt-4o-mini" if needed
const TOP_K_CONTEXT = 3; // How many relevant chunks to retrieve

if (!OPENAI_API_KEY) {
  throw new Error("Missing environment variable OPENAI_API_KEY");
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// --- Simulated Data Source (Replace with your actual data loading) ---
const youssefData = [
  "Youssef is a passionate software engineer specializing in full-stack development.",
  "He primarily works with TypeScript, React, Next.js, and Node.js.",
  "Youssef has experience deploying applications to Vercel and AWS.",
  "He contributed to the open-source library 'Awesome Util' in 2024.",
  "Youssef believes in writing clean, maintainable, and well-tested code.",
  "Outside of coding, Youssef enjoys hiking and photography.",
  "He graduated with a degree in Computer Science from Tech University.",
  "Youssef is currently exploring advancements in AI and machine learning.",
];

// --- In-Memory Vector Store (Replace with a real Vector DB for production) ---
interface DataChunk {
  text: string;
  embedding: number[];
}
let vectorStore: DataChunk[] = [];
let isStoreInitialized = false;

// --- Define Chat Message Structure (Matches OpenAI API) ---
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// --- Helper Functions ---

// Function to get embedding for a text chunk
async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.replace(/\n/g, " "), // OpenAI recommends replacing newlines
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    throw new Error("Failed to get embedding from OpenAI.");
  }
}

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    // console.warn("Vectors have different dimensions, returning 0 similarity.");
    return 0; // Or handle error appropriately
  }
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    // console.warn("One or both vectors have zero magnitude, returning 0 similarity.");
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to initialize the in-memory vector store (run once)
async function initializeVectorStore() {
  if (isStoreInitialized) return;
  console.log("Initializing in-memory vector store...");
  vectorStore = []; // Clear previous store if any (e.g., during hot-reloading)
  for (const text of youssefData) {
    try {
      const embedding = await getEmbedding(text);
      vectorStore.push({ text, embedding });
    } catch (error) {
      console.error(
        `Failed to embed chunk: "${text.substring(0, 30)}..."`,
        error,
      );
      // Decide if you want to skip this chunk or stop initialization
    }
  }
  isStoreInitialized = true;
  console.log(`Vector store initialized with ${vectorStore.length} chunks.`);
}

// Function to find relevant context using cosine similarity
async function findRelevantContext(
  query: string,
  topK: number,
): Promise<string[]> {
  if (!isStoreInitialized || vectorStore.length === 0) {
    console.warn("Vector store not initialized or empty. Cannot find context.");
    return [];
  }

  try {
    const queryEmbedding = await getEmbedding(query);

    const similarities: { text: string; score: number }[] = vectorStore.map(
      (chunk) => ({
        text: chunk.text,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
      }),
    );

    // Sort by similarity score in descending order
    similarities.sort((a, b) => b.score - a.score);

    // Return the text of the top K chunks
    return similarities.slice(0, topK).map((item) => item.text);
  } catch (error) {
    console.error("Error finding relevant context:", error);
    return []; // Return empty context on error
  }
}

// --- API Route Handler ---
export async function POST(req: Request) {
  try {
    // Ensure vector store is initialized (important for serverless environments)
    if (!isStoreInitialized) {
      await initializeVectorStore();
    }

    // --- Get message and optional history from request body ---
    const { message, history } = (await req.json()) as {
      message: string;
      history?: ChatMessage[]; // Expect an optional array of ChatMessage objects
    };

    // --- Validate input ---
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 },
      );
    }

    // Ensure history is an array if provided, otherwise default to empty
    const conversationHistory: ChatMessage[] = Array.isArray(history)
      ? history
      : [];

    // --- RAG Step 1: Retrieve relevant context based on the LATEST message ---
    // Note: Context retrieval usually focuses on the *current* query's relevance.
    const relevantContexts = await findRelevantContext(message, TOP_K_CONTEXT);
    const contextString =
      relevantContexts.length > 0
        ? relevantContexts.join("\n\n")
        : "No specific context found.";

    // --- RAG Step 2: Augment the prompt ---
    // System prompt now includes context and guides the AI to use it along with conversation.
    const systemPrompt = `You are an AI assistant answering questions about Youssef based *primarily* on the provided context and the ongoing conversation. If the context doesn't contain the answer, state that you don't have that information based on the provided details. Refer to previous messages if relevant. Keep responses concise and professional.

Context about Youssef:
--- START CONTEXT ---
${contextString}
--- END CONTEXT ---`;

    // --- Construct the full message list for the LLM ---
    const messagesForAPI: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      // Add messages from the conversation history
      ...conversationHistory,
      // Add the current user message
      {
        role: "user",
        content: message,
      },
    ];

    // --- RAG Step 3: Call the LLM with context AND history ---
    const completion = await openai.chat.completions.create({
      model: COMPLETION_MODEL,
      messages: messagesForAPI, // Pass the full conversation history + new message
      max_tokens: 150, // Adjust as needed
      temperature: 0.3, // Lower temperature for more factual, context-based answers
    });

    return NextResponse.json({
      response: completion.choices[0].message.content,
      // You could optionally return the context used for debugging:
      // context: relevantContexts
    });
  } catch (error: unknown) {
    console.error("API Route Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    // Avoid leaking sensitive details in production errors
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 },
    );
  }
}
