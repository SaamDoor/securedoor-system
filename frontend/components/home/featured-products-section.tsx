'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye, ArrowLeft, Star } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

const products = [
  {
    id: '1',
    name: 'درب ضد سرقت آرتوس پلاتینیوم',
    slug: 'artus-platinum',
    price: 28500000,
    comparePrice: 32000000,
    category: 'درب ضد سرقت',
    rating: 4.9,
    reviewCount: 142,
    isNew: true,
    isFeatured: true,
    badge: 'محبوب‌ترین',
    image: '/products/door-1.jpg',
    securityGrade: 'Class 6',
  },
  {
    id: '2',
    name: 'درب ضد سرقت رگال مشکی',
    slug: 'regal-black',
    price: 19800000,
    comparePrice: null,
    category: 'درب آپارتمانی',
    rating: 4.8,
    reviewCount: 98,
    isNew: false,
    isFeatured: true,
    badge: null,
    image: '/products/door-2.jpg',
    securityGrade: 'Class 4',
  },
  {
    id: '3',
    name: 'درب ضد حریق فایر مکس ۹۰',
    slug: 'fire-max-90',
    price: 35200000,
    comparePrice: null,
    category: 'درب ضد حریق',
    rating: 5.0,
    reviewCount: 63,
    isNew: true,
    isFeatured: true,
    badge: 'جدید',
    image: '/products/door-3.jpg',
    securityGrade: 'REI 90',
  },
  {
    id: '4',
    name: 'درب ویلایی گراند رویال',
    slug: 'grand-royal',
    price: 54900000,
    comparePrice: 60000000,
    category: 'درب ویلایی',
    rating: 4.9,
    reviewCount: 31,
    isNew: false,
    isFeatured: true,
    badge: 'لوکس',
    image: '/products/door-4.jpg',
    securityGrade: 'Class 6',
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
    <div className="group relative bg-surface border border-white/8 rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-400 hover:shadow-gold">
      {/* Image */}
      <div className="relative aspect-product overflow-hidden bg-zinc-900">
        {/* Placeholder gradient until real images */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <Badge variant={product.badge === 'جدید' ? 'success' : 'gold'} size="sm">
              {product.badge}
            </Badge>
          )}
          {discount && (
            <Badge variant="danger" size="sm">
              {toPersianNumber(discount)}٪ تخفیف
            </Badge>
          )}
        </div>

        {/* Security grade */}
        <div className="absolute top-3 left-3 z-10">
          <div className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-2xs font-bold text-gold border border-gold/30">
            {product.securityGrade}
          </div>
        </div>

        {/* Actions overlay */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center gap-3',
          'opacity-0 group-hover:opacity-100 transition-all duration-300',
          'bg-black/30 backdrop-blur-sm',
        )}>
          <button className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-gold/20 hover:border-gold/40 transition-all">
            <Heart className="h-4 w-4" />
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-gold/20 hover:border-gold/40 transition-all"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all">
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-muted mb-1.5">{product.category}</div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-white text-sm mb-2 hover:text-gold transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="text-xs font-semibold text-gold">
            {toPersianNumber(product.rating.toFixed(1))}
          </span>
          <span className="text-xs text-muted">
            ({toPersianNumber(product.reviewCount)} نظر)
          </span>
        </div>

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

          <button className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center',
            'bg-gold/10 border border-gold/30 text-gold',
            'hover:bg-gold hover:text-black transition-all duration-300',
          )}>
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
