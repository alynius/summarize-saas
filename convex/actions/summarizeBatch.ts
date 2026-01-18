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

function stripHtmlTags(html: string): string {
  let text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "");
  text = text.replace(/<!--[\s\S]*?-->/g, "");
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|hr)[^>]*>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/&mdash;/gi, "—");
  text = text.replace(/&ndash;/gi, "–");
  text = text.replace(/\s+/g, " ");
  text = text.replace(/\n\s*\n/g, "\n\n");
  return text.trim();
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();
  const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
  if (ogTitleMatch) return ogTitleMatch[1].trim();
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) return stripHtmlTags(h1Match[1]).trim();
  return "Untitled";
}

function extractMainContent(html: string): string {
  let content = html;
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) {
    content = articleMatch[1];
  } else {
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) content = mainMatch[1];
  }
  return stripHtmlTags(content);
}

interface UrlResult {
  url: string;
  title: string;
  content: string;
  wordCount: number;
  success: boolean;
  error?: string;
}

async function fetchUrlWithTimeout(url: string, timeoutMs: number = 30000): Promise<UrlResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return {
        url,
        title: "",
        content: "",
        wordCount: 0,
        success: false,
        error: "Failed to fetch: " + response.status + " " + response.statusText,
      };
    }

    const html = await response.text();
    const title = extractTitle(html);
    const content = extractMainContent(html);
    const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;

    if (wordCount < 10) {
      return {
        url,
        title,
        content: "",
        wordCount: 0,
        success: false,
        error: "Could not extract meaningful content",
      };
    }

    return { url, title, content, wordCount, success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      url,
      title: "",
      content: "",
      wordCount: 0,
      success: false,
      error: errorMessage.includes("abort") ? "Request timeout" : errorMessage,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

async function generateBatchSummaryWithLLM(
  combinedContent: string,
  length: SummaryLength,
  model: string,
  urlCount: number
): Promise<{ summary: string; tokensUsed: number }> {
  if (!ALLOWED_MODELS.includes(model)) {
    throw new Error("Invalid model selected. Please choose a supported model.");
  }

  const lengthInstruction = LENGTH_PROMPTS[length];

  const systemPrompt =
    "You are an expert summarizer. You are summarizing content from " +
    urlCount +
    " different web pages. " +
    lengthInstruction +
    " Create a cohesive summary that captures the key points from all sources. " +
    "When content from different URLs relates to each other, synthesize the information. " +
    "If the sources cover different topics, organize the summary by topic.";

  const maxContentLength = 100000;
  const truncatedContent =
    combinedContent.length > maxContentLength
      ? combinedContent.slice(0, maxContentLength) + "\n\n[Content truncated...]"
      : combinedContent;

  const userPrompt = "Please summarize the following content from multiple sources:\n\n" + truncatedContent;

  if (model.startsWith("gpt-") || model.startsWith("o1") || model.startsWith("o3")) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY environment variable is not set");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model,
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
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from OpenAI API: missing content");
    }

    return {
      summary: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens ?? 0,
    };
  } else if (model.startsWith("claude-")) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY environment variable is not set");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
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
    if (!data.content?.[0]?.text) {
      throw new Error("Invalid response from Anthropic API: missing content");
    }

    return {
      summary: data.content[0].text,
      tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
    };
  } else if (model.startsWith("gemini-")) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_API_KEY environment variable is not set");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 2000 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API error:", errorText);
      throw new Error("Failed to generate summary. Please try again later.");
    }

    const data = await response.json();
    if (data.promptFeedback?.blockReason) {
      throw new Error("Content blocked by Google API: " + data.promptFeedback.blockReason);
    }
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response from Google API: missing content");
    }

    const usageMetadata = data.usageMetadata ?? {};
    return {
      summary: data.candidates[0].content.parts[0].text,
      tokensUsed: (usageMetadata.promptTokenCount ?? 0) + (usageMetadata.candidatesTokenCount ?? 0),
    };
  } else {
    throw new Error("Unsupported model: " + model);
  }
}

export const summarizeBatch = action({
  args: {
    userId: v.id("users"),
    urls: v.array(v.string()),
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
      totalUrls: number;
      successfulUrls: number;
      failedUrls: Array<{ url: string; error: string }>;
      titles: string[];
    };
    wordCount: number;
    tokensUsed: number;
  }> => {
    // Validate URL count
    if (args.urls.length < 2) {
      throw new Error("Please provide at least 2 URLs for batch summarization.");
    }
    if (args.urls.length > 10) {
      throw new Error("Maximum 10 URLs allowed for batch summarization.");
    }

    // Check rate limits
    const canSummarizeResult = await ctx.runQuery(api.usage.canSummarize, {
      userId: args.userId,
    });

    if (!canSummarizeResult.allowed) {
      throw new Error(canSummarizeResult.reason || "Cannot summarize at this time");
    }

    // Validate and normalize URLs
    const normalizedUrls = args.urls.map((url) => {
      const trimmed = url.trim();
      if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        return "https://" + trimmed;
      }
      return trimmed;
    });

    // Fetch all URLs in parallel
    console.log("Fetching " + normalizedUrls.length + " URLs...");
    const results = await Promise.all(normalizedUrls.map((url) => fetchUrlWithTimeout(url)));

    const successfulResults = results.filter((r) => r.success);
    const failedResults = results.filter((r) => !r.success);

    if (successfulResults.length === 0) {
      throw new Error("Failed to fetch content from any of the provided URLs.");
    }

    // Combine content from all successful URLs
    const combinedContent = successfulResults
      .map((r, idx) => "=== SOURCE " + (idx + 1) + ": " + r.title + " ===\nURL: " + r.url + "\n\n" + r.content)
      .join("\n\n---\n\n");

    const totalWordCount = successfulResults.reduce((sum, r) => sum + r.wordCount, 0);

    if (totalWordCount < 50) {
      throw new Error("Combined content is too short to summarize (minimum 50 words).");
    }

    // Generate summary
    const { summary, tokensUsed } = await generateBatchSummaryWithLLM(
      combinedContent,
      args.summaryLength,
      args.model,
      successfulResults.length
    );

    // Store the summary
    const summaryId = await ctx.runMutation(api.summaries.createSummary, {
      userId: args.userId,
      inputType: "batch",
      inputTitle: "Batch Summary (" + successfulResults.length + " URLs)",
      inputContent: combinedContent,
      inputWordCount: totalWordCount,
      summary,
      summaryLength: args.summaryLength,
      model: args.model,
      tokensUsed,
      batchUrls: successfulResults.map((r) => r.url),
      batchCount: successfulResults.length,
    });

    // Increment usage tracking
    await ctx.runMutation(api.usage.incrementUsage, {
      userId: args.userId,
      tokensUsed,
    });

    return {
      summaryId,
      summary,
      metadata: {
        totalUrls: args.urls.length,
        successfulUrls: successfulResults.length,
        failedUrls: failedResults.map((r) => ({ url: r.url, error: r.error || "Unknown error" })),
        titles: successfulResults.map((r) => r.title),
      },
      wordCount: totalWordCount,
      tokensUsed,
    };
  },
});
