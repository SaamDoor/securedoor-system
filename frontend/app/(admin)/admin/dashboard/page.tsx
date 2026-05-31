'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp, ShoppingBag, Users, Package,
  ArrowUpRight, ArrowDownRight, Star, Clock, AlertTriangle,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { BadgeVariant } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import type { AlertType } from '@/types'

// ─── Explicit types for all data objects ─────────────────────────────────────

interface MetricCard {
  title: string
  value: string
  change: string
  positive: boolean
  icon: LucideIcon
  color: string
  bg: string
  border: string
}

interface RevenueDataPoint {
  month: string
  revenue: number
  orders: number
}

interface CategoryDataPoint {
  name: string
  value: number
  color: string
}

interface RecentOrder {
  id: string
  customer: string
  amount: number
  status: 'delivered' | 'processing' | 'pending' | 'shipped' | 'confirmed'
  time: string
}

interface AlertItem {
  type: AlertType
  message: string
  icon: LucideIcon
}

// ─── Data ────────────────────────────────────────────────────────────────────

const metricCards: MetricCard[] = [
  {
    title: 'درآمد این ماه',
    value: '۴۸۵,۰۰۰,۰۰۰ تومان',
    change: '+۱۸٪',
    positive: true,
    icon: TrendingUp,
    color: 'text-[#C8A85D]',
    bg: 'from-[#C8A85D]/10 to-[#C8A85D]/5',
    border: 'border-[#C8A85D]/20',
  },
  {
    title: 'سفارشات این ماه',
    value: '۱۲۴ سفارش',
    change: '+۱۲٪',
    positive: true,
    icon: ShoppingBag,
    color: 'text-blue-400',
    bg: 'from-blue-500/10 to-blue-500/5',
    border: 'border-blue-500/20',
  },
  {
    title: 'کاربران جدید',
    value: '۸۶ کاربر',
    change: '+۲۴٪',
    positive: true,
    icon: Users,
    color: 'text-green-400',
    bg: 'from-green-500/10 to-green-500/5',
    border: 'border-green-500/20',
  },
  {
    title: 'محصولات فروخته',
    value: '۱۵۸ عدد',
    change: '-۳٪',
    positive: false,
    icon: Package,
    color: 'text-purple-400',
    bg: 'from-purple-500/10 to-purple-500/5',
    border: 'border-purple-500/20',
  },
]

const revenueData: RevenueDataPoint[] = [
  { month: 'مهر', revenue: 320_000_000, orders: 89 },
  { month: 'آبان', revenue: 410_000_000, orders: 112 },
  { month: 'آذر', revenue: 380_000_000, orders: 98 },
  { month: 'دی', revenue: 450_000_000, orders: 124 },
  { month: 'بهمن', revenue: 485_000_000, orders: 131 },
  { month: 'اسفند', revenue: 520_000_000, orders: 143 },
]

const categoryData: CategoryDataPoint[] = [
  { name: 'درب ضد سرقت', value: 48, color: '#C8A85D' },
  { name: 'درب آپارتمانی', value: 28, color: '#3B82F6' },
  { name: 'درب ضد حریق', value: 15, color: '#EF4444' },
  { name: 'درب ویلایی', value: 9, color: '#10B981' },
]

const recentOrders: RecentOrder[] = [
  { id: 'SD-001', customer: 'مهندس رضایی', amount: 28_500_000, status: 'delivered', time: '۲ ساعت پیش' },
  { id: 'SD-002', customer: 'خانم موسوی', amount: 19_800_000, status: 'processing', time: '۴ ساعت پیش' },
  { id: 'SD-003', customer: 'آقای احمدی', amount: 54_900_000, status: 'pending', time: '۵ ساعت پیش' },
  { id: 'SD-004', customer: 'دکتر نجفی', amount: 35_200_000, status: 'shipped', time: '۸ ساعت پیش' },
  { id: 'SD-005', customer: 'مهندس کریمی', amount: 28_500_000, status: 'confirmed', time: 'دیروز' },
]

const alerts: AlertItem[] = [
  { type: 'warning', message: '۳ محصول در آستانه اتمام موجودی', icon: AlertTriangle },
  { type: 'info', message: '۷ نظر جدید در انتظار تأیید', icon: Star },
  { type: 'info', message: '۵ پیام پشتیبانی خوانده نشده', icon: Clock },
]

