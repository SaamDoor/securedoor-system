/**
 * Normalize NEXT_PUBLIC_SUPABASE_URL so supabase-js never double-appends /rest/v1.
 * Accepts project root URLs and mistaken REST/API suffixes from .env.local.
 * Returns '' when unset (callers / middleware should fail open or throw).
 */
export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!raw) return ''

  return raw
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/auth\/v1\/?$/i, '')
    .replace(/\/+$/, '')
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  )
}
