'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Quote } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { Rating } from '@/components/ui/rating'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    id: 1,
    name: 'مهندس رضا کریمی',
    role: 'مدیر پروژه ساختمانی',
    company: 'گروه ساختمانی آریا',
    avatar: '/avatars/testimonial-1.jpg',
    content:
      'پس از ۱۵ سال کار در حوزه ساختمان، گروه صنعتی مشعوف را بهترین انتخاب برای پروژه‌های لوکس می‌دانم. کیفیت ساخت، دقت در نصب و پشتیبانی پس از فروش واقعاً استثنایی است.',
    rating: 5,
    project: 'مجتمع مسکونی ۱۲۰ واحدی',
  },
  {
    id: 2,
    name: 'خانم فاطمه موسوی',
    role: 'طراح داخلی',
    company: 'استودیو فضا',
    avatar: '/avatars/testimonial-2.jpg',
    content:
      'تنوع طراحی محصولات گروه صنعتی مشعوف به من این امکان را می‌دهد که برای هر سبک دکوراسیونی، بهترین گزینه را پیدا کنم. مشتریانم همیشه از زیبایی و کارایی این درب‌ها راضی بوده‌اند.',
    rating: 5,
    project: 'ویلای شخصی - نیاوران',
  },
  {
    id: 3,
    name: 'جناب آقای احمدی',
    role: 'مدیر هتل',
    company: 'هتل بزرگ تهران',
    avatar: '/avatars/testimonial-3.jpg',
    content:
      'برای نوسازی ۲۰۰ اتاق هتلمان به درب‌هایی با کیفیت بین‌المللی نیاز داشتیم. گروه صنعتی مشعوف با ارائه راه‌حل سفارشی و اجرای بی‌نقص، انتظارات ما را فراتر رفت.',
    rating: 5,
    project: 'نوسازی ۲۰۰ اتاق هتل',
  },
  {
    id: 4,
    name: 'دکتر سارا نجفی',
    role: 'پزشک متخصص',
    company: 'کلینیک نور',
    avatar: '/avatars/testimonial-4.jpg',
    content:
      'ضمانت ۱۰ ساله گروه صنعتی مشعوف برایم مهم‌ترین عامل انتخاب بود. بعد از ۳ سال، درب‌ها هنوز مثل روز اول عالی هستند و هیچ مشکلی نداشتیم.',
    rating: 5,
    project: 'منزل شخصی - الهیه',
  },
]

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  const handlePrev = () => {
    setDirection('prev')
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setDirection('next')
    setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  const variants = {
    enter: (dir: string) => ({
      x: dir === 'next' ? -60 : 60,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: string) => ({
      x: dir === 'next' ? 60 : -60,
      opacity: 0,
    }),
  }

  return (
    <section className="section-padding bg-charcoal relative overflow-hidden">
      {/* Radial background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-1/4 w-96 h-96 rounded-full bg-gold/5 blur-[100px]" />
      </div>

      <div className="container relative">
        <div className="flex flex-col lg:flex-row items-start gap-16">

          {/* Left: Header */}
          <div className="lg:w-96 flex-shrink-0">
            <SectionHeader
              eyebrow="نظر مشتریان"
              title="آنچه درباره ما می‌گویند"
              description="بیش از ۱۵,۰۰۰ مشتری راضی بهترین گواه کیفیت گروه صنعتی مشعوف هستند."
              animate={false}
            />

            {/* Overall rating */}
            <div className="mt-8 p-6 rounded-2xl bg-surface border border-white/8">
              <div className="text-6xl font-black text-gold mb-2">۴.۹</div>
              <Rating value={4.9} size="lg" className="mb-2" />
              <p className="text-sm text-muted">میانگین امتیاز از ۲,۴۸۰ نظر</p>
            </div>

            {/* Nav buttons */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handlePrev}
                className={cn(
                  'w-12 h-12 rounded-xl border border-white/15 flex items-center justify-center',
                  'text-muted hover:text-white hover:border-gold/40 hover:bg-gold/10',
                  'transition-all duration-300',
                )}
                aria-label="قبلی"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                className={cn(
                  'w-12 h-12 rounded-xl border border-white/15 flex items-center justify-center',
                  'text-muted hover:text-white hover:border-gold/40 hover:bg-gold/10',
                  'transition-all duration-300',
                )}
                aria-label="بعدی"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2 mr-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > current ? 'next' : 'prev')
                      setCurrent(i)
                    }}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      i === current
                        ? 'w-6 h-2 bg-gold'
                        : 'w-2 h-2 bg-white/20 hover:bg-white/40',
                    )}
                    aria-label={`نظر ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Testimonial cards */}
          <div className="flex-1 relative overflow-hidden min-h-[320px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="p-8 lg:p-10 rounded-2xl bg-surface border border-white/8 relative">
                  {/* Quote icon */}
                  <div className="absolute top-8 left-8 opacity-10">
                    <Quote className="h-16 w-16 text-gold fill-gold" />
                  </div>

                  <Rating value={testimonials[current].rating} size="md" className="mb-6" />

                  <p className="text-lg text-white/90 leading-relaxed mb-8 relative z-10">
                    «{testimonials[current].content}»
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-xl font-bold text-gold">
                        {testimonials[current].name.charAt(testimonials[current].name.lastIndexOf(' ') + 1)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{testimonials[current].name}</div>
                        <div className="text-sm text-muted">{testimonials[current].role}</div>
                        <div className="text-sm text-gold">{testimonials[current].company}</div>
                      </div>
                    </div>

                    <div className="hidden sm:block text-left">
                      <div className="text-xs text-muted mb-1">پروژه</div>
                      <div className="text-sm font-medium text-white">{testimonials[current].project}</div>
                    </div>
                  </div>

                  {/* Gold bottom border */}
                  <div className="absolute bottom-0 right-0 left-0 h-0.5 rounded-b-2xl bg-gold-gradient" />
                </div>

                {/* Background card */}
                <div className="absolute inset-x-4 -bottom-4 -z-10 h-full rounded-2xl bg-surface border border-white/5 opacity-60" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
