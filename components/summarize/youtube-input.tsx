"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isYouTubeUrl, extractYouTubeVideoId } from "@/lib/youtube";
import {
  fetchYouTubeMetadata,
  checkYouTubeCaptions,
  type YouTubeMetadata,
} from "@/lib/youtube";
import { YouTubePreview } from "./youtube-preview";

// YouTube icon component
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface YouTubeInputProps {
  onSubmit: (url: string, metadata?: YouTubeMetadata) => void;
  isLoading?: boolean;
}

export function YouTubeInput({
  onSubmit,
  isLoading = false,
}: YouTubeInputProps) {
  const [url, setUrl] = useState("");
  const [isValidYouTube, setIsValidYouTube] = useState(false);
  const [youtubeMetadata, setYoutubeMetadata] = useState<YouTubeMetadata | null>(
    null
  );
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [hasCaptions, setHasCaptions] = useState<boolean | null>(null);

  // Fetch YouTube metadata and check for captions
  const fetchMetadata = useCallback(async (videoId: string) => {
    setIsFetchingMetadata(true);
    setMetadataError(null);
    setHasCaptions(null);

    try {
      // Fetch metadata and check captions in parallel
      const [metadata, captionsAvailable] = await Promise.all([
        fetchYouTubeMetadata(videoId),
        checkYouTubeCaptions(videoId),
      ]);

      setYoutubeMetadata(metadata);
      setHasCaptions(captionsAvailable);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch video info";
      setMetadataError(message);
      setYoutubeMetadata(null);
      setHasCaptions(null);
    } finally {
      setIsFetchingMetadata(false);
    }
  }, []);

  // Detect YouTube URLs and fetch metadata with debouncing
  useEffect(() => {
    let cancelled = false;
    const trimmedUrl = url.trim();

    if (trimmedUrl && isYouTubeUrl(trimmedUrl)) {
      setIsValidYouTube(true);
      const videoId = extractYouTubeVideoId(trimmedUrl);
      if (videoId) {
        // Debounce the metadata fetch by 300ms
        const timeoutId = setTimeout(() => {
          if (!cancelled) {
            fetchMetadata(videoId);
          }
        }, 300);

        return () => {
          cancelled = true;
          clearTimeout(timeoutId);
        };
      }
    } else {
      setIsValidYouTube(false);
      setYoutubeMetadata(null);
      setMetadataError(null);
      setHasCaptions(null);
    }

    return () => {
      cancelled = true;
    };
  }, [url, fetchMetadata]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && isValidYouTube && youtubeMetadata) {
      onSubmit(url.trim(), youtubeMetadata);
    }
  };

  // Can submit if: valid YouTube URL, not loading, metadata loaded
  const canSubmit =
    url.trim() &&
    isValidYouTube &&
    !isLoading &&
    !isFetchingMetadata &&
    youtubeMetadata !== null;

  const showError = url.trim() && !isValidYouTube && !isFetchingMetadata;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex gap-4">
        {/* Gradient border wrapper */}
        <div className="relative flex-1 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
          <div className="relative flex items-center">
            <YouTubeIcon className="absolute left-5 h-6 w-6 text-muted-foreground/70 group-focus-within:text-red-500 transition-colors duration-200 z-10" />
            <Input
              type="url"
              placeholder="Paste a YouTube video URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-14 pl-14 pr-5 rounded-xl border-2 border-border/50 bg-background/80 backdrop-blur-sm text-lg placeholder:text-muted-foreground/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              disabled={isLoading}
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-14 px-8 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-500/90 hover:to-red-600/90 text-white font-semibold text-lg shadow-lg shadow-red-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:active:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Summarizing...
            </>
          ) : isFetchingMetadata ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </>
          ) : (
            "Summarize"
          )}
        </Button>
      </div>

      {/* Invalid URL Error */}
      {showError && (
        <p className="text-sm text-destructive">
          Please enter a valid YouTube URL (youtube.com or youtu.be)
        </p>
      )}

      {/* YouTube Preview */}
      {isValidYouTube && (isFetchingMetadata || youtubeMetadata) && (
        <YouTubePreview
          videoId={youtubeMetadata?.videoId || extractYouTubeVideoId(url) || ""}
          title={youtubeMetadata?.title || ""}
          channelName={youtubeMetadata?.channelName || ""}
          thumbnail={youtubeMetadata?.thumbnail || ""}
          isLoading={isFetchingMetadata}
        />
      )}

      {/* No Captions Info - Will use Whisper */}
      {isValidYouTube && hasCaptions === false && !isFetchingMetadata && (
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <AlertTriangle className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            This video doesn&apos;t have captions. We&apos;ll use AI audio transcription
            which may take a bit longer and work best on videos under 2 hours.
          </AlertDescription>
        </Alert>
      )}

      {/* Metadata Error */}
      {metadataError && (
        <p className="text-sm text-destructive">{metadataError}</p>
      )}

      <p className="text-base text-muted-foreground">
        {isValidYouTube
          ? hasCaptions === false
            ? "We'll transcribe the audio using AI and generate a summary."
            : "We'll extract the transcript and generate a concise summary."
          : "Paste a YouTube video URL to extract and summarize its content."}
      </p>
    </form>
  );
}
