'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, CheckCircle, Loader2, Package, Save, XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { CatalogOpsToolbar, type CatalogCategoryOption } from '@/components/admin/catalog-ops-toolbar'
import {
  ADMIN_CATALOG_PAGE_SIZE,
  emptyCatalogFilter,
  type AdminCatalogFilter,
  type AdminInventoryRow,
} from '@/lib/admin/catalog-ops'
import {
  bulkAdjustInventoryAction,
  fetchAdminInventoryPageAction,
  saveInventoryPatchesAction,
} from '../actions'

interface Props {
  categories: CatalogCategoryOption[]
}

type DraftMap = Record<string, Pick<AdminInventoryRow, 'stock_left' | 'stock_right' | 'low_stock_threshold'>>

export function InventoryClient({ categories }: Props) {
  const [filter, setFilter] = useState<AdminCatalogFilter>(emptyCatalogFilter())
  const [searchInput, setSearchInput] = useState('')
  const [rows, setRows] = useState<AdminInventoryRow[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<DraftMap>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectAllFiltered, setSelectAllFiltered] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bulkMode, setBulkMode] = useState<'set' | 'increase' | 'decrease'>('set')
  const [bulkField, setBulkField] = useState<'stock_left' | 'stock_right' | 'low_stock_threshold' | 'both_sides'>('both_sides')
  const [bulkValue, setBulkValue] = useState(0)

  const load = useCallback(async (nextFilter: AdminCatalogFilter) => {
    setLoading(true)
    setError(null)
    const result = await fetchAdminInventoryPageAction(nextFilter)
    if (!result.ok) {
      setError(result.error)
      setRows([])
      setTotal(0)
      setTotalPages(1)
      setLoading(false)
      return
    }
    setRows(result.rows)
    setTotal(result.total)
    setTotalPages(result.totalPages)
    setDrafts({})
    setSelected(new Set())
    setSelectAllFiltered(false)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load(filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter((prev) => {
        if (prev.search === searchInput) return prev
        const next = { ...prev, search: searchInput, page: 1 }
        void load(next)
        return next
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, load])

  function updateFilter(patch: Partial<AdminCatalogFilter>) {
    if ('search' in patch && patch.search !== undefined) {
      setSearchInput(patch.search)
      return
    }
    setFilter((prev) => {
      const next = { ...prev, ...patch, search: searchInput }
      void load(next)
      return next
    })
  }

  function resetFilter() {
    const next = emptyCatalogFilter()
    setSearchInput('')
    setFilter(next)
    void load(next)
  }

  function getDraft(row: AdminInventoryRow) {
    return drafts[row.id] ?? {
      stock_left: row.stock_left,
      stock_right: row.stock_right,
      low_stock_threshold: row.low_stock_threshold,
    }
  }

  function isDirty(row: AdminInventoryRow) {
    const draft = drafts[row.id]
    if (!draft) return false
    return (
      draft.stock_left !== row.stock_left
      || draft.stock_right !== row.stock_right
      || draft.low_stock_threshold !== row.low_stock_threshold
    )
  }

  function updateDraft(
    id: string,
    key: 'stock_left' | 'stock_right' | 'low_stock_threshold',
    value: number,
  ) {
    setDrafts((prev) => {
      const base = rows.find((r) => r.id === id)
      if (!base) return prev
      const current = prev[id] ?? {
        stock_left: base.stock_left,
        stock_right: base.stock_right,
        low_stock_threshold: base.low_stock_threshold,
      }
      return {
        ...prev,
        [id]: { ...current, [key]: Math.max(0, value) },
      }
    })
  }

  const dirtyRows = useMemo(
    () => rows.filter((row) => isDirty(row)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, drafts],
  )

  const selectedCount = selectAllFiltered ? total : selected.size

  function toggleRow(id: string) {
    setSelectAllFiltered(false)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function togglePage() {
    setSelectAllFiltered(false)
    const pageIds = rows.map((r) => r.id)
    const allSelected = pageIds.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
  }

  async function saveDirty() {
    if (!dirtyRows.length) {
      toast.message('تغییر ذخیره‌نشده‌ای نیست')
      return
    }
    setSaving(true)
    const payload = dirtyRows.map((row) => {
      const draft = getDraft(row)
      return { id: row.id, ...draft }
    })
    const result = await saveInventoryPatchesAction(payload)
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(`${result.updated.toLocaleString('fa-IR')} محصول ذخیره شد`)
    void load(filter)
  }

  async function applyBulk() {
    if (!selectedCount) {
      toast.error('حداقل یک محصول را انتخاب کنید')
      return
    }
    if (bulkValue < 0 || Number.isNaN(bulkValue)) {
      toast.error('مقدار نامعتبر است')
      return
    }
    const scopeLabel = selectAllFiltered
      ? `همه ${total.toLocaleString('fa-IR')} نتیجه فیلتر`
      : `${selected.size.toLocaleString('fa-IR')} ردیف انتخاب‌شده`
    if (!window.confirm(`عملیات گروهی روی ${scopeLabel} اعمال شود؟`)) return

    setSaving(true)
    const result = await bulkAdjustInventoryAction({
      mode: bulkMode,
      field: bulkField,
      value: bulkValue,
      target: selectAllFiltered
        ? { type: 'filtered', filter }
        : { type: 'ids', ids: [...selected] },
    })
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(`${result.updated.toLocaleString('fa-IR')} محصول به‌روزرسانی شد`)
    void load(filter)
  }

  return (
    <div dir="rtl" className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">موجودی انبار</h1>
          <p className="mt-1 text-sm text-muted">
            موجودی چپ‌بازشو و راست‌بازشو را با جستجو، فیلتر و عملیات گروهی مدیریت کنید.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void saveDirty()}
          disabled={saving || !dirtyRows.length}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          ذخیره تغییرات ({dirtyRows.length.toLocaleString('fa-IR')})
        </button>
      </div>

      <CatalogOpsToolbar
        filter={{ ...filter, search: searchInput }}
        categories={categories}
        total={total}
        shown={rows.length}
        loading={loading}
        showPriceRange
        onChange={updateFilter}
        onReset={resetFilter}
      />

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-gold/20 bg-gold/5 p-4">
        <div className="text-sm font-semibold text-gold">ویرایش گروهی</div>
        <select
          value={bulkField}
          onChange={(e) => setBulkField(e.target.value as typeof bulkField)}
          className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
        >
          <option value="both_sides">چپ و راست</option>
          <option value="stock_left">فقط چپ‌بازشو</option>
          <option value="stock_right">فقط راست‌بازشو</option>
          <option value="low_stock_threshold">حد هشدار</option>
        </select>
        <select
          value={bulkMode}
          onChange={(e) => setBulkMode(e.target.value as typeof bulkMode)}
          className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
        >
          <option value="set">تنظیم مقدار ثابت</option>
          <option value="increase">افزایش</option>
          <option value="decrease">کاهش</option>
        </select>
        <input
          type="number"
          min={0}
          value={bulkValue}
          onChange={(e) => setBulkValue(Number(e.target.value))}
          className="h-10 w-28 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
        />
        <button
          type="button"
          onClick={() => void applyBulk()}
          disabled={saving || !selectedCount}
          className="h-10 rounded-xl bg-gold/20 px-4 text-sm font-bold text-gold hover:bg-gold/30 disabled:opacity-50"
        >
          اعمال روی {selectedCount.toLocaleString('fa-IR')} محصول
        </button>
        {selected.size > 0 && !selectAllFiltered && total > rows.length && (
          <button
            type="button"
            onClick={() => setSelectAllFiltered(true)}
            className="h-10 rounded-xl border border-white/15 px-3 text-xs text-muted hover:text-gold"
          >
            انتخاب همه {total.toLocaleString('fa-IR')} نتیجه فیلتر
          </button>
        )}
        {selectAllFiltered && (
          <span className="text-xs text-amber-300">
            همه نتایج فیلتر انتخاب شده‌اند
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
          <button type="button" onClick={() => void load(filter)} className="mr-3 underline">
            تلاش دوباره
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/8 bg-surface">
        <table className="min-w-[980px] w-full">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.02]">
              <th className="px-4 py-3 text-right">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && rows.every((r) => selected.has(r.id))}
                  onChange={togglePage}
                  aria-label="انتخاب صفحه"
                />
              </th>
              <th className="px-4 py-3 text-right text-xs text-muted">محصول</th>
              <th className="px-4 py-3 text-right text-xs text-muted">SKU</th>
              <th className="px-4 py-3 text-right text-xs text-muted">چپ‌بازشو</th>
              <th className="px-4 py-3 text-right text-xs text-muted">راست‌بازشو</th>
              <th className="px-4 py-3 text-right text-xs text-muted">کل</th>
              <th className="px-4 py-3 text-right text-xs text-muted">هشدار</th>
              <th className="px-4 py-3 text-right text-xs text-muted">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-20 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-sm text-muted">
                  محصولی با این فیلتر یافت نشد
                </td>
              </tr>
            ) : rows.map((product) => {
              const draft = getDraft(product)
              const totalStock = draft.stock_left + draft.stock_right
              const status = totalStock === 0
                ? 'ناموجود'
                : totalStock <= draft.low_stock_threshold
                  ? 'کم'
                  : 'کافی'
              const dirty = isDirty(product)
              return (
                <tr
                  key={product.id}
                  className={`border-b border-white/5 last:border-0 hover:bg-white/[0.025] ${dirty ? 'bg-gold/5' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectAllFiltered || selected.has(product.id)}
                      onChange={() => toggleRow(product.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gold" />
                      <div>
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="text-[11px] text-muted">
                          {product.category_name ?? 'بدون دسته'}
                          {!product.is_active ? ' · غیرفعال' : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted" dir="ltr">{product.sku}</td>
                  <td className="px-4 py-3">
                    <StockInput
                      value={draft.stock_left}
                      onChange={(value) => updateDraft(product.id, 'stock_left', value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StockInput
                      value={draft.stock_right}
                      onChange={(value) => updateDraft(product.id, 'stock_right', value)}
                    />
                  </td>
                  <td className="px-4 py-3 font-black text-white">
                    {totalStock.toLocaleString('fa-IR')}
                  </td>
                  <td className="px-4 py-3">
                    <StockInput
                      value={draft.low_stock_threshold}
                      onChange={(value) => updateDraft(product.id, 'low_stock_threshold', value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-sm font-medium ${
                      status === 'کافی' ? 'text-emerald-400' : status === 'کم' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {status === 'کافی' ? <CheckCircle className="h-4 w-4" /> : status === 'کم' ? <AlertTriangle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted">
          صفحه {filter.page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
          {' · '}
          {ADMIN_CATALOG_PAGE_SIZE.toLocaleString('fa-IR')} ردیف در هر صفحه
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={filter.page <= 1 || loading}
            onClick={() => updateFilter({ page: filter.page - 1 })}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-muted disabled:opacity-40 hover:border-gold hover:text-gold"
          >
            قبلی
          </button>
          <button
            type="button"
            disabled={filter.page >= totalPages || loading}
            onClick={() => updateFilter({ page: filter.page + 1 })}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-muted disabled:opacity-40 hover:border-gold hover:text-gold"
          >
            بعدی
          </button>
        </div>
      </div>
    </div>
  )
}

function StockInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-10 w-20 rounded-xl border border-white/10 bg-black/20 px-3 text-center text-sm text-white outline-none focus:border-gold"
    />
  )
}
