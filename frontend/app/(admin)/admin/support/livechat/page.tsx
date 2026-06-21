'use client'
import { useState } from 'react'
import { Save, MessageCircle } from 'lucide-react'

export default function LiveChatPage() {
  const [enabled, setEnabled] = useState(true)
  const [form, setForm] = useState({
    supportHours: '۸ تا ۱۷',
    welcomeMessage: 'سلام! چطور می‌توانم کمکتان کنم؟',
    widgetColor: '#f59e0b',
  })

  const handleSave = () => {
    alert('تنظیمات چت زنده ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تنظیمات چت زنده</h1>
          <p className="text-zinc-400 mt-1">پیکربندی پشتیبانی آنلاین و چت با مشتریان</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between py-3 border-b border-zinc-700">
            <div className="flex items-center gap-3">
              <MessageCircle size={20} className="text-amber-400" />
              <div>
                <p className="text-zinc-100 font-medium">فعال‌سازی چت زنده</p>
                <p className="text-xs text-zinc-500 mt-0.5">ویجت چت را در سایت نمایش دهید</p>
              </div>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-amber-500' : 'bg-zinc-600'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'right-1' : 'right-7'}`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">ساعات پشتیبانی</label>
            <input
              type="text"
              value={form.supportHours}
              onChange={e => setForm({ ...form, supportHours: e.target.value })}
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">پیام خوش‌آمدگویی</label>
            <textarea
              value={form.welcomeMessage}
              onChange={e => setForm({ ...form, welcomeMessage: e.target.value })}
              rows={3}
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">رنگ ویجت</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.widgetColor}
                onChange={e => setForm({ ...form, widgetColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-zinc-600 bg-zinc-700 cursor-pointer"
              />
              <span className="text-zinc-400 text-sm font-mono">{form.widgetColor}</span>
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
