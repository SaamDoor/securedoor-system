"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { startTransition, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSettingsStore } from "@/store/settings.store";
import { useAuthStore } from "@/store/auth.store";

/**
 * Hydrates the auth store from the role cookie immediately, then confirms
 * the active session and authoritative DB role via Supabase.
 */
function AuthStateListener() {
  const router = useRouter();
  const initializeFromCookie = useAuthStore(
    (state) => state.initializeFromCookie,
  );
  const setLoading = useAuthStore((state) => state.setLoading);
  const syncSession = useAuthStore((state) => state.syncSession);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    initializeFromCookie();
    setLoading(true);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      await syncSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      await syncSession(session);

      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        startTransition(() => router.refresh());
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initializeFromCookie, router, setLoading, syncSession]);

  return null;
}

/** Loads public global settings into the Zustand store once on app boot. */
function SettingsInitializer() {
  const loadPublic = useSettingsStore((s) => s.loadPublic);
  useEffect(() => {
    loadPublic();
  }, [loadPublic]);
  return null;
}

interface ProvidersProps {
  children: ReactNode;
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
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthStateListener />
      <SettingsInitializer />
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
