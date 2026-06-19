'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft, Shield, Award, Wrench, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toPersianNumber } from '@/lib/utils'

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
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const imageY  = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const textY   = useTransform(scrollYProgress, [0, 1], ['0%', '9%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section
      ref={containerRef}
      className="relative -mt-20 min-h-[100svh] flex items-center overflow-hidden bg-black"
    >

      {/* ══ Background images with parallax ══ */}
      <motion.div style={{ y: imageY }} className="absolute inset-0 z-0">
        <Image
          src="/images/hero/mashuf-hero-desktop.webp"
          alt="محصولات مشعوف"
          fill priority
          className="hidden md:block object-cover object-center"
          sizes="100vw"
        />
        <Image
          src="/images/hero/mashuf-hero-mobile.webp"
          alt="محصولات مشعوف"
          fill priority
          className="block md:hidden object-cover object-[60%_top]"
          sizes="100vw"
        />
        {/* Desktop gradient */}
        <div className="hidden md:block absolute inset-0 z-10"
          style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.76) 30%, rgba(0,0,0,0.36) 58%, transparent 78%)' }}
        />
        <div className="hidden md:block absolute inset-0 z-10 bg-gradient-to-t from-black via-transparent to-black/50" />
        {/* Mobile gradient */}
        <div className="block md:hidden absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/55 to-black/90" />
        <div className="block md:hidden absolute inset-0 z-10 bg-gradient-to-r from-black/40 via-transparent to-black/30" />
      </motion.div>

      {/* ══ LUXURY GLOW ORBS — atmospheric depth ══ */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {/* Large primary crimson orb — top right */}
        <motion.div
          className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(196,30,58,0.18) 0%, rgba(196,30,58,0.06) 50%, transparent 70%)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Mid — deep ruby */}
        <motion.div
          className="absolute top-[40%] right-[12%] w-[380px] h-[380px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,0,32,0.20) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        {/* Bottom accent — cool dark purple for depth contrast */}
        <motion.div
          className="absolute bottom-[10%] left-[8%] w-[280px] h-[280px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(88,28,135,0.14) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        {/* Vertical scan-line — crimson */}
        <motion.div
          className="absolute top-0 bottom-0 w-px"
          style={{ right: '44%', background: 'linear-gradient(to bottom, transparent 0%, rgba(196,30,58,0.22) 40%, rgba(196,30,58,0.38) 55%, transparent 100%)' }}
          animate={{ opacity: [0, 1, 0.25, 1, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Horizontal divider line — subtle */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{ bottom: '30%', height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(196,30,58,0.08) 30%, rgba(255,255,255,0.05) 50%, rgba(196,30,58,0.08) 70%, transparent 100%)' }}
        />
      </div>

      {/* ══ Film grain texture ══ */}
      <div
        className="absolute inset-0 z-[3] opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* ══ Main content ══ */}
      <div className="container relative z-10">
        <motion.div
          style={{ y: textY, opacity }}
          className="w-full max-w-xl py-32 lg:py-0 lg:pt-28"
        >

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-7"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full
              backdrop-blur-md bg-white/[0.08] border border-primary/25
              shadow-[0_0_24px_rgba(196,30,58,0.12),inset_0_1px_0_rgba(255,255,255,0.07),0_4px_16px_rgba(0,0,0,0.4)]
              drop-shadow-lg">
              <Star className="h-3 w-3 text-primary fill-primary" />
              <span className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
                صنایع ساختمانی مشعوف
              </span>
              <div className="h-3 w-px bg-primary/30" />
              <span className="text-primary/60 text-xs">از ۱۳۹۰</span>
            </div>
          </motion.div>

          {/* ── H1 — oversized gradient headline ── */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-black text-white mb-7 leading-[1.08] tracking-tight"
            style={{ fontSize: 'clamp(2.75rem, 8vw, 5.5rem)', textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}
          >
            گروه صنعتی{' '}
            <span className="relative inline-block">
              {/* Gradient text — crimson to rose */}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #C41E3A 0%, #E8506A 45%, #D42B47 70%, #FF7A96 100%)' }}
              >
                مشعوف
              </span>
              {/* Animated underline */}
              <motion.span
                className="absolute -bottom-1.5 right-0 left-0 h-[3px] rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, #C41E3A 30%, #E8506A 60%, transparent)' }}
                initial={{ scaleX: 0, originX: 1 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
              {/* Glow behind word */}
              <span
                className="absolute inset-0 -z-10 blur-[32px] opacity-40"
                style={{ background: 'linear-gradient(135deg, #C41E3A, #E8506A)' }}
              />
            </span>
          </motion.h1>

          {/* Description card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative mb-8"
          >
            <div className="rounded-2xl p-5
              backdrop-blur-xl bg-white/[0.07]
              border border-white/[0.10]
              shadow-[0_8px_40px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.08)]">
              <div className="absolute top-0 right-4 left-1/2 h-px bg-gradient-to-l from-transparent to-white/15 rounded-full" />
              <p className="text-white/85 leading-[1.9] text-sm sm:text-base">
                گروه تولیدی صنایع ساختمانی مشعوف با بیش از ۱۰ سال سابقه در زمینه تولید
                چهارچوب‌های فلزی و درب‌های ضد سرقت، ترکیب بی‌نظیری از زیبایی و استحکام را
                به خانه‌های شما می‌آورد.
              </p>
              <div className="mt-3.5 pt-3.5 border-t border-white/[0.07]">
                <p className="text-white/50 leading-[1.85] text-xs sm:text-sm">
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
            className="flex flex-wrap items-center gap-2.5 mb-9"
          >
            {features.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full
                  backdrop-blur-md bg-white/[0.06] border border-white/[0.10]
                  shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]
                  text-sm text-white/80
                  hover:bg-white/[0.10] hover:border-primary/30 hover:text-white
                  transition-all duration-300 cursor-default select-none"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="flex flex-wrap items-center gap-4"
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

      {/* ══ Stats bar ══ */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.95, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute bottom-0 left-0 right-0 z-10"
      >
        <div className="backdrop-blur-2xl bg-black/50 border-t border-white/[0.06]
          shadow-[0_-12px_48px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]">
          {/* Top glow edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="container">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.06] divide-x-reverse">
              {stats.map(({ value, suffix, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.05 + i * 0.1, duration: 0.5 }}
                  className="px-6 py-5 text-center group hover:bg-white/[0.03] transition-colors duration-300"
                >
                  <CountUp value={value} suffix={suffix} />
                  <div className="text-xs text-zinc-500 mt-1">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══ Scroll indicator ══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-[12rem] sm:bottom-[5.5rem] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[10px] text-white/25 tracking-widest">اسکرول</span>
        <motion.div
          className="w-5 h-8 rounded-full backdrop-blur-sm bg-white/[0.04] border border-white/12
            flex items-start justify-center pt-1.5
            shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-1 h-2 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  return (
    <motion.div
      className="text-3xl font-black"
      style={{ background: 'linear-gradient(135deg, #E8506A 0%, #C41E3A 60%, #FF7A96 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {toPersianNumber(value.toLocaleString())}{suffix}
    </motion.div>
  )
}
