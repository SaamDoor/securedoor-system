import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { UserRole } from '@/types/auth'

// ─────────────────────────────────────────────────────────────────────────────
//  ROUTING MAP
//  Each role has exactly one "home" dashboard it is redirected to on login.
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_HOME: Record<UserRole, string> = {
  customer:    '/user/dashboard',
  support:     '/user/vip-dashboard',
  manager:     '/partner/dashboard',
  admin:       '/admin/dashboard',
  super_admin: '/admin/super-dashboard',
}

// ─────────────────────────────────────────────────────────────────────────────
//  PREFIX ACCESS CONTROL
//  Evaluated top-to-bottom — the first matching prefix wins.
//  More-specific prefixes MUST come before less-specific ones.
// ─────────────────────────────────────────────────────────────────────────────

const PREFIX_ACCESS: Array<{ prefix: string; allowed: UserRole[] }> = [
  // Super-dashboard: super_admin only
  {
    prefix:  '/admin/super-dashboard',
    allowed: ['super_admin'],
  },
  // Admin area: admin + super_admin
  {
    prefix:  '/admin',
    allowed: ['admin', 'super_admin'],
  },
  // Partner area: manager + admin + super_admin
  {
    prefix:  '/partner',
    allowed: ['manager', 'admin', 'super_admin'],
  },
  // VIP dashboard: support + admin + super_admin
  {
    prefix:  '/user/vip-dashboard',
    allowed: ['support', 'admin', 'super_admin'],
  },
  // Standard user area: all authenticated roles
  {
    prefix:  '/user',
    allowed: ['customer', 'support', 'manager', 'admin', 'super_admin'],
  },
  // Checkout: all authenticated
  {
    prefix:  '/checkout',
    allowed: ['customer', 'support', 'manager', 'admin', 'super_admin'],
  },
]

const AUTH_ROUTES = ['/auth/login', '/auth/register']

type CookieSetOptions = Parameters<typeof NextResponse.prototype.cookies.set>[2]

function setRoleCookie(response: NextResponse, role: string) {
  response.cookies.set('user_role', role, {
    path:     '/',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 30,
    httpOnly: false,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: CookieSetOptions }[],
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // getUser() refreshes the session token when near expiry — never skip this.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, searchParams } = request.nextUrl

  // ── Supabase OTP / magic-link error bounce ────────────────────────────────
  const supabaseError     = searchParams.get('error')
  const supabaseErrorCode = searchParams.get('error_code')
  if (supabaseError && !pathname.startsWith('/auth/')) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('auth_error', supabaseErrorCode ?? supabaseError)
    return NextResponse.redirect(loginUrl)
  }

  // Lazy role fetch — one RPC per request at most, result cached inline.
  let cachedRole: UserRole | null | undefined
  async function getUserRole(): Promise<UserRole | null> {
    if (!user) return null
    if (cachedRole !== undefined) return cachedRole
    const { data } = await supabase.rpc('get_my_role')
    cachedRole = (data as UserRole | null) ?? null
    return cachedRole
  }

  // ── Auth pages: redirect already-logged-in users to their home dashboard ──
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && user) {
    const role = await getUserRole()
    const dest = role ? ROLE_HOME[role] : '/user/dashboard'
    const response = NextResponse.redirect(new URL(dest, request.url))
    if (role) setRoleCookie(response, role)
    return response
  }

  // ── Protected-prefix enforcement ──────────────────────────────────────────
  const matchedPrefix = PREFIX_ACCESS.find(({ prefix }) =>
    pathname.startsWith(prefix),
  )

  if (matchedPrefix) {
    // Not authenticated → send to login with redirect param
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = await getUserRole()

    // Role not allowed for this prefix → bounce to the role's own home
    if (!role || !matchedPrefix.allowed.includes(role)) {
      const dest = role ? ROLE_HOME[role] : '/'
      return NextResponse.redirect(new URL(dest, request.url))
    }

    // Stamp role into a readable cookie so client components avoid an extra RPC
    request.cookies.set('user_role', role)
    setRoleCookie(supabaseResponse, role)
  }

  // ── Security / SEO headers ─────────────────────────────────────────────────
  const isPrivateRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/partner') ||
    pathname.startsWith('/user')

  supabaseResponse.headers.set(
    'X-Robots-Tag',
    isPrivateRoute ? 'noindex, nofollow' : 'index, follow',
  )

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|fonts|images|icons|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|gif|woff|woff2|ttf|otf)).*)',
  ],
}
