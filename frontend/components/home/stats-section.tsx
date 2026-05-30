'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { toPersianNumber } from '@/lib/utils'

const stats = [
  { value: 20, suffix: '+', unit: 'سال', label: 'سابقه تولید', description: 'از سال ۱۳۸۲' },
  { value: 15000, suffix: '+', unit: '', label: 'درب نصب شده', description: 'در سراسر کشور' },
  { value: 850, suffix: '+', unit: '', label: 'نمایندگی فعال', description: 'در ۳۱ استان' },
  { value: 12, suffix: '', unit: '', label: 'جایزه ملی', description: 'کیفیت و نوآوری' },
  { value: 99, suffix: '٪', unit: '', label: 'رضایت مشتری', description: 'بر اساس نظرسنجی' },
  { value: 10, suffix: '', unit: 'سال', label: 'ضمانت‌نامه', description: 'برای تمام محصولات' },
]

export function StatsSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="section-padding bg-black relative overflow-hidden">
      {/* Gold radial background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full bg-gold/5 blur-[120px]" />
      </div>

      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            rgba(200,168,93,0.5) 0px,
            rgba(200,168,93,0.5) 1px,
            transparent 1px,
            transparent 80px
          ), repeating-linear-gradient(
            0deg,
            rgba(200,168,93,0.5) 0px,
            rgba(200,168,93,0.5) 1px,
            transparent 1px,
            transparent 80px
          )`,
        }}
      />

      <div className="container relative">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gold" />
            <span className="text-gold text-sm font-semibold tracking-widest">اعداد واقعی</span>
            <div className="h-px w-12 bg-gold" />
          </div>
          <h2 className="section-title mb-4">
            سام درب در یک نگاه
          </h2>
          <p className="section-subtitle">
            اعداد و ارقامی که نشان‌دهنده تعهد ما به کیفیت و اعتماد مشتریان است.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="group"
            >
              <div className="relative p-8 rounded-2xl bg-surface border border-white/8 text-center overflow-hidden hover:border-gold/30 transition-all duration-400 hover:shadow-gold">
                {/* Corner accent */}
                <div className="absolute top-0 left-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(circle at top left, rgba(200,168,93,0.15), transparent 70%)',
                  }}
                />

                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  unit={stat.unit}
                  isInView={isInView}
                  delay={i * 0.15}
                />

                <div className="font-bold text-white text-base mt-1">{stat.label}</div>
                <div className="text-xs text-muted mt-1">{stat.description}</div>

                {/* Bottom gold line */}
                <motion.div
                  className="absolute bottom-0 right-0 left-0 h-0.5 bg-gold-gradient"
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.4 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AnimatedNumber({
  value,
  suffix,
  unit,
  isInView,
  delay,
}: {
  value: number
  suffix: string
  unit: string
  isInView: boolean
  delay: number
}) {
  return (
    <motion.div
      className="text-5xl font-black text-gold-gradient leading-none mb-2"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.3, delay }}
    >
      {toPersianNumber(value.toLocaleString('fa-IR'))}{suffix}
      {unit && <span className="text-xl font-semibold text-gold mr-1">{unit}</span>}
    </motion.div>
  )
}
