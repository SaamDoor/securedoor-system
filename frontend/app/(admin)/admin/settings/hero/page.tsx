'use client'
import { useState } from 'react'
import { Save, Image } from 'lucide-react'

export default function HeroSettingsPage() {
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    bgImage: '',
  })

  const handleSave = () => {
    alert('تنظیمات هیرو با موفقیت ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تنظیمات هیرو</h1>
          <p className="text-zinc-400 mt-1">محتوای بخش اصلی صفحه اول را ویرایش کنید</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 space-y-5">
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
