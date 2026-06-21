import { MapPin } from 'lucide-react'

const mockFrameOrders = [
  { id: 'FO-201', type: 'Z-پروفیل استاندارد', qty: 2, address: 'تهران، میدان انقلاب', date: '۱۴۰۳/۰۴/۰۲', status: 'در حال پردازش' },
  { id: 'FO-200', type: 'آلومینیومی استاندارد', qty: 1, address: 'تهران، شهرک غرب', date: '۱۴۰۳/۰۴/۰۱', status: 'تأیید شده' },
  { id: 'FO-199', type: 'فولادی ضد حریق', qty: 3, address: 'کرج، مهرشهر', date: '۱۴۰۳/۰۳/۳۰', status: 'تحویل داده شده' },
]

const statusStyle: Record<string, string> = {
  'در حال پردازش': 'bg-purple-900/50 text-purple-400',
  'تأیید شده': 'bg-blue-900/50 text-blue-400',
  'تحویل داده شده': 'bg-green-900/50 text-green-400',
}

export default function FramesOrdersPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">سفارشات چهارچوب</h1>
          <p className="text-zinc-400 mt-1">پیگیری و مدیریت سفارشات مرتبط با چهارچوب‌ها</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">شماره سفارش</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نوع چهارچوب</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تعداد</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">آدرس نصب</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {mockFrameOrders.map(o => (
                <tr key={o.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-amber-400 font-mono font-bold">{o.id}</td>
                  <td className="px-6 py-4 text-zinc-100 font-medium">{o.type}</td>
                  <td className="px-6 py-4 text-zinc-400">{o.qty} عدد</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm flex items-center gap-1">
                    <MapPin size={14} className="text-amber-400" /> {o.address}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{o.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[o.status]}`}>
                      {o.status}
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
