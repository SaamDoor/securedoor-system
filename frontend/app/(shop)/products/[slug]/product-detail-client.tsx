'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, Heart, ShoppingCart, Share2, Download,
  Shield, Award, Phone, Check, Minus, Plus, Package,
  ZoomIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Rating } from '@/components/ui/rating'
import { Separator } from '@/components/ui/separator'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

const DEMO_PRODUCT = {
  id: '1',
  sku: 'SD-1001',
  name: 'درب ضد سرقت آرتوس پلاتینیوم',
  slug: 'artus-platinum',
  description: `
    درب ضد سرقت آرتوس پلاتینیوم، اوج فناوری و طراحی در صنعت درب‌های امنیتی است.
    این محصول با استفاده از بهترین فولاد گالوانیزه گرم ایتالیایی و سیستم قفل چند نقطه‌ای پیشرفته،
    بالاترین سطح امنیت را برای خانه شما فراهم می‌کند.

    طراحی مدرن و ظریف این درب، آن را به انتخاب اول برای فضاهای لوکس تبدیل کرده است.
  `,
  price: 28_500_000,
  comparePrice: 32_000_000,
  stock: 5,
  stockStatus: 'in_stock' as const,
  isNew: true,
  isFeatured: true,
  averageRating: 4.9,
  reviewCount: 142,
  category: { name: 'درب ضد سرقت', slug: 'darb-zed-sereqat' },
  images: [
    { id: '1', url: '/products/door-1-main.jpg', alt: 'تصویر اصلی', isPrimary: true, order: 0 },
    { id: '2', url: '/products/door-1-detail-1.jpg', alt: 'جزئیات قفل', isPrimary: false, order: 1 },
    { id: '3', url: '/products/door-1-detail-2.jpg', alt: 'جزئیات لبه', isPrimary: false, order: 2 },
    { id: '4', url: '/products/door-1-color.jpg', alt: 'رنگ‌بندی', isPrimary: false, order: 3 },
  ],
  specifications: [
    { label: 'جنس بدنه', value: 'فولاد گالوانیزه گرم', group: 'ساختار' },
    { label: 'ضخامت پنل', value: '۷۰', unit: 'میلی‌متر', group: 'ابعاد' },
    { label: 'وزن', value: '۱۲۰', unit: 'کیلوگرم', group: 'ابعاد' },
    { label: 'درجه امنیتی', value: 'Class 6 - EN 1627', group: 'امنیت' },
    { label: 'سیستم قفل', value: '۷ نقطه‌ای', group: 'امنیت' },
    { label: 'عایق حرارتی', value: 'پلی‌یورتان', group: 'عایق‌بندی' },
    { label: 'کاهش صدا', value: '۴۵', unit: 'دسیبل', group: 'عایق‌بندی' },
    { label: 'ضمانت', value: '۱۰ سال', group: 'گارانتی' },
    { label: 'استاندارد', value: 'EN 1627, ISO 9001', group: 'گواهینامه' },
  ],
  downloads: [
    { id: '1', name: 'کاتالوگ آرتوس پلاتینیوم', fileUrl: '#', fileType: 'PDF' },
    { id: '2', name: 'گواهینامه EN 1627', fileUrl: '#', fileType: 'PDF' },
    { id: '3', name: 'راهنمای نصب', fileUrl: '#', fileType: 'PDF' },
  ],
}

const specGroups = ['ساختار', 'ابعاد', 'امنیت', 'عایق‌بندی', 'گارانتی', 'گواهینامه']

interface ProductDetailClientProps {
  slug: string
}

