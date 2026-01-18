import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Check,
  Zap,
} from "lucide-react";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { InteractiveDemo } from "@/components/landing/interactive-demo";
import { SocialProof } from "@/components/landing/social-proof";
import { Testimonials } from "@/components/landing/testimonials";

export default async function Home() {
  const { userId } = await auth();

  // Redirect authenticated users to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Navigation */}
      <nav className="border-b border-zinc-800/50 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
              DigestAI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-zinc-900 hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Interactive Demo Section */}
      <InteractiveDemo />

      {/* Social Proof Section */}
      <SocialProof />

      {/* How It Works Section */}
      <section className="border-t border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">How It Works</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-zinc-400">
            Get your summary in three simple steps
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-xl font-bold text-zinc-900">
                1
              </div>
              <h3 className="mt-6 text-lg font-semibold">Paste URL or Text</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Enter any article URL or paste your text directly into the input
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-xl font-bold text-zinc-900">
                2
              </div>
              <h3 className="mt-6 text-lg font-semibold">
                Choose Summary Length
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                Select how detailed you want your summary to be
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-xl font-bold text-zinc-900">
                3
              </div>
              <h3 className="mt-6 text-lg font-semibold">Get Your Summary</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Receive your AI-generated summary in seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Pricing Section */}
      <section className="border-t border-zinc-800 bg-zinc-950/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">Simple Pricing</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-zinc-400">
            Start free, upgrade when you need more
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {/* Free Tier */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-2 text-3xl font-bold">
                $0<span className="text-base font-normal text-zinc-400">/mo</span>
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-amber-400" />
                  10 summaries per month
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-amber-400" />
                  All summary lengths
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-amber-400" />
                  All AI models
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="mt-8 block w-full rounded-lg bg-zinc-800 py-2.5 text-center text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="rounded-xl border border-amber-500/50 bg-zinc-900/50 p-8 ring-1 ring-amber-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pro</h3>
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                  Coming Soon
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold">
                $9<span className="text-base font-normal text-zinc-400">/mo</span>
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-amber-400" />
                  Unlimited summaries
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-amber-400" />
                  Priority processing
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-amber-400" />
                  Export to PDF
                </li>
              </ul>
              <button
                disabled
                className="mt-8 block w-full cursor-not-allowed rounded-lg bg-amber-500/50 py-2.5 text-center text-sm font-medium text-zinc-900"
              >
                Coming Soon
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
              <h3 className="text-lg font-semibold">Enterprise</h3>
              <p className="mt-2 text-3xl font-bold">Custom</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-amber-400" />
                  Custom volume
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-amber-400" />
                  API access
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="h-4 w-4 text-amber-400" />
                  Dedicated support
                </li>
              </ul>
              <a
                href="mailto:contact@digestai.ai"
                className="mt-8 block w-full rounded-lg bg-zinc-800 py-2.5 text-center text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <span className="font-semibold">DigestAI</span>
            </div>
            <p className="text-sm text-zinc-500">
              &copy; {new Date().getFullYear()} DigestAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
