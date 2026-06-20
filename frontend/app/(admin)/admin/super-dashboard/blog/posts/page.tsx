import Link from 'next/link'
import {
  Plus, FileText, Eye, Edit, Trash2, Search,
  Calendar, Tag, TrendingUp, Clock,
} from 'lucide-react'

// ── Mock data (replace with Supabase query) ───────────────────────────────────
const MOCK_POSTS = [
  {
    id: '1', title: 'راهنمای انتخاب درب ضد سرقت مناسب برای آپارتمان',
    slug: 'guide-security-door', category: 'راهنمای خرید',
    status: 'published' as const, views: 1240, created_at: '2026-05-10',
    author: 'تیم مشعوف', tags: ['درب', 'امنیت', 'آپارتمان'],
  },
  {
    id: '2', title: 'مقایسه چهارچوب فرانسوی و ایتالیایی',
    slug: 'frame-comparison', category: 'معرفی محصول',
    status: 'published' as const, views: 890, created_at: '2026-05-20',
    author: 'تیم مشعوف', tags: ['چهارچوب', 'فرانسوی'],
  },
  {
    id: '3', title: 'نکات مهم نصب درب ضد سرقت در مازندران',
    slug: 'installation-tips', category: 'نکات نصب',
    status: 'draft' as const, views: 0, created_at: '2026-06-01',
    author: 'تیم مشعوف', tags: ['نصب', 'مازندران'],
  },
  {
    id: '4', title: '۱۴ سال تجربه در ساخت درب ضد سرقت',
    slug: 'company-history', category: 'اخبار شرکت',
    status: 'published' as const, views: 2100, created_at: '2026-04-15',
    author: 'مدیریت', tags: ['شرکت', 'تاریخچه'],
  },
]

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  published: { label: 'منتشرشده',  className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  draft:     { label: 'پیش‌نویس',  className: 'bg-zinc-700/50    text-zinc-400    border-zinc-700'       },
  scheduled: { label: 'زمان‌بندی', className: 'bg-blue-500/15   text-blue-400    border-blue-500/20'    },
}

export default function BlogPostsPage() {
  const published = MOCK_POSTS.filter((p) => p.status === 'published').length
  const drafts    = MOCK_POSTS.filter((p) => p.status === 'draft').length
  const totalViews = MOCK_POSTS.reduce((s, p) => s + p.views, 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">مدیریت وبلاگ</h1>
          <p className="text-sm text-zinc-500 mt-0.5">نوشته‌ها، دسته‌بندی‌ها و کامنت‌ها</p>
        </div>
        <Link
          href="/admin/super-dashboard/blog/new"
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-4 py-2.5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          نوشته جدید
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: FileText,   label: 'کل نوشته‌ها',   value: MOCK_POSTS.length, color: 'text-zinc-300'   },
          { icon: TrendingUp, label: 'منتشرشده',       value: published,          color: 'text-emerald-400' },
          { icon: Clock,      label: 'پیش‌نویس',       value: drafts,             color: 'text-amber-400'  },
          { icon: Eye,        label: 'بازدید کل',      value: totalViews,         color: 'text-blue-400'   },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="h-3.5 w-3.5 text-zinc-600" />
              <span className="text-xs text-zinc-500">{s.label}</span>
            </div>
            <p className={`text-2xl font-black ${s.color}`}>{s.value.toLocaleString('fa-IR')}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        {/* Search row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
            <input
              placeholder="جستجو در نوشته‌ها..."
              className="w-full h-9 rounded-lg border border-zinc-700 bg-zinc-800 pr-9 pl-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>
          <select className="h-9 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-400 focus:outline-none focus:border-amber-500/60 transition-colors">
            <option value="">همه وضعیت‌ها</option>
            <option value="published">منتشرشده</option>
            <option value="draft">پیش‌نویس</option>
          </select>
        </div>

        {/* Posts */}
        <div className="divide-y divide-zinc-800">
          {MOCK_POSTS.map((post) => {
            const st = STATUS_LABEL[post.status]
            return (
              <div key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-zinc-200 truncate">{post.title}</h3>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${st.className}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.created_at).toLocaleDateString('fa-IR')}
                    </span>
                    {post.views > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views.toLocaleString('fa-IR')} بازدید
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/admin/super-dashboard/blog/${post.id}/edit`}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    ویرایش
                  </Link>
                  <button className="flex items-center justify-center w-8 h-8 rounded-lg border border-red-500/20 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
