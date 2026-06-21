'use client'
import { TrendingUp, DollarSign, Calendar } from 'lucide-react'

const monthlyData = [
  { month: 'بهمن', value: 85 },
  { month: 'اسفند', value: 62 },
  { month: 'فروردین', value: 78 },
  { month: 'اردیبهشت', value: 91 },
  { month: 'خرداد', value: 74 },
  { month: 'تیر', value: 100 },
]

export default function RevenuePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">گزارش درآمد</h1>
          <p className="text-zinc-400 mt-1">تحلیل درآمد و فروش</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'درآمد امروز', value: '۸,۵۰۰,۰۰۰ ت', icon: <DollarSign size={20} className="text-amber-400" />, change: '+۱۲%' },
            { label: 'این ماه', value: '۱۴۲,۰۰۰,۰۰۰ ت', icon: <Calendar size={20} className="text-blue-400" />, change: '+۸%' },
            { label: 'این سال', value: '۱,۲۸۴,۰۰۰,۰۰۰ ت', icon: <TrendingUp size={20} className="text-green-400" />, change: '+۲۳%' },
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
          <h2 className="text-zinc-100 font-semibold mb-6">نمودار درآمد ۶ ماهه</h2>
          <div className="flex items-end gap-4 h-48">
            {monthlyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-zinc-400 text-xs">{d.value}%</span>
                <div
                  className="w-full bg-amber-500 rounded-t-md transition-all hover:bg-amber-400"
                  style={{ height: `${d.value}%` }}
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
