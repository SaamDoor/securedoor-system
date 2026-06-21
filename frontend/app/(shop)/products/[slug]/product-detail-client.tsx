'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, ChevronLeft, Heart, Phone, Check,
  Package, MessageCircle, ClipboardList, Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { BY_SLUG } from '@/lib/data/products-catalog'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Spec {
  label: string
  value: string
  unit?: string
  group: string
}

interface ProductData {
  id: string
  sku: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  category: { name: string; slug: string }
  shortDescription: string
  description: string
  specs: Spec[]
  image: string
  isNew: boolean
  badge: string | null
}

// ─── Shared base specs builder ─────────────────────────────────────────────────

function baseSpecs(handle: string, veneer = 'سوپر راش ترک', extra: Spec[] = []): Spec[] {
  return [
    { label: 'کف', value: '۱۸', unit: 'میلی‌متر', group: 'مشخصات فنی' },
    { label: 'ضخامت ورق', value: '۱.۲۵ ضد دیلم', group: 'مشخصات فنی' },
    ...extra.filter((s) => s.group === 'مشخصات فنی'),
    { label: 'یراق', value: 'تیپ ترک — ۲ سال ضمانت', group: 'یراق و امنیت' },
    { label: 'دستگیره', value: handle, group: 'یراق و امنیت' },
    { label: 'رنگ رویه', value: 'پلی‌اورتان', group: 'پوشش' },
    { label: 'روکش', value: veneer, group: 'پوشش' },
    ...extra.filter((s) => s.group === 'پوشش'),
    { label: 'ام‌دی‌اف', value: 'وارداتی ۸ میلی‌متر', group: 'متریال' },
    { label: 'ورق داخل', value: 'سرتاسری فولادی', group: 'متریال' },
  ]
}

function metalSpecs(handle: string, color: string, extra: Spec[] = []): Spec[] {
  return [
    { label: 'کف', value: '۱۸', unit: 'میلی‌متر', group: 'مشخصات فنی' },
    { label: 'ضخامت ورق', value: '۱.۲۵ ضد دیلم', group: 'مشخصات فنی' },
    ...extra.filter((s) => s.group === 'مشخصات فنی'),
    { label: 'یراق', value: 'تیپ ترک — ۲ سال ضمانت', group: 'یراق و امنیت' },
    { label: 'دستگیره', value: handle, group: 'یراق و امنیت' },
    { label: 'رویه', value: 'فلز', group: 'پوشش' },
    { label: 'رنگ رویه', value: color, group: 'پوشش' },
    ...extra.filter((s) => s.group === 'پوشش'),
    { label: 'ورق داخل', value: 'سرتاسری فولادی', group: 'متریال' },
  ]
}

const SPEC_GROUPS = ['مشخصات فنی', 'یراق و امنیت', 'پوشش', 'متریال']

// ─── Product catalogue (computed from central catalog) ─────────────────────────

const PRODUCTS: Record<string, ProductData> = Object.fromEntries(
  Object.entries(BY_SLUG).map(([slug, p]) => [
    slug,
    {
      id: `p${p.code}-0000-0000-0000-${String(p.code).padStart(12, '0')}`,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      price: p.price,
      comparePrice: null,
      category: { name: 'درب ضد سرقت', slug: 'darb-zed-sereqat' },
      shortDescription: p.shortDescription,
      description: p.description,
      specs: p.metalFace
        ? metalSpecs(p.handle, p.metalColor ?? 'دکورال')
        : baseSpecs(p.handle, p.veneer ?? 'سوپر راش ترک', p.hasWoodCarving
            ? [{ label: 'منبت', value: 'چوب دست‌ساز', group: 'پوشش' }]
            : []),
      image: `/products/${p.sku}/main.webp`,
      isNew: p.isNew ?? false,
      badge: p.badge ?? null,
    } satisfies ProductData,
  ])
)

// ─── Component ────────────────────────────────────────────────────────────────

interface ProductDetailClientProps {
  slug: string
}

