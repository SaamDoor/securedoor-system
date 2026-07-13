'use client'

import { useEffect, useState, useTransition } from 'react'
import { Plus, Tag } from 'lucide-react'
import { getBlogTagsAction, saveBlogTagAction } from '../../actions'

export default function BlogTagsPage() {
  const [tags, setTags] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getBlogTagsAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setTags(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function openForm(existing?: Record<string, any>) {
    const name = window.prompt('نام برچسب', existing?.name ?? '')
    if (!name) return
    const slug = window.prompt('اسلاگ', existing?.slug ?? '')
    if (!slug) return
    startTransition(async () => {
      const result = await saveBlogTagAction({ name, slug }, existing?.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      await load()
    })
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">برچسب‌های وبلاگ</h1>
            <p className="mt-1 text-zinc-400">متصل به `blog_tags`</p>
          </div>
          <button disabled={isPending} onClick={() => openForm()} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-60">
            <Plus size={16} />
            برچسب جدید
          </button>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="mb-6 rounded-xl bg-zinc-800 p-6">
          <h2 className="mb-4 font-medium text-zinc-300">ابر برچسب</h2>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <button key={tag.id} onClick={() => openForm(tag)} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-700 px-3 py-1.5 text-sm text-zinc-200">
                <Tag size={12} className="text-amber-400" />
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">نام</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">اسلاگ</th>
              </tr>
            </thead>
            <tbody>
              {tags.length === 0 ? (
                <tr><td colSpan={2} className="px-6 py-10 text-center text-sm text-zinc-500">برچسبی ثبت نشده است</td></tr>
              ) : tags.map((tag) => (
                <tr key={tag.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100">{tag.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{tag.slug ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
