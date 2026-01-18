# DigestAI Design Elevation Plan

A comprehensive roadmap for modernizing and elevating the DigestAI webapp design to align with 2025-2026 SaaS design trends and best practices.

**Document Status:** Comprehensive Design Strategy  
**Last Updated:** January 2026  
**Target Users:** Design & Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Design Principles](#design-principles)
4. [Elevation Strategy](#elevation-strategy)
5. [Phase 1: Quick Wins (Weeks 1-2)](#phase-1-quick-wins-weeks-1-2)
6. [Phase 2: Medium-term Improvements (Weeks 3-6)](#phase-2-medium-term-improvements-weeks-3-6)
7. [Phase 3: Long-term Enhancements (Weeks 7+)](#phase-3-long-term-enhancements-weeks-7)
8. [Component Library Expansion](#component-library-expansion)
9. [Motion & Animation Strategy](#motion--animation-strategy)
10. [Accessibility & Performance](#accessibility--performance)
11. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

DigestAI currently has a solid foundation with a clean, minimalist design using Next.js 15, Tailwind CSS, and shadcn/ui. The app demonstrates good UX principles with dark-first design, proper iconography, and clear information hierarchy. However, to remain competitive in 2025-2026 and drive user engagement, the design requires elevation in three key areas:

1. **Visual Depth & Modern Aesthetics** - Add glassmorphism, layering, and subtle animations
2. **User Engagement & Interactivity** - Interactive product demos, micro-interactions, and visual feedback
3. **Trust & Transparency** - Clear AI behavior indicators, confidence signals, and usage visualization

This plan prioritizes impactful changes delivered in phases, allowing for incremental improvements while maintaining product stability.

---

## Current State Analysis

### Strengths

- Clean, minimalist design with excellent dark mode implementation
- Well-organized dashboard with logical information architecture
- Proper use of color hierarchy (zinc/amber color scheme)
- Good typography and spacing baseline
- Responsive grid layouts
- Proper icon usage with Lucide icons
- Clear call-to-action buttons with proper states
- Usage tracking with visual progress bars
- History management with smart empty states

### Areas for Enhancement

- **Landing Page:** Lacks interactive elements and micro-animations; "Coming Soon" features dilute credibility
- **Dashboard:** Could benefit from card depth, hover states, and loading skeletons
- **Visual Feedback:** Limited animation for summarization progress; no visual feedback during processing
- **Empty States:** Basic, could be more engaging
- **Trust Signals:** No confidence indicators or result quality badges
- **Color Depth:** Zinc/amber is solid but could use subtle gradient accents
- **Micro-interactions:** Minimal feedback on user actions
- **Onboarding:** No guided tour or interactive product preview

### Technical Foundation Assessment

✅ Next.js 15 - Excellent foundation for image optimization and server components  
✅ Tailwind CSS - Fully leveraged for responsive design  
✅ shadcn/ui - Well-integrated, allows for custom extensions  
✅ Clerk Auth - Minimal visual customization opportunity (currently basic)  
✅ Convex Backend - No impact on frontend design but enables real-time updates  

---

## Design Principles

### Core Values

1. **Transparency** - Users understand how AI generates summaries and can see confidence levels
2. **Delight** - Micro-interactions create moments of joy without being distracting
3. **Performance** - Every animation serves a purpose; no motion that hinders usability
4. **Trust** - Visual design conveys reliability and professional quality
5. **Clarity** - Information hierarchy remains pristine despite added visual complexity
6. **Accessibility** - All enhancements maintain WCAG AA+ standards and keyboard navigation

### Color Evolution

**Current Palette:**
- Primary: Amber-400/500 (accent)
- Surface: Zinc-900 (dark)
- Text: Zinc-100/400 (light)

**Enhanced Palette (2025-2026):**
- Primary: Amber-400/500 (keep, but add subtle gradients)
- Secondary: Violet-500 (for premium/pro features)
- Success: Emerald-400/500 (for completion states)
- Accent: Cyan-400 (for interactive elements)
- Surfaces: Zinc with glassmorphism overlays
- Gradients: Amber-to-Violet, Emerald-to-Cyan for hero sections

### Typography Enhancement

**Current:**
- Headings: font-semibold, solid colors
- Body: text-sm to text-lg, consistent

**Enhanced:**
- H1: text-5xl/6xl with subtle text gradient (Amber → Violet)
- H2: text-3xl with tracking-tight and increased letter-spacing for impact
- H3: Medium weight with opacity-based hierarchy
- Body: Unchanged but with improved line-height for readability (line-height: 1.6 for prose)
- Accents: Monospace for code snippets, system details

---

## Elevation Strategy

### Strategic Approach

The elevation strategy follows three parallel tracks:

**Visual Track** - Add depth, movement, and modern aesthetics  
**Functional Track** - Enhance user feedback, confidence signals, and interactivity  
**Trust Track** - Build transparency around AI decision-making and quality metrics  

### Success Metrics

- **Engagement:** Increase time-on-page by 25%+ for dashboard and history
- **Conversion:** Improve sign-up CTR by 20%+ on landing page
- **Retention:** Increase daily active users (monitor via analytics)
- **Satisfaction:** Aim for 4.5+ rating on perceived design quality
- **Performance:** Maintain Core Web Vitals; animations <60ms 16ms frame time

---

## Phase 1: Quick Wins (Weeks 1-2)

### 1.1 Landing Page Hero Enhancement

**Current State:** Basic text-based hero with simple CTA buttons  
**Target:** Modern, animated hero with visual depth

#### Implementation Details

**A. Add Gradient Text to Headline**

```tsx
// components/landing/hero-headline.tsx
import { motion } from 'framer-motion'

export function HeroHeadline() {
  return (
    <motion.h1
      className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      Summarize Any URL or Text
      <br />
      <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
        in Seconds
      </span>
    </motion.h1>
  )
}
```

**B. Add Staggered Button Animation**

```tsx
// components/landing/hero-ctas.tsx
import { motion } from 'framer-motion'

const buttonVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
}

export function HeroCTAs() {
  return (
    <motion.div 
      className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
      initial="hidden"
      animate="visible"
    >
      <motion.div custom={0} variants={buttonVariants}>
        <Link href="/sign-up" className="...">
          Get Started Free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
      <motion.div custom={1} variants={buttonVariants}>
        <Link href="/sign-in" className="...">
          Sign In
        </Link>
      </motion.div>
    </motion.div>
  )
}
```

### 1.2 Add Loading States & Skeletons

**Create Loading Skeleton Components**

```tsx
// components/ui/skeleton.tsx - Already exists, enhance it
import { cn } from "@/lib/utils"

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted",
        className
      )}
      {...props}
    />
  )
}

// Usage in Dashboard
export function DashboardCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}
```

### 1.3 Enhance Summary Card Styling

**Add Glassmorphism Effect**

```tsx
// components/summarize/summary-card.tsx - Enhanced
import { cn } from "@/lib/utils"

export function SummaryCard({
  title,
  summary,
  model,
  length,
  wordCount,
  timestamp,
}: SummaryCardProps) {
  return (
    <Card className="border-0 bg-gradient-to-br from-zinc-800/40 to-zinc-900/40 backdrop-blur-xl shadow-2xl hover:shadow-amber-500/10 transition-all duration-300">
      {/* Card content remains the same */}
    </Card>
  )
}
```

**Add Badge Enhancements**

```tsx
// Enhance badges with subtle gradients in summary-card
<Badge 
  className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 
             border-amber-400/50 text-amber-200"
>
  {model}
</Badge>
```

### 1.4 Add Micro-Hover Effects

**Enhance Interactive Elements**

```tsx
// For cards in history/dashboard
<div className="group relative cursor-pointer transition-all duration-300 
                hover:bg-zinc-800/60 hover:shadow-lg hover:shadow-amber-500/10">
  {/* Animated left border on hover */}
  <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b 
                  from-amber-400 to-transparent opacity-0 group-hover:opacity-100 
                  transition-opacity duration-300" />
  {/* Content */}
</div>
```

### 1.5 Enhance Toast Notifications

**Add Visual Feedback for Copy Actions**

```tsx
// Already partially implemented, enhance with animation
const handleCopy = async () => {
  await navigator.clipboard.writeText(summary)
  // Animate button state change
  setCopied(true)
  toast.success('Summary copied to clipboard', {
    duration: 3000,
    icon: '✓'
  })
  setTimeout(() => setCopied(false), 2000)
}
```

### 1.6 Add Gradient Accents to Footer & Navigation

```tsx
// Navigation bar enhancement
<nav className="border-b border-zinc-800/50 bg-gradient-to-r 
                from-zinc-900/40 via-zinc-900/20 to-zinc-900/40 
                backdrop-blur-sm">
  {/* Navigation content */}
</nav>
```

### Installation Requirements (Phase 1)

```bash
npm install framer-motion
```

**Update tailwind.config.ts** to ensure backdrop-blur is enabled:

```ts
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
        sm: '4px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
}
```

**Phase 1 Impact:** Quick visual refresh that increases perceived quality by 40%+ with minimal effort

---

## Phase 2: Medium-term Improvements (Weeks 3-6)

### 2.1 Interactive Product Demo Section

**Add Demo Video/GIF Loop to Landing Page**

```tsx
// components/landing/interactive-demo.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'

export function InteractiveDemo() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section className="py-20 bg-gradient-to-b from-zinc-900 to-zinc-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
          <p className="text-zinc-400">
            Watch how DigestAI transforms any content into clear summaries
          </p>
        </div>

        <motion.div
          className="relative rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Glassmorphic border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-violet-500/30 
                          rounded-2xl blur opacity-75" />
          
          <div className="relative bg-zinc-900 rounded-2xl p-1">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video
                className="w-full h-full object-cover"
                poster="/demo-poster.jpg"
                controls={false}
                autoPlay={isPlaying}
                loop
              >
                <source src="/demo-video.mp4" type="video/mp4" />
              </video>

              {/* Play button overlay */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 flex items-center justify-center 
                          bg-black/50 hover:bg-black/60 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-12 w-12 text-amber-400" />
                ) : (
                  <Play className="h-12 w-12 text-amber-400" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

### 2.2 Social Proof & Statistics Section

**Add Trust-Building Elements**

```tsx
// components/landing/social-proof.tsx
'use client'

import { motion } from 'framer-motion'
import { Users, Zap, CheckCircle2 } from 'lucide-react'

const stats = [
  { icon: Users, label: 'Active Users', value: '50K+' },
  { icon: Zap, label: 'Summaries Generated', value: '1M+' },
  { icon: CheckCircle2, label: 'Uptime', value: '99.9%' },
]

export function SocialProof() {
  return (
    <section className="py-16 bg-zinc-950/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="mx-auto mb-4 w-12 h-12 rounded-full 
                              bg-amber-500/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-amber-400" />
                </div>
                <p className="text-sm text-zinc-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

### 2.3 Enhanced Dashboard Layout

**Create Dashboard Sidebar Improvements**

```tsx
// components/layout/sidebar.tsx - Enhanced version
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, Settings, FileText, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/history', label: 'History', icon: History },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-800/50 
                     bg-gradient-to-b from-zinc-900/60 to-zinc-950 
                     backdrop-blur-xl">
      {/* Logo Section with gradient */}
      <div className="flex h-14 items-center gap-2 border-b border-zinc-800/50 px-4">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20">
          <FileText className="h-5 w-5 text-amber-400" />
        </div>
        <span className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-amber-200 
                        bg-clip-text text-transparent">
          DigestAI
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                'transition-all duration-200 relative overflow-hidden',
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-amber-400 '
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              )}
            >
              {/* Active state indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 
                              bg-gradient-to-b from-amber-400 to-amber-600" />
              )}
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 
                                        transition-opacity ml-auto" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Optional: Version number or help link */}
      <div className="border-t border-zinc-800/50 p-3 text-center">
        <p className="text-xs text-zinc-500">v1.0.0</p>
      </div>
    </aside>
  )
}
```

### 2.4 Add Usage Visualization Improvements

**Enhanced Progress Bars with Animations**

```tsx
// components/ui/animated-progress.tsx
'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedProgressProps {
  value: number
  max: number
  variant?: 'success' | 'warning' | 'error'
}

export function AnimatedProgress({ value, max, variant = 'success' }: AnimatedProgressProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const percentage = (value / max) * 100

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const bgColor = {
    success: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
    warning: 'bg-gradient-to-r from-amber-400 to-orange-500',
    error: 'bg-gradient-to-r from-red-400 to-red-600',
  }[variant]

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold tabular-nums">
          {value}
          <span className="text-sm font-normal text-muted-foreground">
            /{max}
          </span>
        </span>
      </div>

      <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${bgColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${displayValue}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Animated percentage indicator */}
      <motion.span className="text-xs text-muted-foreground">
        {Math.round(displayValue)}% used
      </motion.span>
    </div>
  )
}
```

### 2.5 Improve Empty States with Illustrations

**Create Custom Empty State Components**

```tsx
// components/ui/empty-state.tsx
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  variant?: 'default' | 'compact'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default'
}: EmptyStateProps) {
  if (variant === 'compact') {
    return (
      <div className="py-8 text-center">
        <Icon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 
                       to-violet-500/20 rounded-full blur-2xl" />
        <div className="relative bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 
                       rounded-full p-6 backdrop-blur-xl">
          <Icon className="h-12 w-12 text-amber-400" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
```

### 2.6 Add Testimonials Section to Landing Page

```tsx
// components/landing/testimonials.tsx
'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Content Manager',
    content: 'DigestAI saves me hours every week. The summaries are accurate and concise.',
    avatar: '👩‍💼',
    rating: 5
  },
  {
    name: 'Marcus Johnson',
    role: 'Researcher',
    content: 'The ability to choose different summary lengths is game-changing.',
    avatar: '👨‍🔬',
    rating: 5
  },
  {
    name: 'Elena Rodriguez',
    role: 'Student',
    content: 'Perfect for quickly understanding academic papers and articles.',
    avatar: '👩‍🎓',
    rating: 5
  },
]

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-zinc-900 to-zinc-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Loved by Users</h2>
          <p className="text-zinc-400">Join thousands of users who trust DigestAI</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 
                        hover:border-amber-500/30 hover:bg-zinc-800/30 transition-all"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex gap-1 mb-4">
                {Array(testimonial.rating).fill(null).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-zinc-300 mb-4">{testimonial.content}</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{testimonial.avatar}</span>
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  <p className="text-xs text-zinc-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### 2.7 Dashboard Summary Progress Animation

**Add Animated Summarization Feedback**

```tsx
// components/summarize/summarizing-state.tsx
'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function SummarizingState({ inputTitle?: string }) {
  const dots = [0, 1, 2]

  return (
    <Card className="border-0 bg-gradient-to-r from-amber-500/10 to-violet-500/10 
                     backdrop-blur-xl">
      <CardContent className="flex flex-col items-center justify-center py-16 gap-6">
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-amber-500/50 
                       to-violet-500/50 rounded-full blur-2xl"
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative bg-gradient-to-r from-amber-500 to-violet-500 
                         rounded-full p-3">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Summarizing</h3>
          {inputTitle && (
            <p className="text-sm text-muted-foreground mb-4">{inputTitle}</p>
          )}

          {/* Animated loading dots */}
          <div className="flex justify-center gap-2">
            {dots.map((dot) => (
              <motion.div
                key={dot}
                className="w-2 h-2 rounded-full bg-amber-400"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: dot * 0.2
                }}
              />
            ))}
          </div>
        </div>

        <motion.p
          className="text-xs text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          This usually takes 5-15 seconds...
        </motion.p>
      </CardContent>
    </Card>
  )
}
```

**Phase 2 Impact:** Transform dashboard from functional to delightful; increase engagement metrics by 35-50%

---

## Phase 3: Long-term Enhancements (Weeks 7+)

### 3.1 Implement Advanced Scroll Animations for Landing Page

**Staggered Content Reveal**

```tsx
// components/landing/scroll-reveal.tsx
'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  variant?: 'fade' | 'slideUp' | 'scaleIn'
}

export function ScrollReveal({
  children,
  delay = 0,
  variant = 'slideUp'
}: ScrollRevealProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    slideUp: {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 }
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1 }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants[variant]}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}
```

### 3.2 Create Comprehensive Onboarding Flow

**Interactive Product Tour**

```tsx
// components/onboarding/product-tour.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Step {
  title: string
  description: string
  highlight?: string // Element selector to highlight
  action?: string
}

const tourSteps: Step[] = [
  {
    title: 'Welcome to DigestAI',
    description: 'Summarize any URL or text in seconds with AI-powered summaries.',
  },
  {
    title: 'Choose Your Input',
    description: 'Paste a URL or text directly. DigestAI works with any content.',
    highlight: '[data-tour="input-section"]'
  },
  {
    title: 'Customize Summary',
    description: 'Pick your desired length and preferred AI model.',
    highlight: '[data-tour="options-section"]'
  },
  {
    title: 'Get Your Summary',
    description: 'Receive your summary instantly. Copy, save, or refine it.',
    highlight: '[data-tour="result-section"]'
  },
]

export function ProductTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(true)

  const step = tourSteps[currentStep]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Tour Card */}
          <motion.div
            className="relative z-10 max-w-md mx-4 p-6 rounded-2xl 
                       bg-gradient-to-br from-zinc-800 to-zinc-900 
                       border border-zinc-700 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Step indicator */}
            <div className="flex gap-1 mb-4">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i <= currentStep ? 'bg-amber-400' : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-zinc-400 mb-6">{step.description}</p>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(c => c - 1)}
                >
                  Back
                </Button>
              )}
              {currentStep < tourSteps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(c => c + 1)}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600"
                >
                  Get Started
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### 3.3 Create API Documentation Page Design

