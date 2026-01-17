'use client'

import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState } from 'react'
import type { Id } from '@/convex/_generated/dataModel'

type SummaryLength = 'short' | 'medium' | 'long' | 'xl'

interface SummaryResult {
  summaryId: string
  summary: string
  title?: string
  wordCount: number
  tokensUsed: number
}

export function useSummarize() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SummaryResult | null>(null)

  const summarizeAction = useAction(api.actions.summarize.summarize)

  const summarizeUrl = async (
    userId: Id<'users'>,
    url: string,
    summaryLength: SummaryLength,
    model: string
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await summarizeAction({
        userId,
        url,
        summaryLength,
        model,
      })
      setResult(res)
      return res
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to summarize'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const summarizeText = async (
    userId: Id<'users'>,
    text: string,
    summaryLength: SummaryLength,
    model: string
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await summarizeAction({
        userId,
        text,
        summaryLength,
        model,
      })
      setResult(res)
      return res
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to summarize'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
  }

  return {
    summarizeUrl,
    summarizeText,
    isLoading,
    error,
    result,
    reset,
  }
}
