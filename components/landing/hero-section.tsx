"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.4 + i * 0.1, duration: 0.5 },
  }),
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="mx-auto max-w-6xl px-6 py-24 sm:py-32 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-sm text-amber-400">
            <Sparkles className="h-4 w-4" />
            AI-Powered Summarization
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
          variants={itemVariants}
        >
          Summarize Any URL or Text
          <br />
          <span className="gradient-text">in Seconds</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-zinc-400 leading-relaxed"
          variants={itemVariants}
        >
          AI-powered summaries at your fingertips. Choose your length, pick your
          model, get instant insights from any content.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          initial="hidden"
          animate="visible"
        >
          <motion.div custom={0} variants={buttonVariants}>
            <Link
              href="/sign-up"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-base font-semibold text-zinc-900 hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <motion.div custom={1} variants={buttonVariants}>
            <Link
              href="/sign-in"
              className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 backdrop-blur-sm px-8 py-4 text-base font-medium text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600 transition-all"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats or trust indicators */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-12"
          variants={itemVariants}
        >
          {[
            { value: "10K+", label: "Summaries" },
            { value: "3", label: "AI Models" },
            { value: "4", label: "Length Options" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
