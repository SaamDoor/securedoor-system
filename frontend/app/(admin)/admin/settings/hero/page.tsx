'use client'
import { useEffect, useState } from 'react'
import { Save, Image } from 'lucide-react'
import { toast } from 'sonner'
import { getSettingsAction, saveSettingsAction } from '../../actions'

export default function HeroSettingsPage() {
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    bgImage: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      const result = await getSettingsAction()
      if (!result.ok) {
        toast.error(result.error)
        setLoading(false)
        return
      }
      const map = new Map((result.data ?? []).map((item: Record<string, unknown>) => [String(item.key), item.value]))
      setForm({
        title: String(map.get('hero_title') ?? ''),
        subtitle: String(map.get('hero_subtitle') ?? ''),
        ctaText: String(map.get('hero_cta_text') ?? ''),
        ctaLink: String(map.get('hero_cta_url') ?? ''),
        bgImage: String(map.get('hero_image_url') ?? ''),
      })
      setLoading(false)
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const result = await saveSettingsAction([
      { key: 'hero_title', value: form.title, group: 'hero' },
      { key: 'hero_subtitle', value: form.subtitle, group: 'hero' },
      { key: 'hero_cta_text', value: form.ctaText, group: 'hero' },
      { key: 'hero_cta_url', value: form.ctaLink, group: 'hero' },
      { key: 'hero_image_url', value: form.bgImage, group: 'hero' },
    ])
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('تنظیمات هیرو ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تنظیمات هیرو</h1>
          <p className="text-zinc-400 mt-1">محتوای بخش اصلی صفحه اول را ویرایش کنید</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 space-y-5">
          {loading && <p className="text-sm text-zinc-400">در حال بارگذاری تنظیمات...</p>}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">عنوان هیرو</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="عنوان اصلی صفحه"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">زیرعنوان</label>
            <textarea
              value={form.subtitle}
              onChange={e => setForm({ ...form, subtitle: e.target.value })}
              placeholder="متن توضیحی زیر عنوان"
              rows={3}
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">متن دکمه CTA</label>
            <input
              type="text"
              value={form.ctaText}
              onChange={e => setForm({ ...form, ctaText: e.target.value })}
              placeholder="مثال: مشاوره رایگان"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">لینک CTA</label>
            <input
              type="text"
              value={form.ctaLink}
              onChange={e => setForm({ ...form, ctaLink: e.target.value })}
              placeholder="/contact یا https://..."
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">آدرس تصویر پس‌زمینه</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.bgImage}
                onChange={e => setForm({ ...form, bgImage: e.target.value })}
                placeholder="/images/hero-bg.jpg"
                className="flex-1 bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
              />
              <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-600 text-zinc-200 rounded-lg hover:bg-zinc-500 transition-colors">
                <Image size={16} />
                انتخاب
              </button>
            </div>
          </div>

          <div className="pt-2">
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