export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const product = DEMO_PRODUCT
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews' | 'downloads'>('description')
  const [isWishlisted, setIsWishlisted] = useState(false)

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null

  return (
    <div className="min-h-screen bg-black">
      {/* Breadcrumb */}
      <div className="bg-charcoal border-b border-white/8">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-muted">
            <Link href="/" className="hover:text-gold transition-colors">خانه</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/products" className="hover:text-gold transition-colors">محصولات</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/categories/${product.category.slug}`} className="hover:text-gold transition-colors">
              {product.category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* ── Image gallery ── */}
          <div className="space-y-4">
            {/* Main image */}
            <motion.div
              className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 cursor-zoom-in"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                <Package className="h-24 w-24 text-zinc-700" />
              </div>

              {/* Zoom icon */}
              <div className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                <ZoomIn className="h-4 w-4" />
              </div>

              {/* Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {product.isNew && <Badge variant="success" size="md">جدید</Badge>}
                {discount && <Badge variant="danger" size="md">٪{toPersianNumber(discount)} تخفیف</Badge>}
              </div>
            </motion.div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'relative aspect-square rounded-xl overflow-hidden bg-zinc-900',
                    'border-2 transition-all duration-200',
                    i === selectedImage
                      ? 'border-gold shadow-gold-sm'
                      : 'border-transparent hover:border-white/20',
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Product info ── */}
          <div className="space-y-6">
            {/* Category & badges */}
            <div className="flex items-center gap-3">
              <Link href={`/categories/${product.category.slug}`}>
                <Badge variant="gold" size="md">{product.category.name}</Badge>
              </Link>
              {product.isFeatured && (
                <Badge variant="muted" size="md" dot>محصول ویژه</Badge>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-black text-white mb-2 leading-tight">
                {product.name}
              </h1>
              <div className="text-sm text-muted">کد محصول: {product.sku}</div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <Rating
                value={product.averageRating}
                showValue
                showCount
                count={product.reviewCount}
                size="md"
              />
              <button className="text-sm text-gold hover:text-gold-light transition-colors">
                مشاهده نظرات
              </button>
            </div>

            <Separator variant="gradient" />

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <div className="text-4xl font-black text-white">
                {formatPrice(product.price)}
              </div>
              {product.comparePrice && (
                <div className="text-xl text-muted line-through">
                  {formatPrice(product.comparePrice)}
                </div>
              )}
              {discount && (
                <div className="badge-gold text-base">
                  {toPersianNumber(discount)}٪ تخفیف
                </div>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                product.stockStatus === 'in_stock' ? 'bg-success-light' : 'bg-danger-light',
              )} />
              <span className={cn(
                'text-sm font-medium',
                product.stockStatus === 'in_stock' ? 'text-success-light' : 'text-danger-light',
              )}>
                {product.stockStatus === 'in_stock'
                  ? `موجود — ${toPersianNumber(product.stock)} عدد در انبار`
                  : 'ناموجود'}
              </span>
            </div>

            {/* Key features */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Shield, text: 'Class 6 — بالاترین امنیت' },
                { icon: Award, text: 'ضمانت ۱۰ ساله' },
                { icon: Check, text: 'نصب تخصصی' },
                { icon: Check, text: 'ارسال سراسری' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-muted">
                  <Icon className="h-4 w-4 text-gold flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            <Separator variant="gradient" />

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4">
              {/* Quantity selector */}
              <div className="flex items-center gap-1 rounded-xl border border-white/15 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-11 flex items-center justify-center text-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-bold text-white text-sm">
                  {toPersianNumber(quantity)}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-11 flex items-center justify-center text-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                variant="gold"
                size="lg"
                className="flex-1"
                leftIcon={<ShoppingCart className="h-5 w-5" />}
                disabled={product.stockStatus !== 'in_stock'}
              >
                افزودن به سبد خرید
              </Button>

              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={cn(
                  'w-11 h-11 rounded-xl border flex items-center justify-center transition-all',
                  isWishlisted
                    ? 'border-gold/40 bg-gold/10 text-gold'
                    : 'border-white/15 text-muted hover:text-white hover:border-white/30',
                )}
              >
                <Heart className={cn('h-5 w-5', isWishlisted && 'fill-gold')} />
              </button>

              <button className="w-11 h-11 rounded-xl border border-white/15 flex items-center justify-center text-muted hover:text-white hover:border-white/30 transition-all">
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* Consultation */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gold/5 border border-gold/20">
              <Phone className="h-5 w-5 text-gold flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">نیاز به مشاوره دارید؟</div>
                <div className="text-xs text-muted">کارشناسان ما آماده پاسخگویی هستند</div>
              </div>
              <a
                href="tel:02188000000"
                className="px-4 py-2 rounded-lg bg-gold text-black text-sm font-bold hover:bg-gold-light transition-colors"
              >
                تماس بگیرید
              </a>
            </div>
          </div>
        </div>

        {/* ── Detail tabs ── */}
        <div className="bg-surface border border-white/8 rounded-2xl overflow-hidden">
          {/* Tab headers */}
          <div className="flex border-b border-white/8 overflow-x-auto hide-scrollbar">
            {[
              { key: 'description', label: 'توضیحات' },
              { key: 'specs', label: 'مشخصات فنی' },
              { key: 'reviews', label: `نظرات (${toPersianNumber(product.reviewCount)})` },
              { key: 'downloads', label: 'دانلودها' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  'px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all',
                  activeTab === tab.key
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-muted hover:text-white',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'description' && (
                  <div className="prose prose-invert max-w-none text-muted leading-relaxed">
                    {product.description.split('\n').map((line, i) => (
                      line.trim() ? <p key={i}>{line.trim()}</p> : null
                    ))}
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-6">
                    {specGroups.map((group) => {
                      const groupSpecs = product.specifications.filter(
                        (s) => s.group === group,
                      )
                      if (!groupSpecs.length) return null

                      return (
                        <div key={group}>
                          <h4 className="font-bold text-gold text-sm mb-3 flex items-center gap-2">
                            <span className="w-1 h-3 bg-gold rounded-full" />
                            {group}
                          </h4>
                          <div className="rounded-xl overflow-hidden border border-white/8">
                            {groupSpecs.map((spec, i) => (
                              <div
                                key={spec.label}
                                className={cn(
                                  'flex items-center justify-between px-4 py-3 text-sm',
                                  i % 2 === 0 ? 'bg-white/3' : 'bg-transparent',
                                )}
                              >
                                <span className="text-muted">{spec.label}</span>
                                <span className="font-semibold text-white">
                                  {spec.value}
                                  {spec.unit && (
                                    <span className="text-muted font-normal mr-1">{spec.unit}</span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="text-center py-12 text-muted">
                    <Award className="h-12 w-12 mx-auto mb-4 text-gold/30" />
                    <p>نظرات مشتریان در اینجا نمایش داده می‌شود.</p>
                  </div>
                )}

                {activeTab === 'downloads' && (
                  <div className="space-y-3">
                    {product.downloads.map((dl) => (
                      <a
                        key={dl.id}
                        href={dl.fileUrl}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/8 hover:border-gold/30 hover:bg-gold/5 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                          <Download className="h-5 w-5 text-gold" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white text-sm">{dl.name}</div>
                          <div className="text-xs text-muted">{dl.fileType}</div>
                        </div>
                        <Download className="h-4 w-4 text-muted group-hover:text-gold transition-colors" />
                      </a>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
