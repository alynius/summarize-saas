"use client";

import { cn } from "@/lib/utils";
import type { SummaryLength } from "@/lib/summarize/types";

interface LengthOption {
  value: SummaryLength;
  label: string;
  description: string;
}

const lengthOptions: LengthOption[] = [
  { value: "short", label: "Short", description: "~100 words" },
  { value: "medium", label: "Medium", description: "~250 words" },
  { value: "long", label: "Long", description: "~500 words" },
  { value: "xl", label: "XL", description: "~1000 words" },
];

interface LengthSelectorProps {
  value: SummaryLength;
  onChange: (value: SummaryLength) => void;
  disabled?: boolean;
}

export function LengthSelector({
  value,
  onChange,
  disabled = false,
}: LengthSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Summary Length
      </label>
      <div className="flex rounded-lg border bg-muted p-1">
        {lengthOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-md px-3 py-2 text-sm transition-all",
              value === option.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <span className="font-medium">{option.label}</span>
            <span className="text-xs opacity-70">{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
