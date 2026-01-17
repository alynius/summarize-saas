'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

export function useSummaries(userId: Id<'users'> | undefined) {
  const summariesData = useQuery(
    api.summaries.getUserSummaries,
    userId ? { userId, limit: 50 } : 'skip'
  )

  const deleteSummaryMutation = useMutation(api.summaries.deleteSummary)

  const deleteSummary = async (summaryId: Id<'summaries'>) => {
    if (!userId) return
    await deleteSummaryMutation({ summaryId, userId })
  }

  return {
    summaries: summariesData?.items ?? [],
    isLoading: summariesData === undefined,
    hasMore: summariesData?.hasMore ?? false,
    deleteSummary,
  }
}
