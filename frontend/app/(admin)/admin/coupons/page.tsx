'use client'

import { useEffect, useState, useTransition } from 'react'
import { Edit, Plus, Tag, Trash2 } from 'lucide-react'
import { formatJalaliDate } from '@/lib/utils'
import { deleteCouponAction, getCouponsAction, saveCouponAction } from '../actions'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getCouponsAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setCoupons(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function openCouponForm(existing?: Record<string, any>) {
    const code = window.prompt('کد تخفیف', existing?.code ?? '')
    if (!code) return
    const type = window.prompt('نوع (percentage/fixed)', existing?.type ?? 'percentage')
    if (!type) return
    const valueInput = window.prompt('مقدار', String(existing?.value ?? 0))
    if (!valueInput) return
    const value = Number(valueInput)
    if (Number.isNaN(value)) return

    startTransition(async () => {
      const result = await saveCouponAction({
        code,
        type,
        value,
        is_active: existing?.is_active ?? true,
      }, existing?.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      await load()
    })
  }

  function removeCoupon(id: string) {
    if (!window.confirm('کوپن حذف شود؟')) return
    startTransition(async () => {
      const result = await deleteCouponAction(id)
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">کوپن‌های تخفیف</h1>
            <p className="mt-1 text-zinc-400">متصل به داده واقعی کوپن‌ها</p>
          </div>
          <button disabled={isPending} onClick={() => openCouponForm()} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-60">
            <Plus size={16} />
            کوپن جدید
          </button>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">کد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">نوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">مقدار</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">انقضا</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">استفاده</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-500">کوپنی ثبت نشده است</td></tr>
              ) : coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-amber-400">
                    <div className="flex items-center gap-2">
                      <Tag size={14} />
                      <span className="font-mono">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{coupon.type}</td>
                  <td className="px-6 py-4 text-sm text-zinc-200">{coupon.value}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{coupon.end_date ? formatJalaliDate(coupon.end_date) : '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{coupon.usage_count ?? 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button disabled={isPending} onClick={() => openCouponForm(coupon)} className="text-amber-400 hover:text-amber-300 disabled:opacity-60"><Edit size={16} /></button>
                      <button disabled={isPending} onClick={() => removeCoupon(coupon.id)} className="text-red-400 hover:text-red-300 disabled:opacity-60"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
