/**
 * Fetch YouTube transcript using youtube-transcript package
 */

import { YoutubeTranscript } from "youtube-transcript";

export interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

/**
 * Fetch the transcript for a YouTube video
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
        throw new Error(
          "Cannot fetch transcript: video is age-restricted"
        );
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
