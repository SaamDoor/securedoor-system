import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton pattern: reuse one client instance per browser tab.
// Re-creating the client on every render breaks session continuity.
let _client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (_client) return _client

  // createBrowserClient throws synchronously if either arg is falsy. A
  // missing/misconfigured env var must never escape as an uncaught throw
  // here — that would unmount the whole React tree with no error boundary
  // to catch it. Fall back to empty strings so the client builds (auth
  // calls will simply fail/no-op instead of crashing the app).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''

  _client = createBrowserClient(url, key)

  return _client
}
