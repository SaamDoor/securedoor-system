import { TrendingUp } from 'lucide-react'

const mockCommissions = [
  { id: 1, partner: 'احمد رضایی', percent: '5%', base: '12,500,000 ت', commission: '625,000 ت', month: 'خرداد ۱۴۰۳' },
  { id: 2, partner: 'مریم احمدی', percent: '7%', base: '8,200,000 ت', commission: '574,000 ت', month: 'خرداد ۱۴۰۳' },
  { id: 3, partner: 'علی کریمی', percent: '5%', base: '5,900,000 ت', commission: '295,000 ت', month: 'خرداد ۱۴۰۳' },
  { id: 4, partner: 'فاطمه موسوی', percent: '6%', base: '15,000,000 ت', commission: '900,000 ت', month: 'خرداد ۱۴۰۳' },
]

export default function CommissionsPage() {
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
              {mockCommissions.map(c => (
                <tr key={c.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100 font-medium">{c.partner}</td>
                  <td className="px-6 py-4">
                    <span className="text-amber-400 font-bold">{c.percent}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{c.base}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-green-400 font-semibold">
                      <TrendingUp size={14} /> {c.commission}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{c.month}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
