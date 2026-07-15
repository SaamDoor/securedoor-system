'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye, ArrowLeft, Package } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, toPersianNumber, cn } from '@/lib/utils'
import { getProductPath } from '@/lib/shop/product-path'

export interface FeaturedProductCard {
  id: string
  name: string
  slug: string
  sku: string
  price: number
  comparePrice: number | null
  category: string
  isNew: boolean
  isFeatured: boolean
  image: string | null
}

interface FeaturedProductsSectionProps {
  products: FeaturedProductCard[]
}

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  if (!products.length) return null

  return (
    <section className="section-padding relative overflow-hidden bg-black">
      <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-gold/4 blur-[120px]" />

      <div className="container relative">
        <div className="mb-12 flex items-end justify-between">
          <SectionHeader
            eyebrow="محصولات ویژه"
            title="بهترین‌های گروه مشعوف"
            description="منتخب سوپر ادمین — بر اساس اولویت نمایش در پنل مدیریت."
          />
          <Link
            href="/products?featured=true"
            className="hidden items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold-light lg:flex"
          >
            مشاهده همه
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <FeaturedCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-center lg:hidden">
          <Button asChild variant="gold-outline" size="md">
            <Link href="/products">مشاهده همه محصولات</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function FeaturedCard({ product }: { product: FeaturedProductCard }) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null

  return (
    <Link
      href={getProductPath(product)}
      className="group relative block overflow-hidden rounded-2xl border border-white/8 bg-surface transition-all duration-400 hover:border-gold/30 hover:shadow-gold"
    >
      <div className="relative aspect-product overflow-hidden bg-zinc-900">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Package className="h-12 w-12 text-zinc-700" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />

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
          {discount !== null && discount > 0 && (
            <Badge variant="danger" size="sm">
              {toPersianNumber(discount)}٪ تخفیف
            </Badge>
          )}
        </div>

        <div className="absolute left-3 top-3 z-10">
          <div className="rounded-lg border border-gold/20 bg-black/60 px-2 py-1 text-[10px] font-bold tracking-widest text-gold/80 backdrop-blur-sm">
            {product.sku}
          </div>
        </div>

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center gap-3',
            'bg-black/25 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100',
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white">
            <Heart className="h-4 w-4" />
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white">
            <Eye className="h-4 w-4" />
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/40 bg-gold/20 text-gold">
            <ShoppingCart className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-1.5 text-xs text-muted">{product.category}</div>
        <h3 className="mb-3 line-clamp-2 min-h-[2.5rem] text-sm font-bold text-white transition-colors group-hover:text-gold">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-black text-white">{formatPrice(product.price)}</div>
            {product.comparePrice && (
              <div className="text-xs text-muted line-through">{formatPrice(product.comparePrice)}</div>
            )}
          </div>
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl',
              'border border-gold/30 bg-gold/10 text-gold',
              'transition-all duration-300 group-hover:bg-gold group-hover:text-black',
            )}
          >
            <ShoppingCart className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
