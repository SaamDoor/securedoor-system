'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Heart, ShoppingCart, Eye, Star, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, toPersianNumber, cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { getProductPath } from '@/lib/shop/product-path'
import type { Product, ViewMode } from '@/types'

interface ProductCardProps {
  product: Product
  viewMode?: ViewMode
  className?: string
}

export function ProductCard({ product, viewMode = 'grid', className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const href = getProductPath(product)
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null

  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0]
  const isInStock = product.stockStatus === 'in_stock'

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (!isInStock) return
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      price: product.price,
      image: primaryImage?.url ?? null,
      quantity: 1,
    })
    toast.success('به سبد خرید اضافه شد')
  }

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'group flex gap-5 rounded-2xl p-5',
          'border border-white/[0.07] bg-zinc-900',
          'shadow-[0_2px_12px_rgba(0,0,0,0.3)]',
          'transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30',
          'hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(196,30,58,0.12)]',
          className,
        )}
      >
        <Link href={href} className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt ?? product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="128px"
            />
          ) : (
            <Image src="/placeholder-product.svg" alt="گروه صنعتی مشعوف" fill className="object-cover" sizes="128px" />
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-1 text-xs text-zinc-500">{product.category.name}</div>
              <Link href={href}>
                <h3 className="mb-2 line-clamp-1 font-bold text-white transition-colors hover:text-primary-400">
                  {product.name}
                </h3>
              </Link>
              <div className="mb-3 flex items-center gap-3">
                {product.reviewCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span className="text-xs font-semibold text-primary">
                      {toPersianNumber(product.averageRating.toFixed(1))}
                    </span>
                    <span className="text-xs text-zinc-500">({toPersianNumber(product.reviewCount)})</span>
                  </div>
                )}
                <Badge variant={isInStock ? 'success' : 'danger'} size="sm" dot>
                  {isInStock ? 'موجود' : 'ناموجود'}
                </Badge>
              </div>
              {product.shortDescription && (
                <p className="line-clamp-2 text-sm text-zinc-500">{product.shortDescription}</p>
              )}
            </div>

            <div className="flex flex-shrink-0 flex-col items-end gap-3">
              <div>
                <div className="text-left text-lg font-black text-white">{formatPrice(product.price)}</div>
                {product.comparePrice && (
                  <div className="text-left text-xs text-zinc-600 line-through">
                    {formatPrice(product.comparePrice)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="افزودن به علاقه‌مندی‌ها"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-zinc-500 transition-all hover:border-primary/30 hover:bg-primary/8 hover:text-primary"
                >
                  <Heart className="h-4 w-4" />
                </button>
                <Button variant="gold" size="sm" disabled={!isInStock} onClick={handleAddToCart}>
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
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        'border border-white/[0.07] bg-zinc-900',
        'shadow-[0_2px_12px_rgba(0,0,0,0.3)]',
        'transition-colors duration-300 hover:border-primary/25',
        'hover:shadow-[0_16px_48px_rgba(0,0,0,0.55),0_0_0_1px_rgba(196,30,58,0.08),0_0_40px_rgba(196,30,58,0.06)]',
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 z-20 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <Link href={href} className="relative block overflow-hidden bg-zinc-800" style={{ aspectRatio: '3/4' }}>
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.07]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <Image
            src="/placeholder-product.svg"
            alt="گروه صنعتی مشعوف"
            fill
            className="object-cover opacity-40"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        )}

        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
          {product.isNew && (
            <Badge variant="success" size="sm">
              جدید
            </Badge>
          )}
          {product.isFeatured && !product.isNew && (
            <Badge variant="gold" size="sm">
              ویژه
            </Badge>
          )}
          {discount !== null && (
            <Badge variant="danger" size="sm">
              ٪{toPersianNumber(discount)}
            </Badge>
          )}
        </div>

        {!isInStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/65 backdrop-blur-[2px]">
            <Badge variant="danger" size="lg">
              ناموجود
            </Badge>
          </div>
        )}
      </Link>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-end justify-center gap-2.5 pb-4 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100" style={{ height: '75%' }}>
        <button
          type="button"
          aria-label="افزودن به علاقه‌مندی‌ها"
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-primary/20 hover:text-primary"
        >
          <Heart className="h-4 w-4" />
        </button>
        <Link
          href={href}
          aria-label="مشاهده محصول"
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-primary/20 hover:text-primary"
        >
          <Eye className="h-4 w-4" />
        </Link>
        {isInStock && (
          <button
            type="button"
            aria-label="افزودن به سبد خرید"
            onClick={handleAddToCart}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#D42B47] to-[#C41E3A] text-white shadow-[0_4px_16px_rgba(196,30,58,0.5)] transition-all duration-200 hover:from-[#E03050]"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1.5 flex items-center gap-1 text-xs text-zinc-500">
          <Package className="h-3 w-3" />
          {product.category.name}
        </div>

        <Link href={href}>
          <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-bold text-white transition-colors hover:text-primary-400">
            {product.name}
          </h3>
        </Link>

        {product.reviewCount > 0 && (
          <div className="mb-3 flex items-center gap-1.5">
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
            <span className="mr-0.5 text-xs text-zinc-500">({toPersianNumber(product.reviewCount)})</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-1">
          <div>
            <div className="text-base font-black leading-tight text-white">{formatPrice(product.price)}</div>
            {product.comparePrice && (
              <div className="text-xs text-zinc-600 line-through">{formatPrice(product.comparePrice)}</div>
            )}
          </div>

          <button
            type="button"
            disabled={!isInStock}
            aria-label="افزودن به سبد خرید"
            onClick={handleAddToCart}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300',
              isInStock
                ? 'border border-primary/25 bg-primary/10 text-primary hover:scale-110 hover:border-transparent hover:bg-gradient-to-b hover:from-[#D42B47] hover:to-[#C41E3A] hover:text-white hover:shadow-[0_4px_16px_rgba(196,30,58,0.4)]'
                : 'cursor-not-allowed border border-white/[0.07] bg-zinc-800 text-zinc-600',
            )}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
