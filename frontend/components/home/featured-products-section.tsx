'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye, ArrowLeft } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

const products = [
  {
    id: 'p1001000-0000-0000-0000-000000000001',
    name: 'درب ضد سرقت سپیدار',
    slug: 'darb-zed-sereqat-sepidaar',
    sku: 'MSH-1001',
    price: 18500000,
    comparePrice: 20000000,
    category: 'درب ضد سرقت',
    rating: 0,
    reviewCount: 0,
    isNew: false,
    isFeatured: true,
    badge: 'ویژه',
    image: '/products/MSH-1001/main.webp',
  },
  {
    id: 'p1002000-0000-0000-0000-000000000002',
    name: 'درب ضد سرقت ونوس راش',
    slug: 'darb-zed-sereqat-venus-rush',
    sku: 'MSH-1002',
    price: 19200000,
    comparePrice: null,
    category: 'درب ضد سرقت',
    rating: 0,
    reviewCount: 0,
    isNew: false,
    isFeatured: true,
    badge: null,
    image: '/products/MSH-1002/main.webp',
  },
  {
    id: 'p1005000-0000-0000-0000-000000000005',
    name: 'درب ضد سرقت CNC کلاسیک',
    slug: 'darb-zed-sereqat-cnc-classic',
    sku: 'MSH-1005',
    price: 22000000,
    comparePrice: 24500000,
    category: 'درب ضد سرقت',
    rating: 0,
    reviewCount: 0,
    isNew: true,
    isFeatured: true,
    badge: 'جدید',
    image: '/products/MSH-1005/main.webp',
  },
  {
    id: 'p1007000-0000-0000-0000-000000000007',
    name: 'درب ضد سرقت نگین',
    slug: 'darb-zed-sereqat-negin',
    sku: 'MSH-1007',
    price: 23000000,
    comparePrice: 25000000,
    category: 'درب ضد سرقت',
    rating: 0,
    reviewCount: 0,
    isNew: true,
    isFeatured: true,
    badge: 'لوکس',
    image: '/products/MSH-1007/main.webp',
  },
]

export function FeaturedProductsSection() {
  return (
    <section className="section-padding bg-black relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gold/4 blur-[120px] pointer-events-none" />

      <div className="container relative">
        <div className="flex items-end justify-between mb-12">
          <SectionHeader
            eyebrow="محصولات ویژه"
            title="بهترین‌های گروه مشعوف"
            description="برگزیده‌ترین محصولات با بالاترین امتیاز مشتریان."
          />
          <Link
            href="/products?featured=true"
            className="hidden lg:flex items-center gap-2 text-gold hover:text-gold-light text-sm font-medium transition-colors"
          >
            مشاهده همه
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="flex lg:hidden justify-center mt-8">
          <Button asChild variant="gold-outline" size="md">
            <Link href="/products">مشاهده همه محصولات</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product }: { product: (typeof products)[0] }) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null

  return (
    <Link href={`/products/${product.slug}`} className="group relative bg-surface border border-white/8 rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-400 hover:shadow-gold block">
      {/* Image */}
      <div className="relative aspect-product overflow-hidden bg-zinc-900">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        {/* Fallback gradient when image not yet uploaded */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 -z-10" />

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <Badge variant={product.badge === 'جدید' ? 'success' : 'gold'} size="sm">
              {product.badge}
            </Badge>
          )}
          {discount !== null && (
            <Badge variant="danger" size="sm">
              {toPersianNumber(discount)}٪ تخفیف
            </Badge>
          )}
        </div>

        {/* SKU chip */}
        <div className="absolute top-3 left-3 z-10">
          <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[10px] font-bold text-gold/80 border border-gold/20 tracking-widest">
            {product.sku}
          </div>
        </div>

        {/* Actions overlay */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center gap-3',
          'opacity-0 group-hover:opacity-100 transition-all duration-300',
          'bg-black/25 backdrop-blur-[2px]',
        )}>
          <button
            onClick={(e) => e.preventDefault()}
            className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-gold/20 hover:border-gold/40 transition-all"
          >
            <Heart className="h-4 w-4" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-gold/20 hover:border-gold/40 transition-all">
            <Eye className="h-4 w-4" />
          </div>
          <button
            onClick={(e) => e.preventDefault()}
            className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-muted mb-1.5">{product.category}</div>

        <h3 className="font-bold text-white text-sm mb-3 group-hover:text-gold transition-colors line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-black text-white text-base">
              {formatPrice(product.price)}
            </div>
            {product.comparePrice && (
              <div className="text-xs text-muted line-through">
                {formatPrice(product.comparePrice)}
              </div>
            )}
          </div>

          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center',
            'bg-gold/10 border border-gold/30 text-gold',
            'group-hover:bg-gold group-hover:text-black transition-all duration-300',
          )}>
            <ShoppingCart className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
