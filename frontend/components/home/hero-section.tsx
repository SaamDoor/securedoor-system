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
  { icon: Award,  label: 'گارانتی ۱۰ ساله' },
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
      className="relative min-h-screen flex items-center overflow-hidden bg-black"
    >

      {/* ── Background images with parallax ── */}
      <motion.div style={{ y: imageY }} className="absolute inset-0 z-0">

        {/* Desktop image */}
        <Image
          src="/images/hero/mashuf-hero-desktop.webp"
          alt="محصولات مشعوف"
          fill priority
          className="hidden md:block object-cover object-center"
          sizes="100vw"
        />

        {/* Mobile image */}
        <Image
          src="/images/hero/mashuf-hero-mobile.webp"
          alt="محصولات مشعوف"
          fill priority
          className="block md:hidden object-cover object-[60%_top]"
          sizes="100vw"
        />

        {/* Desktop gradients — dark on right (text area), clear on left (doors) */}
        <div className="hidden md:block absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to left, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.35) 58%, transparent 78%)',
          }}
        />
        {/* top/bottom fade for desktop */}
        <div className="hidden md:block absolute inset-0 z-10 bg-gradient-to-t from-black via-transparent to-black/50" />

        {/* Mobile gradients — strong overlay so text is always readable */}
        <div className="block md:hidden absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/55 to-black/90" />
        <div className="block md:hidden absolute inset-0 z-10 bg-gradient-to-r from-black/40 via-transparent to-black/30" />
      </motion.div>

      {/* ── Liquid glass ambient orbs ── */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] right-[5%]  w-80 h-80 rounded-full bg-gold/6  blur-[100px] opacity-70" />
        <div className="absolute top-[50%] right-[15%] w-52 h-52 rounded-full bg-gold/4  blur-[70px]" />
        <div className="absolute bottom-[20%] right-[8%] w-40 h-40 rounded-full bg-amber-400/5 blur-[60px]" />
        {/* Animated gold scan-line */}
        <motion.div
          className="absolute top-0 bottom-0 w-px"
          style={{ right: '44%', background: 'linear-gradient(to bottom,transparent 0%,rgba(200,168,93,0.25) 40%,rgba(200,168,93,0.4) 55%,transparent 100%)' }}
          animate={{ opacity: [0, 1, 0.3, 1, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── Grain texture overlay ── */}
      <div
        className="absolute inset-0 z-[3] opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Main content ── */}
      <div className="container relative z-10">
        <motion.div
          style={{ y: textY, opacity }}
          className="w-full max-w-xl py-32 lg:py-0"
        >

          {/* Liquid-glass eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-7"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full
              backdrop-blur-md bg-white/[0.07] border border-gold/30
              shadow-[0_0_24px_rgba(200,168,93,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Star className="h-3 w-3 text-gold fill-gold" />
              <span className="text-gold text-xs font-semibold tracking-[0.18em] uppercase">
                صنایع ساختمانی مشعوف
              </span>
              <div className="h-3 w-px bg-gold/40" />
              <span className="text-gold/70 text-xs">از ۱۳۹۰</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-display font-black text-white mb-7 leading-[1.08]"
          >
            گروه تولیدی{' '}
            <span className="relative inline-block">
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg,#C8A85D 0%,#F0DFA0 45%,#C8A85D 100%)' }}
              >
                مشعوف
              </span>
              <motion.span
                className="absolute -bottom-1.5 right-0 left-0 h-[2px] rounded-full"
                style={{ background: 'linear-gradient(90deg,transparent,#C8A85D 40%,#F0DFA0 60%,transparent)' }}
                initial={{ scaleX: 0, originX: 1 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </span>
          </motion.h1>

          {/* Liquid glass description card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative mb-8"
          >
            <div className="rounded-2xl p-5
              backdrop-blur-xl bg-white/[0.06]
              border border-white/[0.10]
              shadow-[0_8px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-1px_0_rgba(255,255,255,0.03)]"
            >
              {/* Top-right glass shine */}
              <div className="absolute top-0 right-4 left-1/2 h-px bg-gradient-to-l from-transparent to-white/20 rounded-full" />
              <p className="text-white/85 leading-[1.9] text-sm sm:text-base">
                گروه تولیدی صنایع ساختمانی مشعوف با بیش از ۱۰ سال سابقه در زمینه تولید
                چهارچوب‌های فلزی و درب‌های ضد سرقت، ترکیب بی‌نظیری از زیبایی و استحکام را
                به خانه‌های شما می‌آورد.
              </p>
              <div className="mt-3.5 pt-3.5 border-t border-white/[0.07]">
                <p className="text-white/55 leading-[1.85] text-xs sm:text-sm">
                  در گروه صنعتی مشعوف، تیمی از نیروهای مجرب و متخصص با دقتِ تمام بر روی
                  روند تولید و کیفیت عمومی و تخصصی محصولات نظارت دارند.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Liquid glass feature pills */}
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
                  backdrop-blur-md bg-white/[0.07] border border-white/[0.11]
                  shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.07)]
                  text-sm text-white/80
                  hover:bg-white/[0.11] hover:border-gold/35 hover:text-white
                  transition-all duration-300 cursor-default"
              >
                <Icon className="h-3.5 w-3.5 text-gold" />
                {label}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
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

      {/* ── Stats bar — liquid glass ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.95, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute bottom-0 left-0 right-0 z-10"
      >
        <div className="backdrop-blur-2xl bg-black/45 border-t border-white/[0.07]
          shadow-[0_-12px_48px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="container">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.07] divide-x-reverse">
              {stats.map(({ value, suffix, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.05 + i * 0.1, duration: 0.5 }}
                  className="px-6 py-5 text-center group hover:bg-white/[0.03] transition-colors duration-300"
                >
                  <CountUp value={value} suffix={suffix} className="text-3xl font-black text-gold" />
                  <div className="text-xs text-muted mt-1">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-[5.5rem] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[10px] text-white/30 tracking-widest">اسکرول کنید</span>
        <motion.div
          className="w-5 h-8 rounded-full backdrop-blur-sm bg-white/[0.05] border border-white/15
            flex items-start justify-center pt-1.5
            shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-1 h-2 rounded-full bg-gold" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── CountUp ──────────────────────────────────────────────────────────────────

function CountUp({ value, suffix, className }: { value: number; suffix: string; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      >
        {toPersianNumber(value.toLocaleString('fa-IR'))}{suffix}
      </motion.span>
    </motion.div>
  )
}
