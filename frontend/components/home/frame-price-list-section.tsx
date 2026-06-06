'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Info,
  Phone,
  Layers,
  Zap,
  Shield,
  Ruler,
  Building2,
  Flame,
  ChevronLeft,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { PriceRow } from '@/lib/api/google-sheets'

// ─── Types ────────────────────────────────────────────────────────────────────

type FrameType = 'french' | 'mexican'

export type { PriceRow }

// ─── Fallback data (used when live sheet is unavailable) ──────────────────────

const FALLBACK_FRENCH_PRICES: PriceRow[] = [
  { colorName: 'قهوه‌ای',         colorHex: '#5C3317', hasHinge: true,  price3klaf: 3_700_000, klaf4Addon: 600_000 },
  { colorName: 'طوسی',            colorHex: '#7A8599', hasHinge: true,  price3klaf: 3_600_000, klaf4Addon: 600_000 },
  { colorName: 'مشکی',            colorHex: '#232323', hasHinge: true,  price3klaf: 3_700_000, klaf4Addon: 600_000 },
  { colorName: 'سفید',            colorHex: '#EFEFEF', hasHinge: true,  price3klaf: 4_000_000, klaf4Addon: 600_000 },
  { colorName: 'طوسی بدون لولا',  colorHex: '#7A8599', hasHinge: false, price3klaf: 3_500_000, klaf4Addon: 600_000 },
]

const FALLBACK_MEXICAN_PRICES: PriceRow[] = [
  { colorName: 'قهوه‌ای',         colorHex: '#5C3317', hasHinge: true,  price3klaf: 4_500_000, klaf4Addon: 900_000 },
  { colorName: 'طوسی',            colorHex: '#7A8599', hasHinge: true,  price3klaf: 4_400_000, klaf4Addon: 900_000 },
  { colorName: 'مشکی',            colorHex: '#232323', hasHinge: true,  price3klaf: 4_500_000, klaf4Addon: 900_000 },
  { colorName: 'سفید',            colorHex: '#EFEFEF', hasHinge: true,  price3klaf: 4_800_000, klaf4Addon: 900_000 },
  { colorName: 'طوسی بدون لولا',  colorHex: '#7A8599', hasHinge: false, price3klaf: 4_400_000, klaf4Addon: 900_000 },
]

const colorSwatches = [
  { name: 'مشکی مات',        hex: '#232323', border: false },
  { name: 'سفید مات',        hex: '#EFEFEF', border: true  },
  { name: 'طوسی متالیک',     hex: '#7A8599', border: false },
  { name: 'قهوه‌ای سوخته',   hex: '#5C3317', border: false },
]