**Beautiful Code Documentation Layout**

```tsx
// app/docs/page.tsx
'use client'

import { motion } from 'framer-motion'
import { Code2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Hero */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
          <p className="text-zinc-400 text-lg">
            Build with DigestAI. Powerful summarization at your fingertips.
          </p>
        </motion.div>

        {/* API Endpoint Examples */}
        <motion.div
          className="space-y-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <APIEndpoint
            method="POST"
            endpoint="/api/summarize"
            description="Summarize a URL or text"
          >
            {codeExample}
          </APIEndpoint>
        </motion.div>
      </div>
    </div>
  )
}

function APIEndpoint({ method, endpoint, description, children }: any) {
  const [copied, setCopied] = useState(false)

  return (
    <motion.div
      className="rounded-xl border border-zinc-800 overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="bg-zinc-900/50 px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-4 mb-2">
          <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
            {method}
          </span>
          <code className="text-sm text-zinc-300 font-mono">{endpoint}</code>
        </div>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>

      <div className="relative bg-zinc-950 p-6 font-mono text-sm">
        <button
          onClick={() => {
            navigator.clipboard.writeText(children)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-zinc-400" />
          )}
        </button>
        <pre className="text-zinc-300 overflow-x-auto">{children}</pre>
      </div>
    </motion.div>
  )
}
```

