"use client";

import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
} as const;

export function InteractiveDemo() {
  return (
    <section className="border-t border-zinc-800/50 bg-gradient-to-b from-zinc-950 to-zinc-900">
      <motion.div
        className="mx-auto max-w-6xl px-6 py-20 sm:py-24"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Section Header */}
        <motion.div className="text-center" variants={itemVariants}>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-sm text-amber-400">
            <Sparkles className="h-4 w-4" />
            Product Demo
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            See It In Action
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Watch how DigestAI transforms lengthy content into concise,
            actionable summaries in seconds
          </p>
        </motion.div>

        {/* Demo Area with Glassmorphic Border */}
        <motion.div className="mt-12 sm:mt-16" variants={itemVariants}>
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-amber-500/50 via-zinc-700/50 to-violet-500/50">
            {/* Glassmorphic container */}
            <div className="relative rounded-2xl bg-zinc-900/90 backdrop-blur-xl overflow-hidden">
              {/* Inner glow effects */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
              </div>

              {/* Demo placeholder with gradient mockup */}
              <div className="relative aspect-video flex items-center justify-center">
                {/* Mockup UI elements */}
                <div className="absolute inset-6 sm:inset-8 rounded-xl border border-zinc-800/50 bg-zinc-950/50 overflow-hidden">
                  {/* Fake browser chrome */}
                  <div className="flex items-center gap-2 border-b border-zinc-800/50 bg-zinc-900/50 px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-zinc-700" />
                      <div className="h-3 w-3 rounded-full bg-zinc-700" />
                      <div className="h-3 w-3 rounded-full bg-zinc-700" />
                    </div>
                    <div className="ml-4 flex-1 h-6 rounded-md bg-zinc-800/50" />
                  </div>

                  {/* Fake app content */}
                  <div className="p-4 sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Input panel mockup */}
                      <div className="space-y-3">
                        <div className="h-3 w-24 rounded bg-zinc-700/50" />
                        <div className="h-24 rounded-lg border border-zinc-800/50 bg-zinc-900/30" />
                        <div className="flex gap-2">
                          <div className="h-8 w-20 rounded-md bg-zinc-800/50" />
                          <div className="h-8 w-20 rounded-md bg-zinc-800/50" />
                        </div>
                        <div className="h-10 rounded-lg bg-gradient-to-r from-amber-500/30 to-amber-600/30" />
                      </div>

                      {/* Output panel mockup */}
                      <div className="space-y-3">
                        <div className="h-3 w-20 rounded bg-zinc-700/50" />
                        <div className="space-y-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3">
                          <div className="h-2 w-full rounded bg-zinc-700/40" />
                          <div className="h-2 w-5/6 rounded bg-zinc-700/40" />
                          <div className="h-2 w-4/5 rounded bg-zinc-700/40" />
                          <div className="h-2 w-full rounded bg-zinc-700/40" />
                          <div className="h-2 w-3/4 rounded bg-zinc-700/40" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Play button overlay */}
                <motion.button
                  className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shadow-xl shadow-amber-500/30 transition-transform hover:scale-110"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="h-8 w-8 text-zinc-900 ml-1" fill="currentColor" />
                </motion.button>
              </div>

              {/* Bottom caption */}
              <div className="border-t border-zinc-800/50 bg-zinc-900/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-400">
                    Interactive demo coming soon
                  </p>
                  <span className="text-xs text-zinc-500">
                    1:30 min walkthrough
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
