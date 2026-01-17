'use client'

import { useQuery, useMutation } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { useEffect } from 'react'

export function useCurrentUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser()

  const convexUser = useQuery(
    api.users.getUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : 'skip'
  )

  const getOrCreateUser = useMutation(api.users.getOrCreateUser)

  // Create user in Convex if they don't exist yet
  useEffect(() => {
    if (isClerkLoaded && clerkUser && convexUser === null) {
      getOrCreateUser({
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
        name: clerkUser.fullName ?? undefined,
      })
    }
  }, [isClerkLoaded, clerkUser, convexUser, getOrCreateUser])

  return {
    user: convexUser,
    clerkUser,
    isLoading: !isClerkLoaded || convexUser === undefined,
  }
}
