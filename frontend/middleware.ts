import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { ADMIN_ROLES, type UserRole } from '@/types/auth'

type CookieSetOptions = Parameters<typeof NextResponse.prototype.cookies.set>[2]

const PROTECTED_ROUTES = ['/user', '/checkout']
const AUTH_ROUTES = ['/auth/login', '/auth/register']
const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

function setRoleCookie(response: NextResponse, role: string) {
  response.cookies.set('user_role', role, {
    path: '/',
    sameSite: 'lax',
    maxAge: ROLE_COOKIE_MAX_AGE,
    httpOnly: false,
  })
}

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
          cookiesToSet: {
            name: string
            value: string
            options?: CookieSetOptions
          }[],
        ) {
          // First mutate the request so downstream code sees updated cookies
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          // Recreate the response so it carries the mutated request
          supabaseResponse = NextResponse.next({ request })
          // Then propagate to the response so the browser stores them
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: getUser() refreshes the session token when near expiry.
  // Never skip this call — missing it breaks session continuity.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, searchParams } = request.nextUrl

  // ── Supabase auth error: catch ?error=access_denied at any path ───────
  // When an OTP/magic-link expires Supabase bounces back to the Site URL
  // (or the redirect_to URL) with error params in the query string.
  // We intercept here and send the user to the login page with a readable
  // error key so the page can show a Persian toast.
  const supabaseError = searchParams.get('error')
  const supabaseErrorCode = searchParams.get('error_code')
  if (supabaseError && !pathname.startsWith('/auth/')) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('auth_error', supabaseErrorCode ?? supabaseError)
    return NextResponse.redirect(loginUrl)
  }

  let cachedRole: string | null | undefined
  async function getUserRole() {
    if (!user) return null
    if (cachedRole !== undefined) return cachedRole

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    cachedRole = (profile?.role as string | null) ?? null
    return cachedRole
  }

  // ── Auth pages: redirect already-logged-in users ──────────────────────
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && user) {
    const role = await getUserRole()
    const dest = ADMIN_ROLES.includes(role as UserRole) ? '/admin/dashboard' : '/user/dashboard'
    const response = NextResponse.redirect(new URL(dest, request.url))
    if (role) setRoleCookie(response, role)
    return response
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = await getUserRole()
    if (!ADMIN_ROLES.includes(role as UserRole)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    request.cookies.set('user_role', role!)
    setRoleCookie(supabaseResponse, role!)
  }

  // ── Protected routes: require login ───────────────────────────────────
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Security & SEO headers ─────────────────────────────────────────────
  supabaseResponse.headers.set(
    'X-Robots-Tag',
    pathname.startsWith('/admin') ? 'noindex, nofollow' : 'index, follow',
  )

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - _next/static  (static files)
     *  - _next/image   (image optimisation)
     *  - favicon.ico, robots.txt, sitemap.xml
     *  - /fonts, /images, /icons  (public assets)
     *  - files with an extension in public/  (*.svg, *.png …)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|fonts|images|icons|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|gif|woff|woff2|ttf|otf)).*)',
  ],
}
