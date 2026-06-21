import { MessageSquare, Edit, Trash2, Clock } from 'lucide-react'

const mockTemplates = [
  { id: 1, name: 'پاسخ اولیه تیکت', category: 'پاسخ تیکت', lastUsed: '۱۴۰۳/۰۴/۰۲' },
  { id: 2, name: 'تأیید سفارش', category: 'سفارش', lastUsed: '۱۴۰۳/۰۴/۰۱' },
  { id: 3, name: 'اطلاع‌رسانی ارسال', category: 'سفارش', lastUsed: '۱۴۰۳/۰۳/۳۰' },
  { id: 4, name: 'پیام خوش‌آمدگویی', category: 'عمومی', lastUsed: '۱۴۰۳/۰۳/۲۵' },
]

export default function TemplatesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">قالب‌های پیام</h1>
            <p className="text-zinc-400 mt-1">پیام‌های از پیش آماده برای پاسخ‌دهی سریع</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors">
            <MessageSquare size={16} />
            قالب جدید
          </button>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام قالب</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">دسته‌بندی</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">آخرین استفاده</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockTemplates.map(t => (
                <tr key={t.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-amber-400" />
                      <span className="text-zinc-100 font-medium">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 bg-zinc-700 text-zinc-300 rounded-full text-xs">{t.category}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm flex items-center gap-1">
                    <Clock size={14} /> {t.lastUsed}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-amber-400 hover:text-amber-300 transition-colors"><Edit size={16} /></button>
                      <button className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={16} /></button>
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
