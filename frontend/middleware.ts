import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

type CookieSetOptions = Parameters<typeof NextResponse.prototype.cookies.set>[2]

const PROTECTED_ROUTES = ['/user', '/admin', '/checkout']
const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/auth/login', '/auth/register']
const ADMIN_ROLES = ['super_admin', 'admin', 'manager', 'support']

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
        setAll(cookiesToSet: { name: string; value: string; options?: CookieSetOptions }[]) {
          // First mutate the request so downstream code sees updated cookies
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Recreate the response so it carries the mutated request
          supabaseResponse = NextResponse.next({ request })
          // Then propagate to the response so the browser stores them
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getUser() refreshes the session token when near expiry.
  // Never skip this call — missing it breaks session continuity.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Auth pages: redirect already-logged-in users ──────────────────────
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && user) {
    const role = request.cookies.get('user_role')?.value ?? ''
    const dest = ADMIN_ROLES.includes(role) ? '/admin' : '/user/dashboard'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // ── Protected routes: require login ───────────────────────────────────
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Admin routes: cookie is a fast hint; real enforcement is in page ──
  // If the hint says non-admin we redirect immediately without a DB call.
  // The individual admin page/layout must re-verify via createAdminClient().
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && user) {
    const userRole = request.cookies.get('user_role')?.value ?? ''
    if (!ADMIN_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL('/user/dashboard', request.url))
    }
  }

  // ── Security & SEO headers ─────────────────────────────────────────────
  supabaseResponse.headers.set(
    'X-Robots-Tag',
    pathname.startsWith('/admin') ? 'noindex, nofollow' : 'index, follow'
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
