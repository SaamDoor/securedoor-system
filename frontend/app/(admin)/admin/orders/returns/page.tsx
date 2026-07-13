'use client'

import { useEffect, useState, useTransition } from 'react'
import { RotateCcw } from 'lucide-react'
import { formatJalaliDate } from '@/lib/utils'
import { getReturnsAction, updateReturnStatusAction } from '../../actions'

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getReturnsAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setReturns(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function updateStatus(item: Record<string, any>, status: string) {
    startTransition(async () => {
      const result = await updateReturnStatusAction(item.id, status)
      if (!result.ok) {
        setError(result.error)
        return
      }
      await load()
    })
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">مرجوعی‌ها</h1>
          <p className="mt-1 text-zinc-400">درخواست‌های برگشت سفارش</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">سفارش</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">کاربر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">دلیل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">وضعیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {returns.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">درخواست مرجوعی وجود ندارد</td></tr>
              ) : returns.map((item) => (
                <tr key={item.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-amber-400">
                    <div className="flex items-center gap-2">
                      <RotateCcw size={14} />
                      <span className="font-mono">{item.order?.order_number ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{`${item.user?.first_name ?? ''} ${item.user?.last_name ?? ''}`.trim() || item.user?.phone || '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.reason ?? '—'}</td>
                  <td className="px-6 py-4">
                    <select value={item.status ?? ''} onChange={(e) => updateStatus(item, e.target.value)} disabled={isPending} className="rounded-lg border border-zinc-600 bg-zinc-900 px-2 py-1 text-xs text-zinc-200">
                      {['pending', 'approved', 'rejected', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.created_at ? formatJalaliDate(item.created_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
