import { CheckCircle, XCircle, UserPlus } from 'lucide-react'

const mockRequests = [
  { id: 1, name: 'احمد رضایی', email: 'ahmad@example.com', phone: '09121234567', date: '۱۴۰۳/۰۴/۰۲', reason: 'درخواست ارتقا به سطح انبوه‌ساز' },
  { id: 2, name: 'مریم احمدی', email: 'maryam@example.com', phone: '09351234567', date: '۱۴۰۳/۰۴/۰۱', reason: 'ثبت‌نام جدید به عنوان فروشنده' },
  { id: 3, name: 'علی کریمی', email: 'ali@example.com', phone: '09901234567', date: '۱۴۰۳/۰۳/۳۰', reason: 'درخواست همکاری و ارجاع مشتری' },
]

export default function UsersRequestsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">درخواست‌های عضویت</h1>
          <p className="text-zinc-400 mt-1">تأیید یا رد درخواست‌های ثبت‌نام و ارتقا سطح</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">ایمیل</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تلفن</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">دلیل درخواست</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockRequests.map(r => (
                <tr key={r.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <UserPlus size={16} className="text-amber-400" />
                      <span className="text-zinc-100 font-medium">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{r.email}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{r.phone}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{r.date}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{r.reason}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm transition-colors">
                        <CheckCircle size={14} /> تأیید
                      </button>
                      <button className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm transition-colors">
                        <XCircle size={14} /> رد
                      </button>
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
