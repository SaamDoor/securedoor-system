import { Edit } from 'lucide-react'

const mockProducts = [
  { id: 1, name: 'درب ضد سرقت استاندارد', current: '8,500,000 ت', compare: '9,500,000 ت', lastChange: '۱۴۰۳/۰۴/۰۱' },
  { id: 2, name: 'درب ضد سرقت دوبل', current: '14,200,000 ت', compare: '16,000,000 ت', lastChange: '۱۴۰۳/۰۳/۲۸' },
  { id: 3, name: 'درب چوبی MDF', current: '5,800,000 ت', compare: '—', lastChange: '۱۴۰۳/۰۳/۱۵' },
  { id: 4, name: 'درب اتوماتیک پارکینگ', current: '22,000,000 ت', compare: '24,500,000 ت', lastChange: '۱۴۰۳/۰۲/۲۰' },
  { id: 5, name: 'چهارچوب فلزی Z-پروفیل', current: '3,200,000 ت', compare: '—', lastChange: '۱۴۰۳/۰۴/۰۲' },
]

export default function ProductPricingPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">قیمت‌گذاری محصولات</h1>
          <p className="text-zinc-400 mt-1">مدیریت قیمت محصولات و قیمت‌های مقایسه‌ای</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام محصول</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قیمت فعلی</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قیمت مقایسه</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">آخرین تغییر</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map(p => (
                <tr key={p.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-zinc-100 font-semibold">{p.current}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm line-through">{p.compare}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{p.lastChange}</td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm transition-colors">
                      <Edit size={14} /> ویرایش
                    </button>
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
