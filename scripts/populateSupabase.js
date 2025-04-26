// scripts/populateSupabase.js
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises"; // Use file system promises
import pdf from "pdf-parse"; // Import the pdf-parse library

// --- Configuration ---
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const TABLE_NAME = "documents";

// --- File Paths ---
// Assumes files are in the 'public/data/' directory relative to project root
const PDF_PATH = path.join(process.cwd(), "public/data/resume.pdf");
const MD_PATH = path.join(process.cwd(), "public/data/youssef.md");

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
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Helper Function to Load and Combine Data ---
async function loadAndCombineData() {
  console.log(`Reading Markdown file from: ${MD_PATH}`);
  let mdContent = "";
  try {
    mdContent = await fs.readFile(MD_PATH, "utf-8");
    console.log(" -> Markdown file read successfully.");
  } catch (error) {
    console.error(`Error reading Markdown file: ${error.message}`);
    // Decide if you want to proceed without MD content or stop
    // throw new Error(`Failed to read Markdown file: ${MD_PATH}`);
    console.warn("Proceeding without Markdown content.");
  }

  console.log(`Reading PDF file from: ${PDF_PATH}`);
  let pdfContent = "";
  try {
    const pdfBuffer = await fs.readFile(PDF_PATH);
    const data = await pdf(pdfBuffer);
    pdfContent = data.text; // Extract text content
    console.log(" -> PDF file parsed successfully.");
  } catch (error) {
    console.error(`Error reading or parsing PDF file: ${error.message}`);
    // Decide if you want to proceed without PDF content or stop
    // throw new Error(`Failed to read/parse PDF file: ${PDF_PATH}`);
    console.warn("Proceeding without PDF content.");
  }

  if (!mdContent && !pdfContent) {
    throw new Error("Failed to load content from both Markdown and PDF files.");
  }

  // Combine the content with a clear separator
  const combined = `--- START MARKDOWN CONTENT ---\n\n${mdContent}\n\n--- END MARKDOWN CONTENT ---\n\n\n--- START PDF CONTENT ---\n\n${pdfContent}\n\n--- END PDF CONTENT ---`;

  console.log(`Combined content length: ${combined.length} characters.`);
  return combined;
}

// --- Helper Function to Get Embedding ---
async function getEmbedding(text) {
  // Consider potential input length limits of the embedding model
  console.log(
    `Requesting embedding for text length: ${text.length} characters.`,
  );
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.replace(/\n/g, " "), // Replace newlines for OpenAI API
      dimensions: EMBEDDING_DIMENSIONS,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error(`Error getting embedding: ${error.message || error}`);
    // Check for specific errors like input length limits
    if (error.message && error.message.includes("maximum context length")) {
      console.error(
        "The combined text might be too long for the embedding model.",
      );
    }
    throw new Error(`Failed to get embedding: ${error.message}`);
  }
}

// --- Main Population Function ---
async function populateDatabase() {
  console.log(
    "Starting database population process (single document from files)...",
  );

  let combinedContext;
  try {
    combinedContext = await loadAndCombineData();
  } catch (error) {
    console.error("Failed to load data:", error.message);
    process.exit(1); // Stop script if data loading fails
  }

  // Optional: Check if data already exists and clear table
  const { count, error: countError } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error checking existing data:", countError);
    return;
  }

  if (count !== null && count > 0) {
    console.warn(
      `Clearing existing ${count} documents from '${TABLE_NAME}' to insert single combined context...`,
    );
    const { error: deleteError } = await supabaseAdmin
      .from(TABLE_NAME)
      .delete()
      .neq("id", 0);
    if (deleteError) {
      console.error("Error clearing table:", deleteError);
      return;
    }
    console.log("Table cleared.");
  } else {
    console.log(`Table '${TABLE_NAME}' is empty. Proceeding with insertion.`);
  }

  console.log("Generating single embedding for the combined file context...");

  try {
    const embedding = await getEmbedding(combinedContext);

    const documentToInsert = {
      content: combinedContext, // Store the full combined text
      embedding: embedding,
    };

    console.log(
      `Attempting to insert the single combined document into Supabase...`,
    );

    const { error: insertError } = await supabaseAdmin
      .from(TABLE_NAME)
      .insert(documentToInsert);

    if (insertError) {
      console.error(`Error inserting the document:`, insertError);
      return;
    }

    console.log(`Successfully inserted the single combined document.`);
    console.log("Database population complete.");
  } catch (error) {
    console.error(
      "Failed to generate embedding or insert document:",
      error.message,
    );
  }
}

// --- Run the population script ---
populateDatabase().catch((err) => {
  console.error("\nUnhandled error during population:", err);
  process.exit(1);
});
