'use client'

import { useEffect, useMemo, useState } from 'react'
import { Code, CheckCircle } from 'lucide-react'
import { getSeoSettingsAction, getRedirectsAction } from '../../actions'

export default function SeoStructuredPage() {
  const [seoSettings, setSeoSettings] = useState<Record<string, unknown>[]>([])
  const [redirects, setRedirects] = useState<Record<string, unknown>[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const [seoResult, redirectsResult] = await Promise.all([getSeoSettingsAction(), getRedirectsAction()])
      if (!seoResult.ok) {
        setError(seoResult.error)
        return
      }
      if (!redirectsResult.ok) {
        setError(redirectsResult.error)
        return
      }
      setSeoSettings(seoResult.data ?? [])
      setRedirects(redirectsResult.data ?? [])
      setError(null)
    })()
  }, [])

  const rows = useMemo(() => {
    const fromSeo = seoSettings.map((item) => {
      const structured = item.structured_data as Record<string, unknown> | null
      return {
        id: String(item.id),
        type: String(structured?.['@type'] ?? 'CustomSchema'),
        page: String(item.page_label ?? item.page_slug ?? 'صفحه نامشخص'),
        status: item.noindex ? 'غیرفعال' : 'فعال',
      }
    })
    return [
      ...fromSeo,
      {
        id: 'redirect-summary',
        type: 'RedirectMap',
        page: `قوانین ریدایرکت (${redirects.length})`,
        status: redirects.length > 0 ? 'فعال' : 'غیرفعال',
      },
    ]
  }, [seoSettings, redirects])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">داده ساختاریافته</h1>
          <p className="text-zinc-400 mt-1">مدیریت Schema.org JSON-LD برای بهبود نتایج جستجو</p>
        </div>
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نوع</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">صفحه</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-zinc-500">تنظیم ساختاریافته‌ای ثبت نشده است</td>
                </tr>
              ) : rows.map((s) => (
                <tr key={s.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Code size={16} className="text-amber-400" />
                      <span className="text-amber-400 font-mono font-bold">{s.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{s.page}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 text-sm ${s.status === 'فعال' ? 'text-green-400' : 'text-zinc-500'}`}>
                      <CheckCircle size={14} /> {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-sm">نمایش</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
