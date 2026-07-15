import { TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { getDashboardStatsAction, getPayoutsAction, getSettingsAction } from '../../actions'
import { createClient } from '@/lib/supabase/server'

export default async function RevenuePage() {
  const [statsResult, payoutsResult, settingsResult] = await Promise.all([
    getDashboardStatsAction(),
    getPayoutsAction(),
    getSettingsAction(),
  ])
  const supabase = await createClient()
  const { data: wallets } = await supabase
    .from('wallets')
    .select('balance, pending_balance, lifetime_earned, updated_at')
    .order('updated_at', { ascending: false })
    .limit(30)

  const stats = statsResult.ok ? statsResult.data : null
  const payouts = payoutsResult.ok ? payoutsResult.data ?? [] : []
  const settings = settingsResult.ok ? settingsResult.data ?? [] : []
  const taxRate = Number(settings.find((item: Record<string, unknown>) => item.key === 'tax_rate_percent')?.value ?? 9)
  const totalWalletBalance = (wallets ?? []).reduce((sum, wallet) => sum + Number(wallet.balance ?? 0), 0)
  const totalPaidPayouts = payouts
    .filter((item: Record<string, unknown>) => item.status === 'completed')
    .reduce((sum: number, item: Record<string, unknown>) => sum + Number(item.amount ?? 0), 0)

  const monthlyData = [
    { month: '۲ ماه قبل', value: Math.max(10, Math.round((Number(stats?.revenue ?? 0) - totalPaidPayouts) / 1_000_000)) },
    { month: 'ماه قبل', value: Math.max(10, Math.round(totalWalletBalance / 1_000_000)) },
    { month: 'ماه جاری', value: Math.max(10, Math.round(Number(stats?.revenue ?? 0) / 1_000_000)) },
  ]
  const maxBar = Math.max(...monthlyData.map((item) => item.value), 1)

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">گزارش درآمد</h1>
          <p className="text-zinc-400 mt-1">تحلیل درآمد و فروش</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'درآمد ثبت‌شده', value: formatPrice(Number(stats?.revenue ?? 0)), icon: <DollarSign size={20} className="text-amber-400" />, change: `${taxRate}% مالیات` },
            { label: 'موجودی کیف‌پول‌ها', value: formatPrice(totalWalletBalance), icon: <Calendar size={20} className="text-blue-400" />, change: `${wallets?.length ?? 0} کیف‌پول` },
            { label: 'برداشت تکمیل‌شده', value: formatPrice(totalPaidPayouts), icon: <TrendingUp size={20} className="text-green-400" />, change: `${payouts.length} درخواست` },
          ].map((kpi, i) => (
            <div key={i} className="bg-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                {kpi.icon}
                <span className="text-green-400 text-xs font-medium">{kpi.change}</span>
              </div>
              <p className="text-zinc-400 text-sm mb-1">{kpi.label}</p>
              <p className="text-zinc-100 font-bold text-lg">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-zinc-800 rounded-xl p-6">
          <h2 className="text-zinc-100 font-semibold mb-6">نمودار درآمد نسبی</h2>
          <div className="flex items-end gap-4 h-48">
            {monthlyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-zinc-400 text-xs">{d.value}M</span>
                <div
                  className="w-full bg-amber-500 rounded-t-md transition-all hover:bg-amber-400"
                  style={{ height: `${Math.round((d.value / maxBar) * 100)}%` }}
                />
                <span className="text-zinc-400 text-xs">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
