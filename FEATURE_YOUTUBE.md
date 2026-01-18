# YouTube Video Summarization Feature

A comprehensive specification for adding YouTube video summarization to DigestAI.

**Document Status:** Feature Specification
**Created:** January 2026
**Priority:** High
**Estimated Effort:** Medium

---

## Table of Contents

1. [Overview](#overview)
2. [User Stories](#user-stories)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema Changes](#database-schema-changes)
5. [UI/UX Design](#uiux-design)
6. [Implementation Plan](#implementation-plan)
7. [API Endpoints](#api-endpoints)
8. [Error Handling](#error-handling)
9. [Testing Strategy](#testing-strategy)
10. [Future Enhancements](#future-enhancements)

---

## Overview

### Feature Description

Allow users to paste a YouTube video URL and receive an AI-generated summary of the video content. The system will:

1. Extract the video transcript (captions/subtitles)
2. Process the transcript through the existing summarization pipeline
3. Display the summary with video metadata (title, thumbnail, duration, channel)

### Value Proposition

- **Time Savings:** Summarize a 1-hour video in seconds
- **Accessibility:** Make video content accessible to users who prefer reading
- **Research:** Quickly evaluate if a video is worth watching
- **Note-taking:** Get structured notes from educational content

### Scope

**In Scope (MVP):**
- YouTube URLs with available captions (auto-generated or manual)
- English transcripts (primary)
- All existing summary length options (short/medium/long/xl)
- All existing AI model options

**Out of Scope (Future):**
- Videos without captions (would require speech-to-text)
- Non-English transcripts (translation layer)
- YouTube Shorts
- Private/unlisted videos (unless user provides access)
- Playlist summarization

---

## User Stories

### Primary User Stories

1. **As a student**, I want to summarize lecture videos so I can quickly review key concepts before exams.

2. **As a professional**, I want to summarize conference talks and webinars so I can stay updated without watching hours of content.

3. **As a researcher**, I want to summarize documentary and educational videos so I can extract key information efficiently.

4. **As a content creator**, I want to summarize competitor videos so I can understand trending topics in my niche.

### Acceptance Criteria

- [ ] User can paste a YouTube URL in the existing input field
- [ ] System automatically detects YouTube URLs and shows video preview
- [ ] System fetches and displays video metadata (title, thumbnail, duration)
- [ ] System extracts transcript and generates summary
- [ ] Summary includes video-specific metadata in history
- [ ] Proper error handling for videos without captions
- [ ] Loading state shows video being processed

---

## Technical Architecture

### High-Level Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  User       │     │  Frontend   │     │  Convex     │     │  YouTube    │
│  Pastes URL │────>│  Validates  │────>│  Action     │────>│  Transcript │
└─────────────┘     │  YouTube    │     │  Handler    │     │  API        │
                    └─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               v
                    ┌─────────────┐     ┌─────────────┐
                    │  Display    │<────│  LLM        │
                    │  Summary    │     │  Summarize  │
                    └─────────────┘     └─────────────┘
```

### Transcript Extraction Options

#### Option 1: youtube-transcript (Recommended for MVP)

```bash
npm install youtube-transcript
```

```typescript
import { YoutubeTranscript } from 'youtube-transcript';

async function getTranscript(videoId: string): Promise<string> {
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  return transcript.map(item => item.text).join(' ');
}
```

**Pros:**
- Simple, lightweight
- No API key required
- Works with auto-generated captions

**Cons:**
- May break if YouTube changes their internal API
- No official support

#### Option 2: YouTube Data API v3

```typescript
// Requires API key and OAuth for caption download
const youtube = google.youtube({ version: 'v3', auth: apiKey });

// Get video details
const videoResponse = await youtube.videos.list({
  part: ['snippet', 'contentDetails'],
  id: [videoId],
});

// Get captions (requires additional OAuth)
const captionsResponse = await youtube.captions.list({
  part: ['snippet'],
  videoId: videoId,
});
```

**Pros:**
- Official API, reliable
- Rich metadata

**Cons:**
- Requires API key
- Caption download requires OAuth
- Quota limits

#### Option 3: Third-party Transcript Services

- **Superpowered API** - Paid, reliable
- **AssemblyAI** - For videos without captions (speech-to-text)
- **Deepgram** - Alternative speech-to-text

### Recommended Approach (MVP)

Use `youtube-transcript` package for MVP with fallback error handling. Plan migration to YouTube Data API for production scale.

### Video ID Extraction

```typescript
// lib/youtube/extract-video-id.ts

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // Short URL: https://youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // Embed URL: https://www.youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // Mobile URL: https://m.youtube.com/watch?v=VIDEO_ID
    /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}
```

### Video Metadata Fetching

```typescript
// lib/youtube/fetch-metadata.ts

export interface YouTubeMetadata {
  videoId: string;
  title: string;
  channelName: string;
  channelId: string;
  thumbnail: string;
  duration: string; // ISO 8601 duration or formatted
  publishedAt: string;
  viewCount?: number;
  description?: string;
}

// Option 1: Using oEmbed (no API key required)
export async function fetchYouTubeMetadata(videoId: string): Promise<YouTubeMetadata> {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

  const response = await fetch(oembedUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch video metadata');
  }

  const data = await response.json();

  return {
    videoId,
    title: data.title,
    channelName: data.author_name,
    channelId: '', // Not available via oEmbed
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    duration: '', // Not available via oEmbed, need separate call
    publishedAt: '', // Not available via oEmbed
  };
}

// Option 2: Using noembed.com (alternative)
export async function fetchYouTubeMetadataAlt(videoId: string): Promise<YouTubeMetadata> {
  const url = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetch(url);
  const data = await response.json();

  return {
    videoId,
    title: data.title,
    channelName: data.author_name,
    channelId: '',
    thumbnail: data.thumbnail_url,
    duration: '',
    publishedAt: '',
  };
}
```

---

## Database Schema Changes

### Updated Convex Schema

```typescript
// convex/schema.ts - Updated summaries table

summaries: defineTable({
  userId: v.id("users"),

  // Input type - now includes "youtube"
  inputType: v.union(
    v.literal("url"),
    v.literal("text"),
    v.literal("youtube")  // NEW
  ),

  // Existing fields
  url: v.optional(v.string()),
  inputTitle: v.optional(v.string()),
  inputContent: v.string(),           // Transcript for YouTube
  inputWordCount: v.number(),

  // YouTube-specific fields (NEW)
  youtubeVideoId: v.optional(v.string()),
  youtubeThumbnail: v.optional(v.string()),
  youtubeChannelName: v.optional(v.string()),
  youtubeDuration: v.optional(v.string()),

  // Output fields (unchanged)
  summary: v.string(),
  summaryLength: v.union(
    v.literal("short"),
    v.literal("medium"),
    v.literal("long"),
    v.literal("xl")
  ),
  model: v.string(),
  tokensUsed: v.optional(v.number()),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_created", ["userId", "createdAt"]),
```

### Migration Strategy

No migration needed - new fields are optional and backward compatible with existing summaries.

---

## UI/UX Design

### 1. Input Detection

When user pastes a URL, automatically detect if it's a YouTube URL:

```tsx
// components/summarize/url-input.tsx - Enhanced

const handleUrlChange = (url: string) => {
  setUrl(url);

  if (isYouTubeUrl(url)) {
    setInputType('youtube');
    fetchYouTubePreview(url);
  } else {
    setInputType('url');
  }
};
```

### 2. YouTube Preview Card

Show video preview when YouTube URL is detected:

```tsx
// components/summarize/youtube-preview.tsx

interface YouTubePreviewProps {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  duration?: string;
  onRemove: () => void;
}

export function YouTubePreview({
  videoId,
  title,
  channelName,
  thumbnail,
  duration,
  onRemove,
}: YouTubePreviewProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative shrink-0 w-40 aspect-video rounded-lg overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
          {duration && (
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {duration}
            </div>
          )}
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-600 rounded-full p-2">
              <Play className="h-4 w-4 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-sm line-clamp-2">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{channelName}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onRemove}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Badge variant="secondary" className="mt-3">
            <Youtube className="h-3 w-3 mr-1" />
            YouTube Video
          </Badge>
        </div>
      </div>
    </Card>
  );
}
```

### 3. Summary Card with YouTube Metadata

Update history/summary display to show YouTube-specific info:

```tsx
// components/summarize/summary-card.tsx - YouTube variant

{summary.inputType === 'youtube' && (
  <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted/50">
    <img
      src={summary.youtubeThumbnail}
      alt=""
      className="w-20 aspect-video rounded object-cover"
    />
    <div>
      <p className="text-sm font-medium line-clamp-1">{summary.inputTitle}</p>
      <p className="text-xs text-muted-foreground">{summary.youtubeChannelName}</p>
    </div>
    <Badge variant="outline" className="ml-auto shrink-0">
      <Youtube className="h-3 w-3 mr-1 text-red-500" />
      {summary.youtubeDuration}
    </Badge>
  </div>
)}
```

### 4. Loading State for YouTube

```tsx
// components/summarize/youtube-loading.tsx

export function YouTubeLoadingState({ title }: { title?: string }) {
  return (
    <Card className="border-0 bg-gradient-to-r from-red-500/10 to-amber-500/10 backdrop-blur-xl">
      <CardContent className="flex flex-col items-center justify-center py-16 gap-6">
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500/50 to-amber-500/50 rounded-full blur-2xl"
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative bg-gradient-to-r from-red-500 to-amber-500 rounded-full p-3">
            <Youtube className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Processing Video</h3>
          {title && (
            <p className="text-sm text-muted-foreground mb-4 max-w-md line-clamp-2">
              {title}
            </p>
          )}

          {/* Step indicators */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <motion.div
              className="flex items-center gap-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <FileText className="h-3 w-3" />
              <span>Fetching transcript...</span>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5. Error States

```tsx
// components/summarize/youtube-error.tsx

export function YouTubeErrorState({
  error,
  onRetry
}: {
  error: 'no-captions' | 'private' | 'not-found' | 'unknown';
  onRetry: () => void;
}) {
  const errorMessages = {
    'no-captions': {
      title: 'No Captions Available',
      description: 'This video doesn\'t have captions or subtitles. We need captions to generate a summary.',
      suggestion: 'Try a video with auto-generated or manual captions enabled.',
    },
    'private': {
      title: 'Private Video',
      description: 'This video is private or restricted. We can\'t access its content.',
      suggestion: 'Try a public video instead.',
    },
    'not-found': {
      title: 'Video Not Found',
      description: 'We couldn\'t find this video. It may have been deleted or the URL is incorrect.',
      suggestion: 'Check the URL and try again.',
    },
    'unknown': {
      title: 'Something Went Wrong',
      description: 'We encountered an error while processing this video.',
      suggestion: 'Please try again or use a different video.',
    },
  };

  const { title, description, suggestion } = errorMessages[error];

  return (
    <Card className="border-destructive/50">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-destructive/10 rounded-full p-3 mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-1">{description}</p>
        <p className="text-xs text-muted-foreground mb-6">{suggestion}</p>
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Implementation Plan

### Phase 1: Core Infrastructure (Day 1-2)

1. **Install Dependencies**
   ```bash
   cd /home/youhad/summarize-saas
   npm install youtube-transcript
   ```

2. **Create YouTube Utility Functions**
   - `lib/youtube/extract-video-id.ts`
   - `lib/youtube/fetch-metadata.ts`
   - `lib/youtube/fetch-transcript.ts`

3. **Update Database Schema**
   - Add YouTube-specific fields to `convex/schema.ts`
   - Run `npx convex dev` to apply changes

### Phase 2: Backend Integration (Day 2-3)

4. **Create Convex Action for YouTube**
   ```typescript
   // convex/actions/summarizeYoutube.ts
   ```

5. **Update Summarization Pipeline**
   - Modify prompt builder for video transcripts
   - Add video-specific context to prompts

### Phase 3: Frontend Components (Day 3-4)

6. **Create YouTube Preview Component**
   - `components/summarize/youtube-preview.tsx`

7. **Update URL Input Component**
   - Add YouTube URL detection
   - Show preview when YouTube detected

8. **Create Loading/Error States**
   - `components/summarize/youtube-loading.tsx`
   - `components/summarize/youtube-error.tsx`

### Phase 4: History & Display (Day 4-5)

9. **Update History Page**
   - Show YouTube thumbnail and metadata
   - Add YouTube badge/icon

10. **Update Summary Card**
    - Display video info for YouTube summaries

### Phase 5: Testing & Polish (Day 5-6)

11. **Testing**
    - Test various YouTube URL formats
    - Test videos with/without captions
    - Test long videos (transcript limits)
    - Test error scenarios

12. **Polish**
    - Loading animations
    - Error messages
    - Mobile responsiveness

---

## API Endpoints

### Convex Actions

```typescript
// convex/actions/summarizeYoutube.ts

import { action } from "./_generated/server";
import { v } from "convex/values";

export const summarizeYoutube = action({
  args: {
    url: v.string(),
    length: v.union(
      v.literal("short"),
      v.literal("medium"),
      v.literal("long"),
      v.literal("xl")
    ),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Extract video ID
    const videoId = extractYouTubeVideoId(args.url);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // 2. Fetch metadata
    const metadata = await fetchYouTubeMetadata(videoId);

    // 3. Fetch transcript
    const transcript = await fetchYouTubeTranscript(videoId);
    if (!transcript) {
      throw new Error("No captions available for this video");
    }

    // 4. Generate summary
    const summary = await generateSummary({
      content: transcript,
      title: metadata.title,
      length: args.length,
      model: args.model,
      context: "youtube_video",
    });

    // 5. Store in database
    const summaryId = await ctx.runMutation(internal.summaries.create, {
      inputType: "youtube",
      url: args.url,
      inputTitle: metadata.title,
      inputContent: transcript,
      inputWordCount: transcript.split(/\s+/).length,
      youtubeVideoId: videoId,
      youtubeThumbnail: metadata.thumbnail,
      youtubeChannelName: metadata.channelName,
      youtubeDuration: metadata.duration,
      summary: summary.text,
      summaryLength: args.length,
      model: args.model,
      tokensUsed: summary.tokensUsed,
    });

    return {
      summaryId,
      summary: summary.text,
      metadata,
    };
  },
});
```

### React Hook

```typescript
// hooks/use-youtube-summarize.ts

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export function useYouTubeSummarize() {
  const summarizeAction = useAction(api.actions.summarizeYoutube.summarizeYoutube);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarize = async (
    url: string,
    length: "short" | "medium" | "long" | "xl",
    model: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await summarizeAction({ url, length, model });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { summarize, isLoading, error };
}
```

---

## Error Handling

### Error Types

| Error Code | Cause | User Message |
|------------|-------|--------------|
| `INVALID_URL` | URL is not a valid YouTube URL | "Please enter a valid YouTube URL" |
| `VIDEO_NOT_FOUND` | Video doesn't exist or was deleted | "Video not found. It may have been deleted." |
| `PRIVATE_VIDEO` | Video is private/unlisted | "This video is private or restricted." |
| `NO_CAPTIONS` | Video has no captions available | "No captions available for this video." |
| `TRANSCRIPT_TOO_LONG` | Transcript exceeds token limit | "This video is too long to summarize." |
| `RATE_LIMITED` | YouTube API rate limit hit | "Please try again in a few moments." |
| `NETWORK_ERROR` | Network/fetch failure | "Connection error. Please try again." |

### Transcript Length Limits

```typescript
const TRANSCRIPT_LIMITS = {
  // Approximate word counts based on model context windows
  "gpt-4o-mini": 50000,      // ~128k tokens
  "gpt-4o": 50000,           // ~128k tokens
  "claude-3-5-sonnet": 80000, // ~200k tokens
  "gemini-2.0-flash": 40000,  // ~100k tokens
};

function validateTranscriptLength(
  transcript: string,
  model: string
): { valid: boolean; wordCount: number; limit: number } {
  const wordCount = transcript.split(/\s+/).length;
  const limit = TRANSCRIPT_LIMITS[model] || 40000;

  return {
    valid: wordCount <= limit,
    wordCount,
    limit,
  };
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/youtube/extract-video-id.test.ts

describe('extractYouTubeVideoId', () => {
  it('extracts ID from standard watch URL', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'))
      .toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from short URL', () => {
    expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ'))
      .toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from embed URL', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ'))
      .toBe('dQw4w9WgXcQ');
  });

  it('extracts ID with additional parameters', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120'))
      .toBe('dQw4w9WgXcQ');
  });

  it('returns null for non-YouTube URLs', () => {
    expect(extractYouTubeVideoId('https://vimeo.com/123456')).toBeNull();
  });
});
```

### Integration Tests

```typescript
// __tests__/youtube/fetch-transcript.test.ts

describe('fetchYouTubeTranscript', () => {
  it('fetches transcript for video with captions', async () => {
    const transcript = await fetchYouTubeTranscript('dQw4w9WgXcQ');
    expect(transcript).toBeTruthy();
    expect(transcript.length).toBeGreaterThan(0);
  });

  it('throws error for video without captions', async () => {
    await expect(fetchYouTubeTranscript('VIDEO_WITHOUT_CAPTIONS'))
      .rejects.toThrow('No captions available');
  });
});
```

### E2E Test Scenarios

1. **Happy Path:** Paste YouTube URL → See preview → Generate summary → View in history
2. **No Captions:** Paste URL without captions → See appropriate error
3. **Invalid URL:** Paste non-YouTube URL → Normal URL summarization flow
4. **Long Video:** Paste very long video → Handle gracefully or show limit message

---

## Future Enhancements

### Phase 2 Enhancements

1. **Timestamp Navigation**
   - Show key moments with timestamps
   - Click to jump to specific part of video

2. **Chapter Support**
   - Detect YouTube chapters
   - Summarize each chapter separately

3. **Multi-language Support**
   - Detect transcript language
   - Translate before summarizing

4. **Playlist Summarization**
   - Summarize multiple videos
   - Generate playlist overview

### Phase 3 Enhancements

1. **Speech-to-Text Fallback**
   - Use Whisper/AssemblyAI for videos without captions
   - Higher cost, opt-in feature for Pro users

2. **Video Highlights**
   - Extract key visual moments
   - Generate thumbnail strip

3. **Embedded Player**
   - Watch video alongside summary
   - Sync playback with summary sections

4. **Export Options**
   - Export as study notes
   - Export as blog post draft
   - Export timestamps for video editing

---

## Dependencies

### Required Packages

```json
{
  "dependencies": {
    "youtube-transcript": "^1.2.1"
  }
}
```

### Optional (Future)

```json
{
  "dependencies": {
    "googleapis": "^130.0.0",
    "@google-cloud/speech": "^6.0.0"
  }
}
```

---

## Environment Variables

```env
# Optional: YouTube Data API (for enhanced metadata)
YOUTUBE_API_KEY=AIza...

# Optional: For speech-to-text fallback
ASSEMBLYAI_API_KEY=...
```

---

## Success Metrics

### Launch Criteria

- [ ] YouTube URL detection works for all common formats
- [ ] Transcript fetching succeeds for videos with captions
- [ ] Summary quality matches URL/text summarization
- [ ] Error handling covers all edge cases
- [ ] Mobile UI works correctly
- [ ] History displays YouTube metadata properly

### Post-Launch Metrics

- **Adoption:** % of summaries that are YouTube videos
- **Success Rate:** % of YouTube summarizations that complete without error
- **User Satisfaction:** Feedback rating for YouTube summaries
- **Error Rate:** Track "no captions" errors to evaluate speech-to-text need

---

## References

- [youtube-transcript npm package](https://www.npmjs.com/package/youtube-transcript)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [YouTube oEmbed API](https://oembed.com/)
- [Convex Actions Documentation](https://docs.convex.dev/functions/actions)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial specification |

---

## Next Steps

1. Review this specification
2. Set up development environment
3. Implement Phase 1 (Core Infrastructure)
4. Test with sample YouTube videos
5. Iterate based on results
