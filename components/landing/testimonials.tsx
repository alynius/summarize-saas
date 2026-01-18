"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  avatar: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    avatar: "👨‍💻",
    name: "Alex Chen",
    role: "Software Engineer at TechCorp",
    content:
      "DigestAI has completely transformed how I consume technical documentation. What used to take hours now takes minutes. The AI summaries are incredibly accurate.",
    rating: 5,
  },
  {
    avatar: "👩‍🔬",
    name: "Sarah Mitchell",
    role: "Research Analyst",
    content:
      "As someone who reads dozens of research papers weekly, this tool is a game-changer. The different summary lengths let me quickly triage what needs deeper reading.",
    rating: 5,
  },
  {
    avatar: "👨‍💼",
    name: "Marcus Johnson",
    role: "Content Strategist",
    content:
      "I use DigestAI daily to stay on top of industry news. The model choice feature is fantastic - I can pick the best AI for different types of content.",
    rating: 5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
} as const;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating
              ? "text-amber-400 fill-amber-400"
              : "text-zinc-600 fill-zinc-600"
          }`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="border-t border-zinc-800/50 bg-gradient-to-b from-zinc-900 to-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        {/* Section Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Loved by Thousands
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            See what our users have to say about DigestAI
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              className="group relative rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 hover:border-amber-500/30 hover:bg-zinc-800/50 transition-all duration-300"
              variants={itemVariants}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-amber-500/0 to-violet-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

              {/* Rating */}
              <StarRating rating={testimonial.rating} />

              {/* Content */}
              <p className="mt-4 text-zinc-300 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-2xl">
                  {testimonial.avatar}
                </span>
                <div>
                  <p className="font-semibold text-white group-hover:text-amber-100 transition-colors">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-zinc-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
