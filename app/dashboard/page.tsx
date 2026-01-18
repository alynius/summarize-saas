"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Link,
  FileText,
  AlertCircle,
  Loader2,
  FileUp,
  Layers,
  Twitter,
  Github,
  Image,
  Zap,
} from "lucide-react";
import type { SummaryLength } from "@/lib/summarize/types";
import { useCurrentUser } from "@/hooks/use-user";
import { useSummarize } from "@/hooks/use-summarize";
import { cn } from "@/lib/utils";

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

type SourceType =
  | "url"
  | "text"
  | "pdf"
  | "batch"
  | "twitter"
  | "reddit"
  | "github"
  | "image";

const sourceTypes: {
  id: SourceType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}[] = [
  {
    id: "url",
    label: "URL",
    description: "Summarize any webpage",
    icon: Link,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "text",
    label: "Text",
    description: "Paste content directly",
    icon: FileText,
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Upload documents",
    icon: FileUp,
    gradient: "from-red-500 to-red-600",
  },
  {
    id: "batch",
    label: "Batch URLs",
    description: "Multiple URLs at once",
    icon: Layers,
    gradient: "from-violet-500 to-violet-600",
  },
  {
    id: "twitter",
    label: "Twitter",
    description: "Summarize threads",
    icon: Twitter,
    gradient: "from-sky-400 to-sky-500",
  },
  {
    id: "reddit",
    label: "Reddit",
    description: "Posts & comments",
    icon: RedditIcon,
    gradient: "from-orange-500 to-orange-600",
  },
  {
    id: "github",
    label: "GitHub",
    description: "PRs and Issues",
    icon: Github,
    gradient: "from-slate-400 to-slate-500",
  },
  {
    id: "image",
    label: "Image",
    description: "OCR & summarize",
    icon: Image,
    gradient: "from-pink-500 to-pink-600",
  },
];

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

  const [selectedSource, setSelectedSource] = useState<SourceType>("url");
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
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
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

  const handleImageSubmit = async (
    images: Array<{ base64: string; mimeType: string; fileName: string }>
  ) => {
    if (!user?._id) return;
    reset();
    try {
      await summarizeImage(user._id, images, length, model);
    } catch {
      // Error is handled by the hook
    }
  };

  const currentSource = sourceTypes.find((s) => s.id === selectedSource);

  const renderInput = () => {
    switch (selectedSource) {
      case "url":
        return (
          <UrlInput
            onSubmit={handleUrlSubmit}
            onYouTubeSubmit={handleYouTubeSubmit}
            isLoading={isLoading}
          />
        );
      case "text":
        return <TextInput onSubmit={handleTextSubmit} isLoading={isLoading} />;
      case "pdf":
        return <PdfInput onSubmit={handlePdfSubmit} isLoading={isLoading} />;
      case "batch":
        return (
          <BatchUrlInput onSubmit={handleBatchSubmit} isLoading={isLoading} />
        );
      case "twitter":
        return (
          <TwitterInput onSubmit={handleTwitterSubmit} isLoading={isLoading} />
        );
      case "reddit":
        return (
          <RedditInput onSubmit={handleRedditSubmit} isLoading={isLoading} />
        );
      case "github":
        return (
          <GithubInput onSubmit={handleGithubSubmit} isLoading={isLoading} />
        );
      case "image":
        return (
          <ImageInput onSubmit={handleImageSubmit} isLoading={isLoading} />
        );
      default:
        return null;
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Input Section with Sidebar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex gap-4 min-h-[420px]">
          {/* Source Sidebar */}
          <div className="w-48 flex-shrink-0 rounded-2xl border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground px-3 py-2 font-medium uppercase tracking-wide">
              Sources
            </p>
            <nav className="space-y-1">
              {sourceTypes.map((source) => {
                const Icon = source.icon;
                const isSelected = selectedSource === source.id;

                return (
                  <button
                    key={source.id}
                    onClick={() => !isLoading && setSelectedSource(source.id)}
                    disabled={isLoading}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all relative",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isSelected && "text-primary"
                      )}
                    />
                    <span className="text-sm font-medium truncate">
                      {source.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 glass-card rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentSource && (
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                        currentSource.gradient
                      )}
                    >
                      <currentSource.icon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {currentSource?.label}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {currentSource?.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">AI-Powered</span>
                </div>
              </div>
            </div>

            {/* Input Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedSource}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderInput()}
                </motion.div>
              </AnimatePresence>

              {/* Options */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Length:</span>
                  <LengthSelector
                    value={length}
                    onChange={setLength}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Model:</span>
                  <ModelSelector
                    value={model}
                    onChange={setModel}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
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
          <Card className="border-dashed border-border bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl" />
                <div className="relative bg-muted rounded-full p-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">
                No summary yet
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
                Select a source type and enter your content to generate an
                AI-powered summary.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
