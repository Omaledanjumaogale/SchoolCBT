// src/hooks.client.ts
// Client-side hooks — runs in browser after hydration
import type { HandleClientError } from '@sveltejs/kit'

export const handleError: HandleClientError = async ({ error, event, status, message }) => {
  console.error('[Client Error]', { error, status, message, route: event.route.id })
  return {
    message: message ?? 'An unexpected error occurred',
  }
}
