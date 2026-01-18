"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UrlInput } from "@/components/summarize/url-input";
import { TextInput } from "@/components/summarize/text-input";
import { LengthSelector } from "@/components/summarize/length-selector";
import { ModelSelector } from "@/components/summarize/model-selector";
import { SummaryCard } from "@/components/summarize/summary-card";
import { SummarizingState } from "@/components/summarize/summarizing-state";
import { Link, FileText, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import type { SummaryLength } from "@/lib/summarize/types";
import { useCurrentUser } from "@/hooks/use-user";
import { useSummarize } from "@/hooks/use-summarize";

export default function DashboardPage() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { summarizeUrl, summarizeText, summarizeYoutube, isLoading, error, result, reset } = useSummarize();

  const [length, setLength] = useState<SummaryLength>("medium");
  const [model, setModel] = useState("gpt-4o");

  const handleUrlSubmit = async (url: string) => {
    if (!user?._id) return;
    reset();
    try {
      await summarizeUrl(user._id, url, length, model);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleYouTubeSubmit = async (url: string) => {
    if (!user?._id) return;
    reset();
    try {
      await summarizeYoutube(user._id, url, length, model);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleTextSubmit = async (text: string) => {
    if (!user?._id) return;
    reset();
    try {
      await summarizeText(user._id, text, length, model);
    } catch {
      // Error is handled by the hook
    }
  };

  // Show loading state while user is being fetched
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="glass-card border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10">
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              Create Summary
            </CardTitle>
          </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Options Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <LengthSelector
              value={length}
              onChange={setLength}
              disabled={isLoading}
            />
            <ModelSelector
              value={model}
              onChange={setModel}
              disabled={isLoading}
            />
          </div>

          {/* Input Tabs */}
          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="gap-2" disabled={isLoading}>
                <Link className="h-4 w-4" />
                URL
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-2" disabled={isLoading}>
                <FileText className="h-4 w-4" />
                Text
              </TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="mt-4">
              <UrlInput
                onSubmit={handleUrlSubmit}
                onYouTubeSubmit={handleYouTubeSubmit}
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="text" className="mt-4">
              <TextInput onSubmit={handleTextSubmit} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </motion.div>

      {/* Result Section */}
      {isLoading ? (
        <SummarizingState />
      ) : result ? (
        <SummaryCard
          title={result.title}
          summary={result.summary}
          model={model}
          length={length}
          wordCount={result.wordCount}
          timestamp={new Date()}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-dashed border-zinc-800 bg-zinc-900/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-violet-500/10 rounded-full blur-2xl" />
                <div className="relative bg-zinc-800/50 rounded-full p-5">
                  <FileText className="h-10 w-10 text-zinc-500" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-300">No summary yet</h3>
              <p className="max-w-sm text-sm text-zinc-500 leading-relaxed">
                Enter a URL or paste text above to generate a summary using AI.
                Your summary will appear here.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
