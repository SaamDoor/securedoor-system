import { Plus, BookOpen, Eye, Edit } from 'lucide-react'

const mockArticles = [
  { id: 1, title: 'چگونه سفارش ثبت کنیم؟', category: 'سفارش‌دهی', views: 1240 },
  { id: 2, title: 'روش‌های پرداخت', category: 'مالی', views: 890 },
  { id: 3, title: 'زمان‌بندی نصب', category: 'نصب', views: 654 },
  { id: 4, title: 'گارانتی محصولات', category: 'خدمات پس از فروش', views: 432 },
]

export default function KnowledgeBasePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">پایگاه دانش</h1>
            <p className="text-zinc-400 mt-1">مقالات راهنما و سوالات متداول</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors">
            <Plus size={16} />
            مقاله جدید
          </button>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عنوان مقاله</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">دسته‌بندی</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">بازدید</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockArticles.map(article => (
                <tr key={article.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-amber-400" />
                      <span className="text-zinc-100 font-medium">{article.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 bg-zinc-700 text-zinc-300 rounded-full text-xs">{article.category}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm flex items-center gap-1">
                    <Eye size={14} /> {article.views.toLocaleString('fa')}
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
