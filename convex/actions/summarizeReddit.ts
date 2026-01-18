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

const REDDIT_URL_PATTERN = /reddit\.com\/r\/([^/]+)\/comments\/([^/]+)/i;

interface RedditPost {
  postId: string;
  subreddit: string;
  author: string;
  title: string;
  selftext: string;
  score: number;
  comments: Array<{
    author: string;
    body: string;
    score: number;
  }>;
  commentCount: number;
}

function parseRedditUrl(url: string): { subreddit: string; postId: string } | null {
  const match = url.match(REDDIT_URL_PATTERN);
  if (match) {
    return { subreddit: match[1], postId: match[2] };
  }
  return null;
}

interface RedditApiComment {
  kind: string;
  data: {
    author?: string;
    body?: string;
    score?: number;
    replies?: {
      data?: {
        children?: RedditApiComment[];
      };
    };
  };
}

interface RedditApiResponse {
  data: {
    children: Array<{
      data: {
        id: string;
        subreddit: string;
        author: string;
        title: string;
        selftext: string;
        score: number;
        num_comments: number;
      };
    }>;
  };
}

async function fetchRedditPost(subreddit: string, postId: string): Promise<RedditPost> {
  const jsonUrl = "https://www.reddit.com/r/" + subreddit + "/comments/" + postId + ".json";

  const response = await fetch(jsonUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DigestAI/1.0)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Reddit post not found. It may be private or deleted.");
    }
    throw new Error("Failed to fetch Reddit post: " + response.status);
  }

  const data = await response.json() as [RedditApiResponse, { data: { children: RedditApiComment[] } }];

  if (!Array.isArray(data) || data.length < 2) {
    throw new Error("Invalid response from Reddit");
  }

  const postData = data[0].data.children[0].data;
  const commentsData = data[1].data.children;

  // Extract top comments (up to 20)
  const comments: Array<{ author: string; body: string; score: number }> = [];

  function extractComments(commentList: RedditApiComment[], depth: number = 0) {
    if (depth > 2 || comments.length >= 20) return;

    for (const comment of commentList) {
      if (comment.kind !== "t1" || comments.length >= 20) continue;
      if (!comment.data.body || comment.data.body === "[deleted]" || comment.data.body === "[removed]") continue;

      comments.push({
        author: comment.data.author || "[deleted]",
        body: comment.data.body,
        score: comment.data.score || 0,
      });

      // Get top replies
      if (comment.data.replies?.data?.children) {
        extractComments(comment.data.replies.data.children, depth + 1);
      }
    }
  }

  extractComments(commentsData);

  // Sort by score
  comments.sort((a, b) => b.score - a.score);

  return {
    postId,
    subreddit,
    author: postData.author,
    title: postData.title,
    selftext: postData.selftext || "",
    score: postData.score,
    comments: comments.slice(0, 20),
    commentCount: postData.num_comments,
  };
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

async function generateRedditSummaryWithLLM(
  content: string,
  length: SummaryLength,
  model: string,
  postTitle: string,
  subreddit: string,
  commentCount: number
): Promise<{ summary: string; tokensUsed: number }> {
  if (!ALLOWED_MODELS.includes(model)) {
    throw new Error("Invalid model selected. Please choose a supported model.");
  }

  const lengthInstruction = LENGTH_PROMPTS[length];

  const systemPrompt =
    "You are an expert summarizer specializing in online discussions. " +
    "You are summarizing a Reddit post from r/" + subreddit + ' titled "' + postTitle + '" with ' + commentCount + " comments. " +
    lengthInstruction +
    " Summarize both the original post and the key points from the discussion. " +
    "Highlight any consensus, disagreements, or valuable insights from the comments.";

  const maxContentLength = 80000;
  const truncatedContent =
    content.length > maxContentLength
      ? content.slice(0, maxContentLength) + "\n\n[Content truncated...]"
      : content;

  const userPrompt = "Please summarize the following Reddit post and discussion:\n\n" + truncatedContent;

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

export const summarizeReddit = action({
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
      title: string;
      subreddit: string;
      author: string;
      score: number;
      commentCount: number;
    };
    wordCount: number;
    tokensUsed: number;
  }> => {
    // Parse URL
    const parsed = parseRedditUrl(args.url);
    if (!parsed) {
      throw new Error("Invalid Reddit URL. Please provide a link to a Reddit post.");
    }

    // Check rate limits
    const canSummarizeResult = await ctx.runQuery(api.usage.canSummarize, {
      userId: args.userId,
    });

    if (!canSummarizeResult.allowed) {
      throw new Error(canSummarizeResult.reason || "Cannot summarize at this time");
    }

    // Fetch post
    console.log("Fetching Reddit post: r/" + parsed.subreddit + "/" + parsed.postId);
    const post = await fetchRedditPost(parsed.subreddit, parsed.postId);

    // Format content
    const content =
      "=== POST ===\n" +
      "Title: " + post.title + "\n" +
      "Author: u/" + post.author + "\n" +
      "Score: " + post.score + " points\n" +
      "Subreddit: r/" + post.subreddit + "\n\n" +
      (post.selftext ? post.selftext + "\n\n" : "") +
      "=== TOP COMMENTS (" + post.comments.length + " of " + post.commentCount + " total) ===\n\n" +
      post.comments
        .map((c) => "u/" + c.author + " (" + c.score + " points):\n" + c.body)
        .join("\n\n---\n\n");

    const wordCount = countWords(content);

    if (wordCount < 20) {
      throw new Error("Post content is too short to summarize.");
    }

    // Generate summary
    const { summary, tokensUsed } = await generateRedditSummaryWithLLM(
      content,
      args.summaryLength,
      args.model,
      post.title,
      post.subreddit,
      post.commentCount
    );

    // Store the summary
    const summaryId = await ctx.runMutation(api.summaries.createSummary, {
      userId: args.userId,
      url: args.url,
      inputType: "reddit",
      inputTitle: post.title,
      inputContent: content,
      inputWordCount: wordCount,
      summary,
      summaryLength: args.summaryLength,
      model: args.model,
      tokensUsed,
      redditPostId: post.postId,
      redditSubreddit: post.subreddit,
      redditAuthor: post.author,
      redditScore: post.score,
      redditCommentCount: post.commentCount,
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
        title: post.title,
        subreddit: post.subreddit,
        author: post.author,
        score: post.score,
        commentCount: post.commentCount,
      },
      wordCount,
      tokensUsed,
    };
  },
});
