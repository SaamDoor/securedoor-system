import { RefreshCw } from 'lucide-react'

const mockCompetitors = [
  { id: 1, name: 'شرکت آلفا درب', door1: '8,200,000 ت', door2: '13,500,000 ت', frame: '2,900,000 ت', updated: '۱۴۰۳/۰۴/۰۱' },
  { id: 2, name: 'درب‌سازی ایران', door1: '7,900,000 ت', door2: '12,800,000 ت', frame: '3,100,000 ت', updated: '۱۴۰۳/۰۳/۲۸' },
  { id: 3, name: 'سیستم درب پارسیان', door1: '9,000,000 ت', door2: '15,000,000 ت', frame: '3,500,000 ت', updated: '۱۴۰۳/۰۳/۲۰' },
  { id: 4, name: 'قیمت ما', door1: '8,500,000 ت', door2: '14,200,000 ت', frame: '3,200,000 ت', updated: '۱۴۰۳/۰۴/۰۲' },
]

export default function PriceComparePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">مقایسه قیمت رقبا</h1>
            <p className="text-zinc-400 mt-1">تحلیل قیمت‌های بازار و رقبای اصلی</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 transition-colors">
            <RefreshCw size={16} />
            بروزرسانی
          </button>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">رقیب</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">درب ضد سرقت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">درب دوبل</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">چهارچوب</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">آخرین بروزرسانی</th>
              </tr>
            </thead>
            <tbody>
              {mockCompetitors.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-zinc-700/50 transition-colors ${
                    i === mockCompetitors.length - 1 ? 'bg-amber-500/10' : 'hover:bg-zinc-700/30'
                  }`}
                >
                  <td className="px-6 py-4 font-medium">
                    <span className={i === mockCompetitors.length - 1 ? 'text-amber-400' : 'text-zinc-100'}>
                      {c.name}
                      {i === mockCompetitors.length - 1 && ' ★'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{c.door1}</td>
                  <td className="px-6 py-4 text-zinc-300">{c.door2}</td>
                  <td className="px-6 py-4 text-zinc-300">{c.frame}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{c.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
