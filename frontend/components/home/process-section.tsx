'use client'

import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/section-header'
import { toPersianNumber } from '@/lib/utils'

const steps = [
  {
    step: 1,
    title: 'انتخاب محصول',
    description:
      'از میان صدها مدل متنوع، درب مناسب برای فضای خود را انتخاب کنید. کارشناسان ما آماده مشاوره هستند.',
    icon: '🔍',
    duration: 'همین امروز',
  },
  {
    step: 2,
    title: 'ثبت سفارش',
    description:
      'سفارش را بصورت آنلاین یا از طریق تلفن ثبت کنید. پرداخت امن از طریق درگاه‌های معتبر.',
    icon: '📋',
    duration: '۵ دقیقه',
  },
  {
    step: 3,
    title: 'تولید اختصاصی',
    description:
      'درب شما با دقت و مطابق مشخصات سفارش در کارخانه گروه مشعوف تولید می‌شود.',
    icon: '⚙️',
    duration: '۵ تا ۱۰ روز',
  },
  {
    step: 4,
    title: 'ارسال و نصب',
    description:
      'تیم متخصص نصب گروه صنعتی مشعوف در زمان تعیین شده به محل شما می‌آید و نصب را انجام می‌دهد.',
    icon: '🚚',
    duration: '۱ روز',
  },
  {
    step: 5,
    title: 'تحویل و ضمانت',
    description:
      'پس از نصب، ضمانت‌نامه ۱۰ ساله دریافت کنید و از امنیت کامل خانه خود لذت ببرید.',
    icon: '🎉',
    duration: 'ضمانت ۱۰ ساله',
  },
]

export function ProcessSection() {
  return (
    <section className="section-padding bg-charcoal relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gold/4 rounded-full blur-[100px]" />
      </div>

      <div className="container relative">
        <div className="flex flex-col items-center mb-16">
          <SectionHeader
            eyebrow="فرآیند خرید"
            title="خرید آسان در ۵ گام"
            description="از انتخاب تا نصب، ما در هر مرحله کنار شما هستیم."
            align="center"
            className="max-w-xl"
          />
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-16 right-16 left-16 h-0.5 z-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(200,168,93,0.3) 20%, rgba(200,168,93,0.3) 80%, transparent)',
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.12,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step circle */}
                <div className="relative z-10 mb-5">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-surface border-2 border-gold/30 flex items-center justify-center text-2xl mb-1 group-hover:border-gold group-hover:shadow-gold transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    {step.icon}
                  </motion.div>

                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold text-black text-xs font-black flex items-center justify-center">
                    {toPersianNumber(step.step)}
                  </div>
                </div>

                <h3 className="font-bold text-white mb-2 text-sm">{step.title}</h3>
                <p className="text-xs text-muted leading-relaxed mb-3">{step.description}</p>

                <div className="text-2xs text-gold font-semibold px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
                  {step.duration}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
