import { Edit } from 'lucide-react'

const mockFrames = [
  { id: 1, type: 'Z-پروفیل استاندارد', dims: '۲۱۰×۹۰ سانتی‌متر', basePrice: '2,800,000 ت', installPrice: '400,000 ت', total: '3,200,000 ت' },
  { id: 2, type: 'Z-پروفیل پهن', dims: '۲۱۰×۱۰۰ سانتی‌متر', basePrice: '3,200,000 ت', installPrice: '450,000 ت', total: '3,650,000 ت' },
  { id: 3, type: 'آلومینیومی استاندارد', dims: '۲۱۰×۹۰ سانتی‌متر', basePrice: '4,500,000 ت', installPrice: '500,000 ت', total: '5,000,000 ت' },
  { id: 4, type: 'آلومینیومی دوبل', dims: '۲۱۰×۱۸۰ سانتی‌متر', basePrice: '8,200,000 ت', installPrice: '800,000 ت', total: '9,000,000 ت' },
  { id: 5, type: 'فولادی ضد حریق', dims: '۲۱۰×۹۰ سانتی‌متر', basePrice: '6,800,000 ت', installPrice: '600,000 ت', total: '7,400,000 ت' },
  { id: 6, type: 'فولادی ضد حریق دوبل', dims: '۲۱۰×۱۸۰ سانتی‌متر', basePrice: '12,500,000 ت', installPrice: '1,200,000 ت', total: '13,700,000 ت' },
]

export default function FramePricingPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">لیست قیمت چهارچوب</h1>
          <p className="text-zinc-400 mt-1">جدول قیمت‌گذاری انواع چهارچوب‌ها</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نوع چهارچوب</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">ابعاد</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قیمت پایه</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قیمت نصب</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قیمت کل</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockFrames.map(f => (
                <tr key={f.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100 font-medium">{f.type}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{f.dims}</td>
                  <td className="px-6 py-4 text-zinc-400">{f.basePrice}</td>
                  <td className="px-6 py-4 text-zinc-400">{f.installPrice}</td>
                  <td className="px-6 py-4 text-amber-400 font-semibold">{f.total}</td>
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
