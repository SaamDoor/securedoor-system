'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Eye, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { BadgeVariant } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { formatPrice, toPersianNumber, formatJalaliDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { OrderStatus, PaymentStatus } from '@/types'

interface AdminOrder {
  id: string
  orderNumber: string
  customer: string
  phone: string
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  itemCount: number
  createdAt: string
}

const orderStatusVariant: Record<OrderStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
  processing: 'gold',
  shipped: 'gold',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'muted',
  on_hold: 'warning',
}

const orderStatusLabel: Record<OrderStatus, string> = {
  pending: 'در انتظار',
  confirmed: 'تأیید',
  processing: 'پردازش',
  shipped: 'ارسال',
  delivered: 'تحویل',
  cancelled: 'لغو',
  refunded: 'مسترد',
  on_hold: 'معلق',
}

const paymentStatusVariant: Record<PaymentStatus, BadgeVariant> = {
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'muted',
  partial: 'warning',
}

const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: 'در انتظار',
  paid: 'پرداخت شده',
  failed: 'ناموفق',
  refunded: 'مسترد',
  partial: 'ناقص',
}

const ORDERS: AdminOrder[] = [
  { id: '1', orderNumber: 'SD-20250101-001', customer: 'مهندس رضایی', phone: '0912***4567', total: 28_500_000, status: 'delivered', paymentStatus: 'paid', itemCount: 1, createdAt: '2025-01-10' },
  { id: '2', orderNumber: 'SD-20250118-002', customer: 'خانم موسوی', phone: '0911***8765', total: 39_600_000, status: 'processing', paymentStatus: 'paid', itemCount: 2, createdAt: '2025-01-18' },
  { id: '3', orderNumber: 'SD-20250125-003', customer: 'آقای احمدی', phone: '0935***2341', total: 35_200_000, status: 'pending', paymentStatus: 'pending', itemCount: 1, createdAt: '2025-01-25' },
  { id: '4', orderNumber: 'SD-20250128-004', customer: 'دکتر نجفی', phone: '0912***9876', total: 54_900_000, status: 'shipped', paymentStatus: 'paid', itemCount: 1, createdAt: '2025-01-28' },
  { id: '5', orderNumber: 'SD-20250130-005', customer: 'مهندس کریمی', phone: '0921***3456', total: 28_500_000, status: 'cancelled', paymentStatus: 'refunded', itemCount: 1, createdAt: '2025-01-30' },
]

type StatusFilter = 'all' | OrderStatus

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered = ORDERS.filter((o) => {
    const matchesSearch =
      o.orderNumber.includes(search) ||
      o.customer.includes(search) ||
      o.phone.includes(search)
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت سفارشات</h1>
          <p className="text-sm text-[#A0A0A0]">{toPersianNumber(ORDERS.length)} سفارش</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          [
            { label: 'در انتظار', count: ORDERS.filter((o) => o.status === 'pending').length, color: 'text-[#F0B429]' },
            { label: 'در پردازش', count: ORDERS.filter((o) => o.status === 'processing').length, color: 'text-[#C8A85D]' },
            { label: 'تحویل شده', count: ORDERS.filter((o) => o.status === 'delivered').length, color: 'text-[#27AE60]' },
            { label: 'لغو شده', count: ORDERS.filter((o) => o.status === 'cancelled').length, color: 'text-[#E74C3C]' },
          ] as { label: string; count: number; color: string }[]
        ).map(({ label, count, color }) => (
          <div key={label} className="p-4 rounded-xl bg-[#181818] border border-white/8 text-center">
            <div className={cn('text-2xl font-black', color)}>{toPersianNumber(count)}</div>
            <div className="text-xs text-[#A0A0A0] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="جستجو در سفارشات..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                statusFilter === s
                  ? 'bg-[#C8A85D] text-black'
                  : 'bg-[#181818] border border-white/8 text-[#A0A0A0] hover:text-white',
              )}
            >
              {s === 'all' ? 'همه' : orderStatusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
              <TableHead className="text-center">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order, i) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="hover:bg-white/3 transition-colors"
              >
                <TableCell>
                  <span className="font-mono text-[#C8A85D] text-xs">{order.orderNumber}</span>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-white text-sm">{order.customer}</div>
                  <div className="text-xs text-[#A0A0A0]">{order.phone}</div>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-white">{formatPrice(order.total)}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={orderStatusVariant[order.status]} size="sm" dot>
                    {orderStatusLabel[order.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={paymentStatusVariant[order.paymentStatus]} size="sm">
                    {paymentStatusLabel[order.paymentStatus]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[#A0A0A0]">{formatJalaliDate(order.createdAt)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      aria-label="جزئیات سفارش"
                      className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-[#C8A85D] hover:border-[#C8A85D]/30 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
