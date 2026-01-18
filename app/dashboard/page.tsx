"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UrlInput } from "@/components/summarize/url-input";
import { TextInput } from "@/components/summarize/text-input";
import { PdfInput } from "@/components/summarize/pdf-input";
import { BatchUrlInput } from "@/components/summarize/batch-url-input";
import { TwitterInput } from "@/components/summarize/twitter-input";
import { RedditInput } from "@/components/summarize/reddit-input";
import { GithubInput } from "@/components/summarize/github-input";
import { ImageInput } from "@/components/summarize/image-input";
import { LengthSelector } from "@/components/summarize/length-selector";
import { ModelSelector } from "@/components/summarize/model-selector";
import { SummaryCard } from "@/components/summarize/summary-card";
import { SummarizingState } from "@/components/summarize/summarizing-state";
import { Link, FileText, Sparkles, AlertCircle, Loader2, FileUp, Layers, Twitter, Github, Image } from "lucide-react";
import type { SummaryLength } from "@/lib/summarize/types";
import { useCurrentUser } from "@/hooks/use-user";
import { useSummarize } from "@/hooks/use-summarize";

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

export default function DashboardPage() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const {
    summarizeUrl,
    summarizeText,
    summarizeYoutube,
    summarizePdf,
    summarizeBatch,
    summarizeTwitter,
    summarizeReddit,
    summarizeGithub,
    summarizeImage,
    isLoading,
    error,
    result,
    reset,
  } = useSummarize();

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

  const handlePdfSubmit = async (file: File) => {
    if (!user?._id) return;
    reset();
    try {
      // Convert file to base64 using browser-native FileReader
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix (e.g., "data:application/pdf;base64,")
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await summarizePdf(user._id, base64, file.name, length, model);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleBatchSubmit = async (urls: string[]) => {
    if (!user?._id) return;
    reset();
    try {
      await summarizeBatch(user._id, urls, length, model);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleTwitterSubmit = async (url: string) => {
    if (!user?._id) return;
    reset();
    try {
      await summarizeTwitter(user._id, url, length, model);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleRedditSubmit = async (url: string) => {
    if (!user?._id) return;
    reset();
    try {
      await summarizeReddit(user._id, url, length, model);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleGithubSubmit = async (url: string) => {
    if (!user?._id) return;
    reset();
    try {
      await summarizeGithub(user._id, url, length, model);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleImageSubmit = async (images: Array<{ base64: string; mimeType: string; fileName: string }>) => {
    if (!user?._id) return;
    reset();
    try {
      await summarizeImage(user._id, images, length, model);
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
            <TabsList className="grid w-full grid-cols-4 mb-2">
              <TabsTrigger value="url" className="gap-2" disabled={isLoading}>
                <Link className="h-4 w-4" />
                URL
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-2" disabled={isLoading}>
                <FileText className="h-4 w-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="pdf" className="gap-2" disabled={isLoading}>
                <FileUp className="h-4 w-4" />
                PDF
              </TabsTrigger>
              <TabsTrigger value="batch" className="gap-2" disabled={isLoading}>
                <Layers className="h-4 w-4" />
                Batch
              </TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="twitter" className="gap-2" disabled={isLoading}>
                <Twitter className="h-4 w-4" />
                Twitter
              </TabsTrigger>
              <TabsTrigger value="reddit" className="gap-2" disabled={isLoading}>
                <RedditIcon className="h-4 w-4" />
                Reddit
              </TabsTrigger>
              <TabsTrigger value="github" className="gap-2" disabled={isLoading}>
                <Github className="h-4 w-4" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="image" className="gap-2" disabled={isLoading}>
                <Image className="h-4 w-4" />
                Image
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
            <TabsContent value="pdf" className="mt-4">
              <PdfInput onSubmit={handlePdfSubmit} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="batch" className="mt-4">
              <BatchUrlInput onSubmit={handleBatchSubmit} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="twitter" className="mt-4">
              <TwitterInput onSubmit={handleTwitterSubmit} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="reddit" className="mt-4">
              <RedditInput onSubmit={handleRedditSubmit} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="github" className="mt-4">
              <GithubInput onSubmit={handleGithubSubmit} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="image" className="mt-4">
              <ImageInput onSubmit={handleImageSubmit} isLoading={isLoading} />
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
