'use client'

import { useEffect, useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { formatJalaliDate } from '@/lib/utils'
import { getBannersAction, saveBannerAction } from '../actions'

export default function NoticesPage() {
  const [banners, setBanners] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getBannersAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setBanners(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function openForm(existing?: Record<string, any>) {
    const title = window.prompt('عنوان اطلاعیه', existing?.title ?? '')
    if (!title) return
    const type = window.prompt('نوع (info/warning/news)', existing?.type ?? 'info')
    if (!type) return
    startTransition(async () => {
      const result = await saveBannerAction({ title, type, is_active: true }, existing?.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      await load()
    })
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">اطلاعیه‌ها</h1>
            <p className="mt-1 text-zinc-400">نمایش و ویرایش بنرها به عنوان اطلاعیه</p>
          </div>
          <button disabled={isPending} onClick={() => openForm()} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-60">
            <Plus size={16} />
            اطلاعیه جدید
          </button>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">عنوان</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">نوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">وضعیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {banners.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-zinc-500">اطلاعیه‌ای موجود نیست</td></tr>
              ) : banners.map((item) => (
                <tr key={item.id} onClick={() => openForm(item)} className="cursor-pointer border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100">{item.title ?? 'بدون عنوان'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.type ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.is_active ? 'فعال' : 'غیرفعال'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.created_at ? formatJalaliDate(item.created_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
