"use client";

import { useState, useCallback } from "react";
import { Loader2, Plus, X, Link2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BatchUrlInputProps {
  onSubmit: (urls: string[]) => void;
  isLoading?: boolean;
}

const MIN_URLS = 2;
const MAX_URLS = 10;

function isValidUrl(url: string): boolean {
  try {
    const normalized = url.startsWith("http") ? url : "https://" + url;
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

export function BatchUrlInput({ onSubmit, isLoading = false }: BatchUrlInputProps) {
  const [urls, setUrls] = useState<string[]>(["", ""]);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = useCallback((index: number, value: string) => {
    setError(null);
    setUrls((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const handleAddUrl = useCallback(() => {
    if (urls.length < MAX_URLS) {
      setUrls((prev) => [...prev, ""]);
    }
  }, [urls.length]);

  const handleRemoveUrl = useCallback((index: number) => {
    if (urls.length > MIN_URLS) {
      setUrls((prev) => prev.filter((_, i) => i !== index));
    }
  }, [urls.length]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const validUrls = urls.map((u) => u.trim()).filter((u) => u.length > 0);

      if (validUrls.length < MIN_URLS) {
        setError("Please enter at least " + MIN_URLS + " URLs.");
        return;
      }

      const invalidUrls = validUrls.filter((u) => !isValidUrl(u));
      if (invalidUrls.length > 0) {
        setError("Invalid URL: " + invalidUrls[0]);
        return;
      }

      onSubmit(validUrls);
    },
    [urls, onSubmit]
  );

  const filledCount = urls.filter((u) => u.trim().length > 0).length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        {urls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                placeholder={"https://example.com/article-" + (index + 1)}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
            {urls.length > MIN_URLS && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveUrl(index)}
                disabled={isLoading}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddUrl}
          disabled={isLoading || urls.length >= MAX_URLS}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add URL ({urls.length}/{MAX_URLS})
        </Button>

        <Button type="submit" disabled={filledCount < MIN_URLS || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            "Summarize " + filledCount + " URLs"
          )}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Enter {MIN_URLS}-{MAX_URLS} URLs to create a combined summary from multiple sources.
      </p>
    </form>
  );
}
