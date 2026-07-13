'use client'

import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { toPersianNumber } from '@/lib/utils'
import { getKbArticlesAction } from '../../actions'

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const result = await getKbArticlesAction()
      if (!result.ok) {
        setError(result.error)
        return
      }
      setArticles(result.data ?? [])
    })()
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">پایگاه دانش</h1>
          <p className="mt-1 text-zinc-400">مقالات راهنمای ثبت‌شده در سیستم</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">عنوان</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">اسلاگ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-sm text-zinc-500">مقاله‌ای ثبت نشده است</td></tr>
              ) : articles.map((article) => (
                <tr key={article.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100">
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-amber-400" />
                      <span>{article.title ?? 'بدون عنوان'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{article.slug ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{article.is_published ? 'منتشرشده' : 'پیش‌نویس'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-zinc-500">{toPersianNumber(articles.length)} مقاله</p>
      </div>
    </div>
  )
}
