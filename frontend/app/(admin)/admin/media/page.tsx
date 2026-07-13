'use client'

import { useEffect, useState } from 'react'
import { FileText, Image } from 'lucide-react'
import { toPersianNumber } from '@/lib/utils'
import { getMediaAction } from '../actions'

function formatBytes(size: number | null | undefined) {
  if (!size) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaPage() {
  const [media, setMedia] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const result = await getMediaAction()
      if (!result.ok) {
        setError(result.error)
        return
      }
      setMedia(result.data ?? [])
    })()
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">کتابخانه رسانه</h1>
          <p className="mt-1 text-zinc-400">فایل‌های ثبت‌شده در پایگاه داده</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        {media.length === 0 ? (
          <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-8 text-center text-sm text-zinc-500">رسانه‌ای ثبت نشده است</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {media.map((item) => {
              const isImage = (item.mime_type ?? '').startsWith('image/')
              return (
                <div key={item.id} className="group overflow-hidden rounded-xl bg-zinc-800 transition-colors hover:bg-zinc-700">
                  <div className="flex aspect-square items-center justify-center bg-zinc-700">
                    {isImage ? <Image size={40} className="text-zinc-500 group-hover:text-amber-400" /> : <FileText size={40} className="text-zinc-500 group-hover:text-amber-400" />}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-zinc-200">{item.file_name ?? item.alt_text ?? 'فایل'}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{formatBytes(item.file_size)}</span>
                      <span className="rounded px-1.5 py-0.5 text-xs text-zinc-400">{isImage ? 'تصویر' : 'فایل'}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="mt-3 text-xs text-zinc-500">{toPersianNumber(media.length)} فایل</p>
      </div>
    </div>
  )
}
