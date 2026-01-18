/**
 * YouTube utility functions for DigestAI
 */

// Video ID extraction
export { extractYouTubeVideoId, isYouTubeUrl } from "./extract-video-id";

// Metadata fetching
export {
  fetchYouTubeMetadata,
  getYouTubeThumbnailUrl,
  checkYouTubeCaptions,
  type YouTubeMetadata,
} from "./fetch-metadata";

// Transcript fetching
export {
  fetchYouTubeTranscript,
  fetchYouTubeTranscriptWithTimestamps,
  type TranscriptSegment,
} from "./fetch-transcript";
