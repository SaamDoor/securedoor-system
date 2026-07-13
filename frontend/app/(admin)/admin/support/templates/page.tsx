'use client'

import { useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { formatJalaliDate, toPersianNumber } from '@/lib/utils'
import { getMessageTemplatesAction } from '../../actions'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const result = await getMessageTemplatesAction()
      if (!result.ok) {
        setError(result.error)
        return
      }
      setTemplates(result.data ?? [])
    })()
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">قالب‌های پیام</h1>
          <p className="mt-1 text-zinc-400">قالب‌های آماده برای پشتیبانی و اطلاع‌رسانی</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">نام</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">دسته</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">آخرین بروزرسانی</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-sm text-zinc-500">قالبی موجود نیست</td></tr>
              ) : templates.map((item) => (
                <tr key={item.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-amber-400" />
                      <span>{item.name ?? 'بدون نام'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.category ?? 'عمومی'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.updated_at ? formatJalaliDate(item.updated_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-zinc-500">{toPersianNumber(templates.length)} قالب</p>
      </div>
    </div>
  )
}
