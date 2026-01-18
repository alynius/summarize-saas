"use client";

import { motion } from "framer-motion";
import { Users, Zap, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatItem {
  icon: LucideIcon;
  value: string;
  label: string;
}

const stats: StatItem[] = [
  {
    icon: Users,
    value: "50K+",
    label: "Active Users",
  },
  {
    icon: Zap,
    value: "1M+",
    label: "Summaries Generated",
  },
  {
    icon: CheckCircle2,
    value: "99.9%",
    label: "Uptime",
  },
];

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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
} as const;

export function SocialProof() {
  return (
    <section className="border-t border-zinc-800/50 bg-zinc-900">
      <motion.div
        className="mx-auto max-w-6xl px-6 py-16 sm:py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div
          className="grid gap-8 sm:grid-cols-3"
          variants={containerVariants}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="group relative text-center"
                variants={itemVariants}
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-amber-500/0 to-amber-600/0 opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500" />

                {/* Icon container */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                  <Icon className="h-8 w-8 text-amber-400" />
                </div>

                {/* Value */}
                <p className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {stat.value}
                </p>

                {/* Label */}
                <p className="mt-2 text-base text-zinc-400 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trusted by text */}
        <motion.p
          className="mt-12 text-center text-sm text-zinc-500"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Trusted by developers, researchers, and content creators worldwide
        </motion.p>
      </motion.div>
    </section>
  );
}
