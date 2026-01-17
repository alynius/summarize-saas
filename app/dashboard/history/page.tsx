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
} from "lucide-react";
import { useCurrentUser, useSummaries } from "@/hooks";
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
  inputType: "url" | "text";
  inputTitle?: string;
  inputContent: string;
  inputWordCount: number;
  summary: string;
  summaryLength: "short" | "medium" | "long" | "xl";
  model: string;
  tokensUsed?: number;
  createdAt: number;
};

interface SummaryItemProps {
  summary: SummaryData;
  onDelete: (id: Id<"summaries">) => void;
}

function SummaryItem({ summary, onDelete }: SummaryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayTitle = summary.inputTitle || (summary.inputType === "url" ? "URL Summary" : "Pasted text document");

  return (
    <div className="group relative">
      {/* Subtle left accent line */}
      <div className="absolute left-0 top-4 bottom-4 w-px bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="py-5 pl-4 pr-2">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {summary.inputType === "url" ? (
                <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
              ) : (
                <FileText className="size-3.5 text-muted-foreground shrink-0" />
              )}
              <h3 className="font-medium text-sm truncate text-foreground/90">
                {displayTitle}
              </h3>
            </div>

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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-200/50 to-zinc-300/50 dark:from-zinc-700/50 dark:to-zinc-600/50 rounded-full blur-xl" />
        <div className="relative bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 rounded-full p-5">
          <HistoryIcon className="size-8 text-muted-foreground" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        No summaries yet
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
        Your summarized articles and text will appear here. Start by
        summarizing a URL or pasting some text.
      </p>

      <Button className="mt-6" variant="outline" asChild>
        <Link href="/">Create your first summary</Link>
      </Button>
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
            <EmptyState />
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
