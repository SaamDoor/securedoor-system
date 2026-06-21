import { AlertCircle, Clock, CheckCircle } from 'lucide-react'

const mockTickets = [
  { id: 1, subject: 'مشکل در پرداخت آنلاین', user: 'احمد رضایی', priority: 'فوری', status: 'باز', date: '۱۴۰۳/۰۴/۰۲' },
  { id: 2, subject: 'سوال درباره زمان تحویل', user: 'مریم احمدی', priority: 'معمولی', status: 'در حال بررسی', date: '۱۴۰۳/۰۴/۰۱' },
  { id: 3, subject: 'درخواست تغییر رنگ درب', user: 'علی کریمی', priority: 'بالا', status: 'در حال بررسی', date: '۱۴۰۳/۰۳/۳۰' },
  { id: 4, subject: 'مشکل در ثبت سفارش', user: 'فاطمه موسوی', priority: 'بالا', status: 'بسته', date: '۱۴۰۳/۰۳/۲۸' },
  { id: 5, subject: 'استعلام قیمت درب ضد حریق', user: 'حسن تهرانی', priority: 'معمولی', status: 'باز', date: '۱۴۰۳/۰۳/۲۵' },
]

const priorityStyle: Record<string, string> = {
  'فوری': 'bg-red-900/50 text-red-400',
  'بالا': 'bg-orange-900/50 text-orange-400',
  'معمولی': 'bg-zinc-700 text-zinc-400',
}

const statusStyle: Record<string, string> = {
  'باز': 'bg-blue-900/50 text-blue-400',
  'در حال بررسی': 'bg-yellow-900/50 text-yellow-400',
  'بسته': 'bg-zinc-700 text-zinc-400',
}

export default function TicketsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تیکت‌های پشتیبانی</h1>
          <p className="text-zinc-400 mt-1">بررسی و پاسخ به تیکت‌های کاربران</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'تیکت‌های باز', count: 2, icon: <AlertCircle size={20} className="text-blue-400" /> },
            { label: 'در حال بررسی', count: 2, icon: <Clock size={20} className="text-yellow-400" /> },
            { label: 'بسته‌شده', count: 1, icon: <CheckCircle size={20} className="text-green-400" /> },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-800 rounded-xl p-4 flex items-center gap-3">
              {stat.icon}
              <div>
                <p className="text-zinc-400 text-sm">{stat.label}</p>
                <p className="text-zinc-100 font-bold text-xl">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">موضوع</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">کاربر</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">اولویت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {mockTickets.map(ticket => (
                <tr key={ticket.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-zinc-100 font-medium">{ticket.subject}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{ticket.user}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyle[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{ticket.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
