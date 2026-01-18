"use client";

import { useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

// X (Twitter) icon component
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface TwitterInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

const X_URL_PATTERN = /(?:twitter\.com|x\.com)\/[^/]+\/status\/\d+/i;

export function TwitterInput({ onSubmit, isLoading = false }: TwitterInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const trimmed = url.trim();
      if (!trimmed) {
        setError("Please enter an X post URL.");
        return;
      }

      if (!X_URL_PATTERN.test(trimmed)) {
        setError("Invalid X URL. Please enter a link to a post.");
        return;
      }

      onSubmit(trimmed);
    },
    [url, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        {/* Gradient border wrapper */}
        <div className="relative flex-1 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-600 to-zinc-700 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
          <div className="relative flex items-center">
            <XIcon className="absolute left-5 h-5 w-5 text-muted-foreground/70 group-focus-within:text-zinc-400 transition-colors duration-200 z-10" />
            <Input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://x.com/user/status/123..."
              className="h-14 pl-14 pr-5 rounded-xl border-2 border-border/50 bg-background/80 backdrop-blur-sm text-lg placeholder:text-muted-foreground/50 focus:border-zinc-500/50 focus:ring-2 focus:ring-zinc-500/20 transition-all duration-200"
              disabled={isLoading}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={!url.trim() || isLoading}
          className="h-14 px-8 rounded-xl bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-600/90 hover:to-zinc-700/90 text-white font-semibold text-lg shadow-lg shadow-zinc-600/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:active:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Summarizing...
            </>
          ) : (
            "Summarize"
          )}
        </Button>
      </div>

      <p className="text-base text-muted-foreground">
        Paste an X post URL to summarize the thread. Works with x.com and twitter.com links.
      </p>
    </form>
  );
}
