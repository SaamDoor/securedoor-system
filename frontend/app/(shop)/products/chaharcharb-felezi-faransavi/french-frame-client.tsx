'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, Phone, Check, Minus, Plus,
  ClipboardList, ShoppingCart, X, Ruler,
  Package, ChevronDown, CheckCircle2, MessageCircle,
  Star, Shield, Zap, Layers, Award, ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { PriceRow } from '@/lib/api/google-sheets'

// ─── Constants ────────────────────────────────────────────────────────────────

const HINGE_DISCOUNT = 100_000
const KLAF4_ADDON    = 600_000

const FALLBACK_ROWS: PriceRow[] = [
  { colorName: 'قهوه‌ای', colorHex: '#5C3317', hasHinge: true, price3klaf: 3_700_000, klaf4Addon: 600_000 },
  { colorName: 'طوسی',    colorHex: '#7A8599', hasHinge: true, price3klaf: 3_600_000, klaf4Addon: 600_000 },
  { colorName: 'مشکی',    colorHex: '#232323', hasHinge: true, price3klaf: 3_700_000, klaf4Addon: 600_000 },
  { colorName: 'سفید',    colorHex: '#EFEFEF', hasHinge: true, price3klaf: 4_000_000, klaf4Addon: 600_000 },
]

const COLOR_IMAGES: Record<string, string> = {
  'قهوه‌ای': '/products/chaharcharb-felezi-faransavi/brown.webp',
  'طوسی':    '/products/chaharcharb-felezi-faransavi/gray.webp',
  'مشکی':    '/products/chaharcharb-felezi-faransavi/black.webp',
  'سفید':    '/products/chaharcharb-felezi-faransavi/white.webp',
}

const COVER_IMAGE = '/products/chaharcharb-felezi-faransavi/cover.webp'

