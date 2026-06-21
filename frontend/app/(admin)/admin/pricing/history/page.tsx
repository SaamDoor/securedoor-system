import { ArrowLeft } from 'lucide-react'

const mockHistory = [
  { id: 1, product: 'درب ضد سرقت استاندارد', before: '7,800,000 ت', after: '8,500,000 ت', by: 'ادمین', date: '۱۴۰۳/۰۴/۰۱' },
  { id: 2, product: 'درب اتوماتیک پارکینگ', before: '20,000,000 ت', after: '22,000,000 ت', by: 'مدیر', date: '۱۴۰۳/۰۲/۲۰' },
  { id: 3, product: 'درب چوبی MDF', before: '5,200,000 ت', after: '5,800,000 ت', by: 'ادمین', date: '۱۴۰۳/۰۳/۱۵' },
  { id: 4, product: 'چهارچوب فلزی Z-پروفیل', before: '2,900,000 ت', after: '3,200,000 ت', by: 'مدیر', date: '۱۴۰۳/۰۴/۰۲' },
  { id: 5, product: 'درب ضد سرقت دوبل', before: '13,000,000 ت', after: '14,200,000 ت', by: 'ادمین', date: '۱۴۰۳/۰۳/۲۸' },
]

export default function PriceHistoryPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تاریخچه تغییر قیمت</h1>
          <p className="text-zinc-400 mt-1">لاگ تمام تغییرات قیمت با تاریخ و کاربر</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">محصول</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قیمت قبل</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3"></th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قیمت جدید</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تغییر توسط</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {mockHistory.map(h => (
                <tr key={h.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100 font-medium">{h.product}</td>
                  <td className="px-6 py-4 text-red-400 line-through text-sm">{h.before}</td>
                  <td className="px-6 py-4 text-zinc-500"><ArrowLeft size={14} /></td>
                  <td className="px-6 py-4 text-green-400 font-semibold">{h.after}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{h.by}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{h.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
