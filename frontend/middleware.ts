import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getUser() refreshes the session cookie when it's near expiry.
  // Do NOT skip this call — it keeps the session alive on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && user) {
    return NextResponse.redirect(new URL('/user/dashboard', request.url))
  }

  // Protect user + checkout routes
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protect admin routes — the login form writes a user_role cookie as a hint.
  // Pages themselves do a secondary server-side role check for real enforcement.
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && user) {
    const userRole = request.cookies.get('user_role')?.value ?? ''
    if (!ADMIN_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL('/user/dashboard', request.url))
    }
  }

  supabaseResponse.headers.set(
    'X-Robots-Tag',
    pathname.startsWith('/admin') ? 'noindex, nofollow' : 'index, follow'
  )

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|fonts|images|icons).*)',
  ],
}
