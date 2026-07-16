'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  Heart,
  Phone,
  Check,
  Package,
  MessageCircle,
  ClipboardList,
  Share2,
  Shield,
  Sparkles,
  ShoppingCart,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, toPersianNumber, cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { ProductToolsBanner } from '@/components/shop/product-tools-banner'

interface Spec {
  label: string
  value: string
  unit?: string
  group: string
}

export interface ProductDetailData {
  id: string
  sku: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  category: { name: string; slug: string }
  shortDescription: string
  description: string
  tags: string[]
  specs: Spec[]
  images: { url: string; alt: string }[]
  isNew: boolean
  isFeatured: boolean
  stockLeft: number
  stockRight: number
  dimensionOptions: string[]
  allowCustomDimensions: boolean
}

export interface RelatedProductCard {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
  category: string
}

interface ProductDetailClientProps {
  product: ProductDetailData
  related: RelatedProductCard[]
}

export function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [openingDirection, setOpeningDirection] = useState<'left' | 'right'>(
    product.stockRight > 0 ? 'right' : 'left',
  )
  const [selectedDimension, setSelectedDimension] = useState(product.dimensionOptions[0] ?? '')

  const addToCart = (goCheckout = false) => {
    const options: Record<string, string> = {}
    if (product.stockLeft > 0 || product.stockRight > 0) {
      options['جهت بازشو'] = openingDirection === 'right' ? 'راست‌بازشو' : 'چپ‌بازشو'
    }
    if (selectedDimension) options['ابعاد'] = selectedDimension

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      price: product.price,
      image: product.images[0]?.url ?? null,
      quantity: 1,
      options,
    })
    toast.success('به سبد خرید اضافه شد')
    router.push(goCheckout ? '/checkout' : '/cart')
  }

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null

  const images = product.images.length
    ? product.images
    : [{ url: '/placeholder-product.svg', alt: product.name }]

  const current = images[Math.min(activeImage, images.length - 1)]
  const specGroups = [...new Set(product.specs.map((s) => s.group))]

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url })
      } catch {
        /* user cancelled */
      }
    } else if (url) {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="min-h-screen bg-black" dir="rtl">
      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-[#C8A85D]/[0.045] blur-[140px]" />
        <div className="absolute -right-20 top-[40%] h-[420px] w-[420px] rounded-full bg-white/[0.02] blur-[120px]" />
      </div>

      <div className="border-b border-white/[0.06] bg-black/80 backdrop-blur-md">
        <div className="container py-3.5">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 sm:text-sm">
            <Link href="/" className="whitespace-nowrap transition-colors hover:text-gold">
              خانه
            </Link>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            <Link href="/products" className="whitespace-nowrap transition-colors hover:text-gold">
              محصولات
            </Link>
            {product.category.slug && (
              <>
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                <Link
                  href={`/products?category=${encodeURIComponent(product.category.slug)}`}
                  className="whitespace-nowrap transition-colors hover:text-gold"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate text-white">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8 sm:py-12 lg:py-16">
        <ProductToolsBanner />
        <div className="mb-14 grid grid-cols-1 gap-10 lg:mb-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          {/* Gallery */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-zinc-950 shadow-[0_40px_100px_rgba(0,0,0,0.55)]"
              style={{ aspectRatio: '4/5' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.url}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0"
                >
                  {current.url === '/placeholder-product.svg' ? (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-20 w-20 text-zinc-700" />
                    </div>
                  ) : (
                    <Image
                      src={current.url}
                      alt={current.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 560px"
                      priority
                      quality={92}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-black/35 to-transparent" />

              <div className="absolute right-4 top-4 z-30 flex flex-col gap-2">
                {product.isNew && <Badge variant="success" size="md">جدید</Badge>}
                {product.isFeatured && <Badge variant="gold" size="md">ویژه</Badge>}
                {discount !== null && (
                  <Badge variant="danger" size="md">٪{toPersianNumber(discount)} تخفیف</Badge>
                )}
              </div>

              <div className="absolute bottom-4 left-4 z-30">
                <span className="rounded-lg border border-gold/25 bg-black/70 px-2.5 py-1 text-[10px] font-bold tracking-[0.2em] text-gold/85 backdrop-blur-sm">
                  {product.sku}
                </span>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="تصویر قبلی"
                    onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:border-gold/40 hover:text-gold"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="تصویر بعدی"
                    onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                    className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:border-gold/40 hover:text-gold"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </>
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      'relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border transition-all',
                      activeImage === index
                        ? 'border-gold shadow-[0_0_0_1px_rgba(200,168,93,0.35)]'
                        : 'border-white/10 opacity-70 hover:opacity-100',
                    )}
                  >
                    <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-6"
          >
            {product.category.slug ? (
              <Link href={`/products?category=${encodeURIComponent(product.category.slug)}`}>
                <Badge variant="gold" size="md">
                  {product.category.name}
                </Badge>
              </Link>
            ) : (
              <Badge variant="gold" size="md">
                {product.category.name}
              </Badge>
            )}

            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-gold/80">
                <Sparkles className="h-3.5 w-3.5" />
                گروه صنعتی مشعوف
              </div>
              <h1 className="mb-4 text-3xl font-black leading-[1.25] text-white sm:text-4xl lg:text-[2.75rem]">
                {product.name}
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                {product.shortDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-baseline gap-3 border-y border-white/[0.08] py-5">
              <span className="text-3xl font-black text-white sm:text-4xl">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="text-lg text-zinc-600 line-through">{formatPrice(product.comparePrice)}</span>
              )}
              {discount !== null && (
                <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-sm font-bold text-red-400">
                  {toPersianNumber(discount)}٪ تخفیف
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {(product.specs.length > 0
                ? product.specs.slice(0, 4).map((spec) => ({
                    label: spec.label,
                    value: `${spec.value}${spec.unit ? ` ${spec.unit}` : ''}`,
                  }))
                : [
                    { label: 'ساختار', value: 'فولادی سرتاسری' },
                    { label: 'ضمانت', value: '۵ سال رسمی' },
                    { label: 'ساخت', value: 'ایران · مشعوف' },
                    { label: 'کد کالا', value: product.sku },
                  ]
              ).map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 rounded-xl border border-white/[0.07] bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 px-4 py-3"
                >
                  <span className="text-xs text-zinc-500">{label}</span>
                  <span className="text-sm font-bold text-white">{value}</span>
                </div>
              ))}
            </div>

            {(product.stockLeft > 0 ||
              product.stockRight > 0 ||
              product.dimensionOptions.length > 0 ||
              product.allowCustomDimensions) && (
              <div className="space-y-5 rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-4 sm:p-5">
                {(product.stockLeft > 0 || product.stockRight > 0) && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-white">جهت بازشو</span>
                      <span className="text-xs text-zinc-500">نمای بیرونی درب</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { value: 'right' as const, label: 'راست‌بازشو', stock: product.stockRight },
                          { value: 'left' as const, label: 'چپ‌بازشو', stock: product.stockLeft },
                        ] as const
                      ).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          disabled={option.stock === 0}
                          onClick={() => setOpeningDirection(option.value)}
                          className={cn(
                            'rounded-xl border px-3 py-3 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40',
                            openingDirection === option.value
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-white/10 bg-white/[0.025] text-zinc-300 hover:border-white/20',
                          )}
                        >
                          {option.label}
                          <span className="mr-2 text-[10px] font-normal opacity-70">
                            {option.stock > 0 ? `${toPersianNumber(option.stock)} موجود` : 'ناموجود'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(product.dimensionOptions.length > 0 || product.allowCustomDimensions) && (
                  <div>
                    <div className="mb-3 text-sm font-bold text-white">انتخاب ابعاد</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {product.dimensionOptions.map((dimension) => (
                        <button
                          key={dimension}
                          type="button"
                          onClick={() => setSelectedDimension(dimension)}
                          className={cn(
                            'rounded-xl border px-3 py-3 text-xs transition-all',
                            selectedDimension === dimension
                              ? 'border-gold bg-gold/10 font-bold text-gold'
                              : 'border-white/10 text-zinc-400 hover:border-white/20',
                          )}
                        >
                          {dimension}
                        </button>
                      ))}
                      {product.allowCustomDimensions && (
                        <button
                          type="button"
                          onClick={() => setSelectedDimension('ابعاد سفارشی')}
                          className={cn(
                            'rounded-xl border px-3 py-3 text-xs transition-all',
                            selectedDimension === 'ابعاد سفارشی'
                              ? 'border-gold bg-gold/10 font-bold text-gold'
                              : 'border-dashed border-white/15 text-zinc-400 hover:border-gold/40',
                          )}
                        >
                          ابعاد سفارشی
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="gold"
                  size="lg"
                  className="flex-1 justify-center"
                  onClick={() => addToCart(true)}
                >
                  <ShoppingCart className="ml-2 h-5 w-5" />
                  خرید و تکمیل سفارش
                </Button>
                <Button
                  type="button"
                  variant="gold-outline"
                  size="lg"
                  className="flex-1 justify-center"
                  onClick={() => addToCart(false)}
                >
                  افزودن به سبد
                </Button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="dark" size="lg" className="flex-1 justify-center">
                  <Link
                    href={`/contact?type=inquiry&product=${product.sku}&direction=${openingDirection}&dimension=${encodeURIComponent(selectedDimension)}`}
                  >
                    <ClipboardList className="ml-2 h-5 w-5" />
                    استعلام قیمت
                  </Link>
                </Button>
                <Button asChild variant="dark" size="lg" className="flex-1 justify-center">
                  <Link href="/contact">
                    <MessageCircle className="ml-2 h-5 w-5" />
                    مشاوره رایگان
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    aria-label="افزودن به علاقه‌مندی‌ها"
                    className={cn(
                      'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-300',
                      isWishlisted
                        ? 'border-gold/40 bg-gold/10 text-gold'
                        : 'border-white/12 text-zinc-500 hover:border-white/25 hover:text-white',
                    )}
                  >
                    <Heart className={cn('h-5 w-5', isWishlisted && 'fill-gold')} />
                  </button>
                  <button
                    type="button"
                    onClick={share}
                    aria-label="اشتراک‌گذاری"
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/12 text-zinc-500 transition-all duration-300 hover:border-white/25 hover:text-white"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <a
              href="tel:09003286539"
              className="group flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all duration-300 hover:border-primary/35 hover:bg-primary/10"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/15 transition-all duration-300 group-hover:border-primary group-hover:bg-primary">
                <Phone className="h-4 w-4 text-primary transition-colors duration-300 group-hover:text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 text-xs text-zinc-500">مشاوره تلفنی رایگان</div>
                <div className="text-base font-black tracking-wide text-white" dir="ltr">
                  0900 328 6539
                </div>
              </div>
              <ChevronLeft className="h-4 w-4 flex-shrink-0 text-zinc-600 transition-colors group-hover:text-primary" />
            </a>

            <div className="flex items-start gap-3 rounded-xl border border-gold/15 bg-gold/[0.04] px-4 py-3 text-sm text-zinc-400">
              <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
              تضمین کیفیت ساخت مشعوف با پشتیبانی رسمی پس از فروش.
            </div>

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-950/90">
          <div className="flex overflow-x-auto border-b border-white/[0.07]">
            {[
              { key: 'description' as const, label: 'توضیحات محصول' },
              { key: 'specs' as const, label: 'مشخصات فنی' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative whitespace-nowrap px-6 py-4 text-sm font-bold transition-colors duration-200',
                  activeTab === tab.key ? 'text-gold' : 'text-zinc-500 hover:text-white',
                )}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="product-tab-indicator"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-gold"
                  />
                )}
                {tab.label}
              </button>
            ))}
          </div>

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
                  <div className="max-w-3xl">
                    <p className="mb-8 whitespace-pre-line text-sm leading-[2] text-zinc-400 sm:text-base">
                      {product.description}
                    </p>
                    {product.specs.length > 0 && (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {product.specs.slice(0, 6).map((spec) => (
                          <div key={`${spec.group}-${spec.label}`} className="flex items-center gap-3 py-1 text-sm text-zinc-400">
                            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                              <Check className="h-3 w-3 text-gold" />
                            </div>
                            <span>
                              <span className="text-zinc-500">{spec.label}: </span>
                              {spec.value}
                              {spec.unit ? ` ${spec.unit}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-7">
                    {product.specs.length === 0 ? (
                      <p className="text-sm text-zinc-500">هنوز مشخصات فنی برای این محصول ثبت نشده است.</p>
                    ) : (
                      specGroups.map((group) => {
                        const groupSpecs = product.specs.filter((s) => s.group === group)
                        return (
                          <div key={group}>
                            <h4 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold text-gold">
                              <span className="h-4 w-1 flex-shrink-0 rounded-full bg-gold" />
                              {group}
                            </h4>
                            <div className="overflow-hidden rounded-xl border border-white/[0.07]">
                              {groupSpecs.map((spec, i) => (
                                <div
                                  key={`${group}-${spec.label}`}
                                  className={cn(
                                    'flex items-center justify-between px-4 py-3.5 text-sm sm:px-5',
                                    i % 2 === 0 ? 'bg-white/[0.03]' : 'bg-transparent',
                                    i < groupSpecs.length - 1 && 'border-b border-white/[0.06]',
                                  )}
                                >
                                  <span className="text-zinc-500">{spec.label}</span>
                                  <span className="font-semibold text-white">
                                    {spec.value}
                                    {spec.unit && (
                                      <span className="mr-1 font-normal text-zinc-500">{spec.unit}</span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <div className="mb-2 text-xs font-semibold tracking-widest text-gold">مرتبط</div>
                <h2 className="text-2xl font-black text-white">محصولات مشابه</h2>
              </div>
              {product.category.slug && (
                <Link
                  href={`/products?category=${encodeURIComponent(product.category.slug)}`}
                  className="hidden items-center gap-2 text-sm text-gold hover:text-gold-light sm:flex"
                >
                  همه در این دسته
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${encodeURI(item.slug || item.id)}`}
                  className="group overflow-hidden rounded-2xl border border-white/8 bg-zinc-950 transition-all hover:border-gold/30"
                >
                  <div className="relative aspect-[4/5] bg-zinc-900">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        sizes="(max-width: 640px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-10 w-10 text-zinc-700" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-1 text-xs text-zinc-500">{item.category}</div>
                    <h3 className="mb-2 line-clamp-2 text-sm font-bold text-white group-hover:text-gold">
                      {item.name}
                    </h3>
                    <div className="text-sm font-black text-white">{formatPrice(item.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-gold"
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
