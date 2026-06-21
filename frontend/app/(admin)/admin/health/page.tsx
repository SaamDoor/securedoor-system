import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

const mockServices = [
  { id: 1, name: 'وب‌سرور (Next.js)', status: 'سالم', responseTime: '45ms', lastCheck: '۱۴۰۳/۰۴/۰۲ ۱۴:۵۰' },
  { id: 2, name: 'پایگاه داده (PostgreSQL)', status: 'سالم', responseTime: '12ms', lastCheck: '۱۴۰۳/۰۴/۰۲ ۱۴:۵۰' },
  { id: 3, name: 'Redis Cache', status: 'سالم', responseTime: '3ms', lastCheck: '۱۴۰۳/۰۴/۰۲ ۱۴:۵۰' },
  { id: 4, name: 'ذخیره‌سازی فایل (S3)', status: 'هشدار', responseTime: '320ms', lastCheck: '۱۴۰۳/۰۴/۰۲ ۱۴:۴۵' },
  { id: 5, name: 'درگاه پرداخت', status: 'سالم', responseTime: '150ms', lastCheck: '۱۴۰۳/۰۴/۰۲ ۱۴:۵۰' },
  { id: 6, name: 'سرویس ارسال ایمیل (SMTP)', status: 'قطع', responseTime: '—', lastCheck: '۱۴۰۳/۰۴/۰۲ ۱۴:۳۰' },
]

const statusConfig: Record<string, { style: string; icon: React.ReactNode }> = {
  'سالم': { style: 'text-green-400', icon: <CheckCircle size={16} /> },
  'هشدار': { style: 'text-yellow-400', icon: <AlertTriangle size={16} /> },
  'قطع': { style: 'text-red-400', icon: <XCircle size={16} /> },
}

export default function HealthPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">وضعیت سیستم</h1>
            <p className="text-zinc-400 mt-1">پایش سلامت سرویس‌ها و زیرساخت</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 transition-colors">
            <RefreshCw size={16} />
            بررسی مجدد
          </button>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">سرویس</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">زمان پاسخ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">آخرین بررسی</th>
              </tr>
            </thead>
            <tbody>
              {mockServices.map(s => {
                const cfg = statusConfig[s.status]
                return (
                  <tr key={s.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                    <td className="px-6 py-4 text-zinc-100 font-medium">{s.name}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${cfg.style}`}>
                        {cfg.icon} {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-sm">{s.responseTime}</td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{s.lastCheck}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
