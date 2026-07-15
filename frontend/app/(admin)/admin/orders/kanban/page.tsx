'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import type { AdminOrderRow } from '@/lib/admin/orders.server'
import { getOrdersAction } from '../../actions'

const columns = [
  { id: 'pending', title: 'در انتظار', color: 'border-yellow-500' },
  { id: 'confirmed', title: 'تأیید شده', color: 'border-blue-500' },
  { id: 'processing', title: 'در حال پردازش', color: 'border-purple-500' },
  { id: 'shipped', title: 'ارسال شده', color: 'border-cyan-500' },
  { id: 'delivered', title: 'تحویل داده شده', color: 'border-green-500' },
] as const

export default function KanbanPage() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      const result = await getOrdersAction('', 'all')
      if (!result.ok) {
        setError(result.error)
        setLoading(false)
        return
      }
      setOrders(result.data ?? [])
      setError(null)
      setLoading(false)
    })()
  }, [])

  const grouped = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      cards: orders.filter((item) => item.status === column.id),
    }))
  }, [orders])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">کانبان سفارشات</h1>
        <p className="text-zinc-400 mt-1">مدیریت بصری وضعیت سفارشات</p>
      </div>
      {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
      {loading && <p className="mb-4 text-sm text-zinc-400">در حال دریافت سفارشات...</p>}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {grouped.map(col => (
          <div key={col.id} className="flex-shrink-0 w-72">
            <div className={`bg-zinc-800 rounded-xl overflow-hidden border-t-4 ${col.color}`}>
              <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-700">
                <h2 className="text-zinc-100 font-semibold">{col.title}</h2>
                <span className="bg-zinc-700 text-zinc-400 text-xs rounded-full px-2 py-0.5">{col.cards.length}</span>
              </div>
              <div className="p-3 space-y-3">
                {col.cards.length === 0 ? (
                  <div className="rounded-lg border border-zinc-700/70 p-4 text-center text-xs text-zinc-500">
                    موردی در این وضعیت وجود ندارد
                  </div>
                ) : col.cards.map((card) => (
                  <div key={card.id} className="bg-zinc-700/50 rounded-lg p-3 hover:bg-zinc-700 transition-colors cursor-pointer">
                    <div className="mb-2">
                      <span className="text-amber-400 font-mono text-xs">{card.order_number}</span>
                    </div>
                    <p className="text-zinc-100 text-sm font-medium">
                      {`${card.user?.first_name ?? ''} ${card.user?.last_name ?? ''}`.trim() || card.user?.email || 'مشتری بدون نام'}
                    </p>
                    <p className="text-zinc-400 text-xs mt-1">
                      {card.items?.length ?? 0} آیتم
                    </p>
                    <p className="text-zinc-200 text-sm font-semibold mt-2">{formatPrice(Number(card.total ?? 0))}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
