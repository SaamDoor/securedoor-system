import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from './env'

/**
 * Supabase admin client using the service role key.
 * NEVER expose this to the browser — server-only.
 */
export function createAdminClient() {
  const url = getSupabaseUrl()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

  if (!serviceKey) {
    throw new Error(
      '[createAdminClient] Missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)',
    )
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
