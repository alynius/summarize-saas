/**
 * Extract YouTube video ID from various URL formats
 */

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
 * @param url - The YouTube URL to extract the video ID from
 * @returns The video ID if found, null otherwise
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  // Trim whitespace
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

/**
 * Check if a URL is a valid YouTube URL
 * @param url - The URL to check
 * @returns True if the URL is a valid YouTube URL, false otherwise
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const trimmedUrl = url.trim().toLowerCase();

  // Check for common YouTube domains
  const youtubeDomainsPattern =
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)/;

  return youtubeDomainsPattern.test(trimmedUrl);
}
