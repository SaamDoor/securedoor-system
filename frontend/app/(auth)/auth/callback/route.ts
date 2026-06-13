import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ROLE_HOME, type UserRole } from "@/types/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // ── Error path: Supabase bounced here with an error ───────────────────
  const authError = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  if (authError) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("auth_error", errorCode ?? authError);
    return NextResponse.redirect(loginUrl);
  }

  // ── Happy path: exchange the PKCE code for a session ─────────────────
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/user/dashboard";

  if (code) {
    const cookieStore = await cookies();
    type CookieSetOptions = Parameters<typeof cookieStore.set>[2];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(
            cookiesToSet: {
              name: string;
              value: string;
              options?: CookieSetOptions;
            }[],
          ) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const { data: sessionData, error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error && sessionData?.user) {
      // ── Fetch real role from public.users and set the cookie ──────────
      // Use service-role client so RLS never blocks this fetch
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from("users")
        .select("role")
        .eq("id", sessionData.user.id)
        .maybeSingle();

      const role = (profile?.role as string | null) ?? "customer";

      // Build the redirect response first so we can attach the cookie to it
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      const destination = next.startsWith("/auth/")
        ? next
        : (ROLE_HOME[role as UserRole] ?? ROLE_HOME.customer);

      let redirectTarget: string;
      if (isLocalEnv) {
        redirectTarget = `${origin}${destination}`;
      } else if (forwardedHost) {
        redirectTarget = `https://${forwardedHost}${destination}`;
      } else {
        redirectTarget = `${origin}${destination}`;
      }

      const response = NextResponse.redirect(redirectTarget);

      // Set user_role on the redirect response so middleware sees it immediately
      response.cookies.set("user_role", role, {
        path: "/",
        sameSite: "lax",
        maxAge: ROLE_COOKIE_MAX_AGE,
        httpOnly: false, // must be readable by middleware (not httpOnly)
      });

      return response;
    }
  }

  // ── Fallback: something unexpected happened ───────────────────────────
  return NextResponse.redirect(
    `${origin}/auth/login?auth_error=auth_callback_failed`,
  );
}
