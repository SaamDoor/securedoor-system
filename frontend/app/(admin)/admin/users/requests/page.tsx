'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, XCircle, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatJalaliDate } from '@/lib/utils'

export default function UsersRequestsPage() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [messages, setMessages] = useState<Record<string, unknown>[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    void (async () => {
      const [usersRes, messagesRes] = await Promise.all([
        supabase
          .from('users')
          .select('id, first_name, last_name, email, phone, is_verified, created_at, customer_tier')
          .eq('is_verified', false)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('contact_messages')
          .select('id, name, email, phone, subject, message, created_at')
          .order('created_at', { ascending: false })
          .limit(50),
      ])
      if (usersRes.error || messagesRes.error) {
        setError(usersRes.error?.message ?? messagesRes.error?.message ?? 'خطای دریافت اطلاعات')
        return
      }
      setUsers(usersRes.data ?? [])
      setMessages(messagesRes.data ?? [])
      setError(null)
    })()
  }, [])

  const requestMessages = useMemo(() => {
    return messages.filter((item) => {
      const text = `${String(item.subject ?? '')} ${String(item.message ?? '')}`.toLowerCase()
      return text.includes('درخواست') || text.includes('همکاری') || text.includes('ارتقا')
    })
  }, [messages])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">درخواست‌های عضویت</h1>
          <p className="text-zinc-400 mt-1">تأیید یا رد درخواست‌های ثبت‌نام و ارتقا سطح</p>
        </div>
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">ایمیل</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تلفن</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">دلیل درخواست</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && requestMessages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-500">درخواستی برای بررسی وجود ندارد</td>
                </tr>
              ) : (
                <>
                  {users.map((r) => (
                <tr key={`user-${String(r.id)}`} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <UserPlus size={16} className="text-amber-400" />
                      <span className="text-zinc-100 font-medium">
                        {`${String(r.first_name ?? '')} ${String(r.last_name ?? '')}`.trim() || 'کاربر جدید'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{String(r.email ?? '—')}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{String(r.phone ?? '—')}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{r.created_at ? formatJalaliDate(String(r.created_at)) : '—'}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">ثبت‌نام تأییدنشده ({String(r.customer_tier ?? 'regular')})</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 text-green-400 text-sm">
                        <CheckCircle size={14} /> تأیید
                      </button>
                      <button className="flex items-center gap-1 text-red-400 text-sm">
                        <XCircle size={14} /> رد
                      </button>
                    </div>
                  </td>
                </tr>
                  ))}
                  {requestMessages.map((msg) => (
                    <tr key={`msg-${String(msg.id)}`} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                      <td className="px-6 py-4 text-zinc-100 font-medium">{String(msg.name ?? 'بدون نام')}</td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">{String(msg.email ?? '—')}</td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">{String(msg.phone ?? '—')}</td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">{msg.created_at ? formatJalaliDate(String(msg.created_at)) : '—'}</td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">{String(msg.subject ?? 'درخواست')}</td>
                      <td className="px-6 py-4 text-zinc-500 text-sm">بررسی پیام</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
