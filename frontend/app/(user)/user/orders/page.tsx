'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Eye, ChevronRight, Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { BadgeVariant } from '@/components/ui/badge'
import { formatPrice, toPersianNumber, formatJalaliDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

interface OrderListItem {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  itemCount: number
  createdAt: string
  productName: string
}

// Explicit typed maps — prevents TypeScript overlap errors
const statusBadgeVariant: Record<OrderStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
  processing: 'gold',
  shipped: 'gold',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'muted',
  on_hold: 'warning',
}

const statusLabel: Record<OrderStatus, string> = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شده',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
  refunded: 'مسترد شده',
  on_hold: 'معلق',
}

const StatusIconMap: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  refunded: XCircle,
  on_hold: Clock,
}

const ORDERS: OrderListItem[] = [
  {
    id: '1',
    orderNumber: 'SD-20250101-001',
    status: 'delivered',
    total: 28_500_000,
    itemCount: 1,
    createdAt: '2025-01-10',
    productName: 'درب آرتوس پلاتینیوم',
  },
  {
    id: '2',
    orderNumber: 'SD-20250118-002',
    status: 'processing',
    total: 39_600_000,
    itemCount: 2,
    createdAt: '2025-01-18',
    productName: 'درب رگال مشکی × ۲',
  },
  {
    id: '3',
    orderNumber: 'SD-20250125-003',
    status: 'pending',
    total: 35_200_000,
    itemCount: 1,
    createdAt: '2025-01-25',
    productName: 'درب فایر مکس ۹۰',
  },
]

type FilterStatus = 'all' | OrderStatus

const filterOptions: { label: string; value: FilterStatus }[] = [
  { label: 'همه', value: 'all' },
  { label: 'در انتظار', value: 'pending' },
  { label: 'در پردازش', value: 'processing' },
  { label: 'ارسال شده', value: 'shipped' },
  { label: 'تحویل شده', value: 'delivered' },
  { label: 'لغو شده', value: 'cancelled' },
]

export default function UserOrdersPage() {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')

  const filtered =
    activeFilter === 'all' ? ORDERS : ORDERS.filter((o) => o.status === activeFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">سفارشات من</h1>
        <span className="text-sm text-[#A0A0A0]">{toPersianNumber(ORDERS.length)} سفارش</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              activeFilter === value
                ? 'bg-[#C8A85D] text-black'
                : 'bg-[#181818] border border-white/8 text-[#A0A0A0] hover:text-white',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#A0A0A0]">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>سفارشی در این دسته‌بندی یافت نشد.</p>
          </div>
        ) : (
          filtered.map((order, i) => {
            const StatusIcon = StatusIconMap[order.status]
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl bg-[#181818] border border-white/8 overflow-hidden hover:border-[#C8A85D]/20 transition-colors"
              >
                <div className="flex items-center gap-4 p-5">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
                    <StatusIcon className={cn(
                      'h-5 w-5',
                      order.status === 'delivered' ? 'text-[#27AE60]'
                      : order.status === 'cancelled' || order.status === 'refunded' ? 'text-[#E74C3C]'
                      : order.status === 'pending' || order.status === 'on_hold' ? 'text-[#F0B429]'
                      : 'text-[#C8A85D]',
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{order.orderNumber}</span>
                      <Badge variant={statusBadgeVariant[order.status]} size="sm" dot>
                        {statusLabel[order.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#A0A0A0] line-clamp-1">{order.productName}</p>
                  </div>

                  <div className="hidden sm:block text-left flex-shrink-0">
                    <div className="font-black text-white text-base">{formatPrice(order.total)}</div>
                    <div className="text-xs text-[#A0A0A0]">{formatJalaliDate(order.createdAt)}</div>
                  </div>

                  <Link
                    href={`/user/orders/${order.id}`}
                    className="w-9 h-9 rounded-xl border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-[#C8A85D] hover:border-[#C8A85D]/30 transition-all flex-shrink-0"
                    aria-label="مشاهده جزئیات"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
