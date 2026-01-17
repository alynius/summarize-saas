"use client";

import { useState } from "react";
import { Copy, Check, Clock, Sparkles, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SummaryLength } from "@/lib/summarize/types";

interface SummaryCardProps {
  title?: string;
  summary: string;
  model: string;
  length: SummaryLength;
  wordCount: number;
  timestamp: Date;
}

export function SummaryCard({
  title,
  summary,
  model,
  length,
  wordCount,
  timestamp,
}: SummaryCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const getModelDisplayName = (modelId: string) => {
    const modelMap: Record<string, string> = {
      "openai/gpt-4o": "GPT-4o",
      "anthropic/claude-3.5-sonnet": "Claude 3.5 Sonnet",
      "google/gemini-2.0-flash": "Gemini 2.0 Flash",
    };
    return modelMap[modelId] || modelId;
  };

  const getLengthLabel = (len: SummaryLength) => {
    const labels: Record<SummaryLength, string> = {
      short: "Short",
      medium: "Medium",
      long: "Long",
      xl: "XL",
    };
    return labels[len];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex flex-col gap-1.5">
          {title && (
            <CardTitle className="text-lg leading-snug">{title}</CardTitle>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {getModelDisplayName(model)}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              {getLengthLabel(length)}
            </Badge>
            <Badge variant="outline" className="gap-1">
              {wordCount.toLocaleString()} words
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleCopy}
          className="shrink-0"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="sr-only">Copy summary</span>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
          {summary.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-2 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatTimestamp(timestamp)}
        </div>
      </CardContent>
    </Card>
  );
}
