'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { formatJalaliDate, toPersianNumber } from '@/lib/utils'
import { deleteBlogPostAction, getBlogPostsAction } from '../actions'

export default function BlogPage() {
  const [posts, setPosts] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getBlogPostsAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setPosts(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function removePost(id: string) {
    if (!window.confirm('این نوشته حذف شود؟')) return
    startTransition(async () => {
      const result = await deleteBlogPostAction(id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      await load()
    })
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">مدیریت وبلاگ</h1>
            <p className="mt-1 text-zinc-400">نوشته‌های واقعی جدول `blog_posts`</p>
          </div>
          <Link href="/admin/blog/new" className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-zinc-900 transition-colors hover:bg-amber-400">
            <Plus size={16} />
            نوشته جدید
          </Link>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">عنوان</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">دسته</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">وضعیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">تاریخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">بازدید</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-500">مطلبی ثبت نشده است</td></tr>
              ) : posts.map((post) => (
                <tr key={post.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100">{post.title ?? 'بدون عنوان'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{post.category?.name ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{post.status ?? 'draft'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{formatJalaliDate(post.published_at ?? post.created_at)}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{toPersianNumber(post.view_count ?? 0)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/blog/${post.id}/edit`} className="text-amber-400 hover:text-amber-300"><Edit size={16} /></Link>
                      <button disabled={isPending} onClick={() => removePost(post.id)} className="text-red-400 hover:text-red-300 disabled:opacity-50"><Trash2 size={16} /></button>
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
