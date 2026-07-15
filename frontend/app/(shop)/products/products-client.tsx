'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, Grid3X3, List, Package, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/shop/product-card'
import { ProductFilters } from '@/components/shop/product-filters'
import { ProductSort } from '@/components/shop/product-sort'
import { toPersianNumber, cn } from '@/lib/utils'
import type { Product, ViewMode } from '@/types'
import type { ShopCategory } from '@/lib/shop/catalog.types'

interface ProductsPageClientProps {
  products: Product[]
  categories: ShopCategory[]
  activeCategory: ShopCategory | null
  total: number
  page: number
  totalPages: number
  searchParams: {
    category?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    sortBy?: string
    page?: string
    featured?: string
    inStock?: string
  }
}

function buildQuery(base: Record<string, string | undefined>, updates: Record<string, string | null>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(base)) {
    if (value) params.set(key, value)
  }
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === '') params.delete(key)
    else params.set(key, value)
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

function pageWindow(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  if (current <= 3) {
    pages.add(2)
    pages.add(3)
    pages.add(4)
  }
  if (current >= total - 2) {
    pages.add(total - 1)
    pages.add(total - 2)
    pages.add(total - 3)
  }

  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const result: Array<number | 'ellipsis'> = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('ellipsis')
    result.push(sorted[i])
  }
  return result
}

