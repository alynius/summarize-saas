"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const variants = {
  success: {
    bg: "bg-emerald-500/20",
    fill: "from-emerald-400 to-emerald-600",
    text: "text-emerald-400",
  },
  warning: {
    bg: "bg-amber-500/20",
    fill: "from-amber-400 to-orange-500",
    text: "text-amber-400",
  },
  error: {
    bg: "bg-red-500/20",
    fill: "from-red-400 to-red-600",
    text: "text-red-400",
  },
} as const;

interface AnimatedProgressProps {
  value: number;
  max: number;
  variant?: keyof typeof variants;
  className?: string;
  showLabel?: boolean;
}

export function AnimatedProgress({
  value,
  max,
  variant = "success",
  className,
  showLabel = true,
}: AnimatedProgressProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const variantStyles = variants[variant];

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className={cn("font-medium", variantStyles.text)}>
            {value}/{max}
          </span>
          <span className="text-zinc-500">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          "h-2 w-full rounded-full overflow-hidden",
          variantStyles.bg
        )}
      >
        <motion.div
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            variantStyles.fill
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1] as const,
          }}
        />
      </div>
    </div>
  );
}
