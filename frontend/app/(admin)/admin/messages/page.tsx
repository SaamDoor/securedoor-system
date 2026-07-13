'use client'

import { useEffect, useState, useTransition } from 'react'
import { MessageSquare } from 'lucide-react'
import { formatJalaliDate, toPersianNumber } from '@/lib/utils'
import { getContactMessagesAction, markContactMessageAction } from '../actions'

export default function MessagesPage() {
  const [messages, setMessages] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getContactMessagesAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setMessages(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function markRead(message: Record<string, any>) {
    const reply = window.prompt('پاسخ (اختیاری)', message.reply ?? '') ?? undefined
    startTransition(async () => {
      const result = await markContactMessageAction(message.id, reply || undefined)
      if (!result.ok) {
        setError(result.error)
        return
      }
      await load()
    })
  }

  const unreadCount = messages.filter((item) => !item.is_read).length

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-100">
            پیام‌های تماس
            {unreadCount > 0 && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-zinc-900">{toPersianNumber(unreadCount)} جدید</span>}
          </h1>
          <p className="mt-1 text-zinc-400">متصل به `contact_messages`</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">نام</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">ایمیل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">موضوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">تاریخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">پیامی یافت نشد</td></tr>
              ) : messages.map((message) => (
                <tr key={message.id} onClick={() => markRead(message)} className="cursor-pointer border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className={message.is_read ? 'text-zinc-500' : 'text-amber-400'} />
                      <span>{message.name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{message.email ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{message.subject ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{message.created_at ? formatJalaliDate(message.created_at) : '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{message.is_read ? 'خوانده‌شده' : 'جدید'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isPending && <p className="mt-2 text-xs text-zinc-500">در حال بروزرسانی...</p>}
      </div>
    </div>
  )
}
