import { Plus, Tag, Trash2 } from 'lucide-react'

const mockTags = [
  { id: 1, name: 'درب ضد سرقت', postCount: 18 },
  { id: 2, name: 'امنیت خانه', postCount: 14 },
  { id: 3, name: 'چهارچوب فلزی', postCount: 11 },
  { id: 4, name: 'نصب درب', postCount: 9 },
  { id: 5, name: 'قفل دیجیتال', postCount: 7 },
  { id: 6, name: 'درب چوبی', postCount: 6 },
  { id: 7, name: 'تعمیر درب', postCount: 4 },
  { id: 8, name: 'درب اتوماتیک', postCount: 3 },
]

export default function BlogTagsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">برچسب‌های وبلاگ</h1>
            <p className="text-zinc-400 mt-1">مدیریت برچسب‌های مقالات</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors">
            <Plus size={16} />
            برچسب جدید
          </button>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-zinc-300 font-medium mb-4">ابر برچسب</h2>
          <div className="flex flex-wrap gap-3">
            {mockTags.map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700 text-zinc-200 rounded-full text-sm"
                style={{ fontSize: `${Math.max(12, Math.min(18, 10 + tag.postCount / 2))}px` }}
              >
                <Tag size={12} className="text-amber-400" />
                {tag.name}
                <span className="text-zinc-500 text-xs">({tag.postCount})</span>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-700">
            <h2 className="text-zinc-100 font-semibold">لیست برچسب‌ها</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام برچسب</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تعداد پست</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockTags.map(tag => (
                <tr key={tag.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-amber-400" />
                      <span className="text-zinc-100">{tag.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{tag.postCount} مقاله</td>
                  <td className="px-6 py-4">
                    <button className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={16} /></button>
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
