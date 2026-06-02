// src/lib/convex.ts
// Convex client for SchoolCBT frontend
import { ConvexClient } from 'convex/browser'
import type { FunctionReference } from 'convex/server'
import { browser } from '$app/environment'

// The CONVEX_URL comes from environment variables (set per deployment)
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL ?? 'https://ideal-llama-123.convex.cloud'

// Singleton client (one per page load)
let client: ConvexClient | null = null

export function getConvexClient(): ConvexClient {
  if (!browser) throw new Error('Convex client only available in browser')
  if (!client) {
    client = new ConvexClient(CONVEX_URL)
  }
  return client
}

// Helper: subscribe to a Convex query (returns unsubscribe function)
export function subscribeQuery<T>(
  queryName: string,
  args: Record<string, unknown>,
  onResult: (data: T | null) => void,
): () => void {
  if (!browser) return () => {}

  const convex = getConvexClient()
  const subscription = convex.onUpdate(
    queryName as unknown as FunctionReference<'query'>,
    args,
    (result: T) => {
      onResult(result)
    },
  )

  // Return unsubscribe
  return () => subscription()
}

// Helper: one-time query
export async function queryOnce<T>(
  queryName: string,
  args: Record<string, unknown> = {},
): Promise<T | null> {
  if (!browser) return null
  const convex = getConvexClient()
  return (await convex.query(queryName as unknown as FunctionReference<'query'>, args)) as T
}

// Helper: execute a mutation
export async function executeMutation<T = unknown>(
  mutationName: string,
  args: Record<string, unknown> = {},
): Promise<T | null> {
  if (!browser) return null
  const convex = getConvexClient()
  return (await convex.mutation(
    mutationName as unknown as FunctionReference<'mutation'>,
    args,
  )) as T
}
