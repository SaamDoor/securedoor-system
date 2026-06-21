import { CheckCircle, XCircle, CreditCard } from 'lucide-react'

const mockPayouts = [
  { id: 1, partner: 'احمد رضایی', amount: '625,000 ت', iban: 'IR12 3456 7890 1234 5678 9012', date: '۱۴۰۳/۰۴/۰۲', status: 'در انتظار' },
  { id: 2, partner: 'مریم احمدی', amount: '574,000 ت', iban: 'IR98 7654 3210 9876 5432 1098', date: '۱۴۰۳/۰۴/۰۱', status: 'در انتظار' },
  { id: 3, partner: 'فاطمه موسوی', amount: '900,000 ت', iban: 'IR11 2233 4455 6677 8899 0011', date: '۱۴۰۳/۰۳/۳۰', status: 'پرداخت شد' },
]

const statusStyle: Record<string, string> = {
  'در انتظار': 'bg-yellow-900/50 text-yellow-400',
  'پرداخت شد': 'bg-green-900/50 text-green-400',
  'رد شد': 'bg-red-900/50 text-red-400',
}

export default function PayoutsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">درخواست‌های برداشت</h1>
          <p className="text-zinc-400 mt-1">تأیید یا رد درخواست‌های پرداخت کمیسیون همکاران</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام همکار</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">مبلغ درخواستی</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">شماره شبا</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ درخواست</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockPayouts.map(p => (
                <tr key={p.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100 font-medium">{p.partner}</td>
                  <td className="px-6 py-4 text-amber-400 font-semibold">{p.amount}</td>
                  <td className="px-6 py-4 text-zinc-400 text-xs font-mono">{p.iban}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{p.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.status === 'در انتظار' && (
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm transition-colors">
                          <CheckCircle size={14} /> تأیید
                        </button>
                        <button className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm transition-colors">
                          <XCircle size={14} /> رد
                        </button>
                      </div>
                    )}
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