// ─── Badge variant map (strictly typed) ──────────────────────────────────────

const orderStatusBadge: Record<RecentOrder['status'], BadgeVariant> = {
  delivered: 'success',
  processing: 'gold',
  pending: 'warning',
  shipped: 'gold',
  confirmed: 'muted',
}

const orderStatusLabel: Record<RecentOrder['status'], string> = {
  delivered: 'تحویل شده',
  processing: 'در پردازش',
  pending: 'در انتظار',
  shipped: 'ارسال شده',
  confirmed: 'تأیید شده',
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">داشبورد مدیریت</h1>
          <p className="text-[#A0A0A0] text-sm">خلاصه عملکرد سیستم</p>
        </div>
        <div className="text-sm text-[#A0A0A0] bg-[#181818] border border-white/8 px-4 py-2 rounded-xl">
          آخرین بروزرسانی: ۵ دقیقه پیش
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={cn(
                'relative p-5 rounded-2xl bg-gradient-to-br border overflow-hidden',
                card.bg,
                card.border,
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <Icon className={cn('h-6 w-6', card.color)} />
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
                    card.positive
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-red-400 bg-red-500/10',
                  )}
                >
                  {card.positive
                    ? <ArrowUpRight className="h-3 w-3" />
                    : <ArrowDownRight className="h-3 w-3" />
                  }
                  {card.change}
                </div>
              </div>
              <div className="font-black text-white text-xl mb-0.5">{card.value}</div>
              <div className="text-xs text-[#A0A0A0]">{card.title}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 p-5 rounded-2xl bg-[#181818] border border-white/8">
          <div className="mb-5">
            <h3 className="font-bold text-white">درآمد ماهانه</h3>
            <p className="text-xs text-[#A0A0A0]">۶ ماه اخیر</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8A85D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C8A85D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#A0A0A0', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: '#181818',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: 12,
                }}
                formatter={(value: number) => [formatPrice(value), 'درآمد']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C8A85D"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-2xl bg-[#181818] border border-white/8">
          <div className="mb-5">
            <h3 className="font-bold text-white">توزیع فروش</h3>
            <p className="text-xs text-[#A0A0A0]">بر اساس دسته‌بندی</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                strokeWidth={0}
              >
                {categoryData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#181818',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${value}٪`, 'سهم']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-[#A0A0A0]">{c.name}</span>
                </div>
                <span className="text-white font-semibold">{toPersianNumber(c.value)}٪</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent orders */}
        <div className="xl:col-span-2 rounded-2xl bg-[#181818] border border-white/8 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <h3 className="font-bold text-white">آخرین سفارشات</h3>
            <a href="/admin/orders" className="text-xs text-[#C8A85D] hover:text-[#E7D3A5]">
              مشاهده همه
            </a>
          </div>
          <div className="divide-y divide-white/5">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/3 transition-colors">
                <div className="font-mono text-xs text-[#A0A0A0]">{order.id}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{order.customer}</div>
                  <div className="text-xs text-[#A0A0A0]">{order.time}</div>
                </div>
                <div className="text-sm font-bold text-white">{formatPrice(order.amount)}</div>
                <Badge variant={orderStatusBadge[order.status]} size="sm" dot>
                  {orderStatusLabel[order.status]}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-2xl bg-[#181818] border border-white/8">
          <div className="px-5 py-4 border-b border-white/8">
            <h3 className="font-bold text-white">هشدارها</h3>
          </div>
          <div className="p-4 space-y-3">
            {alerts.map((alert, i) => {
              const AlertIcon = alert.icon
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border',
                    alert.type === 'warning'
                      ? 'bg-[#D49A2A]/10 border-[#D49A2A]/20'
                      : 'bg-white/5 border-white/8',
                  )}
                >
                  <AlertIcon
                    className={cn(
                      'h-4 w-4 flex-shrink-0 mt-0.5',
                      alert.type === 'warning' ? 'text-[#F0B429]' : 'text-[#A0A0A0]',
                    )}
                  />
                  <p className="text-xs text-[#A0A0A0] leading-relaxed">{alert.message}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
