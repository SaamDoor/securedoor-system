import Link from 'next/link'
import { FolderOpen, ExternalLink } from 'lucide-react'

const mockCategories = [
  { id: 1, name: 'درب‌های ضد سرقت', slug: 'security-doors', count: 8, status: 'فعال' },
  { id: 2, name: 'چهارچوب‌ها', slug: 'frames', count: 12, status: 'فعال' },
  { id: 3, name: 'درب‌های اتوماتیک', slug: 'automatic-doors', count: 5, status: 'فعال' },
  { id: 4, name: 'درب‌های چوبی', slug: 'wooden-doors', count: 3, status: 'غیرفعال' },
  { id: 5, name: 'متعلقات و لوازم', slug: 'accessories', count: 24, status: 'فعال' },
]

export default function ProductCategoriesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">دسته‌بندی محصولات</h1>
            <p className="text-zinc-400 mt-1">مدیریت دسته‌بندی‌های محصولات</p>
          </div>
          <Link
            href="/admin/categories"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
          >
            <ExternalLink size={16} />
            مدیریت دسته‌بندی‌ها
          </Link>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام دسته</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">اسلاگ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تعداد محصول</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
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
                  <td className="px-6 py-4 text-zinc-400 text-sm">{cat.count} محصول</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cat.status === 'فعال' ? 'bg-green-900/50 text-green-400' : 'bg-zinc-700 text-zinc-400'
                    }`}>
                      {cat.status}
                    </span>
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
