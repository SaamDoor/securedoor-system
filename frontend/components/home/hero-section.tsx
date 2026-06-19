'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Shield, Award, Wrench, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toPersianNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

/* ──────────────────────────────────────────────────────────────
   SLIDES — add/remove items here to change the hero slideshow
   ────────────────────────────────────────────────────────────── */
const heroSlides = [
  {
    desktop: '/images/hero/mashuf-hero-desktop.webp',
    mobile:  '/images/hero/mashuf-hero-mobile.webp',
    alt:     'گروه صنعتی مشعوف — درب ضد سرقت',
  },
  // {
  //   desktop: '/images/hero/mashuf-hero-desktop-2.webp',
  //   mobile:  '/images/hero/mashuf-hero-mobile-2.webp',
  //   alt:     'گروه صنعتی مشعوف — درب آپارتمانی',
  // },
]

const stats = [
  { value: 10,    suffix: '+',  label: 'سال سابقه' },
  { value: 15000, suffix: '+',  label: 'پروژه موفق' },
  { value: 12,    suffix: '',   label: 'استاندارد بین‌المللی' },
  { value: 99,    suffix: '٪',  label: 'رضایت مشتری' },
]

const features = [
  { icon: Shield, label: 'امنیت بالا' },
  { icon: Award,  label: 'گارانتی ۱۰ ساله روکش' },
  { icon: Award,  label: 'گارانتی ۵ ساله یراق' },
  { icon: Wrench, label: 'نصب حرفه‌ای' },
]

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeSlide, setActiveSlide]   = useState(0)
  const [showArrows, setShowArrows]     = useState(false)
  const totalSlides = heroSlides.length
  const dragStartX  = useRef<number>(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  /* Parallax — applied only in transforms; no layout shift */
  const imageY  = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const textY   = useTransform(scrollYProgress, [0, 1], ['0%', '7%'])
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  /* ── Auto-advance ── */
  useEffect(() => {
    if (totalSlides <= 1) return
    const id = setInterval(() => setActiveSlide(p => (p + 1) % totalSlides), 6000)
    return () => clearInterval(id)
  }, [totalSlides])

  const goTo = useCallback((i: number) => {
    setActiveSlide(((i % totalSlides) + totalSlides) % totalSlides)
  }, [totalSlides])

  /* ── Pointer-based swipe (works for mouse AND touch via pointer events) ── */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = e.clientX
  }
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - dragStartX.current
    if (Math.abs(dx) > 55) {
      // RTL: swipe right → go back, swipe left → go forward
      goTo(dx > 0 ? activeSlide - 1 : activeSlide + 1)
    }
  }

  return (
    <section
      ref={containerRef}
      /* -mt-20 cancels the shop layout's pt-20 so hero starts at y=0.
         flex flex-col keeps stats bar in flow so it never overlaps content. */
      className="relative -mt-20 min-h-[100svh] flex flex-col overflow-hidden bg-black select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >

      {/* ══ Slider — background images with parallax ══ */}
      {/* translateZ(0) forces GPU compositing → sharp rendering, no sub-pixel blur */}
      <motion.div
        style={{ y: imageY, translateZ: 0 }}
        className="absolute inset-0 z-0 will-change-transform"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={heroSlides[activeSlide].desktop}
              alt={heroSlides[activeSlide].alt}
              fill priority
              quality={95}
              className="hidden md:block object-cover object-center"
              sizes="100vw"
            />
            <Image
              src={heroSlides[activeSlide].mobile}
              alt={heroSlides[activeSlide].alt}
              fill priority
              quality={95}
              className="block md:hidden object-cover object-[60%_top]"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Desktop overlay */}
        <div className="hidden md:block absolute inset-0 z-10"
          style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.76) 30%, rgba(0,0,0,0.36) 58%, transparent 78%)' }}
        />
        <div className="hidden md:block absolute inset-0 z-10 bg-gradient-to-t from-black via-transparent to-black/50" />
        {/* Mobile overlay */}
        <div className="block md:hidden absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/55 to-black/90" />
        <div className="block md:hidden absolute inset-0 z-10 bg-gradient-to-r from-black/40 via-transparent to-black/30" />
      </motion.div>

      {/* ══ Glow orbs ══ */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(196,30,58,0.18) 0%, rgba(196,30,58,0.06) 50%, transparent 70%)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[40%] right-[12%] w-[380px] h-[380px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,0,32,0.20) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[8%] w-[280px] h-[280px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(88,28,135,0.14) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        <motion.div
          className="absolute top-0 bottom-0 w-px"
          style={{ right: '44%', background: 'linear-gradient(to bottom, transparent 0%, rgba(196,30,58,0.22) 40%, rgba(196,30,58,0.38) 55%, transparent 100%)' }}
          animate={{ opacity: [0, 1, 0.25, 1, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ══ Film grain ══ */}
      <div
        className="absolute inset-0 z-[3] opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* ══ Desktop prev/next arrows ══ */}
      {totalSlides > 1 && (
        <AnimatePresence>
          {showArrows && (
            <>
              <motion.button
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                onClick={() => goTo(activeSlide - 1)}
                aria-label="اسلاید قبلی"
                className="absolute left-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex
                  w-12 h-12 rounded-full items-center justify-center
                  bg-black/40 border border-white/10 text-white backdrop-blur-md
                  hover:bg-primary/20 hover:border-primary/30 hover:text-primary
                  transition-all duration-200 shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                onClick={() => goTo(activeSlide + 1)}
                aria-label="اسلاید بعدی"
                className="absolute right-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex
                  w-12 h-12 rounded-full items-center justify-center
                  bg-black/40 border border-white/10 text-white backdrop-blur-md
                  hover:bg-primary/20 hover:border-primary/30 hover:text-primary
                  transition-all duration-200 shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      )}

      {/* ══ Main content — flex-1 fills space above stats bar ══ */}
      <div className="container relative z-10 flex-1 flex items-center">
        <motion.div
          style={{ y: textY, opacity }}
          className="w-full max-w-xl pt-24 pb-4 sm:pt-28 sm:pb-6 lg:pt-32 lg:pb-0"
        >

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-4 sm:mb-7"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full
              backdrop-blur-md bg-white/[0.08] border border-primary/25
              shadow-[0_0_24px_rgba(196,30,58,0.12),inset_0_1px_0_rgba(255,255,255,0.07),0_4px_16px_rgba(0,0,0,0.4)]
              drop-shadow-lg">
              <Star className="h-3 w-3 text-primary fill-primary flex-shrink-0" />
              <span className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
                صنایع ساختمانی مشعوف
              </span>
              <div className="h-3 w-px bg-primary/30" />
              <span className="text-primary/60 text-xs">از ۱۳۹۰</span>
            </div>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-black text-white mb-4 sm:mb-7 leading-[1.1] tracking-tight"
            style={{ fontSize: 'clamp(2.4rem, 7vw, 5.5rem)', textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}
          >
            گروه صنعتی{' '}
            <span className="relative inline-block">
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #C41E3A 0%, #E8506A 45%, #D42B47 70%, #FF7A96 100%)' }}
              >
                مشعوف
              </span>
              <motion.span
                className="absolute -bottom-1.5 right-0 left-0 h-[3px] rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, #C41E3A 30%, #E8506A 60%, transparent)' }}
                initial={{ scaleX: 0, originX: 1 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
              <span
                className="absolute inset-0 -z-10 blur-[32px] opacity-40"
                style={{ background: 'linear-gradient(135deg, #C41E3A, #E8506A)' }}
              />
            </span>
          </motion.h1>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative mb-4 sm:mb-8"
          >
            <div className="rounded-2xl p-4 sm:p-5
              backdrop-blur-xl bg-white/[0.07]
              border border-white/[0.10]
              shadow-[0_8px_40px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.10)]">
              <div className="absolute top-0 right-4 left-1/2 h-px bg-gradient-to-l from-transparent to-white/15 rounded-full" />
              <p className="text-white/85 leading-[1.85] text-sm sm:text-base">
                گروه صنعتی مشعوف با بیش از ۱۰ سال سابقه در تولید چهارچوب‌های فلزی و
                درب‌های ضد سرقت، ترکیب بی‌نظیری از زیبایی و استحکام را به خانه‌های شما می‌آورد.
              </p>
              {/* Hide secondary paragraph on mobile to save vertical space */}
              <div className="mt-3 pt-3 border-t border-white/[0.07] hidden sm:block">
                <p className="text-white/50 leading-[1.85] text-sm">
                  تیمی از نیروهای مجرب و متخصص با دقتِ تمام بر روی
                  روند تولید و کیفیت عمومی و تخصصی محصولات نظارت دارند.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap items-center gap-2 mb-5 sm:mb-9"
          >
            {features.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.08, duration: 0.35 }}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full
                  backdrop-blur-md bg-white/[0.06] border border-white/[0.10]
                  shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]
                  text-xs sm:text-sm text-white/80
                  hover:bg-white/[0.10] hover:border-primary/30 hover:text-white
                  transition-all duration-300 cursor-default"
              >
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary flex-shrink-0" />
                {label}
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button asChild variant="gold" size="lg" rightIcon={<ArrowLeft className="h-5 w-5" />}>
              <Link href="/products">مشاهده محصولات</Link>
            </Button>
            <Button asChild variant="gold-outline" size="lg">
              <Link href="/contact">مشاوره رایگان</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* ══ Slider dots + scroll indicator row ══ */}
      <div className="relative z-20 flex items-center justify-center gap-4 py-2 sm:py-3">
        {/* Scroll indicator — desktop only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="hidden sm:flex flex-col items-center gap-1.5"
        >
          <span className="text-[9px] text-white/25 tracking-widest">اسکرول</span>
          <motion.div
            className="w-4 h-6 rounded-full backdrop-blur-sm bg-white/[0.04] border border-white/10
              flex items-start justify-center pt-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-0.5 h-1.5 rounded-full bg-primary" />
          </motion.div>
        </motion.div>

        {/* Navigation dots */}
        {totalSlides > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex items-center gap-2.5"
          >
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`اسلاید ${toPersianNumber(i + 1)}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-500 focus:outline-none',
                  i === activeSlide
                    ? 'w-7 bg-primary shadow-[0_0_8px_rgba(196,30,58,0.6)]'
                    : 'w-1.5 bg-white/35 hover:bg-white/60',
                )}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* ══ Stats bar — in document flow (not absolute) so content never overlaps ══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.95, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full"
      >
        <div className="backdrop-blur-2xl bg-black/55 border-t border-white/[0.06]
          shadow-[0_-8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]">
          {/* Top glow edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="container">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.06] divide-x-reverse">
              {stats.map(({ value, suffix, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.05 + i * 0.1, duration: 0.5 }}
                  className="px-4 py-3 sm:py-5 text-center group hover:bg-white/[0.03] transition-colors duration-300"
                >
                  <CountUp value={value} suffix={suffix} />
                  <div className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  return (
    <motion.div
      className="text-2xl sm:text-3xl font-black"
      style={{
        background: 'linear-gradient(135deg, #E8506A 0%, #C41E3A 60%, #FF7A96 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {toPersianNumber(value.toLocaleString())}{suffix}
    </motion.div>
  )
}
