import { UserX, ShieldOff } from 'lucide-react'

const mockBlocked = [
  { id: 1, name: 'کاربر ناشناس ۱', email: 'spam@example.com', reason: 'ارسال پیام‌های اسپم', blockedDate: '۱۴۰۳/۰۳/۲۰' },
  { id: 2, name: 'مهرداد آزادی', email: 'mehrdad@example.com', reason: 'سوء استفاده از کوپن تخفیف', blockedDate: '۱۴۰۳/۰۲/۱۵' },
]

export default function BlockedUsersPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">کاربران مسدود</h1>
          <p className="text-zinc-400 mt-1">مدیریت کاربران مسدودشده و رفع انسداد</p>
        </div>

        {mockBlocked.length === 0 ? (
          <div className="bg-zinc-800 rounded-xl p-16 text-center">
            <ShieldOff size={48} className="text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">کاربری مسدود نشده است</p>
          </div>
        ) : (
          <div className="bg-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام</th>
                  <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">ایمیل</th>
                  <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">دلیل بلاک</th>
                  <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                  <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {mockBlocked.map(u => (
                  <tr key={u.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserX size={16} className="text-red-400" />
                        <span className="text-zinc-100 font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{u.email}</td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{u.reason}</td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{u.blockedDate}</td>
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm transition-colors">
                        <ShieldOff size={14} /> رفع بلاک
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
