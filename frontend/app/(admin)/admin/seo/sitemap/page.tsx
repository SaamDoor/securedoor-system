'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { getSeoSettingsAction, getRedirectsAction } from '../../actions'

export default function SeoSitemapPage() {
  const [seoSettings, setSeoSettings] = useState<Record<string, unknown>[]>([])
  const [redirects, setRedirects] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    const [seoResult, redirectsResult] = await Promise.all([getSeoSettingsAction(), getRedirectsAction()])
    if (!seoResult.ok) {
      toast.error(seoResult.error)
      setLoading(false)
      return
    }
    if (!redirectsResult.ok) {
      toast.error(redirectsResult.error)
      setLoading(false)
      return
    }
    setSeoSettings(seoResult.data ?? [])
    setRedirects(redirectsResult.data ?? [])
    setLoading(false)
  }

  const sitemapGroups = useMemo(() => {
    const pages = seoSettings
      .filter((item) => !item.noindex)
      .map((item) => String(item.page_slug ?? '').trim())
      .filter(Boolean)
      .map((slug) => (slug.startsWith('/') ? slug : `/${slug}`))
    const redirectsFrom = redirects.map((item) => String(item.from_path ?? item.from ?? '').trim()).filter(Boolean)
    return [
      { type: 'صفحات سئو', urls: pages },
      { type: 'ریدایرکت‌ها (از مسیر)', urls: redirectsFrom },
    ]
  }, [seoSettings, redirects])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">نقشه سایت</h1>
            <p className="text-zinc-400 mt-1">لیست URLهای ایندکس‌شده در sitemap.xml</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors">
            <RefreshCw size={16} />
            {loading ? 'در حال بروزرسانی...' : 'بازخوانی Sitemap'}
          </button>
        </div>

        <div className="space-y-4">
          {sitemapGroups.every((group) => group.urls.length === 0) && (
            <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-6 text-sm text-zinc-500">
              هنوز URL قابل نمایش برای sitemap پیدا نشد
            </div>
          )}
          {sitemapGroups.map((group, i) => (
            <div key={i} className="bg-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-700 flex items-center gap-2">
                <Globe size={16} className="text-amber-400" />
                <h2 className="text-zinc-100 font-semibold">{group.type}</h2>
                <span className="text-zinc-500 text-sm">({group.urls.length} URL)</span>
              </div>
              <div className="p-4 space-y-2">
                {group.urls.length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-zinc-500">موردی یافت نشد</div>
                ) : group.urls.map((url, j) => (
                  <div key={j} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-700/30">
                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="text-zinc-400 text-sm font-mono">{url}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