export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const product = PRODUCTS[slug]
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description')
  const [isWishlisted, setIsWishlisted] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-center px-4">
        <Package className="h-16 w-16 text-zinc-700" />
        <p className="text-zinc-400 text-lg font-semibold">محصول مورد نظر یافت نشد</p>
        <Button asChild variant="gold-outline" size="md">
          <Link href="/products">بازگشت به محصولات</Link>
        </Button>
      </div>
    )
  }

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null

  return (
    <div className="min-h-screen bg-black" dir="rtl">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="bg-zinc-950 border-b border-white/[0.06]">
        <div className="container py-3.5">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 flex-wrap">
            <Link href="/" className="hover:text-gold transition-colors whitespace-nowrap">خانه</Link>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            <Link href="/products" className="hover:text-gold transition-colors whitespace-nowrap">محصولات</Link>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-white truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8 sm:py-12 lg:py-16">

        {/* ── Main product grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_1fr] xl:grid-cols-[minmax(0,520px)_1fr] gap-8 lg:gap-14 mb-12 lg:mb-16">

          {/* ── IMAGE ── */}
          <div className="lg:sticky lg:top-28 self-start">
            <div
              className="relative w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
              style={{ aspectRatio: '3/4' }}
            >
              {/* Fallback */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                <Package className="h-20 w-20 text-zinc-700" />
              </div>
              {/* Actual image */}
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover relative z-10"
                sizes="(max-width: 1024px) 100vw, 520px"
                priority
                quality={95}
              />
              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent z-20" />

              {/* Badges top-right */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
                {product.isNew && <Badge variant="success" size="md">جدید</Badge>}
                {product.badge && !product.isNew && <Badge variant="gold" size="md">{product.badge}</Badge>}
                {discount !== null && (
                  <Badge variant="danger" size="md">٪{toPersianNumber(discount)} تخفیف</Badge>
                )}
              </div>

              {/* SKU bottom-left */}
              <div className="absolute bottom-4 left-4 z-30">
                <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] font-bold text-gold/80 border border-gold/20 tracking-widest">
                  {product.sku}
                </span>
              </div>
            </div>
          </div>

          {/* ── PRODUCT INFO ── */}
          <div className="flex flex-col gap-5">

            {/* Category */}
            <Link href={`/categories/${product.category.slug}`}>
              <Badge variant="gold" size="md">{product.category.name}</Badge>
            </Link>

            {/* Name */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-3">
                {product.name}
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                {product.shortDescription}
              </p>
            </div>

            {/* Price block */}
            <div className="flex flex-wrap items-baseline gap-3 py-5 border-y border-white/[0.08]">
              <span className="text-3xl sm:text-4xl font-black text-white">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-lg text-zinc-600 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
              {discount !== null && (
                <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
                  {toPersianNumber(discount)}٪ تخفیف
                </span>
              )}
            </div>

            {/* Quick specs 2×2 grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'کف', value: '۱۸ میلی‌متر' },
                { label: 'ضخامت ورق', value: '۱.۲۵ ضد دیلم' },
                { label: 'یراق', value: 'تیپ ترک' },
                { label: 'ضمانت یراق', value: '۲ سال' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 px-4 py-3 rounded-xl bg-zinc-900 border border-white/[0.07]"
                >
                  <span className="text-xs text-zinc-500">{label}</span>
                  <span className="text-sm font-bold text-white">{value}</span>
                </div>
              ))}
            </div>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                variant="gold"
                size="lg"
                className="flex-1 justify-center"
              >
                <Link href={`/contact?type=inquiry&product=${product.sku}`}>
                  <ClipboardList className="h-5 w-5 ml-2" />
                  استعلام قیمت
                </Link>
              </Button>
              <Button
                asChild
                variant="gold-outline"
                size="lg"
                className="flex-1 justify-center"
              >
                <Link href="/contact">
                  <MessageCircle className="h-5 w-5 ml-2" />
                  مشاوره رایگان
                </Link>
              </Button>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label="افزودن به علاقه‌مندی‌ها"
                  className={cn(
                    'w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-300',
                    isWishlisted
                      ? 'border-gold/40 bg-gold/10 text-gold'
                      : 'border-white/12 text-zinc-500 hover:text-white hover:border-white/25',
                  )}
                >
                  <Heart className={cn('h-5 w-5', isWishlisted && 'fill-gold')} />
                </button>
                <button
                  aria-label="اشتراک‌گذاری"
                  className="w-12 h-12 rounded-xl border border-white/12 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/25 transition-all duration-300 flex-shrink-0"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Phone CTA */}
            <a
              href="tel:09003286539"
              className="group flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/35 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                <Phone className="h-4 w-4 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-zinc-500 mb-0.5">مشاوره تلفنی رایگان</div>
                <div className="text-white font-black text-base tracking-wide" dir="ltr">
                  0900 328 6539
                </div>
              </div>
              <ChevronLeft className="h-4 w-4 text-zinc-600 group-hover:text-primary transition-colors flex-shrink-0" />
            </a>
          </div>
        </div>

        {/* ── Tabs: Description + Specs ──────────────────────────────── */}
        <div className="bg-zinc-950 border border-white/[0.07] rounded-2xl overflow-hidden">

          {/* Tab header */}
          <div className="flex border-b border-white/[0.07] overflow-x-auto">
            {[
              { key: 'description', label: 'توضیحات محصول' },
              { key: 'specs', label: 'مشخصات فنی' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  'relative px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors duration-200',
                  activeTab === tab.key ? 'text-gold' : 'text-zinc-500 hover:text-white',
                )}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="product-tab-indicator"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-gold"
                  />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >

                {activeTab === 'description' && (
                  <div className="max-w-2xl">
                    <p className="text-zinc-400 text-sm sm:text-base leading-[2] mb-8">
                      {product.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        'ورق فولادی سرتاسری داخل',
                        'روکش سوپر راش ترک اصل',
                        'رنگ رویه پلی‌اورتان ضد خش',
                        'ام‌دی‌اف وارداتی ۸ میلی‌متر',
                        'یراق تیپ ترک — ۲ سال ضمانت',
                        'قابل سفارش در ابعاد دلخواه',
                      ].map((feat) => (
                        <div
                          key={feat}
                          className="flex items-center gap-3 text-sm text-zinc-400 py-1"
                        >
                          <div className="w-5 h-5 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-gold" />
                          </div>
                          {feat}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-7">
                    {SPEC_GROUPS.map((group) => {
                      const groupSpecs = product.specs.filter((s) => s.group === group)
                      if (!groupSpecs.length) return null
                      return (
                        <div key={group}>
                          <h4 className="font-bold text-gold text-sm mb-3.5 flex items-center gap-2.5">
                            <span className="w-1 h-4 bg-gold rounded-full flex-shrink-0" />
                            {group}
                          </h4>
                          <div className="rounded-xl overflow-hidden border border-white/[0.07]">
                            {groupSpecs.map((spec, i) => (
                              <div
                                key={spec.label}
                                className={cn(
                                  'flex items-center justify-between px-4 sm:px-5 py-3.5 text-sm',
                                  i % 2 === 0 ? 'bg-white/[0.03]' : 'bg-transparent',
                                  i < groupSpecs.length - 1 && 'border-b border-white/[0.06]',
                                )}
                              >
                                <span className="text-zinc-500">{spec.label}</span>
                                <span className="font-semibold text-white">
                                  {spec.value}
                                  {spec.unit && (
                                    <span className="text-zinc-500 font-normal mr-1">
                                      {spec.unit}
                                    </span>
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

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Related links ────────────────────────────────────────────── */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-gold transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
            بازگشت به همه محصولات
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="gold-outline" size="sm">
              <Link href="/contact?type=inquiry">استعلام قیمت</Link>
            </Button>
            <Button asChild variant="dark" size="sm">
              <Link href="/products">سایر محصولات</Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
