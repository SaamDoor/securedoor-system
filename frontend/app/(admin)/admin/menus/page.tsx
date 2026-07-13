'use client'

import { useEffect, useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { getMenusAction, saveMenuAction } from '../actions'

export default function MenusPage() {
  const [menus, setMenus] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getMenusAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setMenus(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function openForm(existing?: Record<string, any>) {
    const name = window.prompt('نام منو', existing?.name ?? '')
    if (!name) return
    const location = window.prompt('موقعیت منو', existing?.location ?? 'header')
    if (!location) return
    startTransition(async () => {
      const result = await saveMenuAction({ name, location, is_active: true }, existing?.id)
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
          <h1 className="text-2xl font-black text-white">مدیریت منوها</h1>
          <p className="mt-1 text-sm text-muted">اتصال به `menus` و ویرایش سریع</p>
        </div>
        <button disabled={isPending} onClick={() => openForm()} className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-bold text-black disabled:opacity-60">
          <Plus size={16} />
          منوی جدید
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-white/8 bg-charcoal">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              <th className="px-5 py-3 text-right text-xs text-muted">نام</th>
              <th className="px-5 py-3 text-right text-xs text-muted">موقعیت</th>
              <th className="px-5 py-3 text-right text-xs text-muted">آیتم‌ها</th>
            </tr>
          </thead>
          <tbody>
            {menus.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-10 text-center text-sm text-muted">منویی ثبت نشده است</td></tr>
            ) : menus.map((menu) => (
              <tr key={menu.id} onClick={() => openForm(menu)} className="cursor-pointer border-b border-white/5 hover:bg-white/5">
                <td className="px-5 py-3 text-sm text-white">{menu.name}</td>
                <td className="px-5 py-3 text-sm text-muted">{menu.location ?? '—'}</td>
                <td className="px-5 py-3 text-sm text-muted">{menu.items?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
