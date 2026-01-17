"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TextInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

const MAX_CHARACTERS = 100000;

export function TextInput({ onSubmit, isLoading = false }: TextInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
    }
  };

  const characterCount = text.length;
  const isOverLimit = characterCount > MAX_CHARACTERS;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="Paste your text here to summarize..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[200px] resize-y"
          disabled={isLoading}
          required
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Paste any text content you want to summarize.
          </p>
          <span
            className={`text-sm ${
              isOverLimit ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {characterCount.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
          </span>
        </div>
      </div>
      <Button
        type="submit"
        disabled={isLoading || !text.trim() || isOverLimit}
        className="self-end"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Summarizing...
          </>
        ) : (
          "Summarize"
        )}
      </Button>
    </form>
  );
}
