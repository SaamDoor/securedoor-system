import { RotateCcw } from 'lucide-react'

const mockReturns = [
  { id: 1, orderId: 'ORD-085', customer: 'احمد رضایی', product: 'درب ضد سرقت استاندارد', reason: 'عدم تطابق با توضیحات', date: '۱۴۰۳/۰۳/۲۵', status: 'در انتظار بررسی' },
  { id: 2, orderId: 'ORD-079', customer: 'مریم احمدی', product: 'چهارچوب فلزی Z-پروفیل', reason: 'آسیب دیدگی در حمل', date: '۱۴۰۳/۰۳/۱۸', status: 'تأیید شده' },
]

const statusStyle: Record<string, string> = {
  'در انتظار بررسی': 'bg-yellow-900/50 text-yellow-400',
  'تأیید شده': 'bg-green-900/50 text-green-400',
  'رد شده': 'bg-red-900/50 text-red-400',
}

export default function ReturnsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">مرجوعی‌ها</h1>
          <p className="text-zinc-400 mt-1">سفارشات برگشتی و درخواست‌های استرداد وجه</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">شماره سفارش</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">مشتری</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">محصول</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">دلیل برگشت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {mockReturns.map(r => (
                <tr key={r.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <RotateCcw size={14} className="text-amber-400" />
                      <span className="text-amber-400 font-mono font-bold">{r.orderId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-100 font-medium">{r.customer}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{r.product}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{r.reason}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{r.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[r.status]}`}>
                      {r.status}
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
