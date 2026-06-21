'use client'
import { Users, TrendingUp, Clock, Eye } from 'lucide-react'

const weeklyData = [
  { day: 'شنبه', value: 65 },
  { day: 'یکشنبه', value: 80 },
  { day: 'دوشنبه', value: 90 },
  { day: 'سه‌شنبه', value: 72 },
  { day: 'چهارشنبه', value: 100 },
  { day: 'پنجشنبه', value: 55 },
  { day: 'جمعه', value: 30 },
]

const kpis = [
  { label: 'بازدیدکننده امروز', value: '۱,۲۴۰', icon: <Users size={20} className="text-amber-400" />, change: '+۸%' },
  { label: 'نرخ تبدیل', value: '۳.۲%', icon: <TrendingUp size={20} className="text-green-400" />, change: '+۰.۵%' },
  { label: 'میانگین زمان در سایت', value: '۴:۳۲', icon: <Clock size={20} className="text-blue-400" />, change: '+۱۲%' },
  { label: 'صفحات بازدیدشده', value: '۴.۸', icon: <Eye size={20} className="text-purple-400" />, change: '+۲%' },
]

export default function AnalyticsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">آمار و تحلیل</h1>
          <p className="text-zinc-400 mt-1">نمودارها و آمار ترافیک و رفتار کاربران</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                {kpi.icon}
                <span className="text-green-400 text-xs font-medium">{kpi.change}</span>
              </div>
              <p className="text-zinc-400 text-sm mb-1">{kpi.label}</p>
              <p className="text-zinc-100 font-bold text-2xl">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-zinc-800 rounded-xl p-6">
          <h2 className="text-zinc-100 font-semibold mb-6">بازدید هفتگی</h2>
          <div className="flex items-end gap-4 h-48">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-amber-500 rounded-t-md hover:bg-amber-400 transition-colors"
                  style={{ height: `${d.value}%` }}
                />
                <span className="text-zinc-400 text-xs">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
