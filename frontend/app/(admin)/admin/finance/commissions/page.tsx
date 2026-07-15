import { TrendingUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { getPayoutsAction, getSettingsAction } from '../../actions'

export default async function CommissionsPage() {
  const [payoutsResult, settingsResult] = await Promise.all([getPayoutsAction(), getSettingsAction()])
  const payouts = payoutsResult.ok ? payoutsResult.data ?? [] : []
  const settings = settingsResult.ok ? settingsResult.data ?? [] : []
  const commissionPercent = Number(settings.find((item: Record<string, unknown>) => item.key === 'global_commission_pct')?.value ?? 5)

  const rows = payouts.map((item) => {
    const user = item.user as { first_name?: string; last_name?: string; email?: string } | null
    const userName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.email || 'کاربر'
    const base = Number(item.amount ?? 0)
    const commission = Math.round((base * commissionPercent) / 100)
    return {
      id: String(item.id),
      partner: userName,
      percent: `${commissionPercent}%`,
      base,
      commission,
      month: String(item.created_at ?? ''),
    }
  })

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">محاسبه کمیسیون</h1>
          <p className="text-zinc-400 mt-1">گزارش کمیسیون همکاران فروش</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">همکار</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">درصد کمیسیون</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">مبلغ پایه</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">کمیسیون محاسبه‌شده</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">ماه</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">کمیسیونی برای نمایش وجود ندارد</td>
                </tr>
              ) : rows.map((c) => (
                <tr key={c.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100 font-medium">{c.partner}</td>
                  <td className="px-6 py-4">
                    <span className="text-amber-400 font-bold">{c.percent}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{formatPrice(c.base)}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-green-400 font-semibold">
                      <TrendingUp size={14} /> {formatPrice(c.commission)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{new Date(c.month).toLocaleDateString('fa-IR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
