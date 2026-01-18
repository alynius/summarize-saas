"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { YoutubeTranscript } from "youtube-transcript";

type SummaryLength = "short" | "medium" | "long" | "xl";

const LENGTH_PROMPTS: Record<SummaryLength, string> = {
  short: "Provide a brief summary in 2-3 sentences (approximately 50-75 words).",
  medium: "Provide a moderate summary in 1-2 paragraphs (approximately 150-200 words).",
  long: "Provide a detailed summary covering all main points (approximately 300-400 words).",
  xl: "Provide a comprehensive summary with key details and context (approximately 500-700 words).",
};

// ============================================================================
// YouTube Utility Functions (copied for Convex Node runtime compatibility)
// ============================================================================

const YOUTUBE_URL_PATTERNS = [
  // Short URL: youtu.be/VIDEO_ID (most specific, check first)
  /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  // Embed URL: youtube.com/embed/VIDEO_ID
  /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  // YouTube Shorts: youtube.com/shorts/VIDEO_ID
  /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  // YouTube Live: youtube.com/live/VIDEO_ID
  /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
  // Watch URL with v= anywhere in query string (handles ?v=, ?list=...&v=, etc.)
  /(?:(?:www\.|m\.)?youtube\.com\/watch\?(?:[^&]*&)*v=)([a-zA-Z0-9_-]{11})/,
];

/**
 * Extract the video ID from a YouTube URL
 */
function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  const trimmedUrl = url.trim();

  // Check if the input is already a video ID (11 characters, alphanumeric with - and _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // Try each pattern
  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

interface YouTubeMetadata {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
}

interface OEmbedResponse {
  title: string;
  author_name: string;
}

/**
 * Fetch YouTube video metadata using the oEmbed API
 */
async function fetchYouTubeMetadata(videoId: string): Promise<YouTubeMetadata> {
  if (!videoId || typeof videoId !== "string") {
    throw new Error("Invalid video ID provided");
  }

  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    throw new Error("Invalid video ID format");
  }

  const videoUrl = "https://www.youtube.com/watch?v=" + videoId;
  const oembedUrl = "https://www.youtube.com/oembed?url=" + encodeURIComponent(videoUrl) + "&format=json";

  const response = await fetch(oembedUrl);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Video not found or is private");
    }
    if (response.status === 401) {
      throw new Error("Video is not embeddable");
    }
    throw new Error("Failed to fetch video metadata: " + response.statusText);
  }

  const data = (await response.json()) as Partial<OEmbedResponse>;

  if (!data.title || !data.author_name) {
    throw new Error("Invalid response from YouTube oEmbed API");
  }

  const thumbnail = "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg";

  return {
    videoId,
    title: data.title,
    channelName: data.author_name,
    thumbnail,
  };
}

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string;
}

/**
 * Extract caption tracks from YouTube page HTML
 */
function extractCaptionTracks(html: string): CaptionTrack[] {
  try {
    const match = html.match(/"captionTracks":\s*(\[[\s\S]*?\])/);
    if (!match) {
      return [];
    }
    const jsonStr = match[1].replace(/\\u0026/g, "&");
    const tracks = JSON.parse(jsonStr) as CaptionTrack[];
    return tracks;
  } catch {
    return [];
  }
}

/**
 * Fetch transcript directly from YouTube's timedtext API
 */
async function fetchTranscriptDirect(videoId: string): Promise<string | null> {
  try {
    const videoUrl = "https://www.youtube.com/watch?v=" + videoId;
    const response = await fetch(videoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const captionTracks = extractCaptionTracks(html);
    if (captionTracks.length === 0) {
      return null;
    }

    // Prefer English captions, then auto-generated, then first available
    let selectedTrack = captionTracks.find(
      (t) => t.languageCode === "en" && t.kind !== "asr"
    );
    if (!selectedTrack) {
      selectedTrack = captionTracks.find(
        (t) => t.languageCode === "en" && t.kind === "asr"
      );
    }
    if (!selectedTrack) {
      selectedTrack = captionTracks.find((t) => t.kind !== "asr");
    }
    if (!selectedTrack) {
      selectedTrack = captionTracks[0];
    }

    const transcriptUrl = selectedTrack.baseUrl + "&fmt=json3";
    const transcriptResponse = await fetch(transcriptUrl);

    if (!transcriptResponse.ok) {
      return null;
    }

    const transcriptData = await transcriptResponse.json();

    if (!transcriptData.events || !Array.isArray(transcriptData.events)) {
      return null;
    }

    const textParts: string[] = [];
    for (const event of transcriptData.events) {
      if (event.segs) {
        for (const seg of event.segs) {
          if (seg.utf8) {
            textParts.push(seg.utf8);
          }
        }
      }
    }

    const transcript = textParts.join(" ").replace(/\s+/g, " ").trim();
    return transcript.length > 0 ? transcript : null;
  } catch {
    return null;
  }
}

/**
 * Fetch the transcript for a YouTube video
 * Uses direct API fetch first, falls back to youtube-transcript package
 */
async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  if (!videoId || typeof videoId !== "string") {
    throw new Error("Invalid video ID provided");
  }

  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    throw new Error("Invalid video ID format");
  }

  // Try direct fetch first
  const directTranscript = await fetchTranscriptDirect(videoId);
  if (directTranscript && directTranscript.length > 10) {
    return directTranscript;
  }

  // Fall back to youtube-transcript package
  try {
    const transcriptSegments = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptSegments || transcriptSegments.length === 0) {
      throw new Error("No transcript available for this video");
    }

    const fullTranscript = transcriptSegments
      .map((segment) => segment.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return fullTranscript;
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes("disabled") ||
        errorMessage.includes("no captions")
      ) {
        throw new Error(
          "Captions are disabled for this video or no captions are available"
        );
      }

      if (errorMessage.includes("private")) {
        throw new Error("Cannot fetch transcript: video is private");
      }

      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("unavailable")
      ) {
        throw new Error("Video not found or is unavailable");
      }

      if (errorMessage.includes("age")) {
        throw new Error("Cannot fetch transcript: video is age-restricted");
      }

      throw error;
    }

    throw new Error("Failed to fetch YouTube transcript");
  }
}

