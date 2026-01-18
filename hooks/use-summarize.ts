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

interface YouTubeSummaryResult extends SummaryResult {
  metadata: {
    title: string
    channelName: string
    thumbnail: string
  }
}

interface PdfSummaryResult extends SummaryResult {
  metadata: {
    fileName: string
    pageCount: number
    title?: string
    author?: string
  }
}

export function useSummarize() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SummaryResult | null>(null)

  const summarizeAction = useAction(api.actions.summarize.summarize)
  const summarizeYoutubeAction = useAction(api.actions.summarizeYoutube.summarizeYoutube)
  const summarizePdfAction = useAction(api.actions.summarizePdf.summarizePdf)

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

  const summarizeYoutube = async (
    userId: Id<'users'>,
    url: string,
    summaryLength: SummaryLength,
    model: string
  ): Promise<YouTubeSummaryResult> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await summarizeYoutubeAction({
        userId,
        url,
        summaryLength,
        model,
      })
      // Map the result to match SummaryResult interface
      const mappedResult: SummaryResult = {
        summaryId: res.summaryId,
        summary: res.summary,
        title: res.metadata.title,
        wordCount: res.wordCount,
        tokensUsed: res.tokensUsed,
      }
      setResult(mappedResult)
      return res
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to summarize YouTube video'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const summarizePdf = async (
    userId: Id<'users'>,
    pdfBase64: string,
    fileName: string,
    summaryLength: SummaryLength,
    model: string
  ): Promise<PdfSummaryResult> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await summarizePdfAction({
        userId,
        pdfBase64,
        fileName,
        summaryLength,
        model,
      })
      // Map the result to match SummaryResult interface
      const mappedResult: SummaryResult = {
        summaryId: res.summaryId,
        summary: res.summary,
        title: res.metadata.title || res.metadata.fileName,
        wordCount: res.wordCount,
        tokensUsed: res.tokensUsed,
      }
      setResult(mappedResult)
      return res
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to summarize PDF'
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
    summarizeYoutube,
    summarizePdf,
    isLoading,
    error,
    result,
    reset,
  }
}
