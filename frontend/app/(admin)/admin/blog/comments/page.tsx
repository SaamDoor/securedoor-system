'use client'

import { useEffect, useState, useTransition } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { formatJalaliDate } from '@/lib/utils'
import { getBlogCommentsAction, setBlogCommentApprovedAction } from '../../actions'

export default function BlogCommentsPage() {
  const [comments, setComments] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getBlogCommentsAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setComments(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function setApproved(id: string, approved: boolean) {
    startTransition(async () => {
      const result = await setBlogCommentApprovedAction(id, approved)
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">مدیریت نظرات</h1>
          <p className="mt-1 text-zinc-400">بررسی نظرات `blog_comments`</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">کاربر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">نظر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">مقاله</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">وضعیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">تاریخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-zinc-500">نظری ثبت نشده است</td></tr>
              ) : comments.map((comment) => (
                <tr key={comment.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-200">{comment.author_name ?? 'ناشناس'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{comment.content}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{comment.post?.title ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{comment.is_approved ? 'تأییدشده' : 'در انتظار'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{comment.created_at ? formatJalaliDate(comment.created_at) : '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button disabled={isPending} onClick={() => setApproved(comment.id, true)} className="text-green-400 hover:text-green-300 disabled:opacity-60"><CheckCircle size={16} /></button>
                      <button disabled={isPending} onClick={() => setApproved(comment.id, false)} className="text-red-400 hover:text-red-300 disabled:opacity-60"><XCircle size={16} /></button>
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