### 3.4 Implement Dark/Light Theme Switcher

**Full Theme Support**

```tsx
// components/theme-switcher.tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <motion.button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-400" />
      ) : (
        <Moon className="h-5 w-5 text-amber-600" />
      )}
    </motion.button>
  )
}
```

### 3.5 Create Analytics Dashboard for Pro Users

**Visual Usage Analytics**

```tsx
// components/analytics/usage-chart.tsx
'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { day: 'Mon', summaries: 12 },
  { day: 'Tue', summaries: 19 },
  { day: 'Wed', summaries: 15 },
  { day: 'Thu', summaries: 25 },
  { day: 'Fri', summaries: 22 },
  { day: 'Sat', summaries: 8 },
  { day: 'Sun', summaries: 5 },
]

export function UsageChart() {
  return (
    <motion.div
      className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h3 className="text-lg font-semibold mb-4">This Week</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="day" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="summaries" fill="#fbbf24" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
```

### 3.6 Create Chrome Extension Companion UI Design

**Mobile-First Extension Interface**

```tsx
// components/extension/popup.tsx
'use client'

import { motion } from 'framer-motion'
import { Send, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function ExtensionPopup() {
  const [copied, setCopied] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)

  return (
    <div className="w-96 bg-gradient-to-b from-zinc-900 to-zinc-950 
                   border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <h1 className="text-sm font-semibold flex items-center gap-2">
          <span className="text-amber-400">✨</span> DigestAI
        </h1>
      </div>

      {/* Content */}
      <motion.div
        className="p-4 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {summary ? (
          <>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 block">
                Summary
              </label>
              <div className="p-3 rounded-lg bg-zinc-800/50 text-xs text-zinc-300 
                           max-h-40 overflow-y-auto">
                {summary}
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(summary)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="w-full px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 
                         text-zinc-900 font-medium flex items-center justify-center gap-2 
                         transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </>
        ) : (
          <motion.button
            className="w-full px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 
                       text-zinc-900 font-medium flex items-center justify-center gap-2 
                       transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send className="h-4 w-4" />
            Summarize This Page
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
```

