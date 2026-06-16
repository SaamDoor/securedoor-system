import { createBrowserClient } from '@supabase/ssr'

// یک متغیر سراسری برای جلوگیری از ساخت چندباره کلاینت در طول رندر
let _client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (_client) return _client

  // بسیار مهم: استفاده از ?? "" به جای ! 
  // در صورتی که در مرورگر متغیر محیطی گم شده باشد، برنامه به جای کرش قطعی، به کار خود ادامه می‌دهد
  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  )

  return _client
}
