'use client'

import { useState } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

const categories = [
  { id: '1', name: 'درب ضد سرقت', slug: 'darb-zed-sereqat', count: 48 },
  { id: '2', name: 'درب ضد حریق', slug: 'darb-zed-hariq', count: 24 },
  { id: '3', name: 'درب آپارتمانی', slug: 'darb-apartmani', count: 36 },
  { id: '4', name: 'درب ویلایی', slug: 'darb-villaei', count: 18 },
  { id: '5', name: 'درب اداری', slug: 'darb-edari', count: 12 },
  { id: '6', name: 'متعلقات', slug: 'moteallaqat', count: 64 },
]

const PRICE_MIN = 0
const PRICE_MAX = 100_000_000

interface ProductFiltersProps {
  searchParams: {
    category?: string
    minPrice?: string
    maxPrice?: string
  }
}

export function ProductFilters({ searchParams }: ProductFiltersProps) {
  const [openSections, setOpenSections] = useState(['category', 'price', 'stock'])
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category ?? '')
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.minPrice ?? '0'),
    parseInt(searchParams.maxPrice ?? '100000000'),
  ])
  const [inStock, setInStock] = useState(false)

  const toggleSection = (key: string) => {
    setOpenSections((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    )
  }

  const hasActiveFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < PRICE_MAX || inStock

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">فیلترها</h3>
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedCategory('')
              setPriceRange([PRICE_MIN, PRICE_MAX])
              setInStock(false)
            }}
            className="flex items-center gap-1 text-xs text-gold hover:text-gold-light"
          >
            <RotateCcw className="h-3 w-3" />
            پاک کردن
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection
        title="دسته‌بندی"
        sectionKey="category"
        isOpen={openSections.includes('category')}
        onToggle={toggleSection}
      >
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={cn(
              'w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-colors',
              !selectedCategory ? 'bg-gold/10 text-gold' : 'text-muted hover:text-white hover:bg-white/5',
            )}
          >
            <span>همه دسته‌بندی‌ها</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={cn(
                'w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-colors',
                selectedCategory === cat.slug
                  ? 'bg-gold/10 text-gold'
                  : 'text-muted hover:text-white hover:bg-white/5',
              )}
            >
              <span>{cat.name}</span>
              <span className="text-2xs">{toPersianNumber(cat.count)}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      <Separator variant="gradient" className="my-2" />

      {/* Price range */}
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
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full accent-gold"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{formatPrice(priceRange[0], 'تومان', { compact: true })}</span>
            <span>{formatPrice(priceRange[1], 'تومان', { compact: true })}</span>
          </div>
        </div>
      </FilterSection>

      <Separator variant="gradient" className="my-2" />

      {/* Stock */}
      <FilterSection
        title="وضعیت موجودی"
        sectionKey="stock"
        isOpen={openSections.includes('stock')}
        onToggle={toggleSection}
      >
        <label className="flex items-center gap-3 cursor-pointer group py-1">
          <div
            onClick={() => setInStock(!inStock)}
            className={cn(
              'w-10 h-5 rounded-full relative transition-colors',
              inStock ? 'bg-gold' : 'bg-white/10',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all',
                inStock ? 'left-[22px]' : 'left-0.5',
              )}
            />
          </div>
          <span className="text-sm text-muted group-hover:text-white transition-colors">
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
        onClick={() => onToggle(sectionKey)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold text-white"
      >
        {title}
        <ChevronDown
          className={cn('h-4 w-4 text-muted transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && <div className="pb-3">{children}</div>}
    </div>
  )
}
