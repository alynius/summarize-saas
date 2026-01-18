"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isYouTubeUrl, extractYouTubeVideoId } from "@/lib/youtube";
import { fetchYouTubeMetadata, type YouTubeMetadata } from "@/lib/youtube";
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

  // Fetch YouTube metadata when a YouTube URL is detected
  const fetchMetadata = useCallback(async (videoId: string) => {
    setIsFetchingMetadata(true);
    setMetadataError(null);
    try {
      const metadata = await fetchYouTubeMetadata(videoId);
      setYoutubeMetadata(metadata);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch video info";
      setMetadataError(message);
      setYoutubeMetadata(null);
    } finally {
      setIsFetchingMetadata(false);
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
  };

  const canSubmit =
    url.trim() &&
    !isLoading &&
    !isFetchingMetadata &&
    (!isYouTube || youtubeMetadata !== null);

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

      {/* Metadata Error */}
      {metadataError && (
        <p className="text-sm text-destructive">{metadataError}</p>
      )}

      <p className="text-sm text-muted-foreground">
        {isYouTube
          ? "YouTube video detected. We'll extract the transcript and summarize it."
          : "Enter a URL to extract and summarize the content from any webpage."}
      </p>
    </form>
  );
}
