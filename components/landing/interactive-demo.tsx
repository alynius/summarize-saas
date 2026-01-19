"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FileText,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react";

// Content type icons
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" opacity="0.3" />
      <path d="M14 2v6h6M9 13h6M9 17h6M9 9h1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// Color class mappings (Tailwind requires explicit classes)
const colorClasses = {
  red: {
    text: "text-red-400",
    textMuted: "text-red-500/70",
    bg: "bg-red-500/20",
    border: "border-red-500/30",
    cursor: "bg-red-400",
  },
  amber: {
    text: "text-amber-400",
    textMuted: "text-amber-500/70",
    bg: "bg-amber-500/20",
    border: "border-amber-500/30",
    cursor: "bg-amber-400",
  },
  violet: {
    text: "text-violet-400",
    textMuted: "text-violet-500/70",
    bg: "bg-violet-500/20",
    border: "border-violet-500/30",
    cursor: "bg-violet-400",
  },
} as const;

type ColorKey = keyof typeof colorClasses;

// Demo content data
const demoContent = [
  {
    id: "youtube",
    type: "YouTube Video",
    icon: YouTubeIcon,
    color: "red" as ColorKey,
    gradient: "from-red-500 to-red-600",
    input: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    inputLabel: "Video URL",
    title: "How AI is Changing Software Development in 2024",
    meta: "TechTalks • 2.4M views • 45 min",
    summary: [
      "AI coding assistants like GitHub Copilot are now used by 92% of developers",
      "Code review time reduced by 40% with AI-powered tools",
      "Key concern: Over-reliance may impact fundamental coding skills",
      "Prediction: AI will handle 80% of boilerplate code by 2025",
      "Recommendation: Use AI as a tool, not a replacement for understanding",
    ],
  },
  {
    id: "article",
    type: "Web Article",
    icon: LinkIcon,
    color: "amber" as ColorKey,
    gradient: "from-amber-500 to-amber-600",
    input: "https://techcrunch.com/ai-startup-funding-report",
    inputLabel: "Article URL",
    title: "AI Startup Funding Hits Record $50B in Q1 2024",
    meta: "TechCrunch • 8 min read",
    summary: [
      "Global AI startup funding reached $50.2B in Q1 2024, up 65% YoY",
      "Generative AI companies captured 40% of total investment",
      "Top sectors: Healthcare AI ($8.2B), Enterprise ($7.1B), Fintech ($5.4B)",
      "Notable trend: Smaller, focused AI startups outperforming large raises",
      "Investor sentiment remains bullish despite market corrections",
    ],
  },
  {
    id: "pdf",
    type: "PDF Document",
    icon: PdfIcon,
    color: "violet" as ColorKey,
    gradient: "from-violet-500 to-violet-600",
    input: "quarterly-report-q4-2024.pdf",
    inputLabel: "PDF File",
    title: "Company Performance Report Q4 2024",
    meta: "42 pages • Uploaded just now",
    summary: [
      "Revenue grew 23% YoY to $4.2M, exceeding projections by 8%",
      "Customer acquisition cost decreased 15% through organic channels",
      "Net promoter score improved from 42 to 67 (+25 points)",
      "Three new enterprise clients signed, ARR impact: $840K",
      "Q1 2025 focus: International expansion and product diversification",
    ],
  },
];

// Animation phases
type Phase = "idle" | "typing" | "processing" | "revealing" | "complete";

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

const summaryItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
} as const;

