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

const GITHUB_PR_PATTERN = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i;
const GITHUB_ISSUE_PATTERN = /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/i;

interface GithubPR {
  type: "pr";
  owner: string;
  repo: string;
  number: number;
  title: string;
  body: string;
  state: string;
  author: string;
  labels: string[];
  filesChanged: number;
  additions: number;
  deletions: number;
  comments: Array<{ author: string; body: string }>;
  commits: Array<{ message: string; author: string }>;
}

interface GithubIssue {
  type: "issue";
  owner: string;
  repo: string;
  number: number;
  title: string;
  body: string;
  state: string;
  author: string;
  labels: string[];
  comments: Array<{ author: string; body: string }>;
}

type GithubItem = GithubPR | GithubIssue;

function parseGithubUrl(url: string): { type: "pr" | "issue"; owner: string; repo: string; number: number } | null {
  const prMatch = url.match(GITHUB_PR_PATTERN);
  if (prMatch) {
    return { type: "pr", owner: prMatch[1], repo: prMatch[2], number: parseInt(prMatch[3], 10) };
  }

  const issueMatch = url.match(GITHUB_ISSUE_PATTERN);
  if (issueMatch) {
    return { type: "issue", owner: issueMatch[1], repo: issueMatch[2], number: parseInt(issueMatch[3], 10) };
  }

  return null;
}

async function fetchGithubPR(owner: string, repo: string, number: number): Promise<GithubPR> {
  const baseUrl = "https://api.github.com/repos/" + owner + "/" + repo;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "DigestAI/1.0",
  };

  // Add auth if available
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;
  }

  // Fetch PR details
  const prResponse = await fetch(baseUrl + "/pulls/" + number, { headers });
  if (!prResponse.ok) {
    if (prResponse.status === 404) {
      throw new Error("Pull request not found. It may be private or deleted.");
    }
    throw new Error("Failed to fetch pull request: " + prResponse.status);
  }
  const prData = await prResponse.json();

  // Fetch comments
  const commentsResponse = await fetch(baseUrl + "/issues/" + number + "/comments?per_page=20", { headers });
  const commentsData = commentsResponse.ok ? await commentsResponse.json() : [];

  // Fetch commits (just first page)
  const commitsResponse = await fetch(baseUrl + "/pulls/" + number + "/commits?per_page=10", { headers });
  const commitsData = commitsResponse.ok ? await commitsResponse.json() : [];

  return {
    type: "pr",
    owner,
    repo,
    number,
    title: prData.title,
    body: prData.body || "",
    state: prData.state,
    author: prData.user?.login || "unknown",
    labels: (prData.labels || []).map((l: { name: string }) => l.name),
    filesChanged: prData.changed_files || 0,
    additions: prData.additions || 0,
    deletions: prData.deletions || 0,
    comments: (commentsData || []).map((c: { user?: { login?: string }; body?: string }) => ({
      author: c.user?.login || "unknown",
      body: c.body || "",
    })),
    commits: (commitsData || []).map((c: { commit?: { message?: string; author?: { name?: string } } }) => ({
      message: c.commit?.message || "",
      author: c.commit?.author?.name || "unknown",
    })),
  };
}

async function fetchGithubIssue(owner: string, repo: string, number: number): Promise<GithubIssue> {
  const baseUrl = "https://api.github.com/repos/" + owner + "/" + repo;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "DigestAI/1.0",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;
  }

  // Fetch issue details
  const issueResponse = await fetch(baseUrl + "/issues/" + number, { headers });
  if (!issueResponse.ok) {
    if (issueResponse.status === 404) {
      throw new Error("Issue not found. It may be private or deleted.");
    }
    throw new Error("Failed to fetch issue: " + issueResponse.status);
  }
  const issueData = await issueResponse.json();

  // Fetch comments
  const commentsResponse = await fetch(baseUrl + "/issues/" + number + "/comments?per_page=20", { headers });
  const commentsData = commentsResponse.ok ? await commentsResponse.json() : [];

  return {
    type: "issue",
    owner,
    repo,
    number,
    title: issueData.title,
    body: issueData.body || "",
    state: issueData.state,
    author: issueData.user?.login || "unknown",
    labels: (issueData.labels || []).map((l: { name: string }) => l.name),
    comments: (commentsData || []).map((c: { user?: { login?: string }; body?: string }) => ({
      author: c.user?.login || "unknown",
      body: c.body || "",
    })),
  };
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

