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
  const isInStock = product.stockStatus === 'in_stock'

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'group flex gap-5 p-5 rounded-2xl bg-[#181818] border border-white/8',
          'hover:border-[#C8A85D]/30 transition-all duration-300',
          'hover:shadow-[0_4px_20px_rgba(200,168,93,0.15)]',
          className,
        )}
      >
        {/* Image */}
        <div className="w-32 h-32 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0 relative">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="128px"
            />
          ) : (
            <Image
              src="/placeholder-product.svg"
              alt="گروه صنعتی مشعوف"
              fill
              className="object-cover"
              sizes="128px"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs text-[#A0A0A0] mb-1">{product.category.name}</div>
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-bold text-white hover:text-[#E7D3A5] transition-colors mb-2 line-clamp-1">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center gap-3 mb-3">
                {product.reviewCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-[#C8A85D] text-[#C8A85D]" />
                    <span className="text-xs font-semibold text-[#C8A85D]">
                      {toPersianNumber(product.averageRating.toFixed(1))}
                    </span>
                    <span className="text-xs text-[#A0A0A0]">
                      ({toPersianNumber(product.reviewCount)})
                    </span>
                  </div>
                )}
                <Badge variant={isInStock ? 'success' : 'danger'} size="sm" dot>
                  {isInStock ? 'موجود' : 'ناموجود'}
                </Badge>
              </div>

              {product.shortDescription && (
                <p className="text-sm text-[#A0A0A0] line-clamp-2">{product.shortDescription}</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <div>
                <div className="font-black text-white text-lg text-left">
                  {formatPrice(product.price)}
                </div>
                {product.comparePrice && (
                  <div className="text-xs text-[#A0A0A0] line-through text-left">
                    {formatPrice(product.comparePrice)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  aria-label="افزودن به علاقه‌مندی‌ها"
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-[#C8A85D] hover:border-[#C8A85D]/30 transition-all"
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

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative bg-[#181818] border border-white/8 rounded-2xl overflow-hidden',
        'hover:border-[#C8A85D]/30 transition-colors duration-300',
        'hover:shadow-[0_4px_20px_rgba(200,168,93,0.25)]',
        className,
      )}
    >
      {/* Image container */}
      <div className="relative overflow-hidden bg-zinc-900" style={{ aspectRatio: '3/4' }}>
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <Image
            src="/placeholder-product.svg"
            alt="گروه صنعتی مشعوف"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {product.isNew && <Badge variant="success" size="sm">جدید</Badge>}
          {product.isFeatured && !product.isNew && (
            <Badge variant="gold" size="sm">ویژه</Badge>
          )}
          {discount !== null && <Badge variant="danger" size="sm">٪{toPersianNumber(discount)}</Badge>}
        </div>

        {/* Out of stock overlay */}
        {!isInStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <Badge variant="danger" size="lg">ناموجود</Badge>
          </div>
        )}

        {/* Hover actions */}
        <div
          className={cn(
            'absolute inset-0 flex items-end justify-center gap-3 pb-4 z-10',
            'opacity-0 group-hover:opacity-100',
            'bg-gradient-to-t from-black/60 via-transparent to-transparent',
            'transition-opacity duration-300',
          )}
        >
          <button
            aria-label="افزودن به علاقه‌مندی‌ها"
            className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-[#C8A85D]/20 hover:border-[#C8A85D]/40 hover:text-[#C8A85D] transition-all"
          >
            <Heart className="h-4 w-4" />
          </button>
          <Link
            href={`/products/${product.slug}`}
            aria-label="مشاهده محصول"
            className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-[#C8A85D]/20 hover:border-[#C8A85D]/40 hover:text-[#C8A85D] transition-all"
          >
            <Eye className="h-4 w-4" />
          </Link>
          {isInStock && (
            <button
              aria-label="افزودن به سبد خرید"
              className="w-10 h-10 rounded-xl bg-[#C8A85D] flex items-center justify-center text-black hover:bg-[#E7D3A5] transition-all"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-[#A0A0A0] mb-1.5">{product.category.name}</div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-white text-sm mb-2 hover:text-[#E7D3A5] transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="h-3.5 w-3.5 fill-[#C8A85D] text-[#C8A85D]" />
            <span className="text-xs font-semibold text-[#C8A85D]">
              {toPersianNumber(product.averageRating.toFixed(1))}
            </span>
            <span className="text-xs text-[#A0A0A0]">
              ({toPersianNumber(product.reviewCount)})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="font-black text-white text-base leading-tight">
              {formatPrice(product.price)}
            </div>
            {product.comparePrice && (
              <div className="text-xs text-[#A0A0A0] line-through">
                {formatPrice(product.comparePrice)}
              </div>
            )}
          </div>

          <button
            disabled={!isInStock}
            aria-label="افزودن به سبد خرید"
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300',
              isInStock
                ? 'bg-[#C8A85D]/10 border border-[#C8A85D]/30 text-[#C8A85D] hover:bg-[#C8A85D] hover:text-black'
                : 'bg-white/5 border border-white/8 text-[#A0A0A0] cursor-not-allowed',
            )}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
