import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'
import '@/app/globals.css'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/constants'
import { getSupabaseUrl } from '@/lib/supabase/env'

// A misconfigured NEXT_PUBLIC_SITE_URL (empty string, missing protocol) makes
// `new URL()` throw synchronously inside this Server Component on every
// request — crashing the entire site for every visitor with no error
// boundary able to catch it. Fall back to the known-good default instead.
function safeMetadataBase(url: string): URL {
  try {
    return new URL(url)
  } catch {
    return new URL('https://mashuf.com')
  }
}

export const metadata: Metadata = {
  metadataBase: safeMetadataBase(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'درب ضد سرقت', 'درب امنیتی', 'گروه صنعتی مشعوف', 'درب آپارتمانی', 'درب لوکس',
    'درب ضد حریق', 'قفل امنیتی', 'درب فلزی', 'درب ضد صدا', 'درب ورودی',
  ],
  authors: [{ name: 'گروه صنعتی مشعوف', url: SITE_URL }],
  creator: 'گروه صنعتی مشعوف',
  publisher: 'گروه صنعتی مشعوف',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-image.jpg`],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  other: {
    enamad: '60513583',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0B0B0B' }],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const supabaseUrl = getSupabaseUrl()

  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className="scroll-smooth"
      data-scroll-behavior="smooth"
    >
      <head>
        {supabaseUrl ? <link rel="dns-prefetch" href={supabaseUrl} /> : null}
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            dir="rtl"
            toastOptions={{
              style: {
                background: '#181818',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                fontFamily: 'Peyda, Vazirmatn, sans-serif',
                borderRadius: '0.75rem',
                direction: 'rtl',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}