async function generateGithubSummaryWithLLM(
  content: string,
  length: SummaryLength,
  model: string,
  item: GithubItem
): Promise<{ summary: string; tokensUsed: number }> {
  if (!ALLOWED_MODELS.includes(model)) {
    throw new Error("Invalid model selected. Please choose a supported model.");
  }

  const lengthInstruction = LENGTH_PROMPTS[length];
  const itemType = item.type === "pr" ? "Pull Request" : "Issue";

  const systemPrompt =
    "You are an expert summarizer specializing in software development discussions. " +
    "You are summarizing a GitHub " + itemType + " from " + item.owner + "/" + item.repo + ". " +
    lengthInstruction +
    " Focus on: what the " + itemType.toLowerCase() + " is about, key changes or problems discussed, " +
    "important decisions made, and current status. Be technical but accessible.";

  const maxContentLength = 80000;
  const truncatedContent =
    content.length > maxContentLength
      ? content.slice(0, maxContentLength) + "\n\n[Content truncated...]"
      : content;

  const userPrompt = "Please summarize the following GitHub " + itemType + ":\n\n" + truncatedContent;

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

export const summarizeGithub = action({
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
      type: "pr" | "issue";
      owner: string;
      repo: string;
      number: number;
      title: string;
      state: string;
      filesChanged?: number;
    };
    wordCount: number;
    tokensUsed: number;
  }> => {
    // Parse URL
    const parsed = parseGithubUrl(args.url);
    if (!parsed) {
      throw new Error("Invalid GitHub URL. Please provide a link to a GitHub Pull Request or Issue.");
    }

    // Check rate limits
    const canSummarizeResult = await ctx.runQuery(api.usage.canSummarize, {
      userId: args.userId,
    });

    if (!canSummarizeResult.allowed) {
      throw new Error(canSummarizeResult.reason || "Cannot summarize at this time");
    }

    // Fetch item
    console.log("Fetching GitHub " + parsed.type + ": " + parsed.owner + "/" + parsed.repo + "#" + parsed.number);
    const item: GithubItem =
      parsed.type === "pr"
        ? await fetchGithubPR(parsed.owner, parsed.repo, parsed.number)
        : await fetchGithubIssue(parsed.owner, parsed.repo, parsed.number);

    // Format content
    let content: string;
    if (item.type === "pr") {
      content =
        "=== PULL REQUEST #" + item.number + " ===\n" +
        "Title: " + item.title + "\n" +
        "Author: @" + item.author + "\n" +
        "State: " + item.state + "\n" +
        "Labels: " + (item.labels.length > 0 ? item.labels.join(", ") : "None") + "\n" +
        "Files Changed: " + item.filesChanged + " (+" + item.additions + " -" + item.deletions + ")\n\n" +
        "=== DESCRIPTION ===\n" +
        (item.body || "(No description)") + "\n\n" +
        "=== COMMITS (" + item.commits.length + ") ===\n" +
        item.commits.map((c) => "- " + c.message.split("\n")[0]).join("\n") + "\n\n" +
        "=== COMMENTS (" + item.comments.length + ") ===\n" +
        item.comments.map((c) => "@" + c.author + ":\n" + c.body).join("\n\n---\n\n");
    } else {
      content =
        "=== ISSUE #" + item.number + " ===\n" +
        "Title: " + item.title + "\n" +
        "Author: @" + item.author + "\n" +
        "State: " + item.state + "\n" +
        "Labels: " + (item.labels.length > 0 ? item.labels.join(", ") : "None") + "\n\n" +
        "=== DESCRIPTION ===\n" +
        (item.body || "(No description)") + "\n\n" +
        "=== COMMENTS (" + item.comments.length + ") ===\n" +
        item.comments.map((c) => "@" + c.author + ":\n" + c.body).join("\n\n---\n\n");
    }

    const wordCount = countWords(content);

    if (wordCount < 10) {
      throw new Error("Content is too short to summarize.");
    }

    // Generate summary
    const { summary, tokensUsed } = await generateGithubSummaryWithLLM(
      content,
      args.summaryLength,
      args.model,
      item
    );

    // Store the summary
    const summaryId = await ctx.runMutation(api.summaries.createSummary, {
      userId: args.userId,
      url: args.url,
      inputType: "github",
      inputTitle: item.title,
      inputContent: content,
      inputWordCount: wordCount,
      summary,
      summaryLength: args.summaryLength,
      model: args.model,
      tokensUsed,
      githubType: item.type,
      githubOwner: item.owner,
      githubRepo: item.repo,
      githubNumber: item.number,
      githubState: item.state,
      githubFilesChanged: item.type === "pr" ? item.filesChanged : undefined,
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
        type: item.type,
        owner: item.owner,
        repo: item.repo,
        number: item.number,
        title: item.title,
        state: item.state,
        filesChanged: item.type === "pr" ? item.filesChanged : undefined,
      },
      wordCount,
      tokensUsed,
    };
  },
});
