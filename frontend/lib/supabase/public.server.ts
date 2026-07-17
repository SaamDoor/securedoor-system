import 'server-only'

import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js'
import { getSupabaseAnonKey, getSupabaseUrl } from './env'

const PUBLIC_QUERY_TIMEOUT_MS = 6_000
const PUBLIC_QUERY_REVALIDATE_SECONDS = 300

let publicClient: SupabaseClient<any, 'public', any> | null = null

/**
 * Cookie-free client for public catalog/content reads.
 *
 * Using the authenticated SSR client on public pages called `cookies()` and
 * forced every route to be dynamic. This client allows Next to cache GET
 * requests briefly and fails fast when Supabase is temporarily unreachable.
 */
export function createPublicClient(): SupabaseClient<any, 'public', any> {
  if (publicClient) return publicClient

  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key) {
    throw new Error('Supabase public environment variables are missing')
  }

  const cachedFetch: typeof fetch = (input, init = {}) => {
    const method = (init.method ?? 'GET').toUpperCase()
    const options = {
      ...init,
      signal: init.signal ?? AbortSignal.timeout(PUBLIC_QUERY_TIMEOUT_MS),
      ...(method === 'GET'
        ? { next: { revalidate: PUBLIC_QUERY_REVALIDATE_SECONDS } }
        : { cache: 'no-store' as const }),
    }
    return fetch(input, options)
  }

  publicClient = createSupabaseClient<any>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: { fetch: cachedFetch },
  })

  return publicClient
}
