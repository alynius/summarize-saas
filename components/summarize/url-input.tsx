"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, Loader2, AlertTriangle } from "lucide-react";
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

interface UrlInputProps {
  onSubmit: (url: string) => void;
  onYouTubeSubmit?: (url: string, metadata: YouTubeMetadata) => void;
  isLoading?: boolean;
}

export function UrlInput({
  onSubmit,
  onYouTubeSubmit,
  isLoading = false,
}: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeMetadata, setYoutubeMetadata] = useState<YouTubeMetadata | null>(
    null
  );
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [hasCaptions, setHasCaptions] = useState<boolean | null>(null);
  const [isCheckingCaptions, setIsCheckingCaptions] = useState(false);

  // Fetch YouTube metadata and check for captions
  const fetchMetadata = useCallback(async (videoId: string) => {
    setIsFetchingMetadata(true);
    setIsCheckingCaptions(true);
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
      setIsCheckingCaptions(false);
    }
  }, []);

  // Detect YouTube URLs and fetch metadata with debouncing and cancellation
  useEffect(() => {
    let cancelled = false;
    const trimmedUrl = url.trim();

    if (trimmedUrl && isYouTubeUrl(trimmedUrl)) {
      setIsYouTube(true);
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
      setIsYouTube(false);
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
    if (url.trim()) {
      if (isYouTube && youtubeMetadata && onYouTubeSubmit) {
        onYouTubeSubmit(url.trim(), youtubeMetadata);
      } else {
        onSubmit(url.trim());
      }
    }
  };

  const handleRemoveYouTube = () => {
    setUrl("");
    setIsYouTube(false);
    setYoutubeMetadata(null);
    setMetadataError(null);
    setHasCaptions(null);
  };

  // Can submit if: URL exists, not loading, not fetching metadata,
  // and for YouTube: metadata loaded AND captions available
  const canSubmit =
    url.trim() &&
    !isLoading &&
    !isFetchingMetadata &&
    (!isYouTube || (youtubeMetadata !== null && hasCaptions === true));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="url"
            placeholder="https://example.com/article or YouTube URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-10"
            disabled={isLoading}
            required
          />
        </div>
        <Button type="submit" disabled={!canSubmit}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : isFetchingMetadata ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Summarize"
          )}
        </Button>
      </div>

      {/* YouTube Preview */}
      {isYouTube && (isFetchingMetadata || youtubeMetadata) && (
        <YouTubePreview
          videoId={youtubeMetadata?.videoId || extractYouTubeVideoId(url) || ""}
          title={youtubeMetadata?.title || ""}
          channelName={youtubeMetadata?.channelName || ""}
          thumbnail={youtubeMetadata?.thumbnail || ""}
          isLoading={isFetchingMetadata}
        />
      )}

      {/* No Captions Warning */}
      {isYouTube && hasCaptions === false && !isFetchingMetadata && (
        <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-200">
            This video doesn&apos;t have captions/subtitles available. We can only
            summarize videos that have captions enabled by the uploader.
          </AlertDescription>
        </Alert>
      )}

      {/* Metadata Error */}
      {metadataError && (
        <p className="text-sm text-destructive">{metadataError}</p>
      )}

      <p className="text-sm text-muted-foreground">
        {isYouTube
          ? hasCaptions === false
            ? "Try a different video with captions enabled."
            : "YouTube video detected. We'll extract the transcript and summarize it."
          : "Enter a URL to extract and summarize the content from any webpage."}
      </p>
    </form>
  );
}
