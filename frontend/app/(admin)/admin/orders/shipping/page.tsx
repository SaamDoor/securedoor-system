'use client'

import { useEffect, useState, useTransition } from 'react'
import { Edit, Plus, Truck } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { getShippingMethodsAction, saveShippingMethodAction } from '../../actions'

export default function ShippingPage() {
  const [methods, setMethods] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getShippingMethodsAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setMethods(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function openForm(existing?: Record<string, any>) {
    const name = window.prompt('نام روش ارسال', existing?.name ?? '')
    if (!name) return
    const priceInput = window.prompt('قیمت', String(existing?.price ?? 0))
    if (!priceInput) return
    const price = Number(priceInput)
    if (Number.isNaN(price)) return

    startTransition(async () => {
      const result = await saveShippingMethodAction({
        name,
        price,
        delivery_time: existing?.delivery_time ?? '',
        is_active: existing?.is_active ?? true,
      }, existing?.id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      await load()
    })
  }

  function toggleMethod(method: Record<string, any>) {
    startTransition(async () => {
      const result = await saveShippingMethodAction({
        ...method,
        is_active: !method.is_active,
      }, method.id)
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
            <h1 className="text-2xl font-bold text-zinc-100">روش‌های ارسال</h1>
            <p className="mt-1 text-zinc-400">مدیریت `shipping_methods`</p>
          </div>
          <button disabled={isPending} onClick={() => openForm()} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-60">
            <Plus size={16} />
            روش جدید
          </button>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">نام روش</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">قیمت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">زمان تحویل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">وضعیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {methods.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">روشی ثبت نشده است</td></tr>
              ) : methods.map((method) => (
                <tr key={method.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100">
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-amber-400" />
                      <span>{method.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">{formatPrice(Number(method.price ?? 0))}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{method.delivery_time ?? '—'}</td>
                  <td className="px-6 py-4">
                    <button disabled={isPending} onClick={() => toggleMethod(method)} className={`relative h-6 w-12 rounded-full ${method.is_active ? 'bg-amber-500' : 'bg-zinc-600'} disabled:opacity-60`}>
                      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${method.is_active ? 'right-1' : 'right-7'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button disabled={isPending} onClick={() => openForm(method)} className="text-amber-400 disabled:opacity-60"><Edit size={16} /></button>
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
