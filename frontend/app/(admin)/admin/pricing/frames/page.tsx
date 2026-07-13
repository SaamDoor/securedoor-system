'use client'

import { useEffect, useState } from 'react'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import { getFramePricesAction } from '../../actions'

export default function FramePricingPage() {
  const [frames, setFrames] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const result = await getFramePricesAction()
      if (!result.ok) {
        setError(result.error)
        return
      }
      setFrames(result.data ?? [])
    })()
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">لیست قیمت چهارچوب</h1>
          <p className="mt-1 text-zinc-400">اطلاعات واقعی جدول `frame_price_list`</p>
        </div>
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">نوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">ابعاد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">قیمت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">فعال</th>
              </tr>
            </thead>
            <tbody>
              {frames.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-zinc-500">قیمتی ثبت نشده است</td></tr>
              ) : frames.map((frame) => (
                <tr key={frame.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-100">{frame.frame_type ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{frame.dimensions ?? frame.dimension_label ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-amber-400">{formatPrice(Number(frame.price ?? frame.total_price ?? 0))}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{frame.is_active === false ? 'خیر' : 'بله'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-zinc-500">{toPersianNumber(frames.length)} ردیف قیمت</p>
      </div>
    </div>
  )
}
