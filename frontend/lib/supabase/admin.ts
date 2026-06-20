import { createClient } from '@supabase/supabase-js'

/**
 * Supabase admin client using the service role key.
 * NEVER expose this to the browser — server-only.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

  if (!url || !serviceKey) {
    throw new Error(
      '[createAdminClient] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY',
    )
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
