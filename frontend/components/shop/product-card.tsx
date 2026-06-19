'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye, Star, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Product, ViewMode } from '@/types'

interface ProductCardProps {
  product: Product
  viewMode?: ViewMode
  className?: string
}

export function ProductCard({ product, viewMode = 'grid', className }: ProductCardProps) {
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null

  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0]
  const isInStock    = product.stockStatus === 'in_stock'

  /* ── List mode ── */
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'group flex gap-5 p-5 rounded-2xl',
          'bg-zinc-900 border border-white/[0.07]',
          'shadow-[0_2px_12px_rgba(0,0,0,0.3)]',
          'hover:border-primary/30 hover:-translate-y-0.5',
          'hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(196,30,58,0.12)]',
          'transition-all duration-300',
          className,
        )}
      >
        {/* Image */}
        <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="128px"
            />
          ) : (
            <Image src="/placeholder-product.svg" alt="گروه صنعتی مشعوف" fill className="object-cover" sizes="128px" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs text-zinc-500 mb-1">{product.category.name}</div>
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-bold text-white hover:text-primary-400 transition-colors mb-2 line-clamp-1">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center gap-3 mb-3">
                {product.reviewCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span className="text-xs font-semibold text-primary">{toPersianNumber(product.averageRating.toFixed(1))}</span>
                    <span className="text-xs text-zinc-500">({toPersianNumber(product.reviewCount)})</span>
                  </div>
                )}
                <Badge variant={isInStock ? 'success' : 'danger'} size="sm" dot>
                  {isInStock ? 'موجود' : 'ناموجود'}
                </Badge>
              </div>
              {product.shortDescription && (
                <p className="text-sm text-zinc-500 line-clamp-2">{product.shortDescription}</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <div>
                <div className="font-black text-white text-lg text-left">{formatPrice(product.price)}</div>
                {product.comparePrice && (
                  <div className="text-xs text-zinc-600 line-through text-left">{formatPrice(product.comparePrice)}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="افزودن به علاقه‌مندی‌ها"
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-zinc-500 hover:text-primary hover:border-primary/30 hover:bg-primary/8 transition-all"
                >
                  <Heart className="h-4 w-4" />
                </button>
                <Button variant="gold" size="sm" disabled={!isInStock}>
                  <ShoppingCart className="h-4 w-4" />
                  افزودن به سبد
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Grid mode ── */
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        'bg-zinc-900 border border-white/[0.07]',
        'shadow-[0_2px_12px_rgba(0,0,0,0.3)]',
        'hover:border-primary/25',
        'hover:shadow-[0_16px_48px_rgba(0,0,0,0.55),0_0_0_1px_rgba(196,30,58,0.08),0_0_40px_rgba(196,30,58,0.06)]',
        'transition-colors duration-300',
        className,
      )}
    >
      {/* Shimmer line on hover */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

      {/* ── Image area ── */}
      <div className="relative overflow-hidden bg-zinc-800" style={{ aspectRatio: '3/4' }}>
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            className="object-cover group-hover:scale-[1.07] transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <Image src="/placeholder-product.svg" alt="گروه صنعتی مشعوف" fill className="object-cover opacity-40" sizes="(max-width: 640px) 100vw, 33vw" />
        )}

        {/* Vignette on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-[1]" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {product.isNew && <Badge variant="success" size="sm">جدید</Badge>}
          {product.isFeatured && !product.isNew && <Badge variant="gold" size="sm">ویژه</Badge>}
          {discount !== null && <Badge variant="danger" size="sm">٪{toPersianNumber(discount)}</Badge>}
        </div>

        {/* Out of stock overlay */}
        {!isInStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/65 z-10 backdrop-blur-[2px]">
            <Badge variant="danger" size="lg">ناموجود</Badge>
          </div>
        )}

        {/* Hover actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileHover={{ opacity: 1, y: 0 }}
          className={cn(
            'absolute inset-0 flex items-end justify-center gap-2.5 pb-4 z-10',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity duration-300',
          )}
        >
          <button
            aria-label="افزودن به علاقه‌مندی‌ها"
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary/20 hover:border-primary/40 hover:text-primary transition-all duration-200 shadow-lg"
          >
            <Heart className="h-4 w-4" />
          </button>
          <Link
            href={`/products/${product.slug}`}
            aria-label="مشاهده محصول"
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary/20 hover:border-primary/40 hover:text-primary transition-all duration-200 shadow-lg"
          >
            <Eye className="h-4 w-4" />
          </Link>
          {isInStock && (
            <button
              aria-label="افزودن به سبد خرید"
              className="w-10 h-10 rounded-full bg-gradient-to-b from-[#D42B47] to-[#C41E3A] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(196,30,58,0.5)] hover:from-[#E03050] transition-all duration-200"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      </div>

      {/* ── Content ── */}
      <div className="p-4">
        <div className="text-xs text-zinc-500 mb-1.5 flex items-center gap-1">
          <Package className="h-3 w-3" />
          {product.category.name}
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-white text-sm mb-2 hover:text-primary-400 transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < Math.round(product.averageRating)
                    ? 'fill-primary text-primary'
                    : 'fill-zinc-700 text-zinc-700',
                )}
              />
            ))}
            <span className="text-xs text-zinc-500 mr-0.5">({toPersianNumber(product.reviewCount)})</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <div className="font-black text-white text-base leading-tight">{formatPrice(product.price)}</div>
            {product.comparePrice && (
              <div className="text-xs text-zinc-600 line-through">{formatPrice(product.comparePrice)}</div>
            )}
          </div>

          <button
            disabled={!isInStock}
            aria-label="افزودن به سبد خرید"
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
              isInStock
                ? 'bg-primary/10 border border-primary/25 text-primary hover:bg-gradient-to-b hover:from-[#D42B47] hover:to-[#C41E3A] hover:text-white hover:border-transparent hover:shadow-[0_4px_16px_rgba(196,30,58,0.4)] hover:scale-110'
                : 'bg-zinc-800 border border-white/[0.07] text-zinc-600 cursor-not-allowed',
            )}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
