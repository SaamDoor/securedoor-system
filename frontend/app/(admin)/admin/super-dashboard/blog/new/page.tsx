import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { BlogForm } from '@/app/(admin)/admin/blog/blog-form'

export default function NewBlogPostPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-5" dir="rtl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/admin/super-dashboard" className="hover:text-zinc-300 transition-colors">داشبورد</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/admin/super-dashboard/blog/posts" className="hover:text-zinc-300 transition-colors">وبلاگ</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-300">نوشته جدید</span>
      </nav>

      <div>
        <h1 className="text-xl font-bold text-zinc-100">نوشته جدید</h1>
        <p className="text-sm text-zinc-500 mt-0.5">پست وبلاگ جدید با تمام قابلیت‌های SEO، AEO و GEO</p>
      </div>

      <BlogForm />
    </div>
  )
}
