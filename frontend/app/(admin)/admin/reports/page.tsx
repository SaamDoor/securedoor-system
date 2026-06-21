import Link from 'next/link'
import { TrendingUp, DollarSign, Users, BarChart2, ShoppingCart, Package } from 'lucide-react'

const reportCards = [
  {
    title: 'گزارش درآمد',
    description: 'تحلیل کامل درآمد، فروش ماهانه و سالانه',
    icon: <DollarSign size={24} className="text-amber-400" />,
    href: '/admin/finance/revenue',
  },
  {
    title: 'آمار بازدیدکنندگان',
    description: 'ترافیک سایت، منابع بازدید و رفتار کاربران',
    icon: <BarChart2 size={24} className="text-blue-400" />,
    href: '/admin/analytics',
  },
  {
    title: 'عملکرد همکاران',
    description: 'کمیسیون، فروش و رتبه‌بندی همکاران',
    icon: <TrendingUp size={24} className="text-green-400" />,
    href: '/admin/finance/performance',
  },
  {
    title: 'گزارش کاربران',
    description: 'آمار ثبت‌نام، فعالیت و سطح کاربران',
    icon: <Users size={24} className="text-purple-400" />,
    href: '/admin/users',
  },
  {
    title: 'گزارش سفارشات',
    description: 'تعداد سفارشات، وضعیت و آمار زمانی',
    icon: <ShoppingCart size={24} className="text-orange-400" />,
    href: '/admin/orders',
  },
  {
    title: 'موجودی انبار',
    description: 'وضعیت موجودی، هشدارهای کمبود',
    icon: <Package size={24} className="text-cyan-400" />,
    href: '/admin/products/inventory',
  },
]

export default function ReportsPage() {
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
