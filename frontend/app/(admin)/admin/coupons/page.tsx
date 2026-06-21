import { Plus, Edit, Trash2, Tag } from 'lucide-react'

const mockCoupons = [
  { id: 1, code: 'SUMMER10', type: 'درصد', value: '10%', expiry: '۱۴۰۳/۰۶/۳۱', uses: 42, status: 'فعال' },
  { id: 2, code: 'NEWUSER50', type: 'مبلغ', value: '۵۰,۰۰۰ ت', expiry: '۱۴۰۳/۰۵/۳۱', uses: 18, status: 'فعال' },
  { id: 3, code: 'VIP20', type: 'درصد', value: '20%', expiry: '۱۴۰۳/۰۴/۱۵', uses: 7, status: 'منقضی' },
  { id: 4, code: 'INSTALL100', type: 'مبلغ', value: '۱۰۰,۰۰۰ ت', expiry: '۱۴۰۳/۰۷/۰۱', uses: 0, status: 'غیرفعال' },
]

const statusStyle: Record<string, string> = {
  'فعال': 'bg-green-900/50 text-green-400',
  'منقضی': 'bg-red-900/50 text-red-400',
  'غیرفعال': 'bg-zinc-700 text-zinc-400',
}

export default function CouponsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">کوپن‌های تخفیف</h1>
            <p className="text-zinc-400 mt-1">مدیریت کدهای تخفیف و کوپن‌ها</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors">
            <Plus size={16} />
            کوپن جدید
          </button>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">کد تخفیف</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نوع</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">مقدار</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ انقضا</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تعداد استفاده</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockCoupons.map(coupon => (
                <tr key={coupon.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-amber-400" />
                      <span className="text-amber-400 font-mono font-bold">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{coupon.type}</td>
                  <td className="px-6 py-4 text-zinc-100 font-medium">{coupon.value}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{coupon.expiry}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{coupon.uses} بار</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[coupon.status]}`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-amber-400 hover:text-amber-300 transition-colors"><Edit size={16} /></button>
                      <button className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={16} /></button>
                    </div>
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