const features = [
  { icon: Layers,    text: 'تولید با ورق ۲ میلیمتر' },
  { icon: Zap,       text: 'جوشکاری صنعتی دقیق' },
  { icon: Flame,     text: 'رنگ کوره‌ای الکترواستاتیک' },
  { icon: Shield,    text: 'مقاومت بالا در برابر ضربه' },
  { icon: Ruler,     text: 'قابل سفارش در ابعاد مختلف' },
  { icon: Building2, text: 'مناسب پروژه‌های ساختمانی و صنعتی' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIranPrice(n: number): string {
  return n.toLocaleString('fa-IR')
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ColorSwatch({ name, hex, border }: { name: string; hex: string; border: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'w-14 h-14 rounded-xl shadow-luxury-sm transition-transform duration-300 hover:scale-105',
          border && 'border border-white/20',
        )}
        style={{ backgroundColor: hex }}
      />
      <span className="text-xs text-muted text-center leading-tight">{name}</span>
    </div>
  )
}

function FrameTab({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 outline-none',
        active
          ? 'text-black'
          : 'text-muted hover:text-white',
      )}
    >
      {active && (
        <motion.span
          layoutId="tab-bg"
          className="absolute inset-0 rounded-xl bg-gold-gradient"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  )
}

function PriceTable({ rows, klaf4Label }: { rows: PriceRow[]; klaf4Label: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8">
      {/* Header */}
      <div className="grid grid-cols-2 bg-gold/10 border-b border-white/8 px-5 py-3">
        <span className="text-gold font-bold text-sm text-right">رنگ</span>
        <span className="text-gold font-bold text-sm text-left">قیمت (تومان)</span>
      </div>

      {/* Rows */}
      {rows.map((row, i) => (
        <motion.div
          key={row.colorName}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={cn(
            'grid grid-cols-2 items-center px-5 py-4 transition-colors duration-200',
            'hover:bg-white/4 group',
            i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent',
            i < rows.length - 1 && 'border-b border-white/6',
          )}
        >
          {/* Color */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-5 h-5 rounded-md flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                row.colorHex === '#EFEFEF' && 'border border-white/20',
              )}
              style={{ backgroundColor: row.colorHex }}
            />
            <span className="text-sm text-white font-medium">{row.colorName}</span>
            {!row.hasHinge && (
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-2xs font-semibold">
                بدون لولا
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-end gap-2">
            <span className="text-white font-black text-base tabular-nums">
              {formatIranPrice(row.price3klaf)}
            </span>
            <span className="text-muted text-xs hidden sm:inline">تومان</span>
          </div>
        </motion.div>
      ))}

      {/* 4-klaf addon row */}
      <div className="flex items-center justify-between px-5 py-3 bg-gold/5 border-t border-gold/20">
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-gold flex-shrink-0" />
          <span className="text-xs text-gold/80">
            {klaf4Label}: افزودن{' '}
            <span className="font-black text-gold">
              {formatIranPrice(rows[0].klaf4Addon)}
            </span>{' '}
            تومان
          </span>
        </div>
        <span className="text-2xs text-muted hidden sm:inline">۴ کلاف</span>
      </div>
    </div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────

interface FramePriceListSectionProps {
  frenchPrices?: PriceRow[]
  mexicanPrices?: PriceRow[]
}

export function FramePriceListSection({
  frenchPrices = FALLBACK_FRENCH_PRICES,
  mexicanPrices = FALLBACK_MEXICAN_PRICES,
}: FramePriceListSectionProps) {
  const [activeTab, setActiveTab] = useState<FrameType>('french')

  const resolvedFrench = frenchPrices.length > 0 ? frenchPrices : FALLBACK_FRENCH_PRICES
  const resolvedMexican = mexicanPrices.length > 0 ? mexicanPrices : FALLBACK_MEXICAN_PRICES
  const currentRows = activeTab === 'french' ? resolvedFrench : resolvedMexican
  const klaf4Label = activeTab === 'french' ? 'چهارچوب فرانسوی ۴ کلاف' : 'چهارچوب مکزیکی ۴ کلاف'

  return (
    <section
      dir="rtl"
      className="section-padding bg-black relative overflow-hidden"
    >
      {/* ── Decorative blobs ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-gold/4 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(200,168,93,0.6) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="container relative z-10">
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-gold" />
            <span className="text-gold text-sm font-semibold tracking-widest uppercase">
              لیست قیمت رسمی
            </span>
            <div className="h-px w-10 bg-gold" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
            چهارچوب فلزی{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg,#C8A85D 0%,#E7D3A5 50%,#C8A85D 100%)' }}
            >
              فرانسوی و مکزیکی
            </span>
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            {[
              'ضخامت ۲ میلیمتر',
              'رنگ کوره‌ای',
              'لولا پارس کلون',
            ].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gold/10 border border-gold/25 text-gold"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8 items-start">
          {/* ── Left: price table ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-6"
          >
            {/* Title card */}
            <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-surface border border-white/8">
              <div>
                <div className="text-white font-black text-lg">لیست قیمت چهارچوب ۳ کلاف</div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/25">
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="text-gold text-xs font-bold">بروزرسانی ۱۴۰۳</span>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface border border-white/8 w-full sm:w-auto self-start">
              <FrameTab
                label="چهارچوب فرانسوی"
                active={activeTab === 'french'}
                onClick={() => setActiveTab('french')}
              />
              <FrameTab
                label="چهارچوب مکزیکی"
                active={activeTab === 'mexican'}
                onClick={() => setActiveTab('mexican')}
              />
            </div>

            {/* Animated table */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <PriceTable rows={currentRows} klaf4Label={klaf4Label} />
              </motion.div>
            </AnimatePresence>

            {/* Important note */}
            <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span className="text-amber-400 font-bold text-sm">نکته مهم</span>
              </div>
              <p className="text-muted text-sm leading-relaxed mb-3">
                لیست قیمت فوق مربوط به چهارچوب <strong className="text-white">۳ کلاف</strong> می‌باشد.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2.5 text-sm text-muted">
                  <CheckCircle2 className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                  <span>
                    برای چهارچوب فرانسوی <strong className="text-white">۴ کلاف</strong>،
                    مبلغ <strong className="text-gold">۶۰۰٬۰۰۰</strong> تومان به قیمت فوق اضافه می‌شود.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-muted">
                  <CheckCircle2 className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                  <span>
                    برای چهارچوب مکزیکی <strong className="text-white">۴ کلاف</strong>،
                    مبلغ <strong className="text-gold">۹۰۰٬۰۰۰</strong> تومان به قیمت فوق اضافه می‌شود.
                  </span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="gold" size="md" className="w-full sm:w-auto justify-center">
                <Link href="/contact">
                  <Phone className="h-4 w-4 ml-2" />
                  مشاوره و استعلام قیمت
                </Link>
              </Button>
              <Button asChild variant="gold-outline" size="md" className="w-full sm:w-auto justify-center">
                <Link href="/products">
                  مشاهده محصولات
                  <ChevronLeft className="h-4 w-4 mr-2" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* ── Right sidebar ── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-6"
          >
            {/* Color swatches */}
            <div className="rounded-2xl bg-surface border border-white/8 p-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold-gradient" />
                رنگ‌بندی موجود
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {colorSwatches.map((s) => (
                  <ColorSwatch key={s.name} {...s} />
                ))}
              </div>
              <p className="text-muted text-xs mt-4 leading-relaxed">
                رنگ‌آمیزی با فرآیند کوره‌ای الکترواستاتیک — پوشش یکنواخت و مقاوم در برابر خراش و رطوبت.
              </p>
            </div>

            {/* Features */}
            <div className="rounded-2xl bg-surface border border-white/8 p-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold-gradient" />
                ویژگی‌ها
              </h3>
              <ul className="space-y-3">
                {features.map(({ icon: Icon, text }, i) => (
                  <motion.li
                    key={text}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.4 }}
                    className="flex items-center gap-3 text-sm text-muted"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 text-gold" />
                    </div>
                    {text}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Contact strip */}
            <a
              href="tel:09003286539"
              className="group flex items-center gap-4 rounded-2xl bg-gold/10 border border-gold/30 hover:bg-gold/15 hover:border-gold/50 transition-all duration-300 p-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0 group-hover:bg-gold group-hover:border-gold transition-all duration-300">
                <Phone className="h-4 w-4 text-gold group-hover:text-black transition-colors duration-300" />
              </div>
              <div>
                <div className="text-xs text-muted mb-0.5">تماس مستقیم</div>
                <div className="text-white font-black text-base tracking-wide ltr" dir="ltr">
                  0900 328 6539
                </div>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
