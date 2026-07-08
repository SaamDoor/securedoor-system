import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAnonKey, getSupabaseUrl } from './env'

export async function createClient() {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()

  if (!url || !key) {
    throw new Error('CRITICAL: Supabase Environment Variables are missing in Vercel/Local environment')
  }

  const cookieStore = await cookies()
  type CookieSetOptions = Parameters<typeof cookieStore.set>[2]

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieSetOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Ignore — server component context
          }
        },
      },
    },
  )
}

export async function createAdminClient() {
  const url = getSupabaseUrl()
  const key = process.env.SUPABASE_SECRET_KEY

  if (!url || !key) {
    throw new Error('CRITICAL: Supabase Environment Variables are missing in Vercel/Local environment')
  }

  const cookieStore = await cookies()
  type CookieSetOptions = Parameters<typeof cookieStore.set>[2]

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieSetOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Ignore — server component context
          }
        },
      },
    },
  )
}
