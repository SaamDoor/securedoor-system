'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft, Shield, Award, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toPersianNumber } from '@/lib/utils'

const stats = [
  { value: 20, suffix: '+', label: 'سال تجربه' },
  { value: 15000, suffix: '+', label: 'پروژه موفق' },
  { value: 12, suffix: '', label: 'استاندارد بین‌المللی' },
  { value: 99, suffix: '٪', label: 'رضایت مشتری' },
]

const features = [
  { icon: Shield, label: 'امنیت بالا' },
  { icon: Award, label: 'گارانتی ۱۰ ساله' },
  { icon: Wrench, label: 'نصب حرفه‌ای' },
]

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-black"
    >
      {/* ── Background image with parallax ── */}
      <motion.div
        style={{ y: imageY }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/70 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent z-10" />

        {/* Placeholder gradient — replace with real hero image */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(ellipse at 70% 50%, rgba(200,168,93,0.3) 0%, transparent 60%)',
            }}
          />
        </div>
      </motion.div>

      {/* ── Gold scan line effect ── */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent"
          style={{ left: '35%' }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── Grain texture ── */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Content ── */}
      <div className="container relative z-10">
        <motion.div
          style={{ y: textY, opacity }}
          className="max-w-3xl py-32 lg:py-0"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-px w-12 bg-gold" />
            <span className="text-gold text-sm font-semibold tracking-[0.2em] uppercase">
              Premium Security Doors
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-display font-black text-white mb-6 leading-[1.05]"
          >
            گروه تولیدی{' '}
            <span className="relative inline-block">
              مشعوف
              <motion.span
                className="absolute -bottom-2 right-0 left-0 h-1 bg-gold-gradient rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-lg text-muted leading-relaxed mb-10 max-w-xl"
          >
            گروه تولیدی صنایع ساختمانی مشعوف با بیش از ۱۰ سال سابقه در زمینه تولید چهارچوب‌های فلزی و درب‌های ضد سرقت، ترکیب بی‌نظیری از زیبایی و استحکام را به خانه‌های شما می‌آورد.
            <br className="hidden sm:block" />
            در گروه صنعتی مشعوف، تیمی از نیروهای مجرب و متخصص با دقتِ تمام بر روی روند تولید و کیفیت عمومی و تخصصی محصولات نظارت دارند.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap items-center gap-3 mb-10"
          >
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-muted"
              >
                <Icon className="h-4 w-4 text-gold" />
                {label}
              </div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
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

      {/* ── Stats bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute bottom-0 left-0 right-0 z-10"
      >
        <div className="bg-black/60 backdrop-blur-xl border-t border-white/8">
          <div className="container">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/8 divide-x-reverse">
              {stats.map(({ value, suffix, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
                  className="px-6 py-6 text-center"
                >
                  <CountUp
                    value={value}
                    suffix={suffix}
                    className="text-3xl font-black text-gold"
                  />
                  <div className="text-sm text-muted mt-1">{label}</div>
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
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-xs text-muted tracking-widest">اسکرول کنید</span>
        <motion.div
          className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-1 h-2 bg-gold rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function CountUp({
  value,
  suffix,
  className,
}: {
  value: number
  suffix: string
  className?: string
}) {
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
        {toPersianNumber(value.toLocaleString('fa-IR'))}
        {suffix}
      </motion.span>
    </motion.div>
  )
}
