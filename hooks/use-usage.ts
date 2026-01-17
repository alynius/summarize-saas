'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

export function useUsage(userId: Id<'users'> | undefined) {
  const usageData = useQuery(
    api.usage.getUsageWithLimits,
    userId ? { userId } : 'skip'
  )

  const canSummarizeData = useQuery(
    api.usage.canSummarize,
    userId ? { userId } : 'skip'
  )

  return {
    usage: usageData ?? null,
    canSummarize: canSummarizeData?.allowed ?? true,
    isLoading: usageData === undefined,
  }
}
