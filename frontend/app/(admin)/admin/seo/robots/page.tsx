'use client'
import { useState } from 'react'
import { Save, FileText } from 'lucide-react'
import { SITE_URL } from '@/lib/constants'

const defaultRobots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/

Sitemap: ${SITE_URL}/sitemap.xml`

export default function SeoRobotsPage() {
  const [content, setContent] = useState(defaultRobots)

  const handleSave = () => {
    alert('فایل robots.txt ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">فایل robots.txt</h1>
          <p className="text-zinc-400 mt-1">تنظیم دسترسی ربات‌های موتورهای جستجو</p>
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
            className="w-full bg-zinc-900 text-green-400 font-mono text-sm rounded-lg px-4 py-3 border border-zinc-700 focus:border-amber-500 focus:outline-none resize-none"
            dir="ltr"
          />
          <div className="mt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              <Save size={16} />
              ذخیره تنظیمات
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
