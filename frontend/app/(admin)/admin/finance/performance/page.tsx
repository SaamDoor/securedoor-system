import { Trophy, TrendingUp } from 'lucide-react'

const mockPerformance = [
  { id: 1, name: 'فاطمه موسوی', orders: 47, totalSales: '15,000,000 ت', commission: '900,000 ت', rank: 1 },
  { id: 2, name: 'احمد رضایی', orders: 32, totalSales: '12,500,000 ت', commission: '625,000 ت', rank: 2 },
  { id: 3, name: 'مریم احمدی', orders: 28, totalSales: '8,200,000 ت', commission: '574,000 ت', rank: 3 },
  { id: 4, name: 'علی کریمی', orders: 19, totalSales: '5,900,000 ت', commission: '295,000 ت', rank: 4 },
]

const rankColor = ['text-yellow-400', 'text-zinc-300', 'text-amber-700', 'text-zinc-500']

export default function PerformancePage() {
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
              {mockPerformance.map((p, i) => (
                <tr key={p.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 font-bold text-lg ${rankColor[i]}`}>
                      {i === 0 && <Trophy size={16} />}
                      #{p.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-100 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{p.orders} سفارش</td>
                  <td className="px-6 py-4 text-zinc-100">{p.totalSales}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-green-400 font-semibold">
                      <TrendingUp size={14} /> {p.commission}
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