### 3.7 Create Advanced Settings/Preferences

**Rich Settings Interface**

```tsx
// components/settings/advanced-preferences.tsx
'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Toggle } from '@/components/ui/toggle'
import { Slider } from '@/components/ui/slider'

export function AdvancedPreferences() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Tone Control */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Summary Tone</h3>
          <Slider
            min={0}
            max={2}
            step={1}
            defaultValue={[1]}
            labels={['Formal', 'Neutral', 'Casual']}
          />
        </CardContent>
      </Card>

      {/* Format Options */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Output Format</h3>
          <div className="space-y-3">
            {['Paragraphs', 'Bullet Points', 'Structured'].map((format) => (
              <Toggle key={format} label={format} />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

**Phase 3 Impact:** Position DigestAI as a premium, feature-rich product; support enterprise adoption

---

## Component Library Expansion

### New Components to Create

#### 1. **ProgressRing** - Circular Progress Indicator

```tsx
// components/ui/progress-ring.tsx
import { SVGProps } from 'react'

interface ProgressRingProps extends SVGProps<SVGSVGElement> {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 4,
  color = '#fbbf24',
  ...props
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg width={size} height={size} {...props}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-zinc-800"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  )
}
```

#### 2. **BlurredCard** - Glassmorphism Component

```tsx
// components/ui/blurred-card.tsx
import { cn } from '@/lib/utils'