// ============================================================================
// LLM Summary Generation (copied from summarize.ts)
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
  videoTitle?: string
): Promise<{ summary: string; tokensUsed: number }> {
  // Validate model is in allowed list
  if (!ALLOWED_MODELS.includes(model)) {
    throw new Error("Invalid model selected. Please choose a supported model.");
  }

  const lengthInstruction = LENGTH_PROMPTS[length];

  const contextInfo = videoTitle
    ? 'You are summarizing a YouTube video titled: "' + videoTitle + '". '
    : "";

  const systemPrompt = "You are an expert summarizer specializing in video content. " + contextInfo + "Your task is to create clear, accurate, and well-structured summaries of video transcripts. " + lengthInstruction + " Focus on the main ideas, key points, and important details. Maintain the original meaning and tone while making the summary accessible and easy to understand. Note that the input is a transcript which may contain minor transcription errors or lack punctuation - interpret the content intelligently.";

  // Truncate content if too long (roughly 100k chars ~ 25k tokens)
  const maxContentLength = 100000;
  const truncatedContent =
    content.length > maxContentLength
      ? content.slice(0, maxContentLength) + "\n\n[Transcript truncated...]"
      : content;

  const userPrompt = "Please summarize the following video transcript:\n\n" + truncatedContent;

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
// YouTube Summarize Action
// ============================================================================

export const summarizeYoutube = action({
  args: {
    userId: v.id("users"),
    url: v.string(),
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
      title: string;
      channelName: string;
      thumbnail: string;
    };
    wordCount: number;
    tokensUsed: number;
  }> => {
    // 1. Extract video ID from URL
    const videoId = extractYouTubeVideoId(args.url);
    if (!videoId) {
      throw new Error(
        "Invalid YouTube URL. Please provide a valid YouTube video URL."
      );
    }

    // 2. Check rate limits
    const canSummarizeResult = await ctx.runQuery(api.usage.canSummarize, {
      userId: args.userId,
    });

    if (!canSummarizeResult.allowed) {
      throw new Error(
        canSummarizeResult.reason || "Cannot summarize at this time"
      );
    }

    // 3. Fetch metadata (title, channel, thumbnail) using oEmbed
    let metadata: YouTubeMetadata;
    try {
      metadata = await fetchYouTubeMetadata(videoId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Failed to fetch video metadata: " + error.message);
      }
      throw new Error("Failed to fetch video metadata");
    }

    // 4. Fetch transcript using youtube-transcript package
    let transcript: string;
    try {
      transcript = await fetchYouTubeTranscript(videoId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Failed to fetch transcript: " + error.message);
      }
      throw new Error("Failed to fetch video transcript");
    }

    // 5. Validate transcript length
    const wordCount = countWords(transcript);

    if (wordCount < 10) {
      throw new Error(
        "Transcript is too short to summarize. The video may not have meaningful captions."
      );
    }

    if (wordCount > 100000) {
      throw new Error(
        "Transcript is too long to summarize (maximum 100,000 words). Please try a shorter video."
      );
    }

    // 6. Generate summary using LLM
    const { summary, tokensUsed } = await generateSummaryWithLLM(
      transcript,
      args.summaryLength,
      args.model,
      metadata.title
    );

    // 7. Store via api.summaries.createSummary with YouTube fields
    const summaryId = await ctx.runMutation(api.summaries.createSummary, {
      userId: args.userId,
      url: args.url,
      inputType: "youtube",
      inputTitle: metadata.title,
      inputContent: transcript,
      inputWordCount: wordCount,
      summary,
      summaryLength: args.summaryLength,
      model: args.model,
      tokensUsed,
      youtubeVideoId: videoId,
      youtubeThumbnail: metadata.thumbnail,
      youtubeChannelName: metadata.channelName,
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
        title: metadata.title,
        channelName: metadata.channelName,
        thumbnail: metadata.thumbnail,
      },
      wordCount,
      tokensUsed,
    };
  },
});

