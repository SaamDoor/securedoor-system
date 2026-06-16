import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  ADMIN_ROLES,
  PARTNER_PANEL_ROLES,
  ROLE_HOME,
  SUPER_ADMIN_ROLES,
  USER_PANEL_ROLES,
  type UserRole,
} from "@/types/auth";

const CHECKOUT_ROLES: UserRole[] = [
  "customer",
  "support",
  "manager",
  "admin",
  "super_admin",
];

const PREFIX_ACCESS: Array<{ prefix: string; allowed: readonly UserRole[] }> = [
  { prefix: "/admin/super-dashboard", allowed: SUPER_ADMIN_ROLES },
  { prefix: "/admin", allowed: ADMIN_ROLES },
  { prefix: "/partner", allowed: PARTNER_PANEL_ROLES },
  { prefix: "/user", allowed: USER_PANEL_ROLES },
  { prefix: "/checkout", allowed: CHECKOUT_ROLES },
];

const AUTH_ROUTES = ["/auth/login", "/auth/register"];

type CookieSetOptions = Parameters<
  typeof NextResponse.prototype.cookies.set
>[2];

function setRoleCookie(response: NextResponse, role: UserRole) {
  response.cookies.set("user_role", role, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
  });
}

export async function middleware(request: NextRequest) {
  // This middleware runs on almost every request (including the homepage
  // and any crawler/bot hitting it). If anything below throws unguarded —
  // a missing env var, a network blip talking to Supabase — Vercel returns
  // a hard 500 for that request instead of the page, taking the whole site
  // (and any verification bot) down with it. Fail open: on any unexpected
  // error, just let the request through unauthenticated rather than crash.
  try {
    return await handleMiddleware(request);
  } catch (err) {
    console.error("[middleware] unhandled error, failing open:", err);
    return NextResponse.next({ request });
  }
}

async function handleMiddleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieSetOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser().catch((err) => {
    console.error("[middleware] supabase.auth.getUser failed:", err);
    return { data: { user: null } };
  });

  const { pathname, searchParams } = request.nextUrl;
  const supabaseError = searchParams.get("error");
  const supabaseErrorCode = searchParams.get("error_code");

  if (supabaseError && !pathname.startsWith("/auth/")) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("auth_error", supabaseErrorCode ?? supabaseError);
    return NextResponse.redirect(loginUrl);
  }

  let cachedRole: UserRole | null | undefined;

  async function getUserRole(): Promise<UserRole | null> {
    if (!user) return null;
    if (cachedRole !== undefined) return cachedRole;

    const { data } = await supabase.rpc("get_my_role");
    cachedRole = (data as UserRole | null) ?? null;
    return cachedRole;
  }

  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && user) {
    const role = await getUserRole();
    const destination = role ? ROLE_HOME[role] : ROLE_HOME.customer;
    const response = NextResponse.redirect(new URL(destination, request.url));

    if (role) {
      setRoleCookie(response, role);
    }

    return response;
  }

  const matchedPrefix = PREFIX_ACCESS.find(({ prefix }) =>
    pathname.startsWith(prefix),
  );

  if (matchedPrefix) {
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = await getUserRole();

    if (!role || !matchedPrefix.allowed.includes(role)) {
      const destination = role ? ROLE_HOME[role] : "/";
      return NextResponse.redirect(new URL(destination, request.url));
    }

    request.cookies.set("user_role", role);
    setRoleCookie(supabaseResponse, role);
  }

  const isPrivateRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/partner") ||
    pathname.startsWith("/user");

  supabaseResponse.headers.set(
    "X-Robots-Tag",
    isPrivateRoute ? "noindex, nofollow" : "index, follow",
  );

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|fonts|images|icons|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|gif|woff|woff2|ttf|otf)).*)",
  ],
};
