import { FileText, Eye } from 'lucide-react'

const mockQuotes = [
  { id: 'QT-001', title: 'درب ضد سرقت آپارتمان', user: 'احمد رضایی', date: '۱۴۰۳/۰۴/۰۲', status: 'در انتظار بررسی' },
  { id: 'QT-002', title: 'چهارچوب و درب دوبل ویلایی', user: 'مریم احمدی', date: '۱۴۰۳/۰۴/۰۱', status: 'پیش‌فاکتور ارسال شد' },
  { id: 'QT-003', title: 'درب اتوماتیک پارکینگ', user: 'علی کریمی', date: '۱۴۰۳/۰۳/۳۰', status: 'تأیید شده' },
]

const statusStyle: Record<string, string> = {
  'در انتظار بررسی': 'bg-yellow-900/50 text-yellow-400',
  'پیش‌فاکتور ارسال شد': 'bg-blue-900/50 text-blue-400',
  'تأیید شده': 'bg-green-900/50 text-green-400',
}

export default function QuotesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">درخواست‌های پیش‌فاکتور</h1>
          <p className="text-zinc-400 mt-1">بررسی و صدور پیش‌فاکتور برای درخواست‌های مشتریان</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">شماره پیش‌فاکتور</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عنوان</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">کاربر</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockQuotes.map(q => (
                <tr key={q.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-amber-400 font-mono font-bold">{q.id}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-100 font-medium">{q.title}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{q.user}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{q.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[q.status]}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm transition-colors">
                      <Eye size={14} /> مشاهده
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
