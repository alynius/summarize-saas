"use client";

import { useState, useCallback } from "react";
import { Loader2, Twitter, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TwitterInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

const TWITTER_URL_PATTERN = /(?:twitter\.com|x\.com)\/[^/]+\/status\/\d+/i;

export function TwitterInput({ onSubmit, isLoading = false }: TwitterInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const trimmed = url.trim();
      if (!trimmed) {
        setError("Please enter a Twitter/X URL.");
        return;
      }

      if (!TWITTER_URL_PATTERN.test(trimmed)) {
        setError("Invalid Twitter/X URL. Please enter a link to a tweet.");
        return;
      }

      onSubmit(trimmed);
    },
    [url, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Twitter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="https://twitter.com/user/status/123..."
          className="pl-9"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!url.trim() || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            "Summarize Thread"
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Enter a Twitter/X post URL to summarize the thread. Works with x.com and twitter.com links.
      </p>
    </form>
  );
}
