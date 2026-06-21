'use client'
import { useState } from 'react'
import { Send, Users } from 'lucide-react'

export default function BroadcastPage() {
  const [form, setForm] = useState({
    audience: 'all',
    subject: '',
    message: '',
    sendType: 'both',
  })

  const handleSend = () => {
    alert(`پیام برای ${form.audience === 'all' ? 'همه' : form.audience === 'vip' ? 'مشتریان VIP' : 'همکاران'} ارسال شد`)
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">پیام دسته‌جمعی</h1>
          <p className="text-zinc-400 mt-1">ارسال پیام به گروه‌های مختلف کاربری</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-1">
              <Users size={14} /> هدف مخاطبان
            </label>
            <select
              value={form.audience}
              onChange={e => setForm({ ...form, audience: e.target.value })}
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">همه کاربران</option>
              <option value="vip">مشتریان VIP</option>
              <option value="partners">همکاران فروش</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">موضوع پیام</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              placeholder="موضوع پیام را وارد کنید"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">متن پیام</label>
            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="متن پیام را اینجا بنویسید..."
              rows={5}
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">نوع ارسال</label>
            <div className="flex gap-3">
              {([['sms', 'پیامک'], ['email', 'ایمیل'], ['both', 'هر دو']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setForm({ ...form, sendType: val })}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                    form.sendType === val
                      ? 'bg-amber-500 text-zinc-900'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              <Send size={16} />
              ارسال پیام
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
