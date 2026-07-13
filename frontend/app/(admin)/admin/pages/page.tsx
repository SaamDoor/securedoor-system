'use client'

import { useEffect, useState, useTransition } from 'react'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { formatJalaliDate } from '@/lib/utils'
import { deletePageAction, getPagesAction, savePageAction } from '../actions'

export default function PagesPage() {
  const [pages, setPages] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getPagesAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setPages(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function openForm(existing?: Record<string, any>) {
    const title = window.prompt('عنوان صفحه', existing?.title ?? '')
    if (!title) return
    const slug = window.prompt('اسلاگ', existing?.slug ?? '')
    if (!slug) return
    startTransition(async () => {
      const result = await savePageAction({ title, slug, is_published: existing?.is_published ?? true }, existing?.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      await load()
    })
  }

  function removePage(id: string) {
    if (!window.confirm('صفحه حذف شود؟')) return
    startTransition(async () => {
      const result = await deletePageAction(id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      await load()
    })
  }

  return (
    <div className="max-w-[1600px] space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">صفحات ایستا</h1>
          <p className="mt-1 text-sm text-muted">متصل به `pages` با قابلیت ایجاد/ویرایش/حذف</p>
        </div>
        <button disabled={isPending} onClick={() => openForm()} className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-bold text-black disabled:opacity-60">
          <Plus size={16} />
          صفحه جدید
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-white/8 bg-charcoal">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              <th className="px-5 py-3 text-right text-xs text-muted">عنوان</th>
              <th className="px-5 py-3 text-right text-xs text-muted">اسلاگ</th>
              <th className="px-5 py-3 text-right text-xs text-muted">وضعیت</th>
              <th className="px-5 py-3 text-right text-xs text-muted">تاریخ</th>
              <th className="px-5 py-3 text-right text-xs text-muted">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-muted">صفحه‌ای ثبت نشده است</td></tr>
            ) : pages.map((page) => (
              <tr key={page.id} className="border-b border-white/5">
                <td className="px-5 py-3 text-sm text-white">{page.title ?? 'بدون عنوان'}</td>
                <td className="px-5 py-3 text-sm text-muted">{page.slug ?? '—'}</td>
                <td className="px-5 py-3 text-sm text-muted">{page.is_published ? 'منتشرشده' : 'پیش‌نویس'}</td>
                <td className="px-5 py-3 text-sm text-muted">{page.updated_at ? formatJalaliDate(page.updated_at) : '—'}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <button disabled={isPending} onClick={() => openForm(page)} className="text-gold disabled:opacity-60"><Edit size={16} /></button>
                    <button disabled={isPending} onClick={() => removePage(page.id)} className="text-red-400 disabled:opacity-60"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
