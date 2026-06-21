'use client'
import { useState } from 'react'
import { Save, Mail } from 'lucide-react'

export default function EmailSettingsPage() {
  const [form, setForm] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    fromEmail: '',
  })

  const handleSave = () => {
    alert('تنظیمات ایمیل ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تنظیمات ایمیل</h1>
          <p className="text-zinc-400 mt-1">پیکربندی سرور SMTP برای ارسال ایمیل</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">آدرس SMTP</label>
            <input
              type="text"
              value={form.smtpHost}
              onChange={e => setForm({ ...form, smtpHost: e.target.value })}
              placeholder="smtp.gmail.com"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">پورت</label>
            <input
              type="number"
              value={form.smtpPort}
              onChange={e => setForm({ ...form, smtpPort: e.target.value })}
              placeholder="587"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">نام کاربری SMTP</label>
            <input
              type="text"
              value={form.smtpUser}
              onChange={e => setForm({ ...form, smtpUser: e.target.value })}
              placeholder="user@gmail.com"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">رمز SMTP</label>
            <input
              type="password"
              value={form.smtpPass}
              onChange={e => setForm({ ...form, smtpPass: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">ایمیل فرستنده</label>
            <input
              type="email"
              value={form.fromEmail}
              onChange={e => setForm({ ...form, fromEmail: e.target.value })}
              placeholder="noreply@example.com"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
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
