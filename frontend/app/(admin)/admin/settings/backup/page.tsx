import { Database, Download, Clock, CheckCircle } from 'lucide-react'

const mockBackups = [
  { name: 'دیتابیس', size: '45.2 MB', date: '۱۴۰۳/۰۴/۰۱ ۰۲:۰۰', status: 'موفق' },
  { name: 'فایل‌ها', size: '128.7 MB', date: '۱۴۰۳/۰۴/۰۱ ۰۲:۰۵', status: 'موفق' },
  { name: 'تنظیمات', size: '2.1 KB', date: '۱۴۰۳/۰۴/۰۱ ۰۲:۱۰', status: 'موفق' },
]

export default function BackupPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">پشتیبان‌گیری</h1>
          <p className="text-zinc-400 mt-1">مدیریت نسخه‌های پشتیبان سیستم</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">آخرین پشتیبان‌گیری</p>
              <p className="text-zinc-100 font-semibold mt-1 flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                ۱۴۰۳/۰۴/۰۱ ساعت ۰۲:۱۰
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors">
              <Database size={16} />
              ایجاد پشتیبان جدید
            </button>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-700">
            <h2 className="text-zinc-100 font-semibold">پشتیبان‌های اخیر</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نوع</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">حجم</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockBackups.map((b, i) => (
                <tr key={i} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100 font-medium">{b.name}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{b.size}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{b.date}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle size={14} /> {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm transition-colors">
                      <Download size={14} /> دانلود
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
