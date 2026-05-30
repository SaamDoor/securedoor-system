'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ShoppingBag, Heart, MessageCircle, Download,
  TrendingUp, Clock, CheckCircle, Truck, ArrowLeft,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, toPersianNumber, formatJalaliDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const stats = [
  { label: 'کل سفارشات', value: '۱۲', icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { label: 'علاقه‌مندی‌ها', value: '۸', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  { label: 'پیام‌های خوانده نشده', value: '۲', icon: MessageCircle, color: 'text-gold', bg: 'bg-gold/10 border-gold/20' },
  { label: 'دانلودهای فعال', value: '۵', icon: Download, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
]

const recentOrders = [
  {
    id: '1',
    orderNumber: 'SD-20250101-001',
    status: 'delivered' as const,
    total: 28_500_000,
    itemCount: 1,
    createdAt: '2025-01-10',
    productName: 'درب آرتوس پلاتینیوم',
  },
  {
    id: '2',
    orderNumber: 'SD-20250105-002',
    status: 'processing' as const,
    total: 19_800_000,
    itemCount: 1,
    createdAt: '2025-01-18',
    productName: 'درب رگال مشکی',
  },
  {
    id: '3',
    orderNumber: 'SD-20250120-003',
    status: 'pending' as const,
    total: 35_200_000,
    itemCount: 2,
    createdAt: '2025-01-25',
    productName: 'درب فایر مکس ۹۰ و متعلقات',
  },
]

const statusConfig = {
  pending: { label: 'در انتظار', color: 'warning', icon: Clock },
  confirmed: { label: 'تأیید شده', color: 'success', icon: CheckCircle },
  processing: { label: 'در حال پردازش', color: 'primary', icon: TrendingUp },
  shipped: { label: 'ارسال شده', color: 'primary', icon: Truck },
  delivered: { label: 'تحویل شده', color: 'success', icon: CheckCircle },
  cancelled: { label: 'لغو شده', color: 'danger', icon: Clock },
  refunded: { label: 'مسترد', color: 'muted', icon: Clock },
  on_hold: { label: 'معلق', color: 'warning', icon: Clock },
} as const

export default function UserDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-black text-white mb-1">خوش آمدید!</h1>
        <p className="text-muted text-sm">اطلاعات کلی حساب کاربری شما</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className={cn(
                'p-5 rounded-2xl border',
                stat.bg,
              )}
            >
              <Icon className={cn('h-6 w-6 mb-3', stat.color)} />
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-muted mt-1">{stat.label}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Recent orders */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-2xl bg-surface border border-white/8 overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <h2 className="font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold" />
            آخرین سفارشات
          </h2>
          <Link href="/user/orders" className="text-sm text-gold hover:text-gold-light flex items-center gap-1">
            مشاهده همه
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-white/5">
          {recentOrders.map((order) => {
            const status = statusConfig[order.status]
            const StatusIcon = status.icon

            return (
              <Link
                key={order.id}
                href={`/user/orders/${order.id}`}
                className="flex items-center gap-4 p-5 hover:bg-white/3 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
                  <StatusIcon className={cn(
                    'h-5 w-5',
                    status.color === 'success' && 'text-success-light',
                    status.color === 'warning' && 'text-warning-light',
                    status.color === 'danger' && 'text-danger-light',
                    status.color === 'primary' && 'text-gold',
                    status.color === 'muted' && 'text-muted',
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-white text-sm">{order.orderNumber}</span>
                    <Badge
                      variant={
                        status.color === 'success' ? 'success'
                        : status.color === 'danger' ? 'danger'
                        : status.color === 'warning' ? 'warning'
                        : 'gold'
                      }
                      size="sm"
                    >
                      {status.label}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted line-clamp-1">{order.productName}</div>
                </div>

                <div className="text-left flex-shrink-0">
                  <div className="font-bold text-white text-sm">{formatPrice(order.total)}</div>
                  <div className="text-xs text-muted">{formatJalaliDate(order.createdAt)}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { label: 'ادامه خرید', href: '/products', icon: '🛒', desc: 'محصولات جدید را ببینید' },
          { label: 'مشاوره رایگان', href: '/user/messages', icon: '💬', desc: 'با کارشناسان ما صحبت کنید' },
          { label: 'پیگیری سفارش', href: '/user/orders', icon: '📦', desc: 'وضعیت سفارش را بررسی کنید' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/8 hover:border-gold/30 hover:bg-gold/5 transition-all group"
          >
            <span className="text-2xl">{action.icon}</span>
            <div>
              <div className="font-semibold text-white text-sm group-hover:text-gold-light transition-colors">
                {action.label}
              </div>
              <div className="text-xs text-muted">{action.desc}</div>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}
