import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react'

const mockCategories = [
  { id: 1, name: 'آموزشی', slug: 'educational', postCount: 12 },
  { id: 2, name: 'مقایسه محصولات', slug: 'comparison', postCount: 7 },
  { id: 3, name: 'نگهداری', slug: 'maintenance', postCount: 5 },
  { id: 4, name: 'اخبار شرکت', slug: 'news', postCount: 3 },
]

export default function BlogCategoriesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">دسته‌بندی‌های وبلاگ</h1>
            <p className="text-zinc-400 mt-1">مدیریت دسته‌بندی مقالات</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors">
            <Plus size={16} />
            دسته‌بندی جدید
          </button>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام دسته‌بندی</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">اسلاگ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تعداد پست</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockCategories.map(cat => (
                <tr key={cat.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FolderOpen size={16} className="text-amber-400" />
                      <span className="text-zinc-100 font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm font-mono">{cat.slug}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{cat.postCount} مقاله</td>
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
