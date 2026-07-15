'use client'
import { useEffect, useMemo, useState } from 'react'
import { Send, Users } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { toPersianNumber } from '@/lib/utils'

export default function BroadcastPage() {
  const supabase = createClient()
  const [form, setForm] = useState({
    audience: 'all',
    subject: '',
    message: '',
    sendType: 'both',
  })
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [templates, setTemplates] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    void (async () => {
      const [{ data: usersData }, { data: contactsData }] = await Promise.all([
        supabase.from('users').select('id, role, customer_tier'),
        supabase
          .from('contact_messages')
          .select('id, subject, message, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ])
      setUsers(usersData ?? [])
      setTemplates(contactsData ?? [])
    })()
  }, [supabase])

  const audienceCount = useMemo(() => {
    if (form.audience === 'all') return users.length
    if (form.audience === 'vip') {
      return users.filter((u) => u.customer_tier === 'mass_builder' || u.customer_tier === 'reseller').length
    }
    return users.filter((u) => u.role === 'manager' || u.role === 'support').length
  }, [form.audience, users])

  const handleSend = () => {
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('موضوع و متن پیام را کامل کنید')
      return
    }
    toast.success(`پیام برای ${toPersianNumber(audienceCount)} کاربر ثبت شد`)
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">پیام دسته‌جمعی</h1>
          <p className="text-zinc-400 mt-1">ارسال پیام به گروه‌های مختلف کاربری</p>
          <p className="mt-2 text-xs text-zinc-500">تعداد مخاطب فعلی: {toPersianNumber(audienceCount)}</p>
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
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-3">
            <p className="text-xs text-zinc-400 mb-2">نمونه پیام‌های اخیر کاربران (از `contact_messages`)</p>
            {templates.length === 0 ? (
              <p className="text-xs text-zinc-500">پیامی برای پیشنهاد متن وجود ندارد</p>
            ) : (
              <div className="space-y-2">
                {templates.map((item) => (
                  <button
                    key={String(item.id)}
                    onClick={() => setForm((prev) => ({ ...prev, subject: String(item.subject ?? prev.subject), message: String(item.message ?? prev.message) }))}
                    className="block w-full rounded-md border border-zinc-700 px-2 py-1.5 text-right text-xs text-zinc-300 hover:bg-zinc-700/40"
                  >
                    {String(item.subject ?? 'بدون موضوع')}
                  </button>
                ))}
              </div>
            )}
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
