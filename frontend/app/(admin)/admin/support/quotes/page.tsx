'use client'

import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { formatJalaliDate, toPersianNumber } from '@/lib/utils'
import { getBulkQuotesAction } from '../../actions'

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const result = await getBulkQuotesAction()
      if (!result.ok) {
        setError(result.error)
        return
      }
      setQuotes(result.data ?? [])
    })()
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">درخواست‌های پیش‌فاکتور</h1>
          <p className="mt-1 text-zinc-400">دریافت‌شده از فرم ثبت سفارش عمده</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">عنوان</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">نام</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">شماره تماس</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">وضعیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">درخواستی ثبت نشده است</td>
                </tr>
              ) : quotes.map((quote) => (
                <tr key={quote.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-amber-400" />
                      <span>{quote.project_name ?? quote.subject ?? 'بدون عنوان'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{quote.name ?? quote.full_name ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{quote.phone ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{quote.status ?? 'جدید'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{quote.created_at ? formatJalaliDate(quote.created_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-zinc-500">{toPersianNumber(quotes.length)} درخواست</p>
      </div>
    </div>
  )
}
