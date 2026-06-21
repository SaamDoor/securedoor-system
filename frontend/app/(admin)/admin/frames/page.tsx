import { Edit, Package } from 'lucide-react'

const mockFrames = [
  { id: 1, name: 'Z-پروفیل استاندارد', type: 'فلزی', color: 'سفید', stock: 42, price: '2,800,000 ت' },
  { id: 2, name: 'Z-پروفیل پهن', type: 'فلزی', color: 'مشکی', stock: 18, price: '3,200,000 ت' },
  { id: 3, name: 'آلومینیومی استاندارد', type: 'آلومینیوم', color: 'آنودایز', stock: 12, price: '4,500,000 ت' },
  { id: 4, name: 'فولادی ضد حریق', type: 'فولاد', color: 'خاکستری', stock: 7, price: '6,800,000 ت' },
]

export default function FramesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">کاتالوگ چهارچوب‌ها</h1>
          <p className="text-zinc-400 mt-1">مدیریت چهارچوب‌های درب و مشخصات فنی</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نوع</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">رنگ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">موجودی</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قیمت پایه</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockFrames.map(f => (
                <tr key={f.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-amber-400" />
                      <span className="text-zinc-100 font-medium">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{f.type}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{f.color}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{f.stock} عدد</td>
                  <td className="px-6 py-4 text-amber-400 font-semibold">{f.price}</td>
                  <td className="px-6 py-4">
                    <button className="text-amber-400 hover:text-amber-300 transition-colors"><Edit size={16} /></button>
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
