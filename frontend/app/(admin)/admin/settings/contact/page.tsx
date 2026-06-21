'use client'
import { useState } from 'react'
import { Save, Phone, Mail, MapPin, Clock } from 'lucide-react'

export default function ContactSettingsPage() {
  const [form, setForm] = useState({
    phone1: '',
    phone2: '',
    whatsapp: '',
    email: '',
    address: '',
    workingHours: '',
  })

  const handleSave = () => {
    alert('اطلاعات تماس با موفقیت ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">اطلاعات تماس</h1>
          <p className="text-zinc-400 mt-1">اطلاعات تماس نمایش‌داده‌شده در سایت را مدیریت کنید</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-1"><Phone size={14} /> شماره تلفن ۱</label>
              <input
                type="text"
                value={form.phone1}
                onChange={e => setForm({ ...form, phone1: e.target.value })}
                placeholder="021-XXXXXXXX"
                className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-1"><Phone size={14} /> شماره تلفن ۲</label>
              <input
                type="text"
                value={form.phone2}
                onChange={e => setForm({ ...form, phone2: e.target.value })}
                placeholder="021-XXXXXXXX"
                className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">واتساپ</label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={e => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="09XXXXXXXXX"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-1"><Mail size={14} /> ایمیل</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="info@example.com"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-1"><MapPin size={14} /> آدرس</label>
            <textarea
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="تهران، خیابان ..."
              rows={2}
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-1"><Clock size={14} /> ساعات کاری</label>
            <input
              type="text"
              value={form.workingHours}
              onChange={e => setForm({ ...form, workingHours: e.target.value })}
              placeholder="شنبه تا چهارشنبه ۸ تا ۱۷"
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
