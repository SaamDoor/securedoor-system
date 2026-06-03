import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  // ── Error path: Supabase bounced here with an error ───────────────────
  // e.g. /auth/callback?error=access_denied&error_code=otp_expired
  const authError = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  if (authError) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('auth_error', errorCode ?? authError)
    return NextResponse.redirect(loginUrl)
  }

  // ── Happy path: exchange the PKCE code for a session ─────────────────
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/user/dashboard'

  if (code) {
    const cookieStore = await cookies()
    type CookieSetOptions = Parameters<typeof cookieStore.set>[2]

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: CookieSetOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          },
        },
      },
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // ── Fallback: something unexpected happened ───────────────────────────
  return NextResponse.redirect(`${origin}/auth/login?auth_error=auth_callback_failed`)
}
