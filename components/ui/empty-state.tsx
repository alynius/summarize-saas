"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  variant?: "default" | "compact";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact ? "py-8 px-4" : "py-16 px-6",
        className
      )}
    >
      {/* Icon container with glassmorphic effect */}
      <div className="relative">
        {/* Gradient glow effect - only for default variant */}
        {!isCompact && (
          <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-2xl scale-150" />
        )}

        {/* Glassmorphic icon container */}
        <div
          className={cn(
            "relative rounded-full bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 flex items-center justify-center",
            isCompact ? "p-3" : "p-5"
          )}
        >
          <Icon
            className={cn(
              "text-amber-400",
              isCompact ? "h-6 w-6" : "h-10 w-10"
            )}
          />
        </div>
      </div>

      {/* Text content */}
      <div className={cn("max-w-md", isCompact ? "mt-4" : "mt-6")}>
        <h3
          className={cn(
            "font-semibold text-white",
            isCompact ? "text-base" : "text-xl"
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-zinc-400",
            isCompact ? "text-sm mt-1" : "text-base mt-2"
          )}
        >
          {description}
        </p>
      </div>

      {/* Optional action */}
      {action && (
        <div className={cn(isCompact ? "mt-4" : "mt-6")}>{action}</div>
      )}
    </div>
  );
}
