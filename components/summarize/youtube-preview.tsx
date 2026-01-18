"use client";

import { useState } from "react";
import Image from "next/image";
import { Youtube, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface YouTubePreviewProps {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  isLoading?: boolean;
}

function YouTubePreviewSkeleton() {
  return (
    <Card className="glass-card border-0 shadow-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail skeleton */}
        <div className="relative w-full sm:w-48 md:w-56 lg:w-64 aspect-video sm:aspect-auto sm:h-auto shrink-0">
          <Skeleton className="absolute inset-0 bg-zinc-800" />
        </div>

        {/* Content skeleton */}
        <CardContent className="flex flex-col gap-3 p-4 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-5 w-3/4 bg-zinc-800" />
            <Skeleton className="h-5 w-16 rounded-full bg-zinc-800" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full bg-zinc-800" />
            <Skeleton className="h-4 w-32 bg-zinc-800" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export function YouTubePreview({
  videoId,
  title,
  channelName,
  thumbnail,
  isLoading = false,
}: YouTubePreviewProps) {
  const [imgError, setImgError] = useState(false);

  if (isLoading) {
    return <YouTubePreviewSkeleton />;
  }

  // Fallback from maxresdefault to hqdefault if the image fails to load
  const thumbnailUrl = imgError
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <Card className="glass-card border-0 shadow-xl hover:shadow-red-500/10 transition-all duration-300 overflow-hidden group">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 md:w-56 lg:w-64 aspect-video shrink-0 bg-zinc-900">
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 100vw, 256px"
          />
          {/* YouTube play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5 text-white ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="flex flex-col gap-3 p-4 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            {/* Title */}
            <h3 className="font-medium text-white/90 line-clamp-2 leading-snug flex-1">
              {title}
            </h3>

            {/* YouTube Badge */}
            <Badge className="shrink-0 gap-1.5 bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30">
              <Youtube className="h-3 w-3" />
              YouTube
            </Badge>
          </div>

          {/* Channel name */}
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <User className="h-4 w-4 text-zinc-500" />
            <span className="truncate">{channelName}</span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
