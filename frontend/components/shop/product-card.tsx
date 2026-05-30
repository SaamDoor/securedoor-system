'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye, Star, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Product, ViewMode } from '@/types'

interface ProductCardProps {
  product: Product
  viewMode?: ViewMode
  className?: string
}

export function ProductCard({ product, viewMode = 'grid', className }: ProductCardProps) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null

  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0]

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'group flex gap-5 p-5 rounded-2xl bg-surface border border-white/8',
          'hover:border-gold/30 transition-all duration-400 hover:shadow-gold-sm',
          className,
        )}
      >
        {/* Image */}
        <div className="w-32 h-32 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0 relative">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <Package className="h-8 w-8 text-zinc-700" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs text-muted mb-1">{product.category.name}</div>
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-bold text-white hover:text-gold-light transition-colors mb-2 line-clamp-1">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                  <span className="text-xs font-semibold text-gold">
                    {toPersianNumber(product.averageRating.toFixed(1))}
                  </span>
                  <span className="text-xs text-muted">
                    ({toPersianNumber(product.reviewCount)})
                  </span>
                </div>

                <Badge
                  variant={product.stockStatus === 'in_stock' ? 'success' : 'danger'}
                  size="sm"
                  dot
                >
                  {product.stockStatus === 'in_stock' ? 'موجود' : 'ناموجود'}
                </Badge>
              </div>

              {product.shortDescription && (
                <p className="text-sm text-muted line-clamp-2">{product.shortDescription}</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              <div className="text-left">
                <div className="font-black text-white text-lg">
                  {formatPrice(product.price)}
                </div>
                {product.comparePrice && (
                  <div className="text-xs text-muted line-through text-left">
                    {formatPrice(product.comparePrice)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 transition-all">
                  <Heart className="h-4 w-4" />
                </button>
                <Button variant="gold" size="sm" disabled={product.stockStatus !== 'in_stock'}>
                  <ShoppingCart className="h-4 w-4 ml-1" />
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
    <div
      className={cn(
        'group relative bg-surface border border-white/8 rounded-2xl overflow-hidden',
        'hover:border-gold/30 transition-all duration-400 hover:shadow-gold',
        'hover:-translate-y-1',
        className,
      )}
    >
      {/* Image container */}
      <div className="relative aspect-product overflow-hidden bg-zinc-900">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <Package className="h-12 w-12 text-zinc-700" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {product.isNew && <Badge variant="success" size="sm">جدید</Badge>}
          {product.isFeatured && !product.isNew && (
            <Badge variant="gold" size="sm">ویژه</Badge>
          )}
          {discount && <Badge variant="danger" size="sm">٪{toPersianNumber(discount)}</Badge>}
        </div>

        {/* Stock badge */}
        {product.stockStatus !== 'in_stock' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <Badge variant="danger" size="lg">ناموجود</Badge>
          </div>
        )}

        {/* Hover actions */}
        <div className={cn(
          'absolute inset-0 flex items-end justify-center gap-3 pb-4 z-10',
          'opacity-0 group-hover:opacity-100',
          'bg-gradient-to-t from-black/60 via-transparent to-transparent',
          'transition-opacity duration-300',
        )}>
          <button className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-gold/20 hover:border-gold/40 hover:text-gold transition-all">
            <Heart className="h-4 w-4" />
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="w-10 h-10 rounded-xl bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-gold/20 hover:border-gold/40 hover:text-gold transition-all"
          >
            <Eye className="h-4 w-4" />
          </Link>
          {product.stockStatus === 'in_stock' && (
            <button className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center text-black hover:bg-gold-light transition-all">
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-muted mb-1.5">{product.category.name}</div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-white text-sm mb-2 hover:text-gold-light transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            <span className="text-xs font-semibold text-gold">
              {toPersianNumber(product.averageRating.toFixed(1))}
            </span>
            <span className="text-xs text-muted">
              ({toPersianNumber(product.reviewCount)})
            </span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="font-black text-white text-base leading-tight">
              {formatPrice(product.price)}
            </div>
            {product.comparePrice && (
              <div className="text-xs text-muted line-through">
                {formatPrice(product.comparePrice)}
              </div>
            )}
          </div>

          <button
            disabled={product.stockStatus !== 'in_stock'}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300',
              product.stockStatus === 'in_stock'
                ? 'bg-gold/10 border border-gold/30 text-gold hover:bg-gold hover:text-black'
                : 'bg-white/5 border border-white/8 text-muted cursor-not-allowed',
            )}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Button({
  children,
  variant,
  size,
  disabled,
  className,
}: {
  children: React.ReactNode
  variant: 'gold'
  size: 'sm'
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
        variant === 'gold' && !disabled && 'bg-gold text-black hover:bg-gold-light',
        variant === 'gold' && disabled && 'bg-white/5 text-muted cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  )
}
