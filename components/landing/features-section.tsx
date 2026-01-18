"use client";

import { motion } from "framer-motion";
import { Link as LinkIcon, FileText, Scaling, Cpu } from "lucide-react";

const features = [
  {
    icon: LinkIcon,
    title: "URL Summarization",
    description: "Paste any article URL and get a concise summary instantly",
  },
  {
    icon: FileText,
    title: "Text Summarization",
    description: "Paste long text directly and let AI extract the key points",
  },
  {
    icon: Scaling,
    title: "Multiple Lengths",
    description: "Choose Short, Medium, Long, or XL summaries based on your needs",
  },
  {
    icon: Cpu,
    title: "Model Choice",
    description: "Pick from OpenAI, Anthropic, or Google AI models",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function FeaturesSection() {
  return (
    <section className="border-t border-zinc-800/50 bg-gradient-to-b from-zinc-900 to-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything You Need to Summarize
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Powerful features to help you extract insights from any content
          </p>
        </motion.div>

        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="group relative rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 hover:bg-zinc-800/50 hover:border-amber-500/30 transition-all duration-300"
                variants={itemVariants}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-amber-500/0 to-violet-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

                {/* Active border indicator */}
                <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 group-hover:from-amber-500/30 group-hover:to-amber-600/20 transition-colors">
                  <Icon className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-amber-100 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
