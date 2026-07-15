'use client'
import { useEffect, useMemo, useState } from 'react'
import { Save, FileText } from 'lucide-react'
import { SITE_URL } from '@/lib/constants'
import { toast } from 'sonner'
import { getRedirectsAction, getSeoSettingsAction, saveSeoSettingAction } from '../../actions'

const defaultRobots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/

Sitemap: ${SITE_URL}/sitemap.xml`

export default function SeoRobotsPage() {
  const [content, setContent] = useState(defaultRobots)
  const [rowId, setRowId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
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
      const robotsRow = (seoResult.data ?? []).find((item: Record<string, unknown>) => String(item.page_slug) === 'robots_txt')
      if (robotsRow) {
        setRowId(String(robotsRow.id))
        setContent(String((robotsRow.structured_data as Record<string, unknown> | null)?.content ?? defaultRobots))
      } else {
        const disallows = (redirectsResult.data ?? [])
          .map((item: Record<string, unknown>) => String(item.from_path ?? item.from ?? '').trim())
          .filter((value) => value.startsWith('/admin') || value.startsWith('/api'))
        const generated = `${defaultRobots}\n${disallows.map((d) => `Disallow: ${d}`).join('\n')}`
        setContent(generated.trim())
      }
      setLoading(false)
    })()
  }, [])

  const lineCount = useMemo(() => content.split('\n').length, [content])

  const handleSave = async () => {
    setSaving(true)
    const result = await saveSeoSettingAction({
      page_slug: 'robots_txt',
      page_label: 'Robots.txt',
      structured_data: { content },
      meta_title: 'robots.txt',
    }, rowId ?? undefined)
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    if (!rowId && typeof result.data === 'string') {
      setRowId(result.data)
    }
    toast.success('فایل robots.txt ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">فایل robots.txt</h1>
          <p className="text-zinc-400 mt-1">تنظیم دسترسی ربات‌های موتورهای جستجو</p>
          <p className="text-xs text-zinc-500 mt-2">{lineCount} خط تنظیم</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-amber-400" />
            <span className="text-zinc-300 font-medium font-mono">robots.txt</span>
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={12}
            disabled={loading}
            className="w-full bg-zinc-900 text-green-400 font-mono text-sm rounded-lg px-4 py-3 border border-zinc-700 focus:border-amber-500 focus:outline-none resize-none"
            dir="ltr"
          />
          <div className="mt-4">
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              <Save size={16} />
              {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
