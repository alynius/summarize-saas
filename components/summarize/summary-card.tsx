"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
      "gpt-4o": "GPT-4o",
      "anthropic/claude-3.5-sonnet": "Claude 3.5 Sonnet",
      "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet",
      "google/gemini-2.0-flash": "Gemini 2.0 Flash",
      "gemini-2.0-flash": "Gemini 2.0 Flash",
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="glass-card border-0 shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden">
        {/* Subtle gradient border effect on top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/50 via-amber-400/50 to-amber-500/50" />

        <CardHeader className="flex flex-row items-start justify-between space-y-0 pt-6">
          <div className="flex flex-col gap-2">
            {title && (
              <CardTitle className="text-lg leading-snug text-white/90">{title}</CardTitle>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/30 text-amber-200 hover:from-amber-500/30 hover:to-orange-500/30">
                <Sparkles className="h-3 w-3" />
                {getModelDisplayName(model)}
              </Badge>
              <Badge variant="outline" className="gap-1.5 border-zinc-700 text-zinc-300">
                <FileText className="h-3 w-3" />
                {getLengthLabel(length)}
              </Badge>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                {wordCount.toLocaleString()} words
              </Badge>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0 border-zinc-700 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all"
            >
              {copied ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </motion.div>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Copy className="h-4 w-4" />
                  Copy summary
                </span>
              )}
            </Button>
          </motion.div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="prose prose-sm max-w-none text-zinc-300 leading-relaxed">
            {summary.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 pt-2 border-t border-zinc-800/50">
            <Clock className="h-3 w-3" />
            {formatTimestamp(timestamp)}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
