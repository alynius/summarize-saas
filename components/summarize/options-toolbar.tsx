"use client";

import { cn } from "@/lib/utils";
import type { SummaryLength } from "@/lib/summarize/types";

interface LengthOption {
  value: SummaryLength;
  label: string;
}

const lengthOptions: LengthOption[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
  { value: "xl", label: "XL" },
];

interface Model {
  id: string;
  name: string;
}

const models: Model[] = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0" },
];

interface OptionsToolbarProps {
  length: SummaryLength;
  onLengthChange: (value: SummaryLength) => void;
  model: string;
  onModelChange: (value: string) => void;
  disabled?: boolean;
}

export function OptionsToolbar({
  length,
  onLengthChange,
  model,
  onModelChange,
  disabled = false,
}: OptionsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-end sm:justify-between">
      {/* Length Selector */}
      <div className="flex flex-col gap-2">
        <span id="length-label" className="text-sm font-medium text-muted-foreground">
          Length
        </span>
        <div role="group" aria-labelledby="length-label" className="flex rounded-lg bg-muted p-1.5">
          {lengthOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onLengthChange(option.value)}
              disabled={disabled}
              aria-pressed={length === option.value}
              className={cn(
                "rounded-lg px-4 py-2.5 text-base font-medium transition-all duration-200",
                length === option.value
                  ? "bg-primary/20 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Model Selector */}
      <div className="flex flex-col gap-2">
        <span id="model-label" className="text-sm font-medium text-muted-foreground">
          Model
        </span>
        <div role="group" aria-labelledby="model-label" className="flex rounded-lg bg-muted p-1.5">
          {models.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onModelChange(m.id)}
              disabled={disabled}
              aria-pressed={model === m.id}
              className={cn(
                "rounded-lg px-4 py-2.5 text-base font-medium transition-all duration-200",
                model === m.id
                  ? "bg-primary/20 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
