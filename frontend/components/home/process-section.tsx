'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, ClipboardList, Clock3, Search, Settings, Truck } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { toPersianNumber } from '@/lib/utils'

const steps = [
  {
    step: 1,
    title: 'انتخاب محصول',
    description:
      'از میان صدها مدل متنوع، درب مناسب برای فضای خود را انتخاب کنید. کارشناسان ما آماده مشاوره هستند.',
    icon: Search,
    duration: 'همین امروز',
  },
  {
    step: 2,
    title: 'ثبت سفارش',
    description:
      'سفارش را بصورت آنلاین یا از طریق تلفن ثبت کنید. پرداخت امن از طریق درگاه‌های معتبر.',
    icon: ClipboardList,
    duration: '۵ دقیقه',
  },
  {
    step: 3,
    title: 'تولید اختصاصی',
    description:
      'درب شما با دقت و مطابق مشخصات سفارش در کارخانه گروه مشعوف تولید می‌شود.',
    icon: Settings,
    duration: '۵ تا ۱۰ روز',
  },
  {
    step: 4,
    title: 'ارسال و نصب',
    description:
      'تیم متخصص نصب گروه صنعتی مشعوف در زمان تعیین شده به محل شما می‌آید و نصب را انجام می‌دهد.',
    icon: Truck,
    duration: '۱ روز',
  },
  {
    step: 5,
    title: 'تحویل و ضمانت',
    description:
      'پس از نصب، ضمانت‌نامه ۵ ساله دریافت کنید و از امنیت کامل خانه خود لذت ببرید.',
    icon: BadgeCheck,
    duration: 'ضمانت ۵ ساله',
  },
]

export function ProcessSection() {
  return (
    <section className="section-padding bg-charcoal relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gold/4 rounded-full blur-[100px]" />
      </div>

      <div className="container relative">
        <div className="mb-12 flex flex-col items-center sm:mb-16">
          <SectionHeader
            eyebrow="فرآیند خرید"
            title="خرید آسان در ۵ گام"
            description="از انتخاب تا نصب، ما در هر مرحله کنار شما هستیم."
            align="center"
            className="max-w-xl"
          />
        </div>

        <div className="relative rounded-3xl border border-white/8 bg-black/20 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.25)] sm:p-6 lg:p-8">
          {/* Connecting line */}
          <div className="absolute bottom-12 right-11 top-12 w-px bg-gradient-to-b from-transparent via-gold/35 to-transparent sm:hidden" />
          <div className="absolute left-[10%] right-[10%] top-[4.55rem] z-0 hidden h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent lg:block" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="group relative flex min-h-40 items-start gap-4 rounded-2xl border border-white/8 bg-surface/80 p-4 text-right transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:bg-surface sm:min-h-60 sm:flex-col sm:items-center sm:p-5 sm:text-center lg:border-transparent lg:bg-transparent lg:hover:bg-white/[0.025]"
                >
                {/* Step circle */}
                <div className="relative z-10 shrink-0 sm:mb-1">
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/20 to-gold/5 text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 group-hover:border-gold group-hover:shadow-gold sm:h-16 sm:w-16"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.8} />
                  </motion.div>

                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold text-black text-xs font-black flex items-center justify-center">
                    {toPersianNumber(step.step)}
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col sm:items-center">
                  <h3 className="mb-2 text-sm font-bold text-white sm:text-base">{step.title}</h3>
                  <p className="mb-3 text-xs leading-relaxed text-muted">{step.description}</p>

                  <div className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-2xs font-semibold text-gold">
                    <Clock3 className="h-3 w-3" />
                    {step.duration}
                  </div>
                </div>
              </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
