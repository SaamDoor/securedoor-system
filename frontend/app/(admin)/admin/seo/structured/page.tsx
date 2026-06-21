import { Code, CheckCircle, Edit } from 'lucide-react'

const mockStructured = [
  { id: 1, type: 'Organization', page: 'صفحه اصلی', status: 'فعال' },
  { id: 2, type: 'Product', page: 'صفحه محصول درب ضد سرقت', status: 'فعال' },
  { id: 3, type: 'FAQ', page: 'سوالات متداول', status: 'فعال' },
  { id: 4, type: 'BreadcrumbList', page: 'تمام صفحات', status: 'غیرفعال' },
]

export default function SeoStructuredPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">داده ساختاریافته</h1>
          <p className="text-zinc-400 mt-1">مدیریت Schema.org JSON-LD برای بهبود نتایج جستجو</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نوع</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">صفحه</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockStructured.map(s => (
                <tr key={s.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Code size={16} className="text-amber-400" />
                      <span className="text-amber-400 font-mono font-bold">{s.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{s.page}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 text-sm ${s.status === 'فعال' ? 'text-green-400' : 'text-zinc-500'}`}>
                      <CheckCircle size={14} /> {s.status}
                    </span>
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
