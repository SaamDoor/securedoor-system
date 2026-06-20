import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { BlogForm } from '@/app/(admin)/admin/blog/blog-form'

interface Props {
  params: { id: string }
}

export default function EditBlogPostPage({ params }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-5" dir="rtl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/admin/super-dashboard" className="hover:text-zinc-300 transition-colors">داشبورد</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/admin/super-dashboard/blog/posts" className="hover:text-zinc-300 transition-colors">وبلاگ</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-300">ویرایش نوشته</span>
      </nav>

      <div>
        <h1 className="text-xl font-bold text-zinc-100">ویرایش نوشته</h1>
        <p className="text-sm text-zinc-500 mt-0.5 font-mono">شناسه: {params.id}</p>
      </div>

      <BlogForm />
    </div>
  )
}
