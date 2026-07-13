import { formatPrice, toPersianNumber } from '@/lib/utils'
import { getDashboardStatsAction } from '../actions'

export default async function AnalyticsPage() {
  const result = await getDashboardStatsAction()
  const stats = result.ok ? result.data : null
  const statusEntries = Object.entries(stats?.ordersByStatus ?? {})

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">آمار و تحلیل</h1>
          <p className="mt-1 text-zinc-400">خلاصه داده‌های واقعی از سفارش‌ها و کاربران</p>
        </div>

        {!result.ok && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{result.error}</div>}

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            ['کل سفارش', stats?.orderCount ?? 0],
            ['کاربران', stats?.userCount ?? 0],
            ['محصولات', stats?.productCount ?? 0],
            ['درآمد', formatPrice(stats?.revenue ?? 0)],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl bg-zinc-800 p-5">
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="mt-2 text-2xl font-bold text-zinc-100">{typeof value === 'number' ? toPersianNumber(value) : value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-zinc-800 p-6">
          <h2 className="mb-4 font-semibold text-zinc-100">تفکیک وضعیت سفارش‌ها</h2>
          {statusEntries.length === 0 ? (
            <p className="text-sm text-zinc-500">داده‌ای برای نمایش وجود ندارد</p>
          ) : (
            <div className="space-y-3">
              {statusEntries.map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-lg border border-zinc-700 px-4 py-2">
                  <span className="text-sm text-zinc-300">{status}</span>
                  <span className="font-bold text-amber-400">{toPersianNumber(count)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
