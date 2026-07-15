'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { formatPrice, toPersianNumber, cn } from '@/lib/utils'
import type { ShopCategory } from '@/lib/shop/catalog.types'

const PRICE_MIN = 0
const PRICE_MAX = 100_000_000

interface ProductFiltersProps {
  categories: ShopCategory[]
  searchParams: {
    category?: string
    minPrice?: string
    maxPrice?: string
    search?: string
    sortBy?: string
    featured?: string
    inStock?: string
  }
  onApplied?: () => void
}

function flattenCategories(categories: ShopCategory[]): ShopCategory[] {
  const result: ShopCategory[] = []
  for (const root of categories) {
    result.push(root)
    for (const child of root.children) result.push(child)
  }
  return result
}

export function ProductFilters({ categories, searchParams, onApplied }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState(['category', 'price', 'stock'])
  const [draftMaxPrice, setDraftMaxPrice] = useState(
    parseInt(searchParams.maxPrice ?? String(PRICE_MAX), 10),
  )

  const flat = flattenCategories(categories)
  const selectedCategory = searchParams.category ?? ''
  const inStock = searchParams.inStock === 'true'
  const currentMax = parseInt(searchParams.maxPrice ?? String(PRICE_MAX), 10)

  const toggleSection = (key: string) => {
    setOpenSections((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]))
  }

  const pushFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams()
    const base: Record<string, string | undefined> = {
      category: searchParams.category,
      search: searchParams.search,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      sortBy: searchParams.sortBy,
      featured: searchParams.featured,
      inStock: searchParams.inStock,
    }
    for (const [key, value] of Object.entries(base)) {
      if (value) params.set(key, value)
    }
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') params.delete(key)
      else params.set(key, value)
    }
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
    onApplied?.()
  }

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    currentMax < PRICE_MAX ||
    Boolean(searchParams.minPrice) ||
    inStock

  return (
    <div className="space-y-1">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-white">فیلترها</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setDraftMaxPrice(PRICE_MAX)
              pushFilters({
                category: null,
                minPrice: null,
                maxPrice: null,
                inStock: null,
              })
            }}
            className="flex items-center gap-1 text-xs text-gold hover:text-gold-light"
          >
            <RotateCcw className="h-3 w-3" />
            پاک کردن
          </button>
        )}
      </div>

      <FilterSection
        title="دسته‌بندی"
        sectionKey="category"
        isOpen={openSections.includes('category')}
        onToggle={toggleSection}
      >
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => pushFilters({ category: null })}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
              !selectedCategory ? 'bg-gold/10 text-gold' : 'text-muted hover:bg-white/5 hover:text-white',
            )}
          >
            <span>همه دسته‌بندی‌ها</span>
          </button>
          {flat.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => pushFilters({ category: cat.slug })}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                cat.parentId && 'pr-6 text-[13px]',
                selectedCategory === cat.slug
                  ? 'bg-gold/10 text-gold'
                  : 'text-muted hover:bg-white/5 hover:text-white',
              )}
            >
              <span>{cat.name}</span>
              <span className="text-2xs">{toPersianNumber(cat.productCount)}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      <Separator variant="gradient" className="my-2" />

      <FilterSection
        title="محدوده قیمت"
        sectionKey="price"
        isOpen={openSections.includes('price')}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          <div className="relative pt-2">
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={500_000}
              value={draftMaxPrice}
              onChange={(e) => setDraftMaxPrice(parseInt(e.target.value, 10))}
              onMouseUp={() =>
                pushFilters({
                  maxPrice: draftMaxPrice >= PRICE_MAX ? null : String(draftMaxPrice),
                })
              }
              onTouchEnd={() =>
                pushFilters({
                  maxPrice: draftMaxPrice >= PRICE_MAX ? null : String(draftMaxPrice),
                })
              }
              className="w-full accent-gold"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{formatPrice(PRICE_MIN, 'تومان', { compact: true })}</span>
            <span>{formatPrice(draftMaxPrice, 'تومان', { compact: true })}</span>
          </div>
        </div>
      </FilterSection>

      <Separator variant="gradient" className="my-2" />

      <FilterSection
        title="وضعیت موجودی"
        sectionKey="stock"
        isOpen={openSections.includes('stock')}
        onToggle={toggleSection}
      >
        <label className="group flex cursor-pointer items-center gap-3 py-1">
          <div
            role="switch"
            aria-checked={inStock}
            tabIndex={0}
            onClick={() => pushFilters({ inStock: inStock ? null : 'true' })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                pushFilters({ inStock: inStock ? null : 'true' })
              }
            }}
            className={cn(
              'relative h-5 w-10 rounded-full transition-colors',
              inStock ? 'bg-gold' : 'bg-white/10',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                inStock ? 'left-[22px]' : 'left-0.5',
              )}
            />
          </div>
          <span className="text-sm text-muted transition-colors group-hover:text-white">
            فقط کالاهای موجود
          </span>
        </label>
      </FilterSection>
    </div>
  )
}

function FilterSection({
  title,
  sectionKey,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  sectionKey: string
  isOpen: boolean
  onToggle: (key: string) => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-white"
      >
        {title}
        <ChevronDown className={cn('h-4 w-4 text-muted transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && <div className="pb-3">{children}</div>}
    </div>
  )
}
