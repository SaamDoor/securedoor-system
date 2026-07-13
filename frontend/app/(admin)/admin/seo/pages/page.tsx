'use client'

import { useEffect, useState, useTransition } from 'react'
import { Edit, Plus } from 'lucide-react'
import { getSeoSettingsAction, saveSeoSettingAction } from '../../actions'

export default function SeoPagesPage() {
  const [settings, setSettings] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getSeoSettingsAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSettings(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function openForm(existing?: Record<string, any>) {
    const pageLabel = window.prompt('نام صفحه', existing?.page_label ?? '')
    if (!pageLabel) return
    const metaTitle = window.prompt('Meta Title', existing?.meta_title ?? '')
    if (!metaTitle) return
    const metaDescription = window.prompt('Meta Description', existing?.meta_description ?? '') ?? ''
    startTransition(async () => {
      const result = await saveSeoSettingAction({ page_label: pageLabel, meta_title: metaTitle, meta_description: metaDescription }, existing?.id)
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
            <h1 className="text-2xl font-bold text-zinc-100">تنظیمات سئو صفحات</h1>
            <p className="mt-1 text-zinc-400">متصل به `seo_settings`</p>
          </div>
          <button disabled={isPending} onClick={() => openForm()} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-60">
            <Plus size={16} />
            رکورد جدید
          </button>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">صفحه</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">عنوان متا</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">توضیح</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {settings.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-zinc-500">تنظیمی وجود ندارد</td></tr>
              ) : settings.map((item) => (
                <tr key={item.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100">{item.page_label ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.meta_title ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.meta_description ?? '—'}</td>
                  <td className="px-6 py-4"><button disabled={isPending} onClick={() => openForm(item)} className="text-amber-400 disabled:opacity-60"><Edit size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
