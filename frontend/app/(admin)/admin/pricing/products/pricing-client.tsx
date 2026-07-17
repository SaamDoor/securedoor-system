'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { CatalogOpsToolbar, type CatalogCategoryOption } from '@/components/admin/catalog-ops-toolbar'
import {
  ADMIN_CATALOG_PAGE_SIZE,
  emptyCatalogFilter,
  type AdminCatalogFilter,
  type AdminPricingRow,
  type PricingBulkInput,
} from '@/lib/admin/catalog-ops'
import { formatJalaliDate, formatPrice } from '@/lib/utils'
import {
  bulkAdjustPricingAction,
  fetchAdminPricingPageAction,
  savePricingPatchesAction,
} from '../../products/actions'

interface Props {
  categories: CatalogCategoryOption[]
}

type DraftMap = Record<string, Pick<AdminPricingRow, 'price' | 'compare_price' | 'cost_price'>>

export function PricingClient({ categories }: Props) {
  const [filter, setFilter] = useState<AdminCatalogFilter>({
    ...emptyCatalogFilter(),
    sortBy: 'updated_desc',
  })
  const [searchInput, setSearchInput] = useState('')
  const [rows, setRows] = useState<AdminPricingRow[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<DraftMap>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectAllFiltered, setSelectAllFiltered] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bulkMode, setBulkMode] = useState<PricingBulkInput['mode']>('increase_percent')
  const [bulkField, setBulkField] = useState<PricingBulkInput['field']>('price')
  const [bulkValue, setBulkValue] = useState(10)

  const load = useCallback(async (nextFilter: AdminCatalogFilter) => {
    setLoading(true)
    setError(null)
    const result = await fetchAdminPricingPageAction(nextFilter)
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
    const next = { ...emptyCatalogFilter(), sortBy: 'updated_desc' as const }
    setSearchInput('')
    setFilter(next)
    void load(next)
  }

  function getDraft(row: AdminPricingRow) {
    return drafts[row.id] ?? {
      price: row.price,
      compare_price: row.compare_price,
      cost_price: row.cost_price,
    }
  }

  function isDirty(row: AdminPricingRow) {
    const draft = drafts[row.id]
    if (!draft) return false
    return (
      draft.price !== row.price
      || draft.compare_price !== row.compare_price
      || draft.cost_price !== row.cost_price
    )
  }

  function updateDraft(
    id: string,
    key: 'price' | 'compare_price' | 'cost_price',
    value: number | null,
  ) {
    setDrafts((prev) => {
      const base = rows.find((r) => r.id === id)
      if (!base) return prev
      const current = prev[id] ?? {
        price: base.price,
        compare_price: base.compare_price,
        cost_price: base.cost_price,
      }
      return { ...prev, [id]: { ...current, [key]: value } }
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
    for (const row of dirtyRows) {
      const draft = getDraft(row)
      if (!draft.price || draft.price < 1) {
        toast.error(`قیمت «${row.name}» باید حداقل ۱ باشد`)
        return
      }
    }
    setSaving(true)
    const payload = dirtyRows.map((row) => {
      const draft = getDraft(row)
      return {
        id: row.id,
        price: draft.price,
        compare_price: draft.compare_price,
        cost_price: draft.cost_price,
      }
    })
    const result = await savePricingPatchesAction(payload)
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(`${result.updated.toLocaleString('fa-IR')} قیمت ذخیره شد`)
    void load(filter)
  }

  async function applyBulk() {
    if (!selectedCount) {
      toast.error('حداقل یک محصول را انتخاب کنید')
      return
    }
    if (bulkMode !== 'clear' && (bulkValue == null || Number.isNaN(bulkValue) || bulkValue < 0)) {
      toast.error('مقدار نامعتبر است')
      return
    }
    if (bulkMode === 'clear' && bulkField === 'price') {
      toast.error('قیمت اصلی را نمی‌توان پاک کرد')
      return
    }
    const scopeLabel = selectAllFiltered
      ? `همه ${total.toLocaleString('fa-IR')} نتیجه فیلتر`
      : `${selected.size.toLocaleString('fa-IR')} ردیف انتخاب‌شده`
    if (!window.confirm(`عملیات گروهی قیمت روی ${scopeLabel} اعمال شود؟`)) return

    setSaving(true)
    const result = await bulkAdjustPricingAction({
      mode: bulkMode,
      field: bulkField,
      value: bulkMode === 'clear' ? undefined : bulkValue,
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
          <h1 className="text-2xl font-black text-white">قیمت‌گذاری محصولات</h1>
          <p className="mt-1 text-sm text-muted">
            قیمت اصلی، مقایسه‌ای و تمام‌شده را ردیفی یا گروهی ویرایش کنید.
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
        <div className="text-sm font-semibold text-gold">ویرایش گروهی قیمت</div>
        <select
          value={bulkField}
          onChange={(e) => setBulkField(e.target.value as PricingBulkInput['field'])}
          className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
        >
          <option value="price">قیمت اصلی</option>
          <option value="compare_price">قیمت مقایسه</option>
          <option value="cost_price">قیمت تمام‌شده</option>
        </select>
        <select
          value={bulkMode}
          onChange={(e) => setBulkMode(e.target.value as PricingBulkInput['mode'])}
          className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
        >
          <option value="set">مبلغ ثابت</option>
          <option value="increase_amount">افزایش مبلغی</option>
          <option value="decrease_amount">کاهش مبلغی</option>
          <option value="increase_percent">افزایش درصدی</option>
          <option value="decrease_percent">کاهش درصدی</option>
          <option value="clear">پاک کردن (اختیاری)</option>
        </select>
        {bulkMode !== 'clear' && (
          <input
            type="number"
            min={0}
            value={bulkValue}
            onChange={(e) => setBulkValue(Number(e.target.value))}
            className="h-10 w-36 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
            placeholder={bulkMode.includes('percent') ? 'درصد' : 'مبلغ تومان'}
          />
        )}
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
          <span className="text-xs text-amber-300">همه نتایج فیلتر انتخاب شده‌اند</span>
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
        <table className="min-w-[1040px] w-full">
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
              <th className="px-4 py-3 text-right text-xs text-muted">نام محصول</th>
              <th className="px-4 py-3 text-right text-xs text-muted">SKU</th>
              <th className="px-4 py-3 text-right text-xs text-muted">قیمت فعلی</th>
              <th className="px-4 py-3 text-right text-xs text-muted">قیمت مقایسه</th>
              <th className="px-4 py-3 text-right text-xs text-muted">قیمت تمام‌شده</th>
              <th className="px-4 py-3 text-right text-xs text-muted">آخرین تغییر</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm text-muted">
                  محصولی برای قیمت‌گذاری یافت نشد
                </td>
              </tr>
            ) : rows.map((product) => {
              const draft = getDraft(product)
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
                    <div className="font-medium text-white">{product.name}</div>
                    <div className="text-[11px] text-muted">
                      {product.category_name ?? 'بدون دسته'}
                      {' · '}
                      موجودی {product.stock.toLocaleString('fa-IR')}
                      {!product.is_active ? ' · غیرفعال' : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted" dir="ltr">{product.sku}</td>
                  <td className="px-4 py-3">
                    <PriceInput
                      value={draft.price}
                      onChange={(value) => updateDraft(product.id, 'price', Math.max(1, value ?? 1))}
                    />
                    <div className="mt-1 text-[11px] text-muted">{formatPrice(draft.price)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <PriceInput
                      value={draft.compare_price}
                      allowEmpty
                      onChange={(value) => updateDraft(product.id, 'compare_price', value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <PriceInput
                      value={draft.cost_price}
                      allowEmpty
                      onChange={(value) => updateDraft(product.id, 'cost_price', value)}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {product.updated_at ? formatJalaliDate(product.updated_at) : '—'}
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

function PriceInput({
  value,
  onChange,
  allowEmpty = false,
}: {
  value: number | null
  onChange: (value: number | null) => void
  allowEmpty?: boolean
}) {
  return (
    <input
      type="number"
      min={allowEmpty ? 0 : 1}
      value={value ?? ''}
      onChange={(event) => {
        if (allowEmpty && event.target.value === '') {
          onChange(null)
          return
        }
        onChange(Number(event.target.value))
      }}
      className="h-10 w-36 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-gold"
      dir="ltr"
    />
  )
}
