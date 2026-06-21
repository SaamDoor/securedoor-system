import { Edit, CheckCircle, AlertCircle } from 'lucide-react'

const mockPages = [
  { id: 1, page: 'صفحه اصلی', title: 'سکیوردور | درب‌های امنیتی', description: 'تامین‌کننده انواع درب‌های ضدسرقت و امنیتی...', keyword: 'درب ضد سرقت', status: 'کامل' },
  { id: 2, page: 'محصولات', title: 'محصولات | سکیوردور', description: 'مشاهده کامل محصولات امنیتی و درب‌ها...', keyword: 'خرید درب امنیتی', status: 'کامل' },
  { id: 3, page: 'درباره ما', title: 'درباره سکیوردور', description: '', keyword: '', status: 'ناقص' },
  { id: 4, page: 'تماس با ما', title: 'تماس | سکیوردور', description: 'راه‌های ارتباط با ما...', keyword: 'تماس با فروشنده درب', status: 'کامل' },
  { id: 5, page: 'وبلاگ', title: 'وبلاگ سکیوردور', description: '', keyword: '', status: 'ناقص' },
]

export default function SeoPagesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تنظیمات سئو صفحات</h1>
          <p className="text-zinc-400 mt-1">مدیریت متا تگ‌ها و کلمات کلیدی صفحات</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">صفحه</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عنوان متا</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">توضیح متا</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">کلمه کلیدی</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockPages.map(p => (
                <tr key={p.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100 font-medium">{p.page}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm max-w-xs">
                    <span className="truncate block">{p.title || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm max-w-xs">
                    <span className="truncate block">{p.description ? p.description.substring(0, 30) + '...' : '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{p.keyword || '—'}</td>
                  <td className="px-6 py-4">
                    {p.status === 'کامل' ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle size={14} /> کامل</span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-400 text-sm"><AlertCircle size={14} /> ناقص</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-amber-400 hover:text-amber-300 transition-colors"><Edit size={16} /></button>
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