export function InteractiveDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [typedText, setTypedText] = useState("");
  const [visibleSummaryItems, setVisibleSummaryItems] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentContent = demoContent[currentIndex];
  const Icon = currentContent.icon;
  const colors = colorClasses[currentContent.color];

  // Typing animation
  const animateTyping = useCallback(async () => {
    const text = currentContent.input;
    setTypedText("");
    setPhase("typing");

    for (let i = 0; i <= text.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      setTypedText(text.slice(0, i));
    }

    // Start processing after typing
    await new Promise((resolve) => setTimeout(resolve, 300));
    setPhase("processing");

    // Processing duration
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setPhase("revealing");
  }, [currentContent.input]);

  // Summary reveal animation
  useEffect(() => {
    if (phase !== "revealing") return;

    const items = currentContent.summary.length;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      setVisibleSummaryItems(current);

      if (current >= items) {
        clearInterval(interval);
        setPhase("complete");
      }
    }, 400);

    return () => clearInterval(interval);
  }, [phase, currentContent.summary.length]);

  // Main animation loop
  useEffect(() => {
    // Start animation after mount
    const startDelay = setTimeout(() => {
      animateTyping();
    }, 1000);

    return () => clearTimeout(startDelay);
  }, [currentIndex, animateTyping]);

  // Auto-cycle to next content
  useEffect(() => {
    if (phase !== "complete") return;

    const nextTimeout = setTimeout(() => {
      setVisibleSummaryItems(0);
      setTypedText("");
      setPhase("idle");
      setCurrentIndex((prev) => (prev + 1) % demoContent.length);
    }, 4000);

    return () => clearTimeout(nextTimeout);
  }, [phase]);

  // Copy simulation
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Content type selector
  const selectContent = (index: number) => {
    if (index === currentIndex) return;
    setVisibleSummaryItems(0);
    setTypedText("");
    setPhase("idle");
    setCurrentIndex(index);
  };

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
            Live Demo
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            See It In Action
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Watch how DigestAI transforms lengthy content into concise,
            actionable summaries in seconds
          </p>
        </motion.div>

        {/* Content Type Selector */}
        <motion.div
          className="mt-10 flex justify-center gap-3"
          variants={itemVariants}
        >
          {demoContent.map((content, index) => {
            const ContentIcon = content.icon;
            const isActive = index === currentIndex;
            return (
              <button
                key={content.id}
                onClick={() => selectContent(index)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${content.gradient} text-white shadow-lg`
                    : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                <ContentIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{content.type}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Demo Area */}
        <motion.div className="mt-8 sm:mt-12" variants={itemVariants}>
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-amber-500/50 via-zinc-700/50 to-violet-500/50">
            <div className="relative rounded-2xl bg-zinc-900/90 backdrop-blur-xl overflow-hidden">
              {/* Inner glow effects */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
              </div>

              {/* Browser Chrome */}
              <div className="flex items-center gap-2 border-b border-zinc-800/50 bg-zinc-900/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 flex-1 flex items-center gap-2 h-7 rounded-md bg-zinc-800/50 px-3">
                  <span className="text-xs text-zinc-500">digestai.app/dashboard</span>
                </div>
              </div>

              {/* Demo Content */}
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Input Panel */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${colors.text}`} />
                      <span className="text-sm font-medium text-zinc-300">
                        {currentContent.inputLabel}
                      </span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={currentContent.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`ml-auto rounded-full ${colors.bg} px-2 py-0.5 text-xs ${colors.text}`}
                        >
                          {currentContent.type}
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    {/* Input Field with Typing Animation */}
                    <div className={`relative rounded-xl border-2 ${colors.border} bg-zinc-950/50 p-4 transition-colors duration-300`}>
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${colors.textMuted} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-zinc-300 break-all">
                            {typedText}
                            {phase === "typing" && (
                              <motion.span
                                className={`inline-block w-0.5 h-5 ${colors.cursor} ml-0.5`}
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                              />
                            )}
                          </span>
                          {!typedText && phase === "idle" && (
                            <span className="text-zinc-600">Paste URL or upload file...</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Summarize Button */}
                    <motion.button
                      className={`w-full rounded-xl bg-gradient-to-r ${currentContent.gradient} py-3 font-semibold text-white shadow-lg transition-all duration-300`}
                      animate={{
                        scale: phase === "processing" ? [1, 1.02, 1] : 1,
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: phase === "processing" ? Infinity : 0,
                      }}
                    >
                      {phase === "processing" ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Analyzing content...
                        </span>
                      ) : (
                        "Summarize"
                      )}
                    </motion.button>

                    {/* Content Preview Card */}
                    <AnimatePresence mode="wait">
                      {(phase === "processing" || phase === "revealing" || phase === "complete") && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4"
                        >
                          <p className="text-sm font-medium text-zinc-200">
                            {currentContent.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {currentContent.meta}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Output Panel */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-amber-400" />
                        <span className="text-sm font-medium text-zinc-300">
                          Summary
                        </span>
                      </div>
                      {phase === "complete" && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={handleCopy}
                          className="flex items-center gap-1.5 rounded-lg bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-green-400" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>

                    {/* Summary Output */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 p-4 min-h-[280px]">
                      {phase === "idle" || phase === "typing" ? (
                        <div className="flex h-full items-center justify-center text-zinc-600">
                          <p className="text-sm">Summary will appear here...</p>
                        </div>
                      ) : phase === "processing" ? (
                        <div className="space-y-3">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="h-4 rounded bg-zinc-800/50"
                              style={{ width: `${85 - i * 10}%` }}
                              animate={{ opacity: [0.3, 0.6, 0.3] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <motion.ul className="space-y-3">
                          {currentContent.summary.map((item, index) => (
                            <motion.li
                              key={index}
                              variants={summaryItemVariants}
                              initial="hidden"
                              animate={index < visibleSummaryItems ? "visible" : "hidden"}
                              className="flex items-start gap-3"
                            >
                              <ChevronRight className={`h-4 w-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
                              <span className="text-sm text-zinc-300 leading-relaxed">
                                {item}
                              </span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </div>

                    {/* AI Model Badge */}
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Powered by Claude 3.5 Sonnet</span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                        {phase === "complete" ? "Complete" : phase === "processing" ? "Processing..." : "Ready"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Progress Indicator */}
              <div className="border-t border-zinc-800/50 bg-zinc-900/50 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {demoContent.map((content, index) => (
                      <button
                        key={content.id}
                        onClick={() => selectContent(index)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          index === currentIndex
                            ? `w-8 bg-gradient-to-r ${content.gradient}`
                            : "w-1.5 bg-zinc-700 hover:bg-zinc-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {currentIndex + 1} of {demoContent.length} • Auto-playing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-10 text-center"
          variants={itemVariants}
        >
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 font-semibold text-zinc-900 shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:scale-105"
          >
            Try It Free
            <ChevronRight className="h-5 w-5" />
          </a>
          <p className="mt-4 text-sm text-zinc-500">
            No credit card required • 10 free summaries
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
