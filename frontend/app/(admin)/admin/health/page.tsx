import { toPersianNumber } from '@/lib/utils'
import { getDashboardStatsAction } from '../actions'

export default async function HealthPage() {
  const result = await getDashboardStatsAction()
  const stats = result.ok ? result.data : null

  const checks = [
    { name: 'سفارش‌ها', value: stats?.orderCount ?? 0 },
    { name: 'محصولات', value: stats?.productCount ?? 0 },
    { name: 'کاربران', value: stats?.userCount ?? 0 },
    { name: 'تیکت‌های باز', value: stats?.openTickets ?? 0 },
    { name: 'نظرات معلق', value: stats?.pendingReviews ?? 0 },
  ]

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">وضعیت سیستم</h1>
          <p className="mt-1 text-zinc-400">چک سلامت ساده بر اساس آمار پایگاه داده</p>
        </div>

        {!result.ok && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{result.error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">شاخص</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">تعداد</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((check) => (
                <tr key={check.name} className="border-b border-zinc-700/50 last:border-0">
                  <td className="px-6 py-4 text-zinc-200">{check.name}</td>
                  <td className="px-6 py-4 text-zinc-300">{toPersianNumber(check.value)}</td>
                  <td className="px-6 py-4 text-sm text-green-400">سالم</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