const SIZES = [
  { id: 'sm', label: 'کوچک',  width: 75, height: 210, wRatio: 22, hRatio: 38 },
  { id: 'md', label: 'متوسط', width: 80, height: 210, wRatio: 24, hRatio: 38 },
  { id: 'lg', label: 'بزرگ',  width: 95, height: 220, wRatio: 28, hRatio: 40 },
]

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  frenchPrices?: PriceRow[]
  lastUpdated?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FrenchFrameClient({ frenchPrices = [], lastUpdated }: Props) {
  const colors = useMemo(() => {
    const withHinge = (frenchPrices ?? []).filter((r) => r.hasHinge)
    return withHinge.length > 0 ? withHinge : FALLBACK_ROWS
  }, [frenchPrices])

  const [colorIdx, setColorIdx]       = useState(0)
  const [klaf, setKlaf]               = useState<3 | 4>(3)
  const [withHinge, setWithHinge]     = useState(true)
  const [sizeId, setSizeId]           = useState<string | null>('md')
  const [showCustom, setShowCustom]   = useState(false)
  const [customW, setCustomW]         = useState('')
  const [customH, setCustomH]         = useState('')
  const [quantity, setQuantity]       = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)

  const color    = colors[colorIdx]!
  const unitPrice  = color.price3klaf + (withHinge ? 0 : -HINGE_DISCOUNT) + (klaf === 4 ? KLAF4_ADDON : 0)
  const totalPrice = unitPrice * quantity

  const selectedSize  = sizeId ? SIZES.find((s) => s.id === sizeId) : null
  const sizeText      = selectedSize
    ? `${toPersianNumber(selectedSize.width)} × ${toPersianNumber(selectedSize.height)} سانتی‌متر`
    : customW && customH
    ? `${customW} × ${customH} سانتی‌متر`
    : 'انتخاب نشده'

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black" dir="rtl">

      {/* Breadcrumb */}
      <div className="bg-zinc-950 border-b border-white/[0.06]">
        <div className="container py-3.5">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-500 flex-wrap">
            <Link href="/" className="hover:text-gold transition-colors">خانه</Link>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            <Link href="/products" className="hover:text-gold transition-colors">محصولات</Link>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-white">چهارچوب فلزی فرانسوی</span>
          </nav>
        </div>
      </div>

      <div className="container py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,460px)_1fr] xl:grid-cols-[minmax(0,500px)_1fr] gap-8 lg:gap-14">

          {/* ══════════════════════════════ IMAGE ══════════════════════════════ */}
          <div className="lg:sticky lg:top-28 self-start">

            {/* Main image */}
            <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-zinc-900 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
              {/* Fallback */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                <Package className="h-20 w-20 text-zinc-700" />
              </div>

              {/* Color image — fades on change */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={colorIdx}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  <Image
                    src={COLOR_IMAGES[color.colorName] ?? COVER_IMAGE}
                    alt={`چهارچوب فلزی فرانسوی — رنگ ${color.colorName}`}
                    fill
                    className="object-cover"
                    priority
                    quality={95}
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

              {/* Live price badge */}
              {lastUpdated && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse flex-shrink-0" />
                    <span className="text-[10px] text-gold/80 font-medium leading-none">قیمت زنده</span>
                  </div>
                </div>
              )}

              {/* SKU */}
              <div className="absolute bottom-4 left-4 z-10">
                <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] font-bold text-gold/80 border border-gold/20 tracking-widest">
                  MSH-FR
                </span>
              </div>
            </div>

            {/* Color thumbnails */}
            <div className="grid grid-cols-4 gap-2.5 mt-3">
              {colors.map((c, i) => (
                <button
                  key={c.colorName}
                  onClick={() => setColorIdx(i)}
                  title={c.colorName}
                  className={cn(
                    'relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300',
                    i === colorIdx
                      ? 'border-gold shadow-[0_0_0_2px_rgba(200,168,93,0.25)]'
                      : 'border-transparent hover:border-white/20',
                  )}
                >
                  {/* Color swatch as fallback bg */}
                  <div
                    className={cn('absolute inset-0', c.colorHex === '#EFEFEF' && 'border border-white/20')}
                    style={{ backgroundColor: c.colorHex }}
                  />
                  <Image
                    src={COLOR_IMAGES[c.colorName] ?? COVER_IMAGE}
                    alt={c.colorName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {i === colorIdx && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Check className="h-4 w-4 text-gold drop-shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Last updated note */}
            {lastUpdated && (
              <p className="text-center text-[11px] text-zinc-600 mt-2.5">
                آخرین بروزرسانی قیمت: {lastUpdated}
              </p>
            )}
          </div>

          {/* ══════════════════════════════ CONFIG ═════════════════════════════ */}
          <div className="flex flex-col">

            {/* ── Header ── */}
            <div className="pb-5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="gold" size="md">چهارچوب فلزی</Badge>
                <Badge variant="muted" size="md">فرانسوی</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-2.5">
                چهارچوب فلزی فرانسوی
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                ضخامت ۲ میلی‌متر — رنگ کوره‌ای الکترواستاتیک — لولا پارس کلون — مقاومت بالا در برابر ضربه و رطوبت
              </p>
            </div>

            {/* ── Color selector ── */}
            <div className="py-5 border-b border-white/[0.08]">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-sm font-bold text-white">رنگ چهارچوب</span>
                <motion.span
                  key={color.colorName}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gold bg-gold/10 border border-gold/20 px-2.5 py-1 rounded-full"
                >
                  <div
                    className={cn('w-3 h-3 rounded-sm flex-shrink-0', color.colorHex === '#EFEFEF' && 'border border-white/40')}
                    style={{ backgroundColor: color.colorHex }}
                  />
                  {color.colorName}
                </motion.span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((c, i) => (
                  <button
                    key={c.colorName}
                    onClick={() => setColorIdx(i)}
                    className={cn(
                      'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all duration-250',
                      i === colorIdx
                        ? 'border-gold bg-gold/10 shadow-[0_0_0_1px_rgba(200,168,93,0.25)]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20',
                    )}
                  >
                    <div
                      className={cn('w-4 h-4 rounded-md shadow-sm flex-shrink-0', c.colorHex === '#EFEFEF' && 'border border-white/30')}
                      style={{ backgroundColor: c.colorHex }}
                    />
                    <span className={cn('text-xs font-semibold', i === colorIdx ? 'text-gold' : 'text-zinc-400')}>
                      {c.colorName}
                    </span>
                    {i === colorIdx && <Check className="h-3.5 w-3.5 text-gold ml-0.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Klaf selector ── */}
            <div className="py-5 border-b border-white/[0.08]">
              <span className="text-sm font-bold text-white block mb-3.5">تعداد کلاف</span>
              <div className="grid grid-cols-2 gap-3">
                {([3, 4] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setKlaf(k)}
                    className={cn(
                      'relative flex flex-col items-center gap-1 px-4 py-4 rounded-xl border transition-all duration-300',
                      klaf === k
                        ? 'border-gold bg-gold/8 text-gold'
                        : 'border-white/10 text-zinc-400 hover:border-white/20 hover:bg-white/[0.02]',
                    )}
                  >
                    {klaf === k && (
                      <motion.div
                        layoutId="klaf-bg"
                        className="absolute inset-0 rounded-xl bg-gold/5 border border-gold/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className="relative text-2xl font-black">{toPersianNumber(k)}</span>
                    <span className="relative text-xs font-semibold">کلاف</span>
                    {k === 4 ? (
                      <span className="relative text-[10px] text-zinc-500 mt-0.5">
                        +{formatPrice(KLAF4_ADDON)} تومان
                      </span>
                    ) : (
                      <span className="relative text-[10px] text-zinc-600 mt-0.5">قیمت پایه</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Hinge toggle ── */}
            <div className="py-5 border-b border-white/[0.08]">
              <span className="text-sm font-bold text-white block mb-3.5">لولا</span>
              <div className="grid grid-cols-2 gap-3">
                {([true, false] as const).map((h) => (
                  <button
                    key={String(h)}
                    onClick={() => setWithHinge(h)}
                    className={cn(
                      'relative flex flex-col items-center gap-1 px-4 py-4 rounded-xl border transition-all duration-300',
                      withHinge === h
                        ? 'border-gold bg-gold/8 text-gold'
                        : 'border-white/10 text-zinc-400 hover:border-white/20',
                    )}
                  >
                    {withHinge === h && (
                      <motion.div
                        layoutId="hinge-bg"
                        className="absolute inset-0 rounded-xl bg-gold/5 border border-gold/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className="relative text-sm font-bold">{h ? 'با لولا' : 'بدون لولا'}</span>
                    <span className="relative text-[11px] text-zinc-500 mt-0.5">
                      {h ? 'قیمت پایه' : `کسر ${formatPrice(HINGE_DISCOUNT)} تومان`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Size selector ── */}
            <div className="py-5 border-b border-white/[0.08]">
              <span className="text-sm font-bold text-white block mb-3.5">ابعاد چهارچوب</span>

              {/* Preset sizes */}
              <div className="grid grid-cols-3 gap-2.5 mb-3">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSizeId(s.id); setShowCustom(false) }}
                    className={cn(
                      'relative flex flex-col items-center gap-2.5 px-2 py-4 rounded-xl border transition-all duration-300',
                      sizeId === s.id && !showCustom
                        ? 'border-gold bg-gold/8 text-gold'
                        : 'border-white/10 text-zinc-400 hover:border-white/20 hover:bg-white/[0.02]',
                    )}
                  >
                    {sizeId === s.id && !showCustom && (
                      <motion.div
                        layoutId="size-bg"
                        className="absolute inset-0 rounded-xl bg-gold/5 border border-gold/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    {/* Mini door visual */}
                    <div
                      className={cn(
                        'relative border-2 rounded-sm flex-shrink-0',
                        sizeId === s.id && !showCustom ? 'border-gold/60' : 'border-zinc-600',
                      )}
                      style={{ width: s.wRatio, height: s.hRatio }}
                    >
                      {/* Hinge dots */}
                      <div className="absolute right-0.5 top-2 w-1 h-1 rounded-full bg-current opacity-60" />
                      <div className="absolute right-0.5 bottom-2 w-1 h-1 rounded-full bg-current opacity-60" />
                    </div>
                    <div className="relative text-center">
                      <div className="text-[11px] font-bold leading-tight">
                        {toPersianNumber(s.width)} × {toPersianNumber(s.height)}
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">سانتی‌متر</div>
                      <div className="text-[9px] mt-0.5 opacity-70">{s.label}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom size toggle */}
              <button
                onClick={() => {
                  const next = !showCustom
                  setShowCustom(next)
                  if (next) setSizeId(null)
                }}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 text-sm',
                  showCustom
                    ? 'border-gold/40 bg-gold/5 text-gold'
                    : 'border-white/10 text-zinc-500 hover:border-white/15 hover:text-zinc-300',
                )}
              >
                <span className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  وارد کردن ابعاد دلخواه
                </span>
                <ChevronDown className={cn('h-4 w-4 transition-transform duration-300 flex-shrink-0', showCustom && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {showCustom && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-zinc-500">عرض (سانتی‌متر)</span>
                        <input
                          type="number"
                          value={customW}
                          onChange={(e) => setCustomW(e.target.value)}
                          placeholder="مثال: ۹۰"
                          className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors"
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-zinc-500">طول (سانتی‌متر)</span>
                        <input
                          type="number"
                          value={customH}
                          onChange={(e) => setCustomH(e.target.value)}
                          placeholder="مثال: ۲۱۵"
                          className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors"
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-2">
                      * ابعاد سفارشی ممکن است هزینه اضافه داشته باشد — برای تأیید با ما تماس بگیرید.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Quantity ── */}
            <div className="py-5 border-b border-white/[0.08]">
              <span className="text-sm font-bold text-white block mb-3.5">تعداد</span>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center rounded-xl border border-white/12 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    aria-label="کاهش تعداد"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-black text-white text-xl border-x border-white/12 leading-[44px]">
                    {toPersianNumber(quantity)}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    aria-label="افزایش تعداد"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {quantity > 1 && (
                  <p className="text-xs text-zinc-500">
                    هر واحد: <span className="text-white font-semibold">{formatPrice(unitPrice)}</span>
                  </p>
                )}
              </div>
            </div>

            {/* ── Price + CTA ── */}
            <div className="pt-5">
              {/* Price display */}
              <div className="flex flex-wrap items-end justify-between gap-3 mb-5 p-4 rounded-xl bg-zinc-900 border border-white/[0.08]">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">
                    قیمت {klaf === 4 ? '۴ کلاف' : '۳ کلاف'} — {color.colorName}{!withHinge ? ' — بدون لولا' : ''}
                  </div>
                  <motion.div
                    key={totalPrice}
                    initial={{ y: -6, opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="text-3xl sm:text-4xl font-black text-white"
                  >
                    {formatPrice(totalPrice)}
                  </motion.div>
                  {quantity > 1 && (
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {toPersianNumber(quantity)} عدد × {formatPrice(unitPrice)}
                    </div>
                  )}
                </div>

                {/* Mini config summary */}
                <div className="flex flex-col items-end gap-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn('w-3 h-3 rounded-sm', color.colorHex === '#EFEFEF' && 'border border-white/30')}
                      style={{ backgroundColor: color.colorHex }}
                    />
                    <span className="text-xs text-zinc-400">{color.colorName}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{klaf} کلاف — {withHinge ? 'با لولا' : 'بدون لولا'}</span>
                  <span className="text-xs text-zinc-600">{sizeText}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <Button
                  variant="gold"
                  size="lg"
                  className="flex-1 justify-center"
                  onClick={() => setShowSuccess(true)}
                >
                  <ShoppingCart className="h-5 w-5 ml-2" />
                  افزودن به سبد خرید
                </Button>
                <Button
                  asChild
                  variant="gold-outline"
                  size="lg"
                  className="flex-1 justify-center"
                >
                  <Link href="/contact?type=inquiry&product=chaharcharb-faransavi">
                    <ClipboardList className="h-5 w-5 ml-2" />
                    استعلام قیمت
                  </Link>
                </Button>
              </div>

              {/* Phone CTA */}
              <a
                href="tel:09003286539"
                className="group flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/35 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                  <Phone className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-zinc-500 mb-0.5">مشاوره تلفنی رایگان</div>
                  <div className="text-white font-black text-base tracking-wide" dir="ltr">0900 328 6539</div>
                </div>
                <MessageCircle className="h-4 w-4 text-zinc-600 group-hover:text-primary transition-colors flex-shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* ══════════════════════ SPECS SECTION ══════════════════════ */}
        <div className="mt-12 lg:mt-16 bg-zinc-950 border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-white/[0.07]">
            <h2 className="text-lg font-bold text-white">مشخصات فنی چهارچوب فرانسوی</h2>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
              {[
                { label: 'ضخامت ورق', value: '۲ میلی‌متر' },
                { label: 'نوع رنگ‌آمیزی', value: 'کوره‌ای الکترواستاتیک' },
                { label: 'نوع لولا', value: 'پارس کلون' },
                { label: 'تعداد کلاف', value: '۳ یا ۴ کلاف' },
                { label: 'رنگ‌بندی موجود', value: 'قهوه‌ای، طوسی، مشکی، سفید' },
                { label: 'قابلیت سفارشی‌سازی', value: 'ابعاد دلخواه' },
                { label: 'کاربرد', value: 'مسکونی، تجاری، ساختمانی' },
                { label: 'مقاومت رنگ', value: 'ضد خراش و ضد رطوبت' },
              ].map((spec, i) => (
                <div
                  key={spec.label}
                  className={cn(
                    'flex items-center justify-between py-3.5 text-sm border-b border-white/[0.06]',
                    i >= 6 && 'border-b-0',
                  )}
                >
                  <span className="text-zinc-500">{spec.label}</span>
                  <span className="font-semibold text-white">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════ DESCRIPTION ══════════════════════ */}
        <div className="mt-12 lg:mt-20">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <span className="text-gold text-xs font-bold tracking-[0.2em] uppercase">درباره محصول</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/30 to-transparent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-12">
            {/* Text */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-5">
                چهارچوب فلزی فرانسوی<br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg,#C8A85D 0%,#E7D3A5 50%,#C8A85D 100%)' }}>
                  ترکیب استحکام و زیبایی
                </span>
              </h2>
              <div className="space-y-4 text-zinc-400 text-sm sm:text-base leading-[2]">
                <p>
                  چهارچوب فلزی فرانسوی گروه صنعتی مشعوف، با بهره‌گیری از ورق فولادی ۲ میلی‌متری و فرآیند جوشکاری صنعتی دقیق، استحکامی استثنایی را در کنار ظاهری زیبا ارائه می‌دهد. این محصول در ۴ رنگ مختلف و با دو گزینه ۳ یا ۴ کلاف عرضه می‌شود تا با هر نوع معماری هماهنگ باشد.
                </p>
                <p>
                  فرآیند رنگ‌آمیزی الکترواستاتیک کوره‌ای که در دمای بالا انجام می‌شود، پوششی یکنواخت و مقاوم در برابر خراش، رطوبت و تغییرات دما ایجاد می‌کند. این رنگ برخلاف رنگ‌های معمولی، سال‌ها ماندگاری خود را حفظ می‌کند و هیچ‌گاه پوسته نمی‌زند.
                </p>
                <p>
                  لولاهای پارس کلون استفاده‌شده در این محصول، از بهترین نمونه‌های موجود در بازار ایران هستند و حرکتی روان و بدون صدا را برای سال‌های طولانی تضمین می‌کنند.
                </p>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: Layers,
                  title: 'ورق ۲ میلی‌متر',
                  desc: 'فولاد باکیفیت با استحکام بالا در برابر ضربه و فشار',
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10 border-blue-500/20',
                },
                {
                  icon: Zap,
                  title: 'رنگ کوره‌ای',
                  desc: 'الکترواستاتیک — مقاوم در برابر خراش و رطوبت',
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10 border-amber-500/20',
                },
                {
                  icon: Shield,
                  title: 'لولا پارس کلون',
                  desc: 'حرکت روان و بدون صدا — دوام بلندمدت',
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10 border-emerald-500/20',
                },
                {
                  icon: Award,
                  title: '۴ رنگ انتخابی',
                  desc: 'قهوه‌ای، طوسی، مشکی و سفید با پوشش یکنواخت',
                  color: 'text-gold',
                  bg: 'bg-gold/10 border-gold/20',
                },
              ].map(({ icon: Icon, title, desc, color, bg }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`flex flex-col gap-3 p-4 rounded-2xl border ${bg}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-current/10 border border-current/20 ${color}`}>
                    <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <div className={`font-bold text-sm mb-1 ${color}`}>{title}</div>
                    <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quality banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-white/[0.08] p-6 sm:p-8">
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,168,93,0.8) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="text-xs text-gold font-bold tracking-widest mb-2 uppercase">تضمین کیفیت</div>
                <h3 className="text-xl font-black text-white mb-1.5">ساخته‌شده برای ماندگاری</h3>
                <p className="text-zinc-400 text-sm max-w-sm leading-relaxed">
                  تمامی چهارچوب‌های مشعوف پیش از تحویل تحت آزمون‌های کنترل کیفیت سخت‌گیرانه قرار می‌گیرند.
                </p>
              </div>
              <div className="flex gap-6 flex-shrink-0">
                {[
                  { num: '۱۴+', label: 'سال تجربه' },
                  { num: '۲۰۰۰+', label: 'پروژه موفق' },
                  { num: '۱۰۰٪', label: 'رضایت مشتری' },
                ].map(({ num, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-black text-gold">{num}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════ REVIEWS ══════════════════════════ */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <span className="text-gold text-xs font-bold tracking-[0.2em] uppercase">نظرات مشتریان</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/30 to-transparent" />
          </div>

          {/* Overall rating */}
          <div className="flex flex-col sm:flex-row items-center gap-8 p-6 rounded-2xl bg-zinc-950 border border-white/[0.07] mb-8">
            <div className="flex flex-col items-center">
              <div className="text-6xl font-black text-white">۴.۸</div>
              <div className="flex items-center gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-5 w-5 ${s <= 5 ? 'fill-gold text-gold' : 'text-zinc-700'}`} />
                ))}
              </div>
              <div className="text-xs text-zinc-500 mt-1">از ۵ نظر</div>
            </div>
            <div className="flex-1 w-full space-y-2">
              {[
                { stars: 5, count: 4, pct: 80 },
                { stars: 4, count: 1, pct: 20 },
                { stars: 3, count: 0, pct: 0 },
                { stars: 2, count: 0, pct: 0 },
                { stars: 1, count: 0, pct: 0 },
              ].map(({ stars, count, pct }) => (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5 w-16 flex-shrink-0">
                    {[...Array(stars)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                    ))}
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full bg-gold"
                    />
                  </div>
                  <span className="text-xs text-zinc-500 w-4 text-left">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                name: 'احمد رضایی',
                city: 'تهران',
                stars: 5,
                date: '۱۴۰۴/۰۳/۱۲',
                text: 'چهارچوب‌های مشعوف واقعاً کیفیت متفاوتی دارند. برای پروژه مسکونی ۲۰ واحدی استفاده کردم و نتیجه بی‌نظیر بود. رنگ ثابت، استحکام عالی و ظاهر زیبا. کاملاً پیشنهاد می‌کنم.',
                initials: 'ا.ر',
                verified: true,
              },
              {
                name: 'مریم حسینی',
                city: 'قائم‌شهر',
                stars: 5,
                date: '۱۴۰۴/۰۲/۲۸',
                text: 'تحویل به موقع و رنگ‌بندی دقیقاً مطابق نمونه. لولاها هم کیفیت بسیار خوبی داشتند. برای پروژه‌های کوچک هم مناسبه. سفارش بعدی رو هم از مشعوف می‌گیرم.',
                initials: 'م.ح',
                verified: true,
              },
              {
                name: 'محمد کریمی',
                city: 'ساری',
                stars: 4,
                date: '۱۴۰۴/۰۲/۱۵',
                text: 'قیمت مناسب نسبت به کیفیت. رنگ کوره‌ای واقعاً دوام داشت و هیچ خراشی روش نموند. فقط زمان تحویل یکم بیشتر از حد انتظار بود ولی محصول نهایی عالی بود.',
                initials: 'م.ک',
                verified: false,
              },
              {
                name: 'فاطمه اکبری',
                city: 'آمل',
                stars: 5,
                date: '۱۴۰۴/۰۱/۲۰',
                text: 'برای ساختمان ویلایی استفاده کردم. رنگ قهوه‌ای با درب ضدسرقت مشعوف هماهنگی بی‌نظیری داشت. ظاهر ورودی کاملاً تغییر کرد. ممنون از تیم مشعوف.',
                initials: 'ف.ا',
                verified: true,
              },
              {
                name: 'علی صادقی',
                city: 'بابل',
                stars: 5,
                date: '۱۴۰۳/۱۲/۰۸',
                text: 'سفارش عمده برای ۴۰ واحد آپارتمان دادم. هماهنگی عالی تیم فروش، قیمت رقابتی و کیفیت بالا. همه چهارچوب‌ها یکدست بودند. قطعاً سفارش‌های بعدی هم اینجاست.',
                initials: 'ع.ص',
                verified: true,
              },
            ].map((review, i) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`relative flex flex-col gap-4 p-5 rounded-2xl bg-zinc-950 border border-white/[0.07] hover:border-gold/20 transition-colors duration-300 ${i === 4 ? 'md:col-span-2' : ''}`}
              >
                {/* Quote icon */}
                <div className="absolute top-5 left-5 text-gold/10">
                  <svg width="32" height="24" viewBox="0 0 32 24" fill="currentColor">
                    <path d="M0 24V14.4C0 6.4 5.333 1.6 16 0l1.6 2.4C12.267 3.6 9.333 6.267 8.8 10.4H14V24H0zm18 0V14.4C18 6.4 23.333 1.6 34 0l1.6 2.4C30.267 3.6 27.333 6.267 26.8 10.4H32V24H18z" />
                  </svg>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/25 flex items-center justify-center flex-shrink-0">
                    <span className="text-gold text-xs font-black">{review.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{review.name}</span>
                      {review.verified && (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-semibold">
                          <Check className="h-3 w-3" />خرید تأیید‌شده
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= review.stars ? 'fill-gold text-gold' : 'fill-zinc-700 text-zinc-700'}`} />
                        ))}
                      </div>
                      <span className="text-[11px] text-zinc-600">{review.city} — {review.date}</span>
                    </div>
                  </div>
                </div>

                {/* Text */}
                <p className="text-zinc-400 text-sm leading-[1.9] relative z-10">{review.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Write review CTA */}
          <div className="mt-6 flex items-center justify-center">
            <Link
              href="/contact?type=review"
              className="flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/10 text-zinc-400 text-sm hover:border-gold/30 hover:text-gold transition-all duration-300"
            >
              <Star className="h-4 w-4" />
              ثبت نظر شما
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8 pt-8 border-t border-white/[0.06] flex items-center justify-between">
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-gold transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
            بازگشت به محصولات
          </Link>
          <Button asChild variant="dark" size="sm">
            <Link href="/contact">تماس با ما</Link>
          </Button>
        </div>
      </div>

      {/* ══════════════════════ SUCCESS MODAL ══════════════════════ */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowSuccess(false) }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
              className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-[0_-8px_60px_rgba(0,0,0,0.8)] sm:shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
            >
              {/* Close button */}
              <button
                onClick={() => setShowSuccess(false)}
                aria-label="بستن"
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all z-10"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Success icon */}
              <div className="flex flex-col items-center pt-10 pb-5 px-6">
                <motion.div
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.55, delay: 0.15 }}
                  className="w-[72px] h-[72px] rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.5)] mb-5"
                >
                  <CheckCircle2 className="h-9 w-9 text-white" />
                </motion.div>
                <h3 className="text-xl font-black text-white mb-1.5">به سبد اضافه شد!</h3>
                <p className="text-zinc-400 text-sm text-center leading-relaxed">
                  چهارچوب فلزی فرانسوی با موفقیت به سبد خرید شما اضافه گردید.
                </p>
              </div>

              {/* Order summary */}
              <div className="mx-5 mb-5 rounded-2xl bg-zinc-900 border border-white/[0.07] overflow-hidden">
                <div className="px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.07]">
                  <p className="text-xs font-bold text-zinc-400 tracking-wide">خلاصه سفارش</p>
                </div>
                {[
                  { label: 'محصول', value: 'چهارچوب فلزی فرانسوی' },
                  { label: 'رنگ', value: color.colorName },
                  { label: 'کلاف', value: `${toPersianNumber(klaf)} کلاف` },
                  { label: 'لولا', value: withHinge ? 'با لولا' : 'بدون لولا' },
                  { label: 'ابعاد', value: sizeText },
                  { label: 'تعداد', value: `${toPersianNumber(quantity)} عدد` },
                ].map(({ label, value }, i) => (
                  <div
                    key={label}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 text-sm',
                      i < 5 && 'border-b border-white/[0.05]',
                    )}
                  >
                    <span className="text-zinc-500">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3.5 bg-gold/5 border-t border-gold/15">
                  <span className="text-sm font-bold text-zinc-300">جمع کل</span>
                  <span className="text-lg font-black text-gold">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-5 pb-6 grid grid-cols-2 gap-3">
                <Button
                  variant="dark"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => setShowSuccess(false)}
                >
                  ادامه خرید
                </Button>
                <Button
                  asChild
                  variant="gold"
                  size="md"
                  className="w-full justify-center"
                >
                  <Link href="/cart" onClick={() => setShowSuccess(false)}>
                    <ShoppingCart className="h-4 w-4 ml-1.5" />
                    تکمیل سبد
                  </Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
