"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { startTransition, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSettingsStore } from "@/store/settings.store";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";

/**
 * auth.store / cart.store use `persist` with `skipHydration: true`, so
 * `localStorage`/`sessionStorage` are never read during SSR or the initial
 * client render — server and first client paint both show default state,
 * so there is no hydration mismatch. This rehydrates them from storage
 * once mounted, before anything else runs.
 */
function StoreHydrator() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
  }, []);
  return null;
}

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
    let isMounted = true;

    initializeFromCookie();
    setLoading(true);

    // A missing/misconfigured Supabase env var makes createClient() throw
    // synchronously. Without this guard, that exception escapes the effect
    // and — since there is no error boundary anywhere in the tree — React
    // unmounts the entire app to a blank screen for every visitor. Fail
    // soft instead: log it and treat the visitor as unauthenticated so the
    // rest of the site (which doesn't need auth) stays usable.
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch (err) {
      console.error("[AuthStateListener] Supabase client init failed:", err);
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!isMounted) return;
        await syncSession(session);
      })
      .catch((err) => {
        console.error("[AuthStateListener] getSession failed:", err);
        if (isMounted) setLoading(false);
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
      <StoreHydrator />
      <AuthStateListener />
      <SettingsInitializer />
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