export function ProductsPageClient({
  searchParams,
  products,
  categories,
  activeCategory,
  total,
  page,
  totalPages,
}: ProductsPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const sortBy = searchParams.sortBy ?? 'newest'
  const title = searchParams.search
    ? `نتایج جستجو: «${searchParams.search}»`
    : activeCategory
      ? activeCategory.name
      : searchParams.featured === 'true'
        ? 'محصولات ویژه'
        : 'همه محصولات'

  const queryBase = useMemo(
    () => ({
      category: searchParams.category,
      search: searchParams.search,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      sortBy: searchParams.sortBy,
      featured: searchParams.featured,
      inStock: searchParams.inStock,
    }),
    [searchParams],
  )

  const clearFilter = (key: 'category' | 'search' | 'featured') => {
    router.push(`${pathname}${buildQuery(queryBase, { [key]: null, page: null })}`)
  }

  const setSort = (value: string) => {
    router.push(`${pathname}${buildQuery(queryBase, { sortBy: value === 'newest' ? null : value, page: null })}`)
  }

  const pages = totalPages > 1 ? pageWindow(page, totalPages) : []

  return (
    <div className="min-h-screen bg-black">
      <div
        className="relative flex min-h-[220px] items-center justify-center overflow-hidden pb-10 pt-20"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(200,168,93,0.08) 0%, transparent 60%), linear-gradient(180deg, #0F0F0F 0%, #0B0B0B 100%)',
        }}
      >
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-3">
              <div className="h-px w-10 bg-[#C8A85D]" />
              <span className="text-sm font-semibold tracking-widest text-[#C8A85D]">کاتالوگ</span>
              <div className="h-px w-10 bg-[#C8A85D]" />
            </div>
            <h1 className="mb-3 text-4xl font-black text-white">{title}</h1>
            <p className="text-[#A0A0A0]">
              {toPersianNumber(total)} محصول یافت شد
              {totalPages > 1 && (
                <span className="text-[#666]">
                  {' '}
                  · صفحه {toPersianNumber(page)} از {toPersianNumber(totalPages)}
                </span>
              )}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <ProductFilters searchParams={searchParams} categories={categories} />
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="dark"
                  size="sm"
                  className="lg:hidden"
                  leftIcon={<Filter className="h-4 w-4" />}
                  onClick={() => setIsMobileFilterOpen(true)}
                >
                  فیلتر
                </Button>
                <span className="hidden text-sm text-[#A0A0A0] sm:block">
                  {toPersianNumber(total)} محصول
                </span>
              </div>

              <div className="flex items-center gap-3">
                <ProductSort value={sortBy} onChange={setSort} />

                <div className="hidden items-center gap-1 rounded-lg border border-white/8 bg-[#181818] p-1 sm:flex">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    aria-label="نمایش شبکه‌ای"
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded transition-colors',
                      viewMode === 'grid' ? 'bg-[#C8A85D] text-black' : 'text-[#A0A0A0] hover:text-white',
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    aria-label="نمایش لیستی"
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded transition-colors',
                      viewMode === 'list' ? 'bg-[#C8A85D] text-black' : 'text-[#A0A0A0] hover:text-white',
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {(searchParams.category || searchParams.search || searchParams.featured === 'true') && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#A0A0A0]">فیلترهای فعال:</span>
                {searchParams.category && (
                  <button
                    type="button"
                    onClick={() => clearFilter('category')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#C8A85D]/30 bg-[#C8A85D]/10 px-3 py-1 text-xs text-[#C8A85D]"
                  >
                    {activeCategory?.name ?? searchParams.category}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {searchParams.search && (
                  <button
                    type="button"
                    onClick={() => clearFilter('search')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#C8A85D]/30 bg-[#C8A85D]/10 px-3 py-1 text-xs text-[#C8A85D]"
                  >
                    جستجو: {searchParams.search}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {searchParams.featured === 'true' && (
                  <button
                    type="button"
                    onClick={() => clearFilter('featured')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#C8A85D]/30 bg-[#C8A85D]/10 px-3 py-1 text-xs text-[#C8A85D]"
                  >
                    فقط ویژه
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-[#121212] px-6 py-20 text-center">
                <Package className="mb-4 h-14 w-14 text-zinc-700" />
                <h2 className="mb-2 text-lg font-bold text-white">محصولی یافت نشد</h2>
                <p className="mb-6 max-w-md text-sm text-[#A0A0A0]">
                  با فیلترهای فعلی محصولی در کاتالوگ نیست. فیلترها را تغییر دهید یا همه محصولات را ببینید.
                </p>
                <Button asChild variant="gold-outline" size="md">
                  <Link href="/products">مشاهده همه محصولات</Link>
                </Button>
              </div>
            ) : (
              <motion.div
                className={cn(
                  'grid gap-5',
                  viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
                )}
                layout
              >
                <AnimatePresence mode="popLayout">
                  {products.map((product, i) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: i * 0.04 }}
                    >
                      <ProductCard product={product} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {pages.length > 0 && (
              <nav className="mt-12 flex items-center justify-center gap-2" aria-label="صفحه‌بندی">
                {page > 1 && (
                  <Link
                    href={`${pathname}${buildQuery(queryBase, { page: page - 1 === 1 ? null : String(page - 1) })}`}
                    className="flex h-10 min-w-[40px] items-center justify-center rounded-xl border border-white/8 bg-[#181818] px-3 text-sm text-[#A0A0A0] transition-all hover:border-[#C8A85D]/30 hover:text-white"
                  >
                    قبلی
                  </Link>
                )}
                {pages.map((item, i) =>
                  item === 'ellipsis' ? (
                    <span key={`e-${i}`} className="px-1 text-[#666]">
                      …
                    </span>
                  ) : (
                    <Link
                      key={item}
                      href={`${pathname}${buildQuery(queryBase, { page: item === 1 ? null : String(item) })}`}
                      aria-current={item === page ? 'page' : undefined}
                      className={cn(
                        'flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-sm font-medium transition-all',
                        item === page
                          ? 'bg-[#C8A85D] text-black'
                          : 'border border-white/8 bg-[#181818] text-[#A0A0A0] hover:border-[#C8A85D]/30 hover:text-white',
                      )}
                    >
                      {toPersianNumber(item)}
                    </Link>
                  ),
                )}
                {page < totalPages && (
                  <Link
                    href={`${pathname}${buildQuery(queryBase, { page: String(page + 1) })}`}
                    className="flex h-10 min-w-[40px] items-center justify-center rounded-xl border border-white/8 bg-[#181818] px-3 text-sm text-[#A0A0A0] transition-all hover:border-[#C8A85D]/30 hover:text-white"
                  >
                    بعدی
                  </Link>
                )}
              </nav>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileFilterOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="absolute bottom-0 left-0 top-0 w-80 max-w-[90vw] overflow-y-auto border-l border-white/8 bg-[#181818]"
            >
              <div className="flex items-center justify-between border-b border-white/8 p-5">
                <h3 className="flex items-center gap-2 font-bold text-white">
                  <SlidersHorizontal className="h-5 w-5 text-[#C8A85D]" />
                  فیلترها
                </h3>
                <button type="button" onClick={() => setIsMobileFilterOpen(false)} className="text-[#A0A0A0] hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5">
                <ProductFilters
                  searchParams={searchParams}
                  categories={categories}
                  onApplied={() => setIsMobileFilterOpen(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
