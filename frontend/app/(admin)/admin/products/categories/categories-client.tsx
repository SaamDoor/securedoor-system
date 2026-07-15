'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Check,
  FolderOpen,
  FolderTree,
  Loader2,
  Pencil,
  Plus,
  Power,
  Trash2,
  X,
} from 'lucide-react'
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
  image_url: '',
  banner_url: '',
  meta_title: '',
  meta_description: '',
}

interface Props {
  initialCategories: AdminCategoryRow[]
}

export function CategoriesClient({ initialCategories }: Props) {
  const [categories, setCategories] = useState<AdminCategoryRow[]>(initialCategories)
  const [form, setForm] = useState(emptyForm)
  const [categoryType, setCategoryType] = useState<'root' | 'child'>('root')
  const [editingId, setEditingId] = useState<string>()
  const [panelOpen, setPanelOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setLoadError(undefined)
    try {
      const result = await fetchAdminCategoriesAction()
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
    setPanelOpen(false)
  }

  function openCreate(asChild = false, parentId = '') {
    setEditingId(undefined)
    setCategoryType(asChild ? 'child' : 'root')
    setForm({
      ...emptyForm,
      parent_id: parentId,
      order: categories.length,
    })
    setPanelOpen(true)
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
      image_url: category.image_url ?? '',
      banner_url: category.banner_url ?? '',
      meta_title: category.meta_title ?? '',
      meta_description: category.meta_description ?? '',
    })
    setPanelOpen(true)
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
        image_url: form.image_url.trim() || null,
        banner_url: form.banner_url.trim() || null,
        meta_title: form.meta_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
      }
      const result = await saveCategoryAction(editingId, payload)
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
    const childCount = categories.filter((c) => c.parent_id === category.id).length
    if (childCount > 0) {
      toast.error('ابتدا زیر‌دسته‌ها را حذف یا جابه‌جا کنید')
      return
    }
    if (!window.confirm(`دسته «${category.name}» حذف شود؟`)) return
    const result = await deleteCategoryAction(category.id)
    if (!result.ok) toast.error(result.error)
    else {
      toast.success('دسته‌بندی حذف شد')
      if (editingId === category.id) reset()
      await refresh()
    }
  }

  async function toggleActive(category: AdminCategoryRow) {
    const result = await saveCategoryAction(category.id, {
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      parent_id: category.parent_id,
      order: category.order,
      is_active: !category.is_active,
      image_url: category.image_url,
      banner_url: category.banner_url,
      meta_title: category.meta_title,
      meta_description: category.meta_description,
    })
    if (!result.ok) toast.error(result.error)
    else {
      toast.success(category.is_active ? 'دسته غیرفعال شد' : 'دسته فعال شد')
      await refresh()
    }
  }

  async function moveOrder(category: AdminCategoryRow, direction: -1 | 1) {
    const siblings = categories
      .filter((c) => c.parent_id === category.parent_id)
      .sort((a, b) => a.order - b.order)
    const index = siblings.findIndex((c) => c.id === category.id)
    const swapWith = siblings[index + direction]
    if (!swapWith) return

    const first = await saveCategoryAction(category.id, {
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      parent_id: category.parent_id,
      order: swapWith.order,
      is_active: category.is_active,
      image_url: category.image_url,
      banner_url: category.banner_url,
      meta_title: category.meta_title,
      meta_description: category.meta_description,
    })
    const second = await saveCategoryAction(swapWith.id, {
      name: swapWith.name,
      slug: swapWith.slug,
      description: swapWith.description ?? null,
      parent_id: swapWith.parent_id,
      order: category.order,
      is_active: swapWith.is_active,
      image_url: swapWith.image_url,
      banner_url: swapWith.banner_url,
      meta_title: swapWith.meta_title,
      meta_description: swapWith.meta_description,
    })
    if (!first.ok || !second.ok) {
      toast.error(first.ok ? second.error : first.error)
      return
    }
    await refresh()
  }

  const roots = useMemo(
    () => categories.filter((c) => !c.parent_id).sort((a, b) => a.order - b.order),
    [categories],
  )

  const parentOptions = categories.filter((c) => !c.parent_id && c.id !== editingId)

  const treeRows = useMemo(() => {
    const rows: { category: AdminCategoryRow; depth: number; siblings: AdminCategoryRow[] }[] = []
    for (const root of roots) {
      const rootSiblings = roots
      rows.push({ category: root, depth: 0, siblings: rootSiblings })
      const children = categories
        .filter((c) => c.parent_id === root.id)
        .sort((a, b) => a.order - b.order)
      for (const child of children) {
        rows.push({ category: child, depth: 1, siblings: children })
      }
    }
    return rows
  }, [categories, roots])

  return (
    <div dir="rtl" className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">دسته‌بندی محصولات</h1>
          <p className="mt-1 text-sm text-muted">ساختار درختی دسته‌ها را بسازید، ویرایش و مرتب کنید.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openCreate(false)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-bold text-black hover:bg-gold/90"
          >
            <Plus className="h-4 w-4" />
            دسته اصلی جدید
          </button>
          <button
            type="button"
            onClick={() => openCreate(true, roots[0]?.id ?? '')}
            disabled={roots.length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-bold text-white hover:border-gold/40 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FolderTree className="h-4 w-4" />
            زیر‌دسته جدید
          </button>
        </div>
      </div>

      <div className={`grid items-start gap-6 ${panelOpen ? 'lg:grid-cols-[minmax(0,1fr)_24rem]' : ''}`}>
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
          ) : treeRows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-20 text-center">
              <FolderOpen className="h-10 w-10 text-muted/40" />
              <p className="text-sm text-muted">هنوز دسته‌ای ثبت نشده است</p>
              <button type="button" onClick={() => openCreate(false)} className="rounded-xl bg-gold px-4 py-2 text-xs font-bold text-black">
                ایجاد اولین دسته
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {treeRows.map(({ category, depth, siblings }) => {
                const productCount = category.products?.[0]?.count ?? 0
                const siblingIndex = siblings.findIndex((s) => s.id === category.id)
                return (
                  <div
                    key={category.id}
                    className={`flex flex-wrap items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] ${editingId === category.id ? 'bg-gold/5' : ''}`}
                    style={{ paddingRight: `${1 + depth * 1.25}rem` }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FolderOpen className={`h-4 w-4 shrink-0 ${depth ? 'text-muted' : 'text-gold'}`} />
                        <span className="truncate text-sm font-bold text-white">{category.name}</span>
                        {depth > 0 && <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted">زیر‌دسته</span>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                        <span dir="ltr">{category.slug}</span>
                        <span>·</span>
                        <span>{productCount} محصول</span>
                        <span>·</span>
                        <span>ترتیب {category.order}</span>
                      </div>
                    </div>

                    <span className={`rounded-full px-2.5 py-1 text-xs ${category.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-muted'}`}>
                      {category.is_active ? 'فعال' : 'غیرفعال'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void moveOrder(category, -1)}
                        disabled={siblingIndex <= 0}
                        className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-white disabled:opacity-30"
                        aria-label="بالا"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void moveOrder(category, 1)}
                        disabled={siblingIndex >= siblings.length - 1}
                        className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-white disabled:opacity-30"
                        aria-label="پایین"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleActive(category)}
                        className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-gold"
                        aria-label="تغییر وضعیت"
                        title={category.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      {!category.parent_id && (
                        <button
                          type="button"
                          onClick={() => openCreate(true, category.id)}
                          className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-gold"
                          aria-label="افزودن زیر‌دسته"
                          title="افزودن زیر‌دسته"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => edit(category)}
                        className="rounded-lg p-2 text-muted hover:bg-gold/10 hover:text-gold"
                        aria-label="ویرایش"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(category)}
                        className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-400"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {panelOpen && (
          <form onSubmit={save} className="space-y-4 rounded-2xl border border-white/8 bg-surface p-5 lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-white">
                {editingId ? <Pencil className="h-4 w-4 text-gold" /> : <Plus className="h-4 w-4 text-gold" />}
                {editingId ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
              </h2>
              <button type="button" onClick={reset} className="rounded-lg p-1.5 text-muted hover:bg-white/5 hover:text-white">
                <X className="h-4 w-4" />
              </button>
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
                disabled={parentOptions.length === 0}
                onClick={() => setCategoryType('child')}
                className={`rounded-lg px-3 py-2.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${categoryType === 'child' ? 'bg-gold text-black' : 'text-muted hover:text-white'}`}
              >
                زیر‌دسته
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">نام دسته‌بندی *</label>
              <input
                required
                value={form.name}
                onChange={(event) => setForm({
                  ...form,
                  name: event.target.value,
                  slug: editingId ? form.slug : slugify(event.target.value),
                })}
                placeholder={categoryType === 'root' ? 'مثال: درب ضد سرقت' : 'مثال: رویه فلزی'}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">اسلاگ URL *</label>
              <input
                required
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
                placeholder="slug"
                dir="ltr"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-gold"
              />
            </div>

            {categoryType === 'child' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted">دسته اصلی والد *</label>
                <select
                  required
                  value={form.parent_id}
                  onChange={(event) => setForm({ ...form, parent_id: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-800 px-4 text-sm text-white outline-none focus:border-gold"
                >
                  <option value="">انتخاب دسته اصلی</option>
                  {parentOptions.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">توضیحات</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="توضیح کوتاه دسته‌بندی"
                className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">تصویر دسته (URL)</label>
              <input
                value={form.image_url}
                onChange={(event) => setForm({ ...form, image_url: event.target.value })}
                placeholder="https://..."
                dir="ltr"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">بنر دسته (URL)</label>
              <input
                value={form.banner_url}
                onChange={(event) => setForm({ ...form, banner_url: event.target.value })}
                placeholder="https://..."
                dir="ltr"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">عنوان سئو</label>
              <input
                value={form.meta_title}
                onChange={(event) => setForm({ ...form, meta_title: event.target.value })}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">توضیح سئو</label>
              <textarea
                value={form.meta_description}
                onChange={(event) => setForm({ ...form, meta_description: event.target.value })}
                className="min-h-20 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">ترتیب نمایش</label>
              <input
                type="number"
                value={form.order}
                onChange={(event) => setForm({ ...form, order: Number(event.target.value) })}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-gold"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                className="h-4 w-4 accent-gold"
              />
              نمایش این دسته در سایت
            </label>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={reset}
                className="h-11 flex-1 rounded-xl border border-white/15 text-sm text-muted hover:text-white"
              >
                انصراف
              </button>
              <button
                disabled={saving}
                className="flex h-11 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gold font-bold text-black disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editingId ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
