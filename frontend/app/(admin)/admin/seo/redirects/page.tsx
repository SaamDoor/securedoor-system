import { Plus, ArrowLeft, Trash2 } from 'lucide-react'

const mockRedirects = [
  { id: 1, from: '/old-products', to: '/products', type: '301', status: 'فعال' },
  { id: 2, from: '/doors', to: '/products/security-doors', type: '301', status: 'فعال' },
  { id: 3, from: '/blog-old', to: '/blog', type: '302', status: 'غیرفعال' },
]

export default function SeoRedirectsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">ریدایرکت‌ها</h1>
            <p className="text-zinc-400 mt-1">مدیریت هدایت‌های 301 و 302</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors">
            <Plus size={16} />
            ریدایرکت جدید
          </button>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">از URL</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3"></th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">به URL</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نوع</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockRedirects.map(r => (
                <tr key={r.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-400 font-mono text-sm">{r.from}</td>
                  <td className="px-6 py-4 text-zinc-500"><ArrowLeft size={14} /></td>
                  <td className="px-6 py-4 text-zinc-300 font-mono text-sm">{r.to}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${r.type === '301' ? 'bg-blue-900/50 text-blue-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${r.status === 'فعال' ? 'text-green-400' : 'text-zinc-500'}`}>{r.status}</span>
                  </td>
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
