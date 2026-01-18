"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SummarizingStateProps {
  inputTitle?: string;
}

export function SummarizingState({ inputTitle }: SummarizingStateProps) {
  const dots = [0, 1, 2];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="glass-card border-0 overflow-hidden">
        {/* Animated gradient border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-violet-500 to-amber-500 animate-shimmer" />

        <CardContent className="flex flex-col items-center justify-center py-16 gap-6">
          {/* Animated icon */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-500/40 to-violet-500/40 rounded-full blur-2xl"
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="relative bg-gradient-to-br from-amber-500 to-violet-600 rounded-full p-4"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
          </div>

          {/* Text */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Summarizing</h3>
            {inputTitle && (
              <p className="text-sm text-zinc-400 mb-4 max-w-md truncate">
                {inputTitle}
              </p>
            )}

            {/* Animated loading dots */}
            <div className="flex justify-center gap-2 mb-4">
              {dots.map((dot) => (
                <motion.div
                  key={dot}
                  className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                  animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: dot * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress hint */}
          <motion.p
            className="text-xs text-zinc-500"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            This usually takes 5-15 seconds...
          </motion.p>

          {/* Fake progress bar */}
          <div className="w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-violet-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "90%" }}
              transition={{ duration: 12, ease: "easeOut" }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
