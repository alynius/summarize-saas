/**
 * Fetch YouTube transcript using multiple methods:
 * 1. Direct page scraping (most reliable, no API key needed)
 * 2. youtube-transcript package as fallback
 *
 * Note: YouTube's transcript API changes frequently. If transcripts fail to load,
 * the video may not have captions enabled, or YouTube may have changed their API.
 */

import { YoutubeTranscript } from "youtube-transcript";

export interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  name?: { simpleText?: string };
  kind?: string;
}

/**
 * Extract caption tracks from YouTube page HTML
 */
function extractCaptionTracks(html: string): CaptionTrack[] {
  try {
    // Look for captionTracks in the ytInitialPlayerResponse
    const match = html.match(/"captionTracks":\s*(\[[\s\S]*?\])/);
    if (!match) {
      return [];
    }

    // Parse the JSON array - need to handle escaped characters
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
    // Fetch the YouTube video page
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(videoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Extract caption tracks
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

    // Fetch the actual transcript
    const transcriptUrl = selectedTrack.baseUrl + "&fmt=json3";
    const transcriptResponse = await fetch(transcriptUrl);

    if (!transcriptResponse.ok) {
      return null;
    }

    const transcriptData = await transcriptResponse.json();

    // Extract text from events
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
 * @param videoId - The YouTube video ID
 * @returns Promise resolving to the full transcript as a single string
 * @throws Error if transcript cannot be fetched
 */
export async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  if (!videoId || typeof videoId !== "string") {
    throw new Error("Invalid video ID provided");
  }

  // Validate video ID format (11 characters, alphanumeric with - and _)
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

    // Join all transcript segments into a single string
    const fullTranscript = transcriptSegments
      .map((segment) => segment.text)
      .join(" ")
      // Clean up extra whitespace
      .replace(/\s+/g, " ")
      .trim();

    return fullTranscript;
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific error cases
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

      // Re-throw the original error if it's already descriptive
      throw error;
    }

    throw new Error("Failed to fetch YouTube transcript");
  }
}

/**
 * Fetch the transcript with timestamps for a YouTube video
 * @param videoId - The YouTube video ID
 * @returns Promise resolving to an array of transcript segments with timestamps
 * @throws Error if transcript cannot be fetched
 */
export async function fetchYouTubeTranscriptWithTimestamps(
  videoId: string
): Promise<TranscriptSegment[]> {
  if (!videoId || typeof videoId !== "string") {
    throw new Error("Invalid video ID provided");
  }

  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    throw new Error("Invalid video ID format");
  }

  try {
    const transcriptSegments = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptSegments || transcriptSegments.length === 0) {
      throw new Error("No transcript available for this video");
    }

    return transcriptSegments.map((segment) => ({
      text: segment.text,
      offset: segment.offset,
      duration: segment.duration,
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch YouTube transcript");
  }
}