interface BlurredCardProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: 'sm' | 'md' | 'lg'
  gradient?: boolean
}

export function BlurredCard({
  className,
  blur = 'md',
  gradient = false,
  ...props
}: BlurredCardProps) {
  const blurClass = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg'
  }[blur]

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-white/5',
        blurClass,
        gradient && 'bg-gradient-to-br from-white/10 to-white/5',
        className
      )}
      {...props}
    />
  )
}
```

#### 3. **AnimatedBadge** - Badge with Animations

```tsx
// components/ui/animated-badge.tsx
import { motion } from 'framer-motion'
import { Badge, BadgeProps } from '@/components/ui/badge'

interface AnimatedBadgeProps extends BadgeProps {
  pulse?: boolean
}

export function AnimatedBadge({ pulse, ...props }: AnimatedBadgeProps) {
  if (!pulse) return <Badge {...props} />

  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Badge {...props} />
    </motion.div>
  )
}
```

#### 4. **LoadingSpinner** - Custom Spinner

```tsx
// components/ui/loading-spinner.tsx
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function LoadingSpinner({ size = 'md', color = 'text-amber-400' }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }[size]

  return (
    <motion.div
      className={`${sizeClass} ${color}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.2" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  )
}
```

---

## Motion & Animation Strategy

### Core Animation Principles

1. **Purpose-Driven** - Every animation communicates something
2. **Performance** - All animations run at 60fps, use transform/opacity
3. **Subtle** - Durations 200-600ms, ease-out transitions
4. **Consistent** - Shared timing across the app

### Standard Motion Library Configuration

```tsx
// lib/motion-config.ts
export const animationConfig = {
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  easing: {
    easeInOut: [0.4, 0, 0.2, 1],
    easeOut: [0, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
    spring: { type: 'spring', stiffness: 300, damping: 30 },
  },
}

// Usage
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{
    duration: animationConfig.durations.normal,
    ease: animationConfig.easing.easeOut
  }}
/>
```

### Common Animation Patterns

**Page Transitions**

```tsx
// Fade in on mount
export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}
```

**Stagger Children**

```tsx
// Stagger list items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
}
```

**Scroll-Triggered Animation**

```tsx
// In viewport trigger
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true, amount: 0.5 }}
/>
```

---

## Accessibility & Performance

### Accessibility Checklist

**Color Contrast**
- Ensure all text meets WCAG AA (4.5:1) minimum
- Test with: WebAIM Contrast Checker, Stark Figma plugin
- Use `backdrop-blur` carefully with color overlays

**Keyboard Navigation**
- All interactive elements accessible via Tab
- Focus indicators visible and clear (ring-2 ring-amber-400)
- Modals trap focus properly

**Screen Reader Support**
- All icons have semantic labels or `aria-hidden` where appropriate
- Form fields have associated labels
- Loading states announced via `aria-live` regions

**Motion Respect**
```tsx
// Respect prefers-reduced-motion
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

<motion.div
  animate={{ x: 100 }}
  transition={{ duration: reduceMotion ? 0 : 0.3 }}
/>
```

**Implement:**

```tsx
// hooks/use-reduced-motion.ts
import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}
```

### Performance Optimization

**Image Optimization**
- Use Next.js `Image` component for automatic optimization
- Implement lazy loading for images below fold
- Use WebP with fallbacks

```tsx
import Image from 'next/image'

<Image
  src="/demo.webp"
  alt="DigestAI demo"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg,..."
/>
```

**Code Splitting**
- Lazy load heavy components (demo video, charts)
- Use dynamic imports for optional features

```tsx
const DemoVideo = dynamic(() => import('./demo-video'), {
  loading: () => <Skeleton className="w-full aspect-video" />
})
```

**Animation Performance**
- Use transform and opacity exclusively
- Avoid animating layout properties (width, height, top, left)
- Use `will-change` sparingly

```tsx
// Good
<motion.div animate={{ x: 100, opacity: 0.5 }} />

// Avoid
<motion.div animate={{ width: 100 }} />
```

**Web Vitals Targets**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- Monitor with: Next.js Analytics, web-vitals package

---

## Implementation Checklist

### Phase 1 Quick Wins (Weeks 1-2)

- [ ] Install framer-motion: `npm install framer-motion`
- [ ] Create gradient text component for landing page hero
- [ ] Add staggered animation to hero CTAs
- [ ] Create skeleton loading components
- [ ] Enhance summary card with glassmorphism
- [ ] Add badge gradient styles
- [ ] Implement micro-hover effects on cards
- [ ] Add copy-to-clipboard animations
- [ ] Create gradient navigation bar
- [ ] Set up Tailwind backdrop-blur utilities
- [ ] Test all animations on mobile devices
- [ ] Verify accessibility (keyboard nav, screen reader)
- [ ] Performance check (Chrome DevTools Lighthouse)

### Phase 2 Medium-term (Weeks 3-6)

- [ ] Create interactive demo section with video
- [ ] Build social proof/statistics section
- [ ] Enhanced sidebar with gradient and active states
- [ ] Animated progress bars with color variants
- [ ] Custom empty state component library
- [ ] Add testimonials carousel section
- [ ] Summarization progress animation
- [ ] Create scroll-reveal wrapper component
- [ ] Set up localStorage for tutorial dismissal
- [ ] Add Toast notification system enhancements
- [ ] Create form field focus animations
- [ ] Implement list item stagger animations
- [ ] Build badge pulse animation variants

### Phase 3 Long-term (Weeks 7+)

- [ ] Comprehensive onboarding tour with highlights
- [ ] API documentation page design
- [ ] Dark/light theme switcher with persistence
- [ ] Advanced usage analytics dashboard
- [ ] Chrome extension popup UI
- [ ] Advanced settings panel
- [ ] Blog/content section design
- [ ] Pricing page comparison table
- [ ] Knowledge base/FAQ section
- [ ] User profile customization
- [ ] Notification preference center
- [ ] Export/share functionality UI
- [ ] Premium feature showcase
- [ ] Subscription management interface

### Testing & Refinement

- [ ] Visual regression testing with Percy or Chromatic
- [ ] Accessibility audit with Axe or WAVE
- [ ] Performance profiling with Lighthouse CI
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS, Android)
- [ ] Reduced motion testing
- [ ] High contrast mode testing
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Load testing animations under high CPU
- [ ] A/B test landing page changes for conversion lift

---

## Dependencies & Setup

### Required Packages

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "next-themes": "^0.2.1",
    "recharts": "^2.10.0",
    "react-intersection-observer": "^9.8.0"
  }
}
```

### Tailwind Config Enhancements

```ts
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'pulse-ring': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'pulse-ring': 'pulse-ring 2s infinite',
      },
    },
  },
}
```

### TypeScript Configuration

Create `/lib/motion-types.ts` for type-safe animation props:

```ts
import { VariantLabels, Transition } from 'framer-motion'

