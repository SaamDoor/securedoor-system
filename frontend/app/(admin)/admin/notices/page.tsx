import { Plus, Bell, AlertTriangle, Newspaper, Trash2 } from 'lucide-react'

const mockNotices = [
  { id: 1, title: 'افزایش قیمت از تیرماه', type: 'هشدار', publishDate: '۱۴۰۳/۰۴/۰۱', expiry: '۱۴۰۳/۰۵/۰۱', status: 'فعال' },
  { id: 2, title: 'تخفیف ویژه عید فطر', type: 'اطلاعیه', publishDate: '۱۴۰۳/۰۳/۱۵', expiry: '۱۴۰۳/۰۳/۳۱', status: 'منقضی' },
  { id: 3, title: 'افتتاح شعبه جدید در اصفهان', type: 'خبر', publishDate: '۱۴۰۳/۰۴/۰۲', expiry: '۱۴۰۳/۰۶/۰۱', status: 'فعال' },
]

const typeConfig: Record<string, { style: string; icon: React.ReactNode }> = {
  'اطلاعیه': { style: 'bg-blue-900/50 text-blue-400', icon: <Bell size={12} /> },
  'هشدار': { style: 'bg-yellow-900/50 text-yellow-400', icon: <AlertTriangle size={12} /> },
  'خبر': { style: 'bg-green-900/50 text-green-400', icon: <Newspaper size={12} /> },
}

export default function NoticesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">اطلاعیه‌ها</h1>
            <p className="text-zinc-400 mt-1">انتشار اطلاعیه‌ها و بنرهای اطلاع‌رسانی به کاربران</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors">
            <Plus size={16} />
            اطلاعیه جدید
          </button>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عنوان</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نوع</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ انتشار</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ انقضا</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockNotices.map(n => {
                const typeCfg = typeConfig[n.type]
                return (
                  <tr key={n.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                    <td className="px-6 py-4 text-zinc-100 font-medium">{n.title}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeCfg.style}`}>
                        {typeCfg.icon} {n.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{n.publishDate}</td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{n.expiry}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        n.status === 'فعال' ? 'bg-green-900/50 text-green-400' : 'bg-zinc-700 text-zinc-400'
                      }`}>
                        {n.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={16} /></button>
                    </td>
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
