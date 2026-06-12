'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSettingsStore } from '@/store/settings.store'

const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/**
 * Listens to Supabase auth events and keeps the `user_role` cookie in sync
 * with what is stored in `public.users`. This is the single source of truth
 * for the server-side middleware/layout role check.
 */
function AuthStateListener() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Always re-fetch from public.users so a role change in the DB is
        // reflected immediately on the next auth event (login, token refresh).
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()

        const role = (profile?.role as string | null) ?? 'customer'
        document.cookie = `user_role=${role}; path=/; SameSite=Lax; Max-Age=${ROLE_COOKIE_MAX_AGE}`
        // Refresh server components so the new role is picked up immediately
        router.refresh()
      }

      if (event === 'SIGNED_OUT') {
        document.cookie = 'user_role=; path=/; Max-Age=0; SameSite=Lax'
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return null
}

/** Loads public global settings into the Zustand store once on app boot. */
function SettingsInitializer() {
  const loadPublic = useSettingsStore((s) => s.loadPublic)
  useEffect(() => { loadPublic() }, [loadPublic])
  return null
}

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthStateListener />
      <SettingsInitializer />
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  )
}
