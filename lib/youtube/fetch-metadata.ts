/**
 * Fetch YouTube video metadata using oEmbed API (no API key required)
 */

export interface YouTubeMetadata {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  duration?: number;
}

interface OEmbedResponse {
  title: string;
  author_name: string;
  author_url: string;
  type: string;
  height: number;
  width: number;
  version: string;
  provider_name: string;
  provider_url: string;
  thumbnail_height: number;
  thumbnail_width: number;
  thumbnail_url: string;
  html: string;
}

/**
 * Fetch YouTube video metadata using the oEmbed API
 * @param videoId - The YouTube video ID
 * @returns Promise resolving to YouTubeMetadata
 * @throws Error if the video is not found or the request fails
 */
export async function fetchYouTubeMetadata(
  videoId: string
): Promise<YouTubeMetadata> {
  if (!videoId || typeof videoId !== "string") {
    throw new Error("Invalid video ID provided");
  }

  // Validate video ID format (11 characters, alphanumeric with - and _)
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    throw new Error("Invalid video ID format");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;

  try {
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Video not found or is private");
      }
      if (response.status === 401) {
        throw new Error("Video is not embeddable");
      }
      throw new Error(`Failed to fetch video metadata: ${response.statusText}`);
    }

    const data = (await response.json()) as Partial<OEmbedResponse>;

    // Validate required fields exist
    if (!data.title || !data.author_name) {
      throw new Error("Invalid response from YouTube oEmbed API");
    }

    // Use maxresdefault thumbnail, fall back to hqdefault if not available
    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return {
      videoId,
      title: data.title,
      channelName: data.author_name,
      thumbnail,
      // Note: oEmbed API does not provide duration, it would require YouTube Data API
      duration: undefined,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch YouTube metadata");
  }
}

/**
 * Get thumbnail URL for a YouTube video
 * @param videoId - The YouTube video ID
 * @param quality - The thumbnail quality (default, medium, high, standard, maxres)
 * @returns The thumbnail URL
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: "default" | "medium" | "high" | "standard" | "maxres" = "maxres"
): string {
  // Validate video ID format
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    throw new Error("Invalid video ID format");
  }

  const qualityMap = {
    default: "default",
    medium: "mqdefault",
    high: "hqdefault",
    standard: "sddefault",
    maxres: "maxresdefault",
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}
