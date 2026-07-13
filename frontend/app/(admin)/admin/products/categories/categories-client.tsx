'use client'

import { useCallback, useState } from 'react'
import { Check, FolderOpen, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { slugify } from '@/lib/utils'
import {
  deleteCategoryAction,
  fetchAdminCategoriesAction,
  saveCategoryAction,
} from '../actions'
import type { AdminCategoryRow } from '@/lib/api/products-admin.server'

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  parent_id: '',
  order: 0,
  is_active: true,
}

interface Props {
  initialCategories: AdminCategoryRow[]
}

export function CategoriesClient({ initialCategories }: Props) {
  const [categories, setCategories] = useState<AdminCategoryRow[]>(initialCategories)
  const [form, setForm] = useState(emptyForm)
  const [categoryType, setCategoryType] = useState<'root' | 'child'>('root')
  const [editingId, setEditingId] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setLoadError(undefined)
    try {
      const result = await fetchAdminCategoriesAction()
      // #region agent log
      fetch('http://127.0.0.1:7589/ingest/5a232d27-556f-403d-98b2-82415887fe5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8b5927'},body:JSON.stringify({sessionId:'8b5927',runId:'post-fix',hypothesisId:'H1-H2',location:'categories-client.tsx:refresh',message:'categories refresh result',data:{ok:result.ok,categoryCount:result.ok?result.categories.length:0,error:result.ok?null:result.error},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (!result.ok) throw new Error(result.error)
      setCategories(result.categories)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ارتباط با پایگاه داده برقرار نشد'
      setLoadError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  function reset() {
    setEditingId(undefined)
    setCategoryType('root')
    setForm(emptyForm)
  }

  function edit(category: AdminCategoryRow) {
    setEditingId(category.id)
    setCategoryType(category.parent_id ? 'child' : 'root')
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      parent_id: category.parent_id ?? '',
      order: category.order,
      is_active: category.is_active,
    })
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (categoryType === 'child' && !form.parent_id) {
      toast.error('برای زیر‌دسته، یک دسته اصلی انتخاب کنید')
      return
    }
    const normalizedSlug = slugify(form.slug || form.name)
    if (!normalizedSlug) {
      toast.error('اسلاگ معتبر وارد کنید')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: normalizedSlug,
        description: form.description.trim() || null,
        parent_id: categoryType === 'child' ? form.parent_id : null,
        order: Number(form.order),
        is_active: form.is_active,
      }
      const result = await saveCategoryAction(editingId, payload)
      // #region agent log
      fetch('http://127.0.0.1:7589/ingest/5a232d27-556f-403d-98b2-82415887fe5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8b5927'},body:JSON.stringify({sessionId:'8b5927',runId:'post-fix',hypothesisId:'H2',location:'categories-client.tsx:save',message:'category save result',data:{editingId:editingId??null,categoryType,normalizedSlug,ok:result.ok,error:result.ok?null:result.error},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (!result.ok) throw new Error(result.error)
      toast.success(editingId ? 'دسته‌بندی ویرایش شد' : 'دسته‌بندی ایجاد شد')
      reset()
      await refresh()
    } catch (error) {
      const dbError = error as { code?: string; message?: string }
      toast.error(dbError.code === '23505' ? 'این نامک قبلاً استفاده شده است' : dbError.message ?? 'ذخیره دسته‌بندی ناموفق بود')
    } finally {
      setSaving(false)
    }
  }

  async function remove(category: AdminCategoryRow) {
    const count = category.products?.[0]?.count ?? 0
    if (count > 0) {
      toast.error('ابتدا محصولات این دسته را به دسته دیگری منتقل کنید')
      return
    }
    if (!window.confirm(`دسته «${category.name}» حذف شود؟`)) return
    const result = await deleteCategoryAction(category.id)
    if (!result.ok) toast.error(result.error)
    else {
      toast.success('دسته‌بندی حذف شد')
      await refresh()
    }
  }

  const roots = categories.filter((category) => !category.parent_id && category.id !== editingId)

  return (
    <div dir="rtl" className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">دسته‌بندی محصولات</h1>
        <p className="mt-1 text-sm text-muted">ساختار اصلی و زیردسته‌های فروشگاه را مدیریت کنید.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-surface">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-4 px-5 py-16 text-center">
              <div className="text-sm font-bold text-red-400">دریافت دسته‌بندی‌ها ناموفق بود</div>
              <div className="max-w-md text-xs leading-relaxed text-muted" dir="ltr">{loadError}</div>
              <button onClick={() => void refresh()} className="rounded-xl border border-gold/25 bg-gold/10 px-4 py-2 text-xs font-bold text-gold">
                تلاش دوباره
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full">
                <thead className="border-b border-white/8 bg-white/[0.02]">
                  <tr>
                    <th className="px-5 py-3 text-right text-xs text-muted">دسته‌بندی</th>
                    <th className="px-5 py-3 text-right text-xs text-muted">اسلاگ URL</th>
                    <th className="px-5 py-3 text-right text-xs text-muted">محصول</th>
                    <th className="px-5 py-3 text-right text-xs text-muted">وضعیت</th>
                    <th className="px-5 py-3 text-left text-xs text-muted">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => {
                    const parent = categories.find((item) => item.id === category.parent_id)
                    return (
                      <tr key={category.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.025]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-gold" />
                            <div>
                              <div className="text-sm font-bold text-white">{category.name}</div>
                              {parent && <div className="mt-1 text-[10px] text-muted">زیرمجموعه {parent.name}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted" dir="ltr">{category.slug}</td>
                        <td className="px-5 py-4 text-sm text-white">{category.products?.[0]?.count ?? 0}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${category.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-muted'}`}>
                            {category.is_active ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => edit(category)} className="rounded-lg p-2 text-muted hover:bg-gold/10 hover:text-gold" aria-label="ویرایش"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => remove(category)} className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-400" aria-label="حذف"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form onSubmit={save} className="space-y-4 rounded-2xl border border-white/8 bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-white"><Plus className="h-4 w-4 text-gold" />{editingId ? 'ویرایش دسته' : 'دسته جدید'}</h2>
            {editingId && <button type="button" onClick={reset} className="text-muted hover:text-white"><X className="h-4 w-4" /></button>}
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/20 p-1.5">
            <button
              type="button"
              onClick={() => {
                setCategoryType('root')
                setForm({ ...form, parent_id: '' })
              }}
              className={`rounded-lg px-3 py-2.5 text-xs font-bold transition-all ${categoryType === 'root' ? 'bg-gold text-black' : 'text-muted hover:text-white'}`}
            >
              دسته اصلی
            </button>
            <button
              type="button"
              disabled={roots.length === 0}
              onClick={() => setCategoryType('child')}
              className={`rounded-lg px-3 py-2.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${categoryType === 'child' ? 'bg-gold text-black' : 'text-muted hover:text-white'}`}
            >
              زیر‌دسته
            </button>
          </div>
          {roots.length === 0 && !editingId && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-300">
              ابتدا اولین دسته اصلی را ایجاد کنید؛ سپس گزینه «زیر‌دسته» فعال می‌شود.
            </div>
          )}
          {categoryType === 'child' && (
            <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 p-3 text-xs leading-relaxed text-blue-300">
              این مورد زیرمجموعه دسته اصلی انتخاب‌شده خواهد بود و در فرم افزودن محصول زیر همان دسته نمایش داده می‌شود.
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted">نام دسته‌بندی *</label>
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: editingId ? form.slug : slugify(event.target.value) })} placeholder={categoryType === 'root' ? 'مثال: درب ضد سرقت' : 'مثال: رویه فلزی'} className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-gold" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted">اسلاگ URL *</label>
            <input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="اسلاگ فارسی یا انگلیسی" dir="ltr" className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-gold" />
          </div>
          {categoryType === 'child' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">دسته اصلی والد *</label>
              <select required value={form.parent_id} onChange={(event) => setForm({ ...form, parent_id: event.target.value })} className="h-11 w-full rounded-xl border border-white/10 bg-zinc-800 px-4 text-sm text-white outline-none focus:border-gold">
                <option value="">انتخاب دسته اصلی</option>
                {roots.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
          )}
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="توضیح کوتاه دسته‌بندی" className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-gold" />
          <input type="number" value={form.order} onChange={(event) => setForm({ ...form, order: Number(event.target.value) })} placeholder="ترتیب نمایش" className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-gold" />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} className="h-4 w-4 accent-gold" />
            نمایش این دسته در سایت
          </label>
          <button disabled={saving} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gold font-bold text-black disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {editingId ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی'}
          </button>
        </form>
      </div>
    </div>
  )
}
