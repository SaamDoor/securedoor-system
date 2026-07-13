'use client'

import { useEffect, useState, useTransition } from 'react'
import { Edit, Plus, RefreshCw, Webhook } from 'lucide-react'
import { formatJalaliDate, toPersianNumber } from '@/lib/utils'
import { getWebhooksAction, saveWebhookAction } from '../actions'

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getWebhooksAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setWebhooks(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function openForm(existing?: Record<string, any>) {
    const name = window.prompt('نام وب‌هوک', existing?.name ?? '')
    if (!name) return
    const url = window.prompt('آدرس URL', existing?.url ?? '')
    if (!url) return
    startTransition(async () => {
      const result = await saveWebhookAction({
        name,
        url,
        is_active: existing?.is_active ?? true,
      }, existing?.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      await load()
    })
  }

  function toggleActive(item: Record<string, any>) {
    startTransition(async () => {
      const result = await saveWebhookAction({ ...item, is_active: !item.is_active }, item.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      await load()
    })
  }

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت وب‌هوک‌ها</h1>
          <p className="text-sm text-[#A0A0A0]">{toPersianNumber(webhooks.length)} وب‌هوک</p>
        </div>
        <button disabled={isPending} onClick={() => openForm()} className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-black disabled:opacity-60">
          <Plus size={16} />
          وب‌هوک جدید
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      <div className="space-y-3">
        {webhooks.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-[#181818] p-8 text-center text-sm text-[#A0A0A0]">وب‌هوکی ثبت نشده است</div>
        ) : webhooks.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/8 bg-[#181818] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Webhook size={16} className="text-gold" />
                <span>{item.name ?? 'بدون نام'}</span>
              </div>
              <span className="text-xs text-[#A0A0A0]">{item.is_active ? 'فعال' : 'غیرفعال'}</span>
            </div>
            <div className="mb-3 text-xs text-[#A0A0A0]">{item.url}</div>
            <div className="text-xs text-[#A0A0A0]">آخرین بروزرسانی: {item.updated_at ? formatJalaliDate(item.updated_at) : '—'}</div>
            <div className="mt-3 flex items-center gap-2">
              <button disabled={isPending} onClick={() => toggleActive(item)} className="rounded-lg border border-white/10 p-2 text-[#A0A0A0] hover:text-white disabled:opacity-60"><RefreshCw size={14} /></button>
              <button disabled={isPending} onClick={() => openForm(item)} className="rounded-lg border border-white/10 p-2 text-[#A0A0A0] hover:text-gold disabled:opacity-60"><Edit size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
