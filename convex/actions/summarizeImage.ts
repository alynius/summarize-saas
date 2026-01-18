"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";

type SummaryLength = "short" | "medium" | "long" | "xl";

const LENGTH_PROMPTS: Record<SummaryLength, string> = {
  short: "Provide a brief summary in 2-3 sentences (approximately 50-75 words).",
  medium: "Provide a moderate summary in 1-2 paragraphs (approximately 150-200 words).",
  long: "Provide a detailed summary covering all main points (approximately 300-400 words).",
  xl: "Provide a comprehensive summary with key details and context (approximately 500-700 words).",
};

const ALLOWED_MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "o1-mini",
  "o1-preview",
  "o3-mini",
  "claude-3-5-sonnet-20241022",
  "claude-3-haiku-20240307",
  "claude-3-opus-20240229",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
];

const MAX_TOTAL_SIZE_MB = 20;
const MAX_IMAGES = 5;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

interface ImageData {
  base64: string;
  mimeType: string;
  fileName: string;
  size: number;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

async function extractTextAndSummarizeWithVision(
  images: ImageData[],
  length: SummaryLength,
  model: string
): Promise<{ extractedText: string; summary: string; tokensUsed: number }> {
  if (!ALLOWED_MODELS.includes(model)) {
    throw new Error("Invalid model selected. Please choose a supported model.");
  }

  const lengthInstruction = LENGTH_PROMPTS[length];

  const systemPrompt =
    "You are an expert at extracting and summarizing text from images. " +
    "First, extract all visible text from the provided image(s), preserving structure where possible. " +
    "Then, " + lengthInstruction + " " +
    "If the image contains diagrams, charts, or visual elements, describe them briefly. " +
    "Format your response as:\n\n" +
    "=== EXTRACTED TEXT ===\n[extracted text here]\n\n" +
    "=== SUMMARY ===\n[summary here]";

  // GPT-4o Vision is the primary choice for OCR
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required for image OCR");
  }

  // Build content array with images
  const content: Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }> = [
    { type: "text", text: "Please extract text from and summarize the following image(s):" },
  ];

  for (const image of images) {
    content.push({
      type: "image_url",
      image_url: {
        url: "data:" + image.mimeType + ";base64," + image.base64,
        detail: "high",
      },
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model: "gpt-4o", // Force GPT-4o for vision tasks
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content },
      ],
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI Vision API error:", errorText);
    throw new Error("Failed to process images. Please try again later.");
  }

  const data = await response.json();
  const fullResponse = data.choices[0].message.content;

  // Parse the response to separate extracted text and summary
  const extractedMatch = fullResponse.match(/=== EXTRACTED TEXT ===\s*([\s\S]*?)\s*=== SUMMARY ===/i);
  const summaryMatch = fullResponse.match(/=== SUMMARY ===\s*([\s\S]*?)$/i);

  const extractedText = extractedMatch ? extractedMatch[1].trim() : "";
  const summary = summaryMatch ? summaryMatch[1].trim() : fullResponse;

  return {
    extractedText,
    summary,
    tokensUsed: data.usage?.total_tokens ?? 0,
  };
}

export const summarizeImage = action({
  args: {
    userId: v.id("users"),
    images: v.array(
      v.object({
        base64: v.string(),
        mimeType: v.string(),
        fileName: v.string(),
      })
    ),
    summaryLength: v.union(v.literal("short"), v.literal("medium"), v.literal("long"), v.literal("xl")),
    model: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    summaryId: string;
    summary: string;
    metadata: {
      imageCount: number;
      fileNames: string[];
      extractedText: string;
    };
    wordCount: number;
    tokensUsed: number;
  }> => {
    // Validate image count
    if (args.images.length === 0) {
      throw new Error("Please provide at least one image.");
    }
    if (args.images.length > MAX_IMAGES) {
      throw new Error("Maximum " + MAX_IMAGES + " images allowed.");
    }

    // Check rate limits
    const canSummarizeResult = await ctx.runQuery(api.usage.canSummarize, {
      userId: args.userId,
    });

    if (!canSummarizeResult.allowed) {
      throw new Error(canSummarizeResult.reason || "Cannot summarize at this time");
    }

    // Validate images
    let totalSize = 0;
    const validatedImages: ImageData[] = [];

    for (const img of args.images) {
      // Validate mime type
      if (!ALLOWED_TYPES.includes(img.mimeType)) {
        throw new Error("Invalid image type: " + img.mimeType + ". Allowed: PNG, JPG, WEBP, GIF");
      }

      // Calculate size from base64
      const sizeBytes = (img.base64.length * 3) / 4;
      totalSize += sizeBytes;

      validatedImages.push({
        base64: img.base64,
        mimeType: img.mimeType,
        fileName: img.fileName,
        size: sizeBytes,
      });
    }

    // Check total size
    const totalSizeMB = totalSize / (1024 * 1024);
    if (totalSizeMB > MAX_TOTAL_SIZE_MB) {
      throw new Error(
        "Total image size (" + totalSizeMB.toFixed(1) + "MB) exceeds limit of " + MAX_TOTAL_SIZE_MB + "MB."
      );
    }

    console.log("Processing " + validatedImages.length + " images (" + totalSizeMB.toFixed(1) + "MB total)");

    // Extract text and generate summary using GPT-4o Vision
    const { extractedText, summary, tokensUsed } = await extractTextAndSummarizeWithVision(
      validatedImages,
      args.summaryLength,
      args.model
    );

    const wordCount = countWords(extractedText || summary);

    // Store the summary
    const inputContent = extractedText || "Image content (no text extracted)";
    const summaryId = await ctx.runMutation(api.summaries.createSummary, {
      userId: args.userId,
      inputType: "image",
      inputTitle: validatedImages.length === 1 ? validatedImages[0].fileName : validatedImages.length + " Images",
      inputContent: inputContent,
      inputWordCount: wordCount,
      summary,
      summaryLength: args.summaryLength,
      model: "gpt-4o", // Always GPT-4o for vision
      tokensUsed,
      imageFileNames: validatedImages.map((i) => i.fileName),
      imageCount: validatedImages.length,
      ocrMethod: "gpt-4o-vision",
    });

    // Increment usage
    await ctx.runMutation(api.usage.incrementUsage, {
      userId: args.userId,
      tokensUsed,
    });

    return {
      summaryId,
      summary,
      metadata: {
        imageCount: validatedImages.length,
        fileNames: validatedImages.map((i) => i.fileName),
        extractedText,
      },
      wordCount,
      tokensUsed,
    };
  },
});
