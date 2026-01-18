"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import * as cheerio from "cheerio";

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

const TWITTER_URL_PATTERNS = [
  /(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/i,
  /(?:twitter\.com|x\.com)\/i\/web\/status\/(\d+)/i,
];

const NITTER_INSTANCES = [
  "nitter.privacydev.net",
  "nitter.poast.org",
  "nitter.net",
  "nitter.cz",
];

interface TwitterThread {
  tweetId: string;
  author: string;
  authorHandle: string;
  tweets: Array<{
    content: string;
    timestamp?: string;
  }>;
}

function parseTwitterUrl(url: string): { tweetId: string; handle?: string } | null {
  for (const pattern of TWITTER_URL_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      if (match.length === 3) {
        return { tweetId: match[2], handle: match[1] };
      } else if (match.length === 2) {
        return { tweetId: match[1] };
      }
    }
  }
  return null;
}

async function fetchViaNitter(tweetId: string): Promise<TwitterThread | null> {
  for (const instance of NITTER_INSTANCES) {
    try {
      const nitterUrl = "https://" + instance + "/i/status/" + tweetId;
      console.log("Trying Nitter instance: " + instance);

      const response = await fetch(nitterUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract author info
      const authorElement = $(".tweet-header .fullname").first();
      const handleElement = $(".tweet-header .username").first();
      const author = authorElement.text().trim() || "Unknown";
      const authorHandle = handleElement.text().trim().replace("@", "") || "unknown";

      // Extract tweets in thread
      const tweets: Array<{ content: string; timestamp?: string }> = [];

      $(".timeline-item, .main-tweet").each((_, element) => {
        const tweetContent = $(element).find(".tweet-content").text().trim();
        const timestamp = $(element).find(".tweet-date a").attr("title");

        if (tweetContent) {
          tweets.push({
            content: tweetContent,
            timestamp,
          });
        }
      });

      if (tweets.length === 0) continue;

      return {
        tweetId,
        author,
        authorHandle,
        tweets,
      };
    } catch (error) {
      console.log("Nitter instance " + instance + " failed:", error);
      continue;
    }
  }

  return null;
}

async function fetchTwitterThread(tweetId: string): Promise<TwitterThread> {
  // Try Nitter instances first
  const nitterResult = await fetchViaNitter(tweetId);
  if (nitterResult) {
    return nitterResult;
  }

  throw new Error(
    "Unable to fetch Twitter thread. The tweet may be private, deleted, or Twitter is blocking access. " +
    "Please ensure the tweet is public and try again."
  );
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

async function generateTwitterSummaryWithLLM(
  threadContent: string,
  length: SummaryLength,
  model: string,
  author: string,
  tweetCount: number
): Promise<{ summary: string; tokensUsed: number }> {
  if (!ALLOWED_MODELS.includes(model)) {
    throw new Error("Invalid model selected. Please choose a supported model.");
  }

  const lengthInstruction = LENGTH_PROMPTS[length];

  const systemPrompt =
    "You are an expert summarizer specializing in social media content. " +
    "You are summarizing a Twitter/X thread by @" + author + " containing " + tweetCount + " tweets. " +
    lengthInstruction +
    " Focus on the main ideas, key arguments, and important takeaways. " +
    "Maintain the original tone while making the summary accessible.";

  const maxContentLength = 50000;
  const truncatedContent =
    threadContent.length > maxContentLength
      ? threadContent.slice(0, maxContentLength) + "\n\n[Thread truncated...]"
      : threadContent;

  const userPrompt = "Please summarize the following Twitter thread:\n\n" + truncatedContent;

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
    return {
      summary: data.candidates[0].content.parts[0].text,
      tokensUsed: (data.usageMetadata?.promptTokenCount ?? 0) + (data.usageMetadata?.candidatesTokenCount ?? 0),
    };
  } else {
    throw new Error("Unsupported model: " + model);
  }
}

export const summarizeTwitter = action({
  args: {
    userId: v.id("users"),
    url: v.string(),
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
      author: string;
      authorHandle: string;
      tweetCount: number;
    };
    wordCount: number;
    tokensUsed: number;
  }> => {
    // Parse URL to extract tweet ID
    const parsed = parseTwitterUrl(args.url);
    if (!parsed) {
      throw new Error("Invalid Twitter/X URL. Please provide a valid tweet URL.");
    }

    // Check rate limits
    const canSummarizeResult = await ctx.runQuery(api.usage.canSummarize, {
      userId: args.userId,
    });

    if (!canSummarizeResult.allowed) {
      throw new Error(canSummarizeResult.reason || "Cannot summarize at this time");
    }

    // Fetch thread
    console.log("Fetching Twitter thread: " + parsed.tweetId);
    const thread = await fetchTwitterThread(parsed.tweetId);

    // Format thread content
    const threadContent = thread.tweets
      .map((tweet, idx) => "Tweet " + (idx + 1) + ":\n" + tweet.content)
      .join("\n\n---\n\n");

    const wordCount = countWords(threadContent);

    if (wordCount < 10) {
      throw new Error("Thread content is too short to summarize.");
    }

    // Generate summary
    const { summary, tokensUsed } = await generateTwitterSummaryWithLLM(
      threadContent,
      args.summaryLength,
      args.model,
      thread.author,
      thread.tweets.length
    );

    // Store the summary
    const summaryId = await ctx.runMutation(api.summaries.createSummary, {
      userId: args.userId,
      url: args.url,
      inputType: "twitter",
      inputTitle: "Thread by @" + thread.authorHandle,
      inputContent: threadContent,
      inputWordCount: wordCount,
      summary,
      summaryLength: args.summaryLength,
      model: args.model,
      tokensUsed,
      twitterThreadId: thread.tweetId,
      twitterAuthor: thread.author,
      twitterAuthorHandle: thread.authorHandle,
      twitterTweetCount: thread.tweets.length,
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
        author: thread.author,
        authorHandle: thread.authorHandle,
        tweetCount: thread.tweets.length,
      },
      wordCount,
      tokensUsed,
    };
  },
});
