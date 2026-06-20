import { createBrowserClient } from '@supabase/ssr'

// یک متغیر سراسری برای جلوگیری از ساخت چندباره کلاینت در طول رندر
let _client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error("CRITICAL: Supabase Environment Variables are missing in Vercel/Local environment")
  }

  _client = createBrowserClient(url, key)

  return _client
}
