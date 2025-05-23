// src/app/api/ask/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// --- Configuration ---
const USE_RAG = false;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key for server-side RPC

const EMBEDDING_MODEL = "text-embedding-3-small"; // Needed for query embedding
const EMBEDDING_DIMENSIONS = 1536; // Needed for query embedding
const COMPLETION_MODEL = "gpt-4.1-nano";
const TOP_K_CONTEXT = 3;
const SIMILARITY_THRESHOLD = 0.5; // Minimum similarity score for matches
const SUPABASE_MATCH_FUNCTION = "match_documents"; // Must match your SQL function name

// --- Validate Environment Variables ---
if (!OPENAI_API_KEY) {
  throw new Error("Missing environment variable OPENAI_API_KEY");
}
if (!SUPABASE_URL) {
  throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_URL");
}
if (!SUPABASE_SERVICE_KEY) {
  throw new Error("Missing environment variable SUPABASE_SERVICE_ROLE_KEY");
}

// --- Initialize Clients ---
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
// Create a single Supabase client instance for server-side operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Define Chat Message Structure ---
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// --- Helper Functions ---

// Function to get embedding for the *user query*
async function getQueryEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.replace(/\n/g, " "),
      dimensions: EMBEDDING_DIMENSIONS,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error getting query embedding:", error);
    throw new Error("Failed to get query embedding from OpenAI.");
  }
}

// --- Function to find relevant context using Supabase RPC ---
async function findRelevantContext(
  query: string,
  topK: number,
  similarityThreshold: number,
): Promise<string[]> {
  try {
    console.log("Finding context for query:", query);
    const queryEmbedding = await getQueryEmbedding(query);
    // console.log("Query Embedding (first 5 dims):", queryEmbedding.slice(0, 5)); // Optional: Log embedding snippet

    // console.log(
    //   "Query Embedding Vector (for SQL testing):",
    //   JSON.stringify(queryEmbedding), // Stringify makes it easy to copy
    // );

    console.log("Calling Supabase RPC match_documents...");
    const { data, error } = await supabaseAdmin.rpc(SUPABASE_MATCH_FUNCTION, {
      query_embedding: queryEmbedding,
      match_threshold: similarityThreshold,
      match_count: topK,
    });

    if (error) {
      console.error("Supabase RPC Error:", error); // Log the specific error
      throw new Error("Failed to retrieve relevant context from Supabase.");
    }

    // Log the raw data received from Supabase
    console.log("Supabase RPC Data:", data);

    if (!data || data.length === 0) {
      console.log("No relevant documents found in Supabase.");
      return [];
    }

    const contexts = data.map((item: any) => item.content);
    // console.log("Extracted Contexts:", contexts); // Log the final text contexts
    return contexts;
  } catch (error) {
    console.error("Error in findRelevantContext:", error);
    return [];
  }
}

// --- API Route Handler ---
export async function POST(req: Request) {
  try {
    // --- Get message and optional history ---
    const { message, history } = (await req.json()) as {
      message: string;
      history?: ChatMessage[];
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 },
      );
    }
    const conversationHistory: ChatMessage[] = Array.isArray(history)
      ? history
      : [];

    // --- RAG Step 1: Retrieve relevant context from Supabase ---
    // Database is assumed to be populated by the separate script
    const relevantContexts = await findRelevantContext(
      message,
      TOP_K_CONTEXT,
      SIMILARITY_THRESHOLD,
    );
    const contextString =
      relevantContexts.length > 0
        ? relevantContexts.join("\n\n")
        : "No specific context found matching the query.";

    let systemPrompt = "";
    if (USE_RAG) {
      systemPrompt = `You are an AI assistant answering questions about Youssef based *primarily* on the provided context and the ongoing conversation. If the context doesn't contain the answer, state that you don't have that information based on the provided details. Refer to previous messages if relevant. Keep responses concise and professional.
              Context about Youssef:
              --- START CONTEXT ---
              ${contextString}
              --- END CONTEXT ---`;
    } else {
      systemPrompt = `You are an AI assistant answering questions about Youssef based *primarily* on the provided context and the ongoing conversation. If the context doesn't contain the answer, state that you don't have that information based on the provided details. Refer to previous messages if relevant. Keep responses concise and professional.
              Context about Youssef:
              --- START CONTEXT ---
              Youssef Chouay is a driven software engineer and AI researcher currently pursuing a Master’s in Computer Science at the University of Ottawa (January 2025–December 2026), under the supervision of Prof. Vida Dujmović, having earned over \$52 000 in research scholarships. He previously completed a Bachelor of Applied Science in Software Engineering at the same institution (September 2020–December 2024), where he excelled in courses such as Data Structures & Algorithms, Embedded Systems, Databases, Discrete Mathematics, Real-Time Systems Design, and Enterprise Architecture .

              Since May 2024, Youssef has worked as an Artificial Intelligence Researcher at the National Research Council (NRC) in Ottawa, designing and deploying Python-based systems using LangChain to integrate Building Automation Systems (BAS). His solutions reduced data-processing times and manual workload by 49 % and—through partnerships with Delta Controls and Carleton University—achieved a 56 % drop in maintenance costs via predictive maintenance and real-time alerts, leveraging SQLite for efficient stream processing .

              Before that, he served as a Junior Software Engineer at Wind River Systems (September 2022–August 2023), where he built an Automation Dashboard with Angular, TypeScript, Django, and PostgreSQL—optimizing API endpoints to deliver over 90 % faster queries and UI responsiveness. Concurrently, as a Software Developer at the University of Ottawa (May 2022–April 2024), he redesigned the university’s search engine in PHP/MySQL, cutting response times by 80 % and saving the institution over \$30 000 annually, while automating data workflows with Bash and Cron jobs .

              An active Teaching Assistant since September 2023, Youssef supports both graduate and undergraduate courses—ranging from Machine Learning for Bio-informatics to Data Structures & Algorithms, Programming Paradigms, and Discrete Structures .

              Beyond his roles, Youssef has spearheaded several high-impact projects:

              * **NLP Phishing Detection (Bell Canada Research):** Built a CNN-based classifier achieving 98.4 % accuracy, integrated via a Chrome extension and automated AWS S3 retraining pipelines.
              * **GeeGee’s Intramural Sports Hub:** Developed with Next.js/TypeScript/Tailwind and a high-throughput Rust + Actix-web API, streaming real-time standings and match analytics at sub-20 ms latency.
              * **Distributed File Storage System (Go):** Engineered a fault-tolerant, gRPC/Protocol Buffers-backed storage network using consistent hashing and replication, reducing transfer latency by 35 % .

              His technical toolkit spans Python, Java, Go, Rust, C/C++, JavaScript/TypeScript, SQL, and LaTeX, alongside frameworks and tools like AWS CDK, React, Node.js, TensorFlow, Docker, Kubernetes, and Firebase. An avid open-source contributor (GitHub: github.com/Youssef2430), Youssef is passionate about leveraging cutting-edge AI and scalable architectures to solve real-world challenges—particularly in smart buildings, predictive analytics, and high-performance systems.&#x20;
              --- END CONTEXT ---`;
    }

    // --- Construct the full message list for the LLM ---
    const messagesForAPI: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    // --- RAG Step 3: Call the LLM ---
    const completion = await openai.chat.completions.create({
      model: COMPLETION_MODEL,
      messages: messagesForAPI,
      max_tokens: 150,
      temperature: 0.3,
    });

    return NextResponse.json({
      response: completion.choices[0].message.content,
    });
  } catch (error: unknown) {
    console.error("API Route Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 },
    );
  }
}
