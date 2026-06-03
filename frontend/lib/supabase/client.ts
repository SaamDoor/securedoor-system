import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton pattern: reuse one client instance per browser tab.
// Re-creating the client on every render breaks session continuity.
let _client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (_client) return _client

  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )

  return _client
}
