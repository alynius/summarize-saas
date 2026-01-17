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

function stripHtmlTags(html: string): string {
  // Remove script and style elements entirely
  let text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Replace common block elements with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|hr)[^>]*>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text.replace(/&nbsp;/gi, ' ');
  text = text.replace(/&amp;/gi, '&');
  text = text.replace(/&lt;/gi, '<');
  text = text.replace(/&gt;/gi, '>');
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/&mdash;/gi, '—');
  text = text.replace(/&ndash;/gi, '–');

  // Collapse whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n\s*\n/g, '\n\n');

  return text.trim();
}

function extractTitle(html: string): string {
  // Try to extract title from <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Try og:title
  const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
  if (ogTitleMatch) {
    return ogTitleMatch[1].trim();
  }

  // Try first h1
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return stripHtmlTags(h1Match[1]).trim();
  }

  return "Untitled";
}

function extractMainContent(html: string): string {
  // Try to find article or main content
  let content = html;

  // Try to extract from article tag
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) {
    content = articleMatch[1];
  } else {
    // Try main tag
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
      content = mainMatch[1];
    }
  }

  return stripHtmlTags(content);
}

async function fetchAndExtractContent(url: string): Promise<{
  title: string;
  content: string;
  wordCount: number;
}> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const title = extractTitle(html);
  const content = extractMainContent(html);
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount < 10) {
    throw new Error("Could not extract meaningful content from the URL");
  }

  return {
    title,
    content,
    wordCount,
  };
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

async function generateSummaryWithLLM(
  content: string,
  length: SummaryLength,
  model: string
): Promise<{ summary: string; tokensUsed: number }> {
  const lengthInstruction = LENGTH_PROMPTS[length];

  const systemPrompt = `You are an expert summarizer. Your task is to create clear, accurate, and well-structured summaries of content provided to you. ${lengthInstruction} Focus on the main ideas, key points, and important details. Maintain the original meaning and tone while making the summary accessible and easy to understand.`;

  // Truncate content if too long (roughly 100k chars ~ 25k tokens)
  const maxContentLength = 100000;
  const truncatedContent = content.length > maxContentLength
    ? content.slice(0, maxContentLength) + "\n\n[Content truncated...]"
    : content;

  const userPrompt = `Please summarize the following content:\n\n${truncatedContent}`;

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
        Authorization: `Bearer ${apiKey}`,
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
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
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
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
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
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
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
      const error = await response.text();
      throw new Error(`Google API error: ${error}`);
    }

    const data = await response.json();
    const usageMetadata = data.usageMetadata ?? {};

    return {
      summary: data.candidates[0].content.parts[0].text,
      tokensUsed:
        (usageMetadata.promptTokenCount ?? 0) +
        (usageMetadata.candidatesTokenCount ?? 0),
    };
  } else {
    throw new Error(`Unsupported model: ${model}`);
  }
}

export const summarize = action({
  args: {
    userId: v.id("users"),
    url: v.optional(v.string()),
    text: v.optional(v.string()),
    summaryLength: v.union(
      v.literal("short"),
      v.literal("medium"),
      v.literal("long"),
      v.literal("xl")
    ),
    model: v.string(),
  },
  handler: async (ctx, args): Promise<{
    summaryId: string;
    summary: string;
    title?: string;
    wordCount: number;
    tokensUsed: number;
  }> => {
    // Validate input - either URL or text must be provided
    if (!args.url && !args.text) {
      throw new Error("Either URL or text must be provided");
    }

    // Check if user can summarize (within rate limits)
    const canSummarizeResult = await ctx.runQuery(api.usage.canSummarize, {
      userId: args.userId,
    });

    if (!canSummarizeResult.allowed) {
      throw new Error(canSummarizeResult.reason || "Cannot summarize at this time");
    }

    let inputContent: string;
    let inputTitle: string | undefined;
    let inputWordCount: number;
    const inputType: "url" | "text" = args.url ? "url" : "text";

    // Extract content based on input type
    if (args.url) {
      const extracted = await fetchAndExtractContent(args.url);
      inputContent = extracted.content;
      inputTitle = extracted.title;
      inputWordCount = extracted.wordCount;
    } else {
      inputContent = args.text!;
      inputWordCount = countWords(inputContent);
    }

    // Validate content length
    if (inputWordCount < 50) {
      throw new Error("Content is too short to summarize (minimum 50 words)");
    }

    if (inputWordCount > 100000) {
      throw new Error("Content is too long to summarize (maximum 100,000 words)");
    }

    // Generate summary using LLM
    const { summary, tokensUsed } = await generateSummaryWithLLM(
      inputContent,
      args.summaryLength,
      args.model
    );

    // Store the summary in the database
    const summaryId = await ctx.runMutation(api.summaries.createSummary, {
      userId: args.userId,
      url: args.url,
      inputType,
      inputTitle,
      inputContent,
      inputWordCount,
      summary,
      summaryLength: args.summaryLength,
      model: args.model,
      tokensUsed,
    });

    // Increment usage tracking
    await ctx.runMutation(api.usage.incrementUsage, {
      userId: args.userId,
      tokensUsed,
    });

    return {
      summaryId,
      summary,
      title: inputTitle,
      wordCount: inputWordCount,
      tokensUsed,
    };
  },
});

export const summarizeWithoutAuth = action({
  args: {
    url: v.optional(v.string()),
    text: v.optional(v.string()),
    summaryLength: v.union(
      v.literal("short"),
      v.literal("medium"),
      v.literal("long"),
      v.literal("xl")
    ),
    model: v.string(),
  },
  handler: async (_, args): Promise<{
    summary: string;
    title?: string;
    wordCount: number;
    tokensUsed: number;
  }> => {
    // Validate input - either URL or text must be provided
    if (!args.url && !args.text) {
      throw new Error("Either URL or text must be provided");
    }

    let inputContent: string;
    let inputTitle: string | undefined;
    let inputWordCount: number;

    // Extract content based on input type
    if (args.url) {
      const extracted = await fetchAndExtractContent(args.url);
      inputContent = extracted.content;
      inputTitle = extracted.title;
      inputWordCount = extracted.wordCount;
    } else {
      inputContent = args.text!;
      inputWordCount = countWords(inputContent);
    }

    // Validate content length
    if (inputWordCount < 50) {
      throw new Error("Content is too short to summarize (minimum 50 words)");
    }

    if (inputWordCount > 100000) {
      throw new Error("Content is too long to summarize (maximum 100,000 words)");
    }

    // Generate summary using LLM
    const { summary, tokensUsed } = await generateSummaryWithLLM(
      inputContent,
      args.summaryLength,
      args.model
    );

    return {
      summary,
      title: inputTitle,
      wordCount: inputWordCount,
      tokensUsed,
    };
  },
});
