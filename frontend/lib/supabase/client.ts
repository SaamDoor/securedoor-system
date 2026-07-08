import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from './env'

// یک متغیر سراسری برای جلوگیری از ساخت چندباره کلاینت در طول رندر
let _client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (_client) return _client

  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()

  if (!url || !key) {
    throw new Error('CRITICAL: Supabase Environment Variables are missing in Vercel/Local environment')
  }

  _client = createBrowserClient(url, key)

  return _client
}
