'use client'

import { useEffect, useState } from 'react'
import { formatJalaliDate, formatPrice, toPersianNumber } from '@/lib/utils'
import { getPayoutsAction } from '../../actions'

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const result = await getPayoutsAction()
      if (!result.ok) {
        setError(result.error)
        return
      }
      setPayouts(result.data ?? [])
    })()
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">درخواست‌های برداشت</h1>
          <p className="mt-1 text-zinc-400">لیست برداشت‌های ثبت‌شده</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">کاربر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">مبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">وضعیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-zinc-500">درخواستی ثبت نشده است</td></tr>
              ) : payouts.map((item) => (
                <tr key={item.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-200">{`${item.user?.first_name ?? ''} ${item.user?.last_name ?? ''}`.trim() || item.user?.email || '—'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-amber-400">{formatPrice(Number(item.amount ?? 0))}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.status ?? 'pending'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.created_at ? formatJalaliDate(item.created_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-zinc-500">{toPersianNumber(payouts.length)} درخواست</p>
      </div>
    </div>
  )
}
