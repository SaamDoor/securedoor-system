import { type NextRequest, NextResponse } from 'next/server'

const PROTECTED_ROUTES = ['/user', '/admin', '/checkout']
const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/auth/login', '/auth/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value
  const userRole = request.cookies.get('user_role')?.value

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (accessToken) {
      return NextResponse.redirect(new URL('/user/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Protect user routes
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!accessToken) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect admin routes — require admin role
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    if (!['super_admin', 'admin', 'manager', 'support'].includes(userRole ?? '')) {
      return NextResponse.redirect(new URL('/user/dashboard', request.url))
    }
  }

  // Security headers response
  const response = NextResponse.next()

  response.headers.set('X-Robots-Tag', pathname.startsWith('/admin') ? 'noindex, nofollow' : 'index, follow')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|fonts|images|icons).*)',
  ],
}
