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

// ============================================================================
// LLM Summary Generation (copied from summarizeYoutube.ts for self-contained action)
// ============================================================================

// Allowed models for summarization
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

async function generateSummaryWithLLM(
  content: string,
  length: SummaryLength,
  model: string,
  documentTitle?: string
): Promise<{ summary: string; tokensUsed: number }> {
  // Validate model is in allowed list
  if (!ALLOWED_MODELS.includes(model)) {
    throw new Error("Invalid model selected. Please choose a supported model.");
  }

  const lengthInstruction = LENGTH_PROMPTS[length];

  const contextInfo = documentTitle
    ? 'You are summarizing a PDF document titled: "' + documentTitle + '". '
    : "";

  const systemPrompt = "You are an expert summarizer specializing in document content. " + contextInfo + "Your task is to create clear, accurate, and well-structured summaries of PDF documents. " + lengthInstruction + " Focus on the main ideas, key points, and important details. Maintain the original meaning and tone while making the summary accessible and easy to understand. Note that the input is extracted text from a PDF which may have some formatting artifacts - interpret the content intelligently.";

  // Truncate content if too long (roughly 100k chars ~ 25k tokens)
  const maxContentLength = 100000;
  const truncatedContent =
    content.length > maxContentLength
      ? content.slice(0, maxContentLength) + "\n\n[Document truncated...]"
      : content;

  const userPrompt = "Please summarize the following PDF document content:\n\n" + truncatedContent;

  // Determine which provider to use based on model string
  if (model.startsWith("gpt-") || model.startsWith("o1") || model.startsWith("o3")) {
    // OpenAI models
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error("Failed to generate summary. Please try again later.");
    }

    const data = await response.json();

    // Validate response structure
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI API: missing content");
    }

    return {
      summary: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens ?? 0,
    };
  } else if (model.startsWith("claude-")) {
    // Anthropic models
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      throw new Error("Failed to generate summary. Please try again later.");
    }

    const data = await response.json();

    // Validate response structure
    if (!data.content?.[0]?.text) {
      throw new Error("Invalid response from Anthropic API: missing content");
    }

    const inputTokens = data.usage?.input_tokens ?? 0;
    const outputTokens = data.usage?.output_tokens ?? 0;

    return {
      summary: data.content[0].text,
      tokensUsed: inputTokens + outputTokens,
    };
  } else if (model.startsWith("gemini-")) {
    // Google models
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY environment variable is not set");
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API error:", errorText);
      throw new Error("Failed to generate summary. Please try again later.");
    }

    const data = await response.json();

    // Validate response structure and check for content blocking
    if (data.promptFeedback?.blockReason) {
      throw new Error("Content blocked by Google API: " + data.promptFeedback.blockReason);
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response from Google API: missing content");
    }

    const usageMetadata = data.usageMetadata ?? {};

    return {
      summary: data.candidates[0].content.parts[0].text,
      tokensUsed:
        (usageMetadata.promptTokenCount ?? 0) +
        (usageMetadata.candidatesTokenCount ?? 0),
    };
  } else {
    throw new Error("Unsupported model: " + model);
  }
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

// ============================================================================
// PDF Summarize Action
// ============================================================================

export const summarizePdf = action({
  args: {
    userId: v.id("users"),
    pdfBase64: v.string(),
    fileName: v.string(),
    summaryLength: v.union(
      v.literal("short"),
      v.literal("medium"),
      v.literal("long"),
      v.literal("xl")
    ),
    model: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    summaryId: string;
    summary: string;
    metadata: {
      fileName: string;
      pageCount: number;
      title?: string;
      author?: string;
    };
    wordCount: number;
    tokensUsed: number;
  }> => {
    // 1. Check rate limits
    const canSummarizeResult = await ctx.runQuery(api.usage.canSummarize, {
      userId: args.userId,
    });

    if (!canSummarizeResult.allowed) {
      throw new Error(
        canSummarizeResult.reason || "Cannot summarize at this time"
      );
    }

    // 2. Validate base64 size before decoding (10MB * 1.37 for base64 overhead)
    const MAX_BASE64_SIZE = 10 * 1024 * 1024 * 1.37; // ~13.7MB
    if (args.pdfBase64.length > MAX_BASE64_SIZE) {
      throw new Error("PDF file is too large. Maximum size is 10MB.");
    }

    // 3. Decode base64 to buffer
    const pdfBuffer = Buffer.from(args.pdfBase64, "base64");

    // Validate PDF magic bytes
    if (pdfBuffer.length < 5 || pdfBuffer.toString("utf8", 0, 5) !== "%PDF-") {
      throw new Error("Invalid PDF file format.");
    }

    // 4. Extract text using pdf-parse (dynamic import for Convex Node runtime)
    let pdfText: string;
    let pageCount: number;
    let pdfTitle: string | undefined;
    let pdfAuthor: string | undefined;

    try {
      const { PDFParse } = await import("pdf-parse");

      // Convert Buffer to Uint8Array for pdf-parse
      const pdfData = new Uint8Array(pdfBuffer);

      // Create parser and parse the PDF
      const parser = new PDFParse({ data: pdfData });

      // Get text and info
      const [textResult, infoResult] = await Promise.all([
        parser.getText(),
        parser.getInfo(),
      ]);

      // Clean up parser
      await parser.destroy();

      // Extract and clean up text
      pdfText = textResult.text
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      pageCount = infoResult.total;

      // Extract metadata
      if (infoResult.info?.Title) {
        pdfTitle = infoResult.info.Title;
      }
      if (infoResult.info?.Author) {
        pdfAuthor = infoResult.info.Author;
      }
    } catch (error) {
      console.error("PDF parsing error:", error);
      throw new Error("Failed to parse PDF. The file may be corrupted or password-protected.");
    }

    // 5. Validate word count (50-100,000)
    const wordCount = countWords(pdfText);

    if (wordCount < 50) {
      throw new Error(
        "PDF content is too short to summarize (minimum 50 words). The PDF may contain mostly images or have no extractable text."
      );
    }

    if (wordCount > 100000) {
      throw new Error(
        "PDF content is too long to summarize (maximum 100,000 words). Please try a shorter document."
      );
    }

    // 6. Generate summary using LLM
    const displayTitle = pdfTitle || args.fileName;
    const { summary, tokensUsed } = await generateSummaryWithLLM(
      pdfText,
      args.summaryLength,
      args.model,
      displayTitle
    );

    // 7. Store via api.summaries.createSummary with PDF fields
    const summaryId = await ctx.runMutation(api.summaries.createSummary, {
      userId: args.userId,
      inputType: "pdf",
      inputTitle: displayTitle,
      inputContent: pdfText,
      inputWordCount: wordCount,
      summary,
      summaryLength: args.summaryLength,
      model: args.model,
      tokensUsed,
      pdfFileName: args.fileName,
      pdfPageCount: pageCount,
    });

    // 8. Increment usage tracking
    await ctx.runMutation(api.usage.incrementUsage, {
      userId: args.userId,
      tokensUsed,
    });

    // 9. Return result
    return {
      summaryId,
      summary,
      metadata: {
        fileName: args.fileName,
        pageCount,
        title: pdfTitle,
        author: pdfAuthor,
      },
      wordCount,
      tokensUsed,
    };
  },
});
