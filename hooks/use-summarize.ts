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

interface BatchSummaryResult extends SummaryResult {
  metadata: {
    totalUrls: number
    successfulUrls: number
    failedUrls: Array<{ url: string; error: string }>
    titles: string[]
  }
}

interface TwitterSummaryResult extends SummaryResult {
  metadata: {
    author: string
    authorHandle: string
    tweetCount: number
  }
}

interface RedditSummaryResult extends SummaryResult {
  metadata: {
    title: string
    subreddit: string
    author: string
    score: number
    commentCount: number
  }
}

interface GithubSummaryResult extends SummaryResult {
  metadata: {
    type: 'pr' | 'issue'
    owner: string
    repo: string
    number: number
    title: string
    state: string
    filesChanged?: number
  }
}

interface ImageSummaryResult extends SummaryResult {
  metadata: {
    imageCount: number
    fileNames: string[]
    extractedText: string
  }
}

export function useSummarize() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SummaryResult | null>(null)

  const summarizeAction = useAction(api.actions.summarize.summarize)
  const summarizeYoutubeAction = useAction(api.actions.summarizeYoutube.summarizeYoutube)
  const summarizePdfAction = useAction(api.actions.summarizePdf.summarizePdf)
  const summarizeBatchAction = useAction(api.actions.summarizeBatch.summarizeBatch)
  const summarizeTwitterAction = useAction(api.actions.summarizeTwitter.summarizeTwitter)
  const summarizeRedditAction = useAction(api.actions.summarizeReddit.summarizeReddit)
  const summarizeGithubAction = useAction(api.actions.summarizeGithub.summarizeGithub)
  const summarizeImageAction = useAction(api.actions.summarizeImage.summarizeImage)

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

  const summarizeBatch = async (
    userId: Id<'users'>,
    urls: string[],
    summaryLength: SummaryLength,
    model: string
  ): Promise<BatchSummaryResult> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await summarizeBatchAction({
        userId,
        urls,
        summaryLength,
        model,
      })
      const mappedResult: SummaryResult = {
        summaryId: res.summaryId,
        summary: res.summary,
        title: 'Batch Summary (' + res.metadata.successfulUrls + ' URLs)',
        wordCount: res.wordCount,
        tokensUsed: res.tokensUsed,
      }
      setResult(mappedResult)
      return res
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to summarize URLs'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const summarizeTwitter = async (
    userId: Id<'users'>,
    url: string,
    summaryLength: SummaryLength,
    model: string
  ): Promise<TwitterSummaryResult> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await summarizeTwitterAction({
        userId,
        url,
        summaryLength,
        model,
      })
      const mappedResult: SummaryResult = {
        summaryId: res.summaryId,
        summary: res.summary,
        title: 'Thread by @' + res.metadata.authorHandle,
        wordCount: res.wordCount,
        tokensUsed: res.tokensUsed,
      }
      setResult(mappedResult)
      return res
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to summarize Twitter thread'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const summarizeReddit = async (
    userId: Id<'users'>,
    url: string,
    summaryLength: SummaryLength,
    model: string
  ): Promise<RedditSummaryResult> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await summarizeRedditAction({
        userId,
        url,
        summaryLength,
        model,
      })
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
      const message = err instanceof Error ? err.message : 'Failed to summarize Reddit post'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const summarizeGithub = async (
    userId: Id<'users'>,
    url: string,
    summaryLength: SummaryLength,
    model: string
  ): Promise<GithubSummaryResult> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await summarizeGithubAction({
        userId,
        url,
        summaryLength,
        model,
      })
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
      const message = err instanceof Error ? err.message : 'Failed to summarize GitHub item'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const summarizeImage = async (
    userId: Id<'users'>,
    images: Array<{ base64: string; mimeType: string; fileName: string }>,
    summaryLength: SummaryLength,
    model: string
  ): Promise<ImageSummaryResult> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await summarizeImageAction({
        userId,
        images,
        summaryLength,
        model,
      })
      const mappedResult: SummaryResult = {
        summaryId: res.summaryId,
        summary: res.summary,
        title: res.metadata.imageCount === 1 ? res.metadata.fileNames[0] : res.metadata.imageCount + ' Images',
        wordCount: res.wordCount,
        tokensUsed: res.tokensUsed,
      }
      setResult(mappedResult)
      return res
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process images'
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
    summarizeBatch,
    summarizeTwitter,
    summarizeReddit,
    summarizeGithub,
    summarizeImage,
    isLoading,
    error,
    result,
    reset,
  }
}
