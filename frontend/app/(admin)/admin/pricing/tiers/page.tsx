'use client'

import { useEffect, useState } from 'react'
import { toPersianNumber } from '@/lib/utils'
import { getBuilderTiersAction } from '../../actions'

export default function PricingTiersPage() {
  const [tiers, setTiers] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const result = await getBuilderTiersAction()
      if (!result.ok) {
        setError(result.error)
        return
      }
      setTiers(result.data ?? [])
    })()
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">سطوح قیمت‌گذاری</h1>
          <p className="mt-1 text-zinc-400">پیکربندی سطوح سازنده و فروشنده</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        {tiers.length === 0 ? (
          <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-8 text-center text-sm text-zinc-500">سطحی تعریف نشده است</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tiers.map((tier) => (
              <div key={tier.id} className="flex items-center justify-between rounded-xl bg-zinc-800 p-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">{tier.name ?? tier.tier_name ?? 'Tier'}</h3>
                  <p className="mt-1 text-sm text-zinc-400">حداقل سفارش: {toPersianNumber(Number(tier.min_orders ?? 0))}</p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-zinc-500">درصد تخفیف</p>
                  <p className="text-xl font-bold text-amber-400">{toPersianNumber(Number(tier.discount_percent ?? 0))}٪</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
