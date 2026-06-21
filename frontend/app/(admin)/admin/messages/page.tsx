import { MessageSquare, Eye } from 'lucide-react'

const mockMessages = [
  { id: 1, name: 'احمد رضایی', email: 'ahmad@example.com', subject: 'استعلام قیمت درب دوبل', date: '۱۴۰۳/۰۴/۰۲', status: 'جدید' },
  { id: 2, name: 'مریم احمدی', email: 'maryam@example.com', subject: 'سوال درباره ضمانت محصولات', date: '۱۴۰۳/۰۴/۰۱', status: 'خوانده‌شده' },
  { id: 3, name: 'علی کریمی', email: 'ali@example.com', subject: 'درخواست نمایندگی', date: '۱۴۰۳/۰۳/۳۰', status: 'خوانده‌شده' },
  { id: 4, name: 'فاطمه موسوی', email: 'fateme@example.com', subject: 'بازخورد از محصول', date: '۱۴۰۳/۰۳/۲۸', status: 'جدید' },
  { id: 5, name: 'حسن تهرانی', email: 'hasan@example.com', subject: 'سوال درباره نصب', date: '۱۴۰۳/۰۳/۲۵', status: 'خوانده‌شده' },
]

const unreadCount = mockMessages.filter(m => m.status === 'جدید').length

export default function MessagesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              پیام‌های تماس
              {unreadCount > 0 && (
                <span className="bg-amber-500 text-zinc-900 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} جدید</span>
              )}
            </h1>
            <p className="text-zinc-400 mt-1">پیام‌های ارسال‌شده از طریق فرم تماس</p>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام فرستنده</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">ایمیل</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">موضوع</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockMessages.map(m => (
                <tr
                  key={m.id}
                  className={`border-b border-zinc-700/50 transition-colors ${
                    m.status === 'جدید' ? 'bg-zinc-800/80 hover:bg-zinc-700/50' : 'hover:bg-zinc-700/30'
                  }`}
                >
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className={m.status === 'جدید' ? 'text-amber-400' : 'text-zinc-500'} />
                      <span className="text-zinc-100">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{m.email}</td>
                  <td className="px-6 py-4 text-zinc-300">{m.subject}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{m.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      m.status === 'جدید' ? 'bg-amber-900/50 text-amber-400' : 'bg-zinc-700 text-zinc-400'
                    }`}>
                      {m.status}
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
