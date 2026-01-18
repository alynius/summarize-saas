"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  ExternalLink,
  FileText,
  Clock,
  Sparkles,
  History as HistoryIcon,
  Loader2,
  Youtube,
  User,
  Layers,
  Twitter,
  Github,
  Image,
} from "lucide-react";
import { useCurrentUser, useSummaries } from "@/hooks";
import { EmptyState } from "@/components/ui/empty-state";
import type { Id } from "@/convex/_generated/dataModel";

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getLengthColor(length: string): string {
  const colors: Record<string, string> = {
    short: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    medium: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    long: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    xl: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
  return colors[length] || colors.medium;
}

function getModelDisplay(model: string): string {
  const displays: Record<string, string> = {
    "gpt-4o-mini": "GPT-4o Mini",
    "gpt-4o": "GPT-4o",
    "claude-3-5-sonnet-20241022": "Claude Sonnet",
    "claude-3-haiku-20240307": "Claude Haiku",
    "gemini-2.0-flash": "Gemini Flash",
    "gemini-1.5-pro": "Gemini Pro",
  };
  return displays[model] || model;
}

type SummaryData = {
  _id: Id<"summaries">;
  userId: Id<"users">;
  url?: string;
  inputType: "url" | "text" | "youtube" | "pdf" | "batch" | "twitter" | "reddit" | "github" | "image";
  inputTitle?: string;
  inputContent: string;
  inputWordCount: number;
  summary: string;
  summaryLength: "short" | "medium" | "long" | "xl";
  model: string;
  tokensUsed?: number;
  createdAt: number;
  // YouTube-specific fields
  youtubeVideoId?: string;
  youtubeThumbnail?: string;
  youtubeChannelName?: string;
  youtubeDuration?: string;
  // PDF-specific fields
  pdfFileName?: string;
  pdfPageCount?: number;
  // Batch URLs fields
  batchUrls?: string[];
  batchCount?: number;
  // Twitter fields
  twitterThreadId?: string;
  twitterAuthor?: string;
  twitterAuthorHandle?: string;
  twitterTweetCount?: number;
  // Reddit fields
  redditPostId?: string;
  redditSubreddit?: string;
  redditAuthor?: string;
  redditScore?: number;
  redditCommentCount?: number;
  // GitHub fields
  githubType?: "pr" | "issue";
  githubOwner?: string;
  githubRepo?: string;
  githubNumber?: number;
  githubState?: string;
  githubFilesChanged?: number;
  // Image fields
  imageFileNames?: string[];
  imageCount?: number;
  ocrMethod?: string;
};

interface SummaryItemProps {
  summary: SummaryData;
  onDelete: (id: Id<"summaries">) => void;
}

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

function SummaryItem({ summary, onDelete }: SummaryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDisplayTitle = () => {
    if (summary.inputTitle) return summary.inputTitle;
    switch (summary.inputType) {
      case "youtube": return "YouTube Video";
      case "pdf": return summary.pdfFileName || "PDF Document";
      case "url": return "URL Summary";
      case "batch": return `Batch Summary (${summary.batchCount || 0} URLs)`;
      case "twitter": return `Thread by @${summary.twitterAuthorHandle || "user"}`;
      case "reddit": return `r/${summary.redditSubreddit || "post"}`;
      case "github": return `${summary.githubOwner}/${summary.githubRepo}#${summary.githubNumber}`;
      case "image": return summary.imageCount === 1 ? summary.imageFileNames?.[0] || "Image" : `${summary.imageCount} Images`;
      default: return "Pasted text document";
    }
  };

  const displayTitle = getDisplayTitle();

  const getInputIcon = () => {
    switch (summary.inputType) {
      case "youtube":
        return <Youtube className="size-3.5 text-red-500 shrink-0" />;
      case "pdf":
        return <FileText className="size-3.5 text-red-500 shrink-0" />;
      case "url":
        return <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />;
      case "batch":
        return <Layers className="size-3.5 text-blue-500 shrink-0" />;
      case "twitter":
        return <Twitter className="size-3.5 text-sky-500 shrink-0" />;
      case "reddit":
        return <RedditIcon className="size-3.5 text-orange-500 shrink-0" />;
      case "github":
        return <Github className="size-3.5 text-purple-500 shrink-0" />;
      case "image":
        return <Image className="size-3.5 text-green-500 shrink-0" />;
      default:
        return <FileText className="size-3.5 text-muted-foreground shrink-0" />;
    }
  };

  const getAccentColor = () => {
    switch (summary.inputType) {
      case "youtube":
      case "pdf":
        return "from-red-400 via-red-500 to-red-400";
      case "batch":
        return "from-blue-400 via-blue-500 to-blue-400";
      case "twitter":
        return "from-sky-400 via-sky-500 to-sky-400";
      case "reddit":
        return "from-orange-400 via-orange-500 to-orange-400";
      case "github":
        return "from-purple-400 via-purple-500 to-purple-400";
      case "image":
        return "from-green-400 via-green-500 to-green-400";
      default:
        return "from-zinc-200 via-zinc-300 to-zinc-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700";
    }
  };

  return (
    <div className="group relative">
      {/* Subtle left accent line */}
      <div className={`absolute left-0 top-4 bottom-4 w-px bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${getAccentColor()}`} />

      <div className="py-5 pl-4 pr-2">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          {/* YouTube thumbnail */}
          {summary.inputType === "youtube" && summary.youtubeThumbnail && (
            <div className="shrink-0 w-24 h-14 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <img
                src={summary.youtubeThumbnail}
                alt={displayTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to hqdefault if maxresdefault fails
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes('maxresdefault')) {
                    target.src = target.src.replace('maxresdefault', 'hqdefault');
                  }
                }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {getInputIcon()}
              <h3 className="font-medium text-sm truncate text-foreground/90">
                {displayTitle}
              </h3>
            </div>

            {/* YouTube channel name */}
            {summary.inputType === "youtube" && summary.youtubeChannelName && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <User className="size-3" />
                <span>{summary.youtubeChannelName}</span>
              </div>
            )}

            {/* PDF page count */}
            {summary.inputType === "pdf" && summary.pdfPageCount && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <FileText className="size-3" />
                <span>{summary.pdfPageCount} {summary.pdfPageCount === 1 ? "page" : "pages"}</span>
              </div>
            )}

            {summary.url && (
              <a
                href={summary.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate block max-w-md"
              >
                {summary.url}
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(summary._id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>{formatRelativeTime(summary.createdAt)}</span>
          </div>

          <Badge
            variant="outline"
            className={`text-[10px] uppercase tracking-wider font-medium ${getLengthColor(summary.summaryLength)}`}
          >
            {summary.summaryLength}
          </Badge>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3" />
            <span>{getModelDisplay(summary.model)}</span>
          </div>
        </div>

        {/* Summary content - collapsible */}
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          >
            <div
              className={`text-sm text-muted-foreground leading-relaxed ${
                isExpanded ? "" : "line-clamp-2"
              }`}
            >
              {summary.summary}
            </div>

            {summary.summary.length > 150 && (
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-foreground/60 hover:text-foreground/80 transition-colors">
                {isExpanded ? (
                  <>
                    <ChevronUp className="size-3" />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3" />
                    <span>Show more</span>
                  </>
                )}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <Loader2 className="size-8 text-muted-foreground animate-spin mb-4" />
      <p className="text-sm text-muted-foreground">Loading your summaries...</p>
    </div>
  );
}

export default function HistoryPage() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { summaries, isLoading: isSummariesLoading, deleteSummary } = useSummaries(user?._id);

  const isLoading = isUserLoading || isSummariesLoading;

  const handleDelete = async (id: Id<"summaries">) => {
    await deleteSummary(id);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <HistoryIcon className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Browse and manage your past summaries
          </p>
        </div>

        {/* Content */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <LoadingState />
          ) : summaries.length === 0 ? (
            <EmptyState
              icon={HistoryIcon}
              title="No summaries yet"
              description="Your summarized articles and text will appear here. Start by summarizing a URL or pasting some text."
              action={
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Create your first summary</Link>
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {summaries.map((summary: SummaryData, index: number) => (
                <div
                  key={summary._id}
                  className="animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <SummaryItem summary={summary} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Footer hint */}
        {!isLoading && summaries.length > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-6">
            Showing {summaries.length} summar{summaries.length !== 1 ? "ies" : "y"}
          </p>
        )}
      </div>
    </div>
  );
}
