'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6 text-center" dir="rtl">
      <AlertTriangle className="h-12 w-12 text-[#C8A85D] mb-4" />
      <h1 className="text-xl font-bold text-white mb-2">مشکلی پیش آمد</h1>
      <p className="text-[#A0A0A0] mb-6 max-w-sm">
        بخشی از صفحه با خطا مواجه شد. لطفاً دوباره تلاش کنید یا به صفحه اصلی بازگردید.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C8A85D] text-black font-bold hover:bg-[#E7D3A5] transition-colors text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          تلاش دوباره
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-white hover:border-white/30 transition-colors text-sm"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  )
}
