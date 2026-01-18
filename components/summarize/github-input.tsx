"use client";

import { useState, useCallback } from "react";
import { Loader2, Github, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GithubInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

const GITHUB_URL_PATTERN = /github\.com\/[^/]+\/[^/]+\/(pull|issues)\/\d+/i;

export function GithubInput({ onSubmit, isLoading = false }: GithubInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const trimmed = url.trim();
      if (!trimmed) {
        setError("Please enter a GitHub URL.");
        return;
      }

      if (!GITHUB_URL_PATTERN.test(trimmed)) {
        setError("Invalid GitHub URL. Please enter a link to a Pull Request or Issue.");
        return;
      }

      onSubmit(trimmed);
    },
    [url, onSubmit]
  );

  const isPR = url.includes("/pull/");
  const isIssue = url.includes("/issues/");

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="https://github.com/owner/repo/pull/123"
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
            "Summarize " + (isPR ? "PR" : isIssue ? "Issue" : "PR/Issue")
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Enter a GitHub Pull Request or Issue URL to summarize the changes and discussion.
      </p>
    </form>
  );
}
