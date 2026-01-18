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

// Note: Audio transcription (Whisper) is handled server-side in Convex actions
// and not exported here due to Node.js dependencies (ytdl-core)
