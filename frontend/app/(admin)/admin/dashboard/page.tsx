import { formatJalaliDate, formatPrice, toPersianNumber } from '@/lib/utils'
import { getDashboardStatsAction } from '../actions'

export default async function AdminDashboardPage() {
  const result = await getDashboardStatsAction()
  const stats = result.ok ? result.data : null

  return (
    <div className="max-w-[1600px] space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">داشبورد مدیریت</h1>
        <p className="text-sm text-[#A0A0A0]">نمای کلی آمار واقعی سیستم</p>
      </div>

      {!result.ok && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{result.error}</div>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          ['سفارش‌ها', stats?.orderCount ?? 0],
          ['محصولات', stats?.productCount ?? 0],
          ['کاربران', stats?.userCount ?? 0],
          ['تیکت باز', stats?.openTickets ?? 0],
          ['نظر معلق', stats?.pendingReviews ?? 0],
          ['درآمد', formatPrice(stats?.revenue ?? 0)],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-white/8 bg-[#181818] p-4 text-center">
            <div className="text-xs text-[#A0A0A0]">{label}</div>
            <div className="mt-2 text-xl font-black text-white">{typeof value === 'number' ? toPersianNumber(value) : value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#181818]">
        <div className="border-b border-white/8 px-5 py-4 text-sm font-bold text-white">آخرین سفارش‌ها</div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              <th className="px-4 py-3 text-right text-xs text-[#A0A0A0]">شماره</th>
              <th className="px-4 py-3 text-right text-xs text-[#A0A0A0]">وضعیت</th>
              <th className="px-4 py-3 text-right text-xs text-[#A0A0A0]">مبلغ</th>
              <th className="px-4 py-3 text-right text-xs text-[#A0A0A0]">تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.recentOrders ?? []).length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-[#A0A0A0]">سفارشی برای نمایش وجود ندارد</td></tr>
            ) : (stats?.recentOrders ?? []).map((order) => (
              <tr key={order.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-sm text-white">{order.order_number ?? order.id}</td>
                <td className="px-4 py-3 text-sm text-[#A0A0A0]">{order.status}</td>
                <td className="px-4 py-3 text-sm text-[#C8A85D]">{formatPrice(Number(order.total ?? 0))}</td>
                <td className="px-4 py-3 text-sm text-[#A0A0A0]">{order.created_at ? formatJalaliDate(order.created_at) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
