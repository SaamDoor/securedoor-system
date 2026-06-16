import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Session as SupabaseSession,
  User as SupabaseUser,
} from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { User, AuthTokens, UserRole } from "@/types";
import { ROLE_DASHBOARD_LABEL, ROLE_DASHBOARD_LINK } from "@/types";

const ROLE_COOKIE_KEY = "user_role";
const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type UserProfileRow = {
  role?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  is_active?: boolean | null;
  is_verified?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type DashboardConfig = {
  href: string | null;
  label: string | null;
};

function isUserRole(value: string | null | undefined): value is UserRole {
  return (
    value === "customer" ||
    value === "support" ||
    value === "manager" ||
    value === "admin" ||
    value === "super_admin"
  );
}

function getRoleFromCookie(): UserRole | null {
  if (typeof document === "undefined") return null;

  try {
    const match = document.cookie.match(/(?:^|;\s*)user_role=([^;]+)/);
    // decodeURIComponent throws on a malformed cookie value (e.g. a stray
    // "%" from a previous bug or manual edit) — a stale cookie should never
    // be able to crash the whole app on every page load.
    const value = match?.[1] ? decodeURIComponent(match[1]) : null;
    return isUserRole(value) ? value : null;
  } catch (err) {
    console.error("[auth.store] malformed user_role cookie:", err);
    return null;
  }
}

function writeRoleCookie(role: UserRole) {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE_KEY}=${role}; path=/; SameSite=Lax; Max-Age=${ROLE_COOKIE_MAX_AGE}`;
}

function clearRoleCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE_KEY}=; path=/; Max-Age=0; SameSite=Lax`;
}

function getDashboardConfig(role: UserRole | null): DashboardConfig {
  if (!role) {
    return { href: null, label: null };
  }

  return {
    href: ROLE_DASHBOARD_LINK[role],
    label: ROLE_DASHBOARD_LABEL[role],
  };
}

function buildTokens(session: SupabaseSession): AuthTokens {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresIn: session.expires_in ?? 0,
  };
}

function buildUser(
  sessionUser: SupabaseUser,
  profile: UserProfileRow | null,
  role: UserRole,
  previousUser: User | null,
): User {
  const metadata = sessionUser.user_metadata ?? {};
  const firstName =
    profile?.first_name ??
    previousUser?.firstName ??
    (typeof metadata.first_name === "string" ? metadata.first_name : "") ??
    "";
  const lastName =
    profile?.last_name ??
    previousUser?.lastName ??
    (typeof metadata.last_name === "string" ? metadata.last_name : "") ??
    "";

  return {
    id: sessionUser.id,
    email: profile?.email ?? sessionUser.email ?? previousUser?.email ?? "",
    phone: profile?.phone ?? previousUser?.phone,
    firstName,
    lastName,
    avatar: previousUser?.avatar,
    role,
    isActive: profile?.is_active ?? previousUser?.isActive ?? true,
    isVerified:
      profile?.is_verified ??
      previousUser?.isVerified ??
      !!sessionUser.email_confirmed_at,
    createdAt:
      profile?.created_at ?? previousUser?.createdAt ?? sessionUser.created_at,
    updatedAt:
      profile?.updated_at ??
      previousUser?.updatedAt ??
      sessionUser.updated_at ??
      sessionUser.created_at,
    customerTier: previousUser?.customerTier,
    specialDiscountPercent: previousUser?.specialDiscountPercent,
  };
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  dashboardHref: string | null;
  dashboardLabel: string | null;
  isReady: boolean;

  setAuth: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  setRole: (role: UserRole | null) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  initializeFromCookie: () => void;
  syncSession: (session: SupabaseSession | null) => Promise<void>;
}

const initialRole = getRoleFromCookie();
const initialDashboard = getDashboardConfig(initialRole);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,
      role: initialRole,
      dashboardHref: initialDashboard.href,
      dashboardLabel: initialDashboard.label,
      isReady: false,

      setAuth(user, tokens) {
        const dashboard = getDashboardConfig(user.role);
        writeRoleCookie(user.role);
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          role: user.role,
          dashboardHref: dashboard.href,
          dashboardLabel: dashboard.label,
          isReady: true,
        });
      },

      setUser(user) {
        const dashboard = getDashboardConfig(user.role);
        writeRoleCookie(user.role);
        set({
          user,
          isAuthenticated: true,
          role: user.role,
          dashboardHref: dashboard.href,
          dashboardLabel: dashboard.label,
        });
      },

      setRole(role) {
        const dashboard = getDashboardConfig(role);
        if (role) {
          writeRoleCookie(role);
        } else {
          clearRoleCookie();
        }

        set({
          role,
          dashboardHref: dashboard.href,
          dashboardLabel: dashboard.label,
        });
      },

      clearAuth() {
        clearRoleCookie();
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          role: null,
          dashboardHref: null,
          dashboardLabel: null,
          isReady: true,
        });
      },

      setLoading(loading) {
        set({ isLoading: loading });
      },

      initializeFromCookie() {
        const role = getRoleFromCookie();
        const dashboard = getDashboardConfig(role);
        set({
          role,
          dashboardHref: dashboard.href,
          dashboardLabel: dashboard.label,
        });
      },

      async syncSession(session) {
        if (!session?.user) {
          clearRoleCookie();
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            role: null,
            dashboardHref: null,
            dashboardLabel: null,
            isReady: true,
          });
          return;
        }

        // A Supabase client/query failure here (missing env vars, network
        // error) must never throw out of this store method — it runs from
        // Providers on every page, and an uncaught error there blanks the
        // entire app for every visitor. Fall back to the role cookie.
        let profile: UserProfileRow | null = null;
        try {
          const supabase = createClient();
          const { data } = await supabase
            .from("users")
            .select(
              "role, first_name, last_name, email, phone, is_active, is_verified, created_at, updated_at",
            )
            .eq("id", session.user.id)
            .maybeSingle();
          profile = (data ?? null) as UserProfileRow | null;
        } catch (err) {
          console.error("[auth.store] syncSession profile fetch failed:", err);
        }

        const role = isUserRole(profile?.role)
          ? profile.role
          : (getRoleFromCookie() ?? "customer");
        const dashboard = getDashboardConfig(role);
        writeRoleCookie(role);

        set({
          user: buildUser(session.user, profile ?? null, role, get().user),
          tokens: buildTokens(session),
          isAuthenticated: true,
          isLoading: false,
          role,
          dashboardHref: dashboard.href,
          dashboardLabel: dashboard.label,
          isReady: true,
        });
      },
    }),
    {
      name: "mashuf-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      // Same reasoning as cart.store.ts: never touch sessionStorage during
      // SSR / initial render. Rehydrated manually after mount in
      // providers.tsx, ahead of initializeFromCookie/syncSession.
      skipHydration: true,
    },
  ),
);
