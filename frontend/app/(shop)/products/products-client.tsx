'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, Grid3X3, List, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/shop/product-card'
import { ProductFilters } from '@/components/shop/product-filters'
import { ProductSort } from '@/components/shop/product-sort'
import { toPersianNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Product, ViewMode } from '@/types'
import type { StockStatus } from '@/types/product'

interface ProductsPageClientProps {
  searchParams: {
    category?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    sortBy?: string
    page?: string
    featured?: string
  }
}

const NAMES = ['آرتوس', 'رگال', 'فایر', 'گراند', 'پرمیوم', 'الیت'] as const
const VARIANTS = ['پلاتینیوم', 'گلد', 'بلک', 'رویال', 'پرو', 'کلاسیک'] as const

const DEMO_PRODUCTS: Product[] = Array.from({ length: 12 }, (_, i) => {
  const stockStatus: StockStatus = i % 4 === 0 ? 'out_of_stock' : 'in_stock'
  return {
    id: String(i + 1),
    sku: `SD-${1000 + i}`,
    name: `درب ضد سرقت مدل ${NAMES[i % 6]} ${VARIANTS[i % 6]}`,
    slug: `door-model-${i + 1}`,
    shortDescription: 'درب ضد سرقت با استاندارد بین‌المللی و ضمانت ۱۰ ساله',
    description: 'توضیحات کامل محصول',
    price: (15 + i * 3.5) * 1_000_000,
    comparePrice: i % 3 === 0 ? (18 + i * 3.5) * 1_000_000 : undefined,
    costPrice: undefined,
    categoryId: '1',
    category: {
      id: '1',
      name: 'درب ضد سرقت',
      slug: 'darb-zed-sereqat',
      order: 1,
      isActive: true,
    },
    images: [],
    attributes: [],
    specifications: [],
    downloads: [],
    tags: [],
    stock: i % 4 === 0 ? 0 : 10,
    stockStatus,
    weight: undefined,
    dimensions: undefined,
    isActive: true,
    isFeatured: i < 4,
    isNew: i < 3,
    viewCount: 1000 + i * 123,
    reviewCount: 10 + i * 7,
    averageRating: Math.min(5, 4.5 + (i % 3) * 0.15),
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  }
})

export function ProductsPageClient({ searchParams }: ProductsPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState(searchParams.sortBy ?? 'newest')

  const totalProducts = DEMO_PRODUCTS.length

  return (
    <div className="min-h-screen bg-black">
      {/* Page hero */}
      <div className="relative min-h-[220px] flex items-center justify-center overflow-hidden pt-20 pb-10"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(200,168,93,0.08) 0%, transparent 60%), linear-gradient(180deg, #0F0F0F 0%, #0B0B0B 100%)',
        }}
      >
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-[#C8A85D]" />
              <span className="text-[#C8A85D] text-sm font-semibold tracking-widest">کاتالوگ</span>
              <div className="h-px w-10 bg-[#C8A85D]" />
            </div>
            <h1 className="text-4xl font-black text-white mb-3">
              {searchParams.search
                ? `نتایج جستجو: "${searchParams.search}"`
                : 'همه محصولات'}
            </h1>
            <p className="text-[#A0A0A0]">
              {toPersianNumber(totalProducts)} محصول یافت شد
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <ProductFilters searchParams={searchParams} />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
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
                <span className="text-sm text-[#A0A0A0] hidden sm:block">
                  {toPersianNumber(totalProducts)} محصول
                </span>
              </div>

              <div className="flex items-center gap-3">
                <ProductSort value={sortBy} onChange={setSortBy} />

                <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-[#181818] border border-white/8">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="نمایش شبکه‌ای"
                    className={cn(
                      'h-7 w-7 rounded flex items-center justify-center transition-colors',
                      viewMode === 'grid'
                        ? 'bg-[#C8A85D] text-black'
                        : 'text-[#A0A0A0] hover:text-white',
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label="نمایش لیستی"
                    className={cn(
                      'h-7 w-7 rounded flex items-center justify-center transition-colors',
                      viewMode === 'list'
                        ? 'bg-[#C8A85D] text-black'
                        : 'text-[#A0A0A0] hover:text-white',
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filters */}
            {(searchParams.category || searchParams.search) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-[#A0A0A0]">فیلترهای فعال:</span>
                {searchParams.category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8A85D]/10 border border-[#C8A85D]/30 text-[#C8A85D] text-xs">
                    {searchParams.category}
                    <X className="h-3 w-3 cursor-pointer" />
                  </span>
                )}
                {searchParams.search && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8A85D]/10 border border-[#C8A85D]/30 text-[#C8A85D] text-xs">
                    جستجو: {searchParams.search}
                    <X className="h-3 w-3 cursor-pointer" />
                  </span>
                )}
              </div>
            )}

            {/* Products */}
            <motion.div
              className={cn(
                'grid gap-5',
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1',
              )}
              layout
            >
              <AnimatePresence mode="popLayout">
                {DEMO_PRODUCTS.map((product, i) => (
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

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-12">
              {([1, 2, 3, '...', 8] as Array<number | string>).map((page, i) => (
                <button
                  key={i}
                  className={cn(
                    'h-10 min-w-[40px] px-3 rounded-xl text-sm font-medium transition-all',
                    page === 1
                      ? 'bg-[#C8A85D] text-black'
                      : 'bg-[#181818] border border-white/8 text-[#A0A0A0] hover:border-[#C8A85D]/30 hover:text-white',
                  )}
                >
                  {typeof page === 'number' ? toPersianNumber(page) : page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-80 max-w-[90vw] bg-[#181818] border-l border-white/8 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/8">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-[#C8A85D]" />
                  فیلترها
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-[#A0A0A0] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5">
                <ProductFilters searchParams={searchParams} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
