'use client'

import { useEffect } from 'react'

// Catches errors thrown by the root layout itself (e.g. inside <Providers>)
// that occur before the regular app/error.tsx boundary can mount. Must
// render its own <html>/<body> since it replaces the root layout entirely.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="fa" dir="rtl">
      <body style={{ margin: 0, background: '#000', color: '#fff' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '24px',
            fontFamily: 'Tahoma, sans-serif',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            مشکلی پیش آمد
          </h1>
          <p style={{ color: '#A0A0A0', marginBottom: '24px', maxWidth: '380px' }}>
            سایت موقتاً با خطا مواجه شد. لطفاً صفحه را دوباره بارگذاری کنید.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              background: '#C8A85D',
              color: '#000',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            تلاش دوباره
          </button>
        </div>
      </body>
    </html>
  )
}
