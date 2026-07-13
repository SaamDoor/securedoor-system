'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { BadgeVariant } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { formatPrice, toPersianNumber, formatJalaliDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { OrderStatus, PaymentStatus } from '@/types'
import type { AdminOrderRow } from '@/lib/admin/orders.server'
import { getOrdersAction, updateOrderStatusAction } from '../actions'

const orderStatusVariant: Record<OrderStatus, BadgeVariant> = {
  pending: 'warning', confirmed: 'success', processing: 'gold', shipped: 'gold',
  delivered: 'success', cancelled: 'danger', refunded: 'muted', on_hold: 'warning',
}

const orderStatusLabel: Record<OrderStatus, string> = {
  pending: 'در انتظار', confirmed: 'تأیید', processing: 'پردازش', shipped: 'ارسال',
  delivered: 'تحویل', cancelled: 'لغو', refunded: 'مسترد', on_hold: 'معلق',
}

const paymentStatusVariant: Record<PaymentStatus, BadgeVariant> = {
  pending: 'warning', paid: 'success', failed: 'danger', refunded: 'muted', partial: 'warning',
}

const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: 'در انتظار', paid: 'پرداخت شده', failed: 'ناموفق', refunded: 'مسترد', partial: 'ناقص',
}

type StatusFilter = 'all' | OrderStatus

interface Props {
  initialOrders: AdminOrderRow[]
  initialError: string | null
}

export function OrdersClient({ initialOrders, initialError }: Props) {
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialError)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await getOrdersAction(search, statusFilter)
    if (!result.ok) setError(result.error)
    else { setOrders(result.data); setError(null) }
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => {
    const t = setTimeout(() => { if (search || statusFilter !== 'all') load() }, 300)
    return () => clearTimeout(t)
  }, [search, statusFilter, load])

  const displayOrders = (search || statusFilter !== 'all') ? orders : initialOrders

  async function changeStatus(id: string, status: OrderStatus) {
    const result = await updateOrderStatusAction(id, status)
    if (!result.ok) { setError(result.error); return }
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت سفارشات</h1>
          <p className="text-sm text-[#A0A0A0]">{toPersianNumber(displayOrders.length)} سفارش</p>
        </div>
        {loading && <Loader2 className="h-5 w-5 animate-spin text-gold" />}
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['pending', 'processing', 'delivered', 'cancelled'] as OrderStatus[]).map((s) => (
          <div key={s} className="p-4 rounded-xl bg-[#181818] border border-white/8 text-center">
            <div className="text-2xl font-black text-gold">{toPersianNumber(displayOrders.filter((o) => o.status === s).length)}</div>
            <div className="text-xs text-[#A0A0A0] mt-1">{orderStatusLabel[s]}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 max-w-xs">
          <Input placeholder="جستجو..." leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as StatusFilter[]).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all', statusFilter === s ? 'bg-gold text-black' : 'bg-[#181818] border border-white/8 text-[#A0A0A0]')}>
              {s === 'all' ? 'همه' : orderStatusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[#181818] border border-white/8 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>شماره سفارش</TableHead>
              <TableHead>مشتری</TableHead>
              <TableHead>مبلغ</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>پرداخت</TableHead>
              <TableHead>تاریخ</TableHead>
              <TableHead>تغییر وضعیت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayOrders.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted py-10">سفارشی ثبت نشده است</TableCell></TableRow>
            ) : displayOrders.map((order, i) => {
              const user = order.user
              const name = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email : '—'
              return (
                <motion.tr key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-white/3">
                  <TableCell><span className="font-mono text-gold text-xs">{order.order_number}</span></TableCell>
                  <TableCell>
                    <div className="font-medium text-white text-sm">{name}</div>
                    <div className="text-xs text-[#A0A0A0]">{user?.phone ?? user?.email}</div>
                  </TableCell>
                  <TableCell><span className="font-bold text-white">{formatPrice(Number(order.total))}</span></TableCell>
                  <TableCell><Badge variant={orderStatusVariant[order.status]} size="sm" dot>{orderStatusLabel[order.status]}</Badge></TableCell>
                  <TableCell><Badge variant={paymentStatusVariant[order.payment_status]} size="sm">{paymentStatusLabel[order.payment_status]}</Badge></TableCell>
                  <TableCell><span className="text-xs text-[#A0A0A0]">{formatJalaliDate(order.created_at)}</span></TableCell>
                  <TableCell>
                    <select
                      className="bg-black/40 border border-white/10 rounded-lg text-xs px-2 py-1 text-white"
                      value={order.status}
                      onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
                    >
                      {Object.entries(orderStatusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </TableCell>
                </motion.tr>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
