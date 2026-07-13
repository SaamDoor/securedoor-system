'use client'

import { useEffect, useState, useTransition } from 'react'
import { Edit, FolderOpen, Plus } from 'lucide-react'
import { getBlogCategoriesAction, saveBlogCategoryAction } from '../../actions'

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getBlogCategoriesAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setCategories(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function openForm(existing?: Record<string, any>) {
    const name = window.prompt('نام دسته', existing?.name ?? '')
    if (!name) return
    const slug = window.prompt('اسلاگ', existing?.slug ?? '')
    if (!slug) return
    startTransition(async () => {
      const result = await saveBlogCategoryAction({ name, slug, order: existing?.order ?? 0 }, existing?.id)
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
            <h1 className="text-2xl font-bold text-zinc-100">دسته‌بندی‌های وبلاگ</h1>
            <p className="mt-1 text-zinc-400">متصل به `blog_categories`</p>
          </div>
          <button disabled={isPending} onClick={() => openForm()} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-60">
            <Plus size={16} />
            دسته‌بندی جدید
          </button>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">نام</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">اسلاگ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-sm text-zinc-500">دسته‌ای ثبت نشده است</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100">
                    <div className="flex items-center gap-2">
                      <FolderOpen size={14} className="text-amber-400" />
                      <span>{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-zinc-400">{cat.slug}</td>
                  <td className="px-6 py-4">
                    <button disabled={isPending} onClick={() => openForm(cat)} className="text-amber-400 hover:text-amber-300 disabled:opacity-60"><Edit size={16} /></button>
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