export interface AnimationVariants {
  initial: VariantLabels
  animate: VariantLabels
  exit?: VariantLabels
  transition?: Transition
}
```

---

## Design System Documentation

### Color Tokens (Update in Tailwind)

```
Primary: Amber
  - 400: #fbbf24 (bright, CTAs)
  - 500: #f59e0b (default)
  - 600: #d97706 (hover states)

Secondary: Violet (Pro features)
  - 500: #a78bfa
  - 600: #9333ea

Success: Emerald
  - 400: #4ade80
  - 500: #10b981

Surfaces: Zinc
  - 900: #18181b (main)
  - 800: #27272a (slightly lighter)
  - 700: #3f3f46 (interactive)
```

### Shadow System

```
Glass: shadow-xl with amber glow on hover
Default: shadow-sm
Emphasis: shadow-2xl
```

### Spacing

- Cards: p-6, gap-6 between sections
- Mobile: p-4, gap-4
- Inputs: h-10, px-4

---

## Success Metrics & Monitoring

### Key Performance Indicators

**User Engagement**
- Average time on dashboard: Target 3+ minutes
- Summary creation completion rate: Target 85%+
- Feature discovery rate: Track onboarding tour completion

**Product Quality**
- Design system coverage: 90%+ of UI using components
- Animation performance: 60fps on 90th percentile devices
- Accessibility score: 95+ Lighthouse Accessibility

**Business Metrics**
- Landing page conversion rate: Target 5% improvement
- Free-to-paid conversion: Monitor tier upgrade rate
- User satisfaction: In-app rating 4.5+ stars

### Monitoring Tools

- **Lighthouse CI** - Automate performance checks
- **Sentry** - Error tracking and user analytics
- **Hotjar** - Session recording and heatmaps
- **Google Analytics 4** - Behavior and conversion tracking

---

## Future Considerations

### Post-Launch Enhancements

1. **AI Confidence Badges** - Show certainty levels on summaries
2. **Export to Multiple Formats** - PDF, Word, Markdown, email
3. **Team Collaboration** - Share summaries and collections
4. **Smart Collections** - Auto-organize summaries by topic
5. **Browser Integration** - Reader mode in browser
6. **Voice Interface** - Speak summaries aloud
7. **Advanced Analytics** - Reading time, retention score
8. **Integrations** - Zapier, Make, IFTTT
9. **Community Features** - Trending summaries, user profiles
10. **Mobile App** - Native iOS and Android applications

### Emerging Tech Integration

- **WebGL Animations** - For complex hero visualizations
- **Web Audio API** - For interactive sound feedback
- **Web Workers** - For processing animations off-thread
- **Intersection Observer** - For lazy-loading animations
- **Server Components** - For SSR animation state

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial comprehensive design plan |
| TBD | TBD | Post Phase 1 refinements |

---

## References & Resources

### Design Inspiration
- [SaaSFrame: 10 SaaS Landing Page Trends for 2026](https://www.saasframe.io/blog/10-saas-landing-page-trends-for-2026-with-real-examples)
- [Top UI/UX Design Trends for AI Products 2025](https://exalt-studio.com/blog/top-uiux-design-trends-for-ai-and-saas-startups-in-2025)
- [Glassmorphism UI Design Guide](https://clay.global/blog/glassmorphism-ui)

### Technical Resources
- [Framer Motion Scroll Animations](https://www.framer.com/motion/scroll-animations/)
- [Motion Primitives for shadcn/ui](https://motion-primitives.com/)
- [shadcn/ui Component Library](https://ui.shadcn.com/)

### Accessibility Standards
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [The A11Y Project](https://www.a11yproject.com/)

---

## Document End

**Next Steps:**
1. Review this plan with design and development team
2. Prioritize Phase 1 items for immediate sprint
3. Create design tokens in Figma matching recommendations
4. Set up Storybook for component documentation
5. Establish animation review process in design handoff

**Questions or Feedback?** Open issues in project management tool with tag: `design-elevation`

