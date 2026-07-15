import Link from 'next/link'
import { TrendingUp, DollarSign, Users, BarChart2, ShoppingCart, Package } from 'lucide-react'
import { getDashboardStatsAction } from '../actions'
import { createClient } from '@/lib/supabase/server'
import { toPersianNumber } from '@/lib/utils'

export default async function ReportsPage() {
  const statsResult = await getDashboardStatsAction()
  const stats = statsResult.ok ? statsResult.data : null
  const supabase = await createClient()
  const { count: lowStockCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .lt('stock', 5)

  const reportCards = [
    {
      title: 'گزارش درآمد',
      description: 'تحلیل کامل درآمد، فروش ماهانه و سالانه',
      icon: <DollarSign size={24} className="text-amber-400" />,
      href: '/admin/finance/revenue',
      count: toPersianNumber(Number(stats?.revenue ?? 0)),
      countLabel: 'تومان',
    },
    {
      title: 'آمار بازدیدکنندگان',
      description: 'ترافیک سایت، منابع بازدید و رفتار کاربران',
      icon: <BarChart2 size={24} className="text-blue-400" />,
      href: '/admin/analytics',
      count: '—',
      countLabel: 'متصل نیست',
    },
    {
      title: 'عملکرد همکاران',
      description: 'کمیسیون، فروش و رتبه‌بندی همکاران',
      icon: <TrendingUp size={24} className="text-green-400" />,
      href: '/admin/finance/performance',
      count: toPersianNumber(stats?.openTickets ?? 0),
      countLabel: 'تیکت باز',
    },
    {
      title: 'گزارش کاربران',
      description: 'آمار ثبت‌نام، فعالیت و سطح کاربران',
      icon: <Users size={24} className="text-purple-400" />,
      href: '/admin/users',
      count: toPersianNumber(stats?.userCount ?? 0),
      countLabel: 'کاربر',
    },
    {
      title: 'گزارش سفارشات',
      description: 'تعداد سفارشات، وضعیت و آمار زمانی',
      icon: <ShoppingCart size={24} className="text-orange-400" />,
      href: '/admin/orders',
      count: toPersianNumber(stats?.orderCount ?? 0),
      countLabel: 'سفارش',
    },
    {
      title: 'موجودی انبار',
      description: 'وضعیت موجودی، هشدارهای کمبود',
      icon: <Package size={24} className="text-cyan-400" />,
      href: '/admin/products/inventory',
      count: toPersianNumber(lowStockCount ?? 0),
      countLabel: 'کم‌موجودی',
    },
  ]

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">گزارشات</h1>
          <p className="text-zinc-400 mt-1">دسترسی سریع به گزارش‌های مدیریتی</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportCards.map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className="bg-zinc-800 rounded-xl p-6 hover:bg-zinc-700 transition-colors group"
            >
              <div className="mb-4">{card.icon}</div>
              <h3 className="text-zinc-100 font-semibold mb-1 group-hover:text-amber-400 transition-colors">
                {card.title}
              </h3>
              <p className="text-zinc-400 text-sm">{card.description}</p>
              <p className="mt-3 text-xs text-amber-400">{card.count} {card.countLabel}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
