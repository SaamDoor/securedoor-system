'use client'

import { Loader2, RotateCcw, Search } from 'lucide-react'
import type { AdminCatalogFilter, AdminCatalogSort } from '@/lib/admin/catalog-ops'

export interface CatalogCategoryOption {
  id: string
  name: string
  parent_id: string | null
}

interface Props {
  filter: AdminCatalogFilter
  categories: CatalogCategoryOption[]
  total: number
  shown: number
  loading?: boolean
  showPriceRange?: boolean
  onChange: (patch: Partial<AdminCatalogFilter>) => void
  onReset: () => void
}

const SORT_OPTIONS: { value: AdminCatalogSort; label: string }[] = [
  { value: 'name_asc', label: 'نام (الف-ی)' },
  { value: 'name_desc', label: 'نام (ی-الف)' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
  { value: 'stock_asc', label: 'کمترین موجودی' },
  { value: 'stock_desc', label: 'بیشترین موجودی' },
  { value: 'updated_desc', label: 'آخرین تغییر' },
]

export function CatalogOpsToolbar({
  filter,
  categories,
  total,
  shown,
  loading,
  showPriceRange = true,
  onChange,
  onReset,
}: Props) {
  const roots = categories.filter((c) => !c.parent_id)
  const childrenOf = (parentId: string) => categories.filter((c) => c.parent_id === parentId)

  return (
    <div className="mb-4 space-y-3 rounded-2xl border border-white/8 bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={filter.search}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            placeholder="جستجو نام یا SKU…"
            className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pr-10 pl-3 text-sm text-white outline-none focus:border-gold"
          />
        </div>
        <select
          value={filter.categoryId || ''}
          onChange={(e) => onChange({ categoryId: e.target.value, page: 1 })}
          className="h-10 min-w-[180px] rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-gold"
        >
          <option value="">همه دسته‌ها</option>
          {roots.map((root) => (
            <optgroup key={root.id} label={root.name}>
              <option value={root.id}>{root.name}</option>
              {childrenOf(root.id).map((child) => (
                <option key={child.id} value={child.id}>
                  ↳ {child.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <select
          value={filter.isActive}
          onChange={(e) => onChange({ isActive: e.target.value as AdminCatalogFilter['isActive'], page: 1 })}
          className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-gold"
        >
          <option value="all">فعال/غیرفعال</option>
          <option value="true">فقط فعال</option>
          <option value="false">فقط غیرفعال</option>
        </select>
        <select
          value={filter.stockLevel}
          onChange={(e) => onChange({ stockLevel: e.target.value as AdminCatalogFilter['stockLevel'], page: 1 })}
          className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-gold"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="in_stock">موجود</option>
          <option value="low">کم‌موجود</option>
          <option value="out_of_stock">ناموجود</option>
          <option value="pre_order">پیش‌سفارش</option>
          <option value="discontinued">متوقف</option>
        </select>
        <select
          value={filter.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value as AdminCatalogSort, page: 1 })}
          className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-gold"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-muted hover:border-gold hover:text-gold"
        >
          <RotateCcw className="h-4 w-4" />
          بازنشانی
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-xs text-muted">
          حداقل موجودی
          <input
            type="number"
            min={0}
            value={filter.minStock ?? ''}
            onChange={(e) => onChange({
              minStock: e.target.value === '' ? undefined : Number(e.target.value),
              page: 1,
            })}
            className="block h-9 w-28 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-gold"
          />
        </label>
        <label className="space-y-1 text-xs text-muted">
          حداکثر موجودی
          <input
            type="number"
            min={0}
            value={filter.maxStock ?? ''}
            onChange={(e) => onChange({
              maxStock: e.target.value === '' ? undefined : Number(e.target.value),
              page: 1,
            })}
            className="block h-9 w-28 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-gold"
          />
        </label>
        {showPriceRange && (
          <>
            <label className="space-y-1 text-xs text-muted">
              حداقل قیمت
              <input
                type="number"
                min={0}
                value={filter.minPrice ?? ''}
                onChange={(e) => onChange({
                  minPrice: e.target.value === '' ? undefined : Number(e.target.value),
                  page: 1,
                })}
                className="block h-9 w-36 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-gold"
              />
            </label>
            <label className="space-y-1 text-xs text-muted">
              حداکثر قیمت
              <input
                type="number"
                min={0}
                value={filter.maxPrice ?? ''}
                onChange={(e) => onChange({
                  maxPrice: e.target.value === '' ? undefined : Number(e.target.value),
                  page: 1,
                })}
                className="block h-9 w-36 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-gold"
              />
            </label>
          </>
        )}
        <div className="ms-auto flex items-center gap-2 text-xs text-muted">
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />}
          <span>
            نمایش {shown.toLocaleString('fa-IR')} از {total.toLocaleString('fa-IR')} محصول
          </span>
        </div>
      </div>
    </div>
  )
}
