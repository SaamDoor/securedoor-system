'use client'

import { useEffect, useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { getFaqsAction, saveFaqAction } from '../actions'

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getFaqsAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setFaqs(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function openForm(existing?: Record<string, any>) {
    const question = window.prompt('سوال', existing?.question ?? '')
    if (!question) return
    const answer = window.prompt('پاسخ', existing?.answer ?? '')
    if (!answer) return
    startTransition(async () => {
      const result = await saveFaqAction({ question, answer, is_active: true }, existing?.id)
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
          <h1 className="text-2xl font-black text-white">سوالات متداول</h1>
          <p className="mt-1 text-sm text-muted">اتصال به `faqs` با ذخیره از طریق server action</p>
        </div>
        <button disabled={isPending} onClick={() => openForm()} className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-bold text-black disabled:opacity-60">
          <Plus size={16} />
          سوال جدید
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      <div className="space-y-3">
        {faqs.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-charcoal p-8 text-center text-sm text-muted">سوالی ثبت نشده است</div>
        ) : faqs.map((faq) => (
          <button key={faq.id} onClick={() => openForm(faq)} className="w-full rounded-2xl border border-white/8 bg-charcoal p-4 text-right">
            <div className="font-bold text-white">{faq.question}</div>
            <div className="mt-2 text-sm text-muted">{faq.answer}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
