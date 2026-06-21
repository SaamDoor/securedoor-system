import Link from 'next/link'
import { Plus, Eye, Edit, Trash2 } from 'lucide-react'

const mockPosts = [
  { id: 1, title: 'راهنمای انتخاب درب ضد سرقت', category: 'آموزشی', status: 'منتشرشده', date: '۱۴۰۳/۰۴/۰۱', views: 1240 },
  { id: 2, title: 'تفاوت درب‌های چوبی و فلزی', category: 'مقایسه', status: 'پیش‌نویس', date: '۱۴۰۳/۰۳/۲۸', views: 0 },
  { id: 3, title: 'نکات نگهداری از درب‌های امنیتی', category: 'نگهداری', status: 'منتشرشده', date: '۱۴۰۳/۰۳/۱۵', views: 852 },
]

export default function BlogPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">مدیریت وبلاگ</h1>
            <p className="text-zinc-400 mt-1">نوشته‌های وبلاگ را مدیریت کنید</p>
          </div>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
          >
            <Plus size={16} />
            نوشته جدید
          </Link>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عنوان</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">دسته‌بندی</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">بازدید</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockPosts.map(post => (
                <tr key={post.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100 font-medium">{post.title}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{post.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'منتشرشده'
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{post.date}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm flex items-center gap-1">
                    <Eye size={14} /> {post.views.toLocaleString('fa')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/blog/${post.id}/edit`} className="text-amber-400 hover:text-amber-300 transition-colors">
                        <Edit size={16} />
                      </Link>
                      <button className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 size={16} />
                      </button>
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
