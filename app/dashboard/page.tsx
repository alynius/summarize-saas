"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { YouTubeInput } from "@/components/summarize/youtube-input";
import { UrlInput } from "@/components/summarize/url-input";
import { TextInput } from "@/components/summarize/text-input";
import { PdfInput } from "@/components/summarize/pdf-input";
import { BatchUrlInput } from "@/components/summarize/batch-url-input";
import { TwitterInput } from "@/components/summarize/twitter-input";
import { RedditInput } from "@/components/summarize/reddit-input";
import { GithubInput } from "@/components/summarize/github-input";
import { ImageInput } from "@/components/summarize/image-input";
import { OptionsToolbar } from "@/components/summarize/options-toolbar";
import { SummaryCard } from "@/components/summarize/summary-card";
import { SummarizingState } from "@/components/summarize/summarizing-state";
import {
  Link,
  FileText,
  AlertCircle,
  Loader2,
  FileUp,
  Layers,
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

// YouTube icon component
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// X (Twitter) icon component
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

type SourceType =
  | "youtube"
  | "url"
  | "batch"
  | "text"
  | "pdf"
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
  color: string;
}[] = [
  {
    id: "youtube",
    label: "YouTube",
    description: "Summarize videos",
    icon: YouTubeIcon,
    gradient: "from-red-500 to-red-600",
    color: "red",
  },
  {
    id: "url",
    label: "URL",
    description: "Summarize any webpage",
    icon: Link,
    gradient: "from-blue-500 to-blue-600",
    color: "blue",
  },
  {
    id: "batch",
    label: "Batch URLs",
    description: "Multiple URLs at once",
    icon: Layers,
    gradient: "from-violet-500 to-violet-600",
    color: "violet",
  },
  {
    id: "text",
    label: "Text",
    description: "Paste content directly",
    icon: FileText,
    gradient: "from-emerald-500 to-emerald-600",
    color: "emerald",
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Upload documents",
    icon: FileUp,
    gradient: "from-amber-500 to-amber-600",
    color: "amber",
  },
  {
    id: "twitter",
    label: "X",
    description: "Summarize posts & threads",
    icon: XIcon,
    gradient: "from-zinc-600 to-zinc-700",
    color: "zinc",
  },
  {
    id: "reddit",
    label: "Reddit",
    description: "Posts & comments",
    icon: RedditIcon,
    gradient: "from-orange-500 to-orange-600",
    color: "orange",
  },
  {
    id: "github",
    label: "GitHub",
    description: "PRs and Issues",
    icon: Github,
    gradient: "from-slate-400 to-slate-500",
    color: "slate",
  },
  {
    id: "image",
    label: "Image",
    description: "OCR & summarize",
    icon: Image,
    gradient: "from-pink-500 to-pink-600",
    color: "pink",
  },
];

// Helper to get Tailwind color classes for icons
const getIconColorClasses = (color: string, isSelected: boolean) => {
  const colorMap: Record<string, { muted: string; full: string }> = {
    blue: { muted: "text-blue-400/50", full: "text-blue-500" },
    emerald: { muted: "text-emerald-400/50", full: "text-emerald-500" },
    red: { muted: "text-red-400/50", full: "text-red-500" },
    amber: { muted: "text-amber-400/50", full: "text-amber-500" },
    violet: { muted: "text-violet-400/50", full: "text-violet-500" },
    zinc: { muted: "text-zinc-400/50", full: "text-zinc-400" },
    orange: { muted: "text-orange-400/50", full: "text-orange-500" },
    slate: { muted: "text-slate-400/50", full: "text-slate-400" },
    pink: { muted: "text-pink-400/50", full: "text-pink-500" },
  };
  const colors = colorMap[color] || colorMap.blue;
  return isSelected ? colors.full : colors.muted;
};

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

  const [selectedSource, setSelectedSource] = useState<SourceType>("youtube");
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
      case "youtube":
        return (
          <YouTubeInput
            onSubmit={handleYouTubeSubmit}
            isLoading={isLoading}
          />
        );
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
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4">
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
        <div className="flex gap-6 min-h-[560px]">
          {/* Source Sidebar */}
          <div className="w-72 flex-shrink-0 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground px-4 py-3 font-medium uppercase tracking-wide">
              Sources
            </p>
            <nav className="space-y-1.5">
              {sourceTypes.map((source) => {
                const Icon = source.icon;
                const isSelected = selectedSource === source.id;
                const iconColorClass = getIconColorClasses(source.color, isSelected);

                return (
                  <button
                    key={source.id}
                    onClick={() => !isLoading && setSelectedSource(source.id)}
                    disabled={isLoading}
                    aria-pressed={isSelected}
                    className={cn(
                      "w-full flex items-start gap-4 px-4 py-3.5 rounded-xl text-left transition-colors duration-200 relative group",
                      isSelected
                        ? "bg-amber-500/10"
                        : "hover:bg-accent/80",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-amber-500 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "h-6 w-6 flex-shrink-0 mt-0.5 transition-colors duration-200",
                        iconColorClass,
                        !isSelected && "group-hover:opacity-80"
                      )}
                    />
                    <div className="flex flex-col min-w-0 gap-0.5">
                      <span
                        className={cn(
                          "text-base font-medium truncate transition-colors duration-200",
                          isSelected
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      >
                        {source.label}
                      </span>
                      <span
                        className={cn(
                          "text-sm truncate transition-colors duration-200",
                          isSelected
                            ? "text-muted-foreground"
                            : "text-muted-foreground/60 group-hover:text-muted-foreground"
                        )}
                      >
                        {source.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 glass-card rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-10 py-6 border-b border-border bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  {currentSource && (
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center",
                        currentSource.gradient
                      )}
                    >
                      <currentSource.icon className="h-7 w-7 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">
                      {currentSource?.label}
                    </h2>
                    <p className="text-base text-muted-foreground">
                      {currentSource?.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-base text-muted-foreground">AI-Powered</span>
                </div>
              </div>
            </div>

            {/* Input Content */}
            <div className="p-10">
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

              {/* Options Toolbar */}
              <div className="mt-10 pt-8 border-t border-border">
                <OptionsToolbar
                  length={length}
                  onLengthChange={setLength}
                  model={model}
                  onModelChange={setModel}
                  disabled={isLoading}
                />
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center py-24 px-10 text-center relative">
            {/* Ambient background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-subtle-pulse" />
            </div>

            {/* Icon with layered effects */}
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-xl scale-150" />
              <motion.div
                className="relative bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-8 border border-border shadow-lg"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Zap className="h-12 w-12 text-primary" />
              </motion.div>
            </div>

            {/* Text content */}
            <h3 className="mb-4 text-2xl font-semibold text-foreground">
              Ready to summarize
            </h3>
            <p className="max-w-md text-base text-muted-foreground leading-relaxed mb-8">
              Choose a source from the sidebar and paste your content. Our AI will generate a concise, accurate summary in seconds.
            </p>

            {/* Feature hints */}
            <div className="flex flex-wrap justify-center gap-3">
              {["URLs", "PDFs", "YouTube", "Twitter", "GitHub"].map((item, i) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/50 rounded-full border border-border"
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
