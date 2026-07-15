import { Trophy, TrendingUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { getPayoutsAction } from '../../actions'
import { createClient } from '@/lib/supabase/server'

const rankColor = ['text-yellow-400', 'text-zinc-300', 'text-amber-700', 'text-zinc-500'] as const

export default async function PerformancePage() {
  const payoutsResult = await getPayoutsAction()
  const supabase = await createClient()
  const { data: wallets } = await supabase
    .from('wallets')
    .select('id, user_id, lifetime_earned, user:users(first_name, last_name)')
    .order('lifetime_earned', { ascending: false })
    .limit(20)

  const payouts = payoutsResult.ok ? payoutsResult.data ?? [] : []
  const rows = (wallets ?? []).map((wallet) => {
    const user = Array.isArray(wallet.user) ? wallet.user[0] : wallet.user
    const userPayouts = payouts.filter((item: Record<string, unknown>) => item.user_id === wallet.user_id)
    const paid = userPayouts
      .filter((item: Record<string, unknown>) => item.status === 'completed' || item.status === 'approved')
      .reduce((sum: number, item: Record<string, unknown>) => sum + Number(item.amount ?? 0), 0)
    return {
      id: wallet.id,
      name: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || 'کاربر',
      orders: userPayouts.length,
      totalSales: Number(wallet.lifetime_earned ?? 0),
      commission: paid,
    }
  })

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">عملکرد همکاران</h1>
          <p className="text-zinc-400 mt-1">رتبه‌بندی و آمار فروش همکاران</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">رتبه</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تعداد سفارش</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">مجموع فروش</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">کمیسیون</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">اطلاعات عملکردی وجود ندارد</td>
                </tr>
              ) : rows.map((p, i) => (
                <tr key={p.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 font-bold text-lg ${rankColor[i]}`}>
                      {i === 0 && <Trophy size={16} />}
                      #{i + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-100 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{p.orders} سفارش</td>
                  <td className="px-6 py-4 text-zinc-100">{formatPrice(p.totalSales)}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-green-400 font-semibold">
                      <TrendingUp size={14} /> {formatPrice(p.commission)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
