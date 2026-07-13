'use client'

import { useEffect, useState, useTransition } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { getRedirectsAction, saveRedirectAction } from '../../actions'

export default function SeoRedirectsPage() {
  const [redirects, setRedirects] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getRedirectsAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setRedirects(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function openForm(existing?: Record<string, any>) {
    const fromPath = window.prompt('از مسیر', existing?.from_path ?? existing?.from ?? '')
    if (!fromPath) return
    const toPath = window.prompt('به مسیر', existing?.to_path ?? existing?.to ?? '')
    if (!toPath) return
    const code = window.prompt('کد (301/302)', String(existing?.status_code ?? 301))
    if (!code) return
    startTransition(async () => {
      const result = await saveRedirectAction({
        from_path: fromPath,
        to_path: toPath,
        status_code: Number(code),
        is_active: true,
      }, existing?.id)
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
            <h1 className="text-2xl font-bold text-zinc-100">ریدایرکت‌ها</h1>
            <p className="mt-1 text-zinc-400">مدیریت `redirects`</p>
          </div>
          <button disabled={isPending} onClick={() => openForm()} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-60">
            <Plus size={16} />
            ریدایرکت جدید
          </button>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">از</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400"></th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">به</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">کد</th>
              </tr>
            </thead>
            <tbody>
              {redirects.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-zinc-500">ریدایرکتی وجود ندارد</td></tr>
              ) : redirects.map((item) => (
                <tr key={item.id} onClick={() => openForm(item)} className="cursor-pointer border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-zinc-400">{item.from_path ?? item.from ?? '—'}</td>
                  <td className="px-6 py-4 text-zinc-500"><ArrowLeft size={14} /></td>
                  <td className="px-6 py-4 text-sm font-mono text-zinc-200">{item.to_path ?? item.to ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.status_code ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
