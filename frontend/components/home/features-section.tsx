'use client'

import { motion } from 'framer-motion'
import {
  Shield, Zap, Award, Headphones, Truck, RotateCcw,
  Lock, Layers, Thermometer, Volume2,
} from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Shield,
    title: 'امنیت نظامی',
    description: 'سیستم قفل چند نقطه‌ای با مقاومت در برابر تخریب بیش از ۲۰ دقیقه',
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: Layers,
    title: 'متریال درجه یک',
    description: 'فولاد گالوانیزه گرم ایتالیایی با ضخامت ۳ میلی‌متر، مقاوم در برابر خوردگی',
    color: 'from-gold/20 to-gold/5',
    iconColor: 'text-gold',
    borderColor: 'border-gold/20',
  },
  {
    icon: Thermometer,
    title: 'عایق حرارتی',
    description: 'عایق‌بندی پلی‌یورتان پیشرفته با R-value استثنایی برای صرفه‌جویی در انرژی',
    color: 'from-orange-500/20 to-orange-600/5',
    iconColor: 'text-orange-400',
    borderColor: 'border-orange-500/20',
  },
  {
    icon: Volume2,
    title: 'ضد صدا',
    description: 'کاهش ۴۵ دسیبل صدای محیط با سیستم آب‌بندی چهار لبه‌ای اختصاصی',
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: Award,
    title: 'گواهینامه بین‌المللی',
    description: 'دارای ۱۲ استاندارد معتبر اروپایی از جمله EN 1627 و Class 6',
    color: 'from-gold/20 to-yellow-600/5',
    iconColor: 'text-gold',
    borderColor: 'border-gold/20',
  },
  {
    icon: Lock,
    title: 'قفل هوشمند',
    description: 'سازگار با سیستم‌های هوشمند خانه، دسترسی بیومتریک و کنترل از راه دور',
    color: 'from-green-500/20 to-green-600/5',
    iconColor: 'text-green-400',
    borderColor: 'border-green-500/20',
  },
  {
    icon: Truck,
    title: 'نصب تخصصی',
    description: 'تیم نصب متخصص با بیمه کامل و گارانتی نصب در سراسر کشور',
    color: 'from-cyan-500/20 to-cyan-600/5',
    iconColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/20',
  },
  {
    icon: Headphones,
    title: 'پشتیبانی ۲۴/۷',
    description: 'تیم پشتیبانی فنی آماده پاسخگویی در تمام ساعات شبانه‌روز',
    color: 'from-pink-500/20 to-pink-600/5',
    iconColor: 'text-pink-400',
    borderColor: 'border-pink-500/20',
  },
]

export function FeaturesSection() {
  return (
    <section className="section-padding bg-charcoal relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gold/3 blur-[100px]" />
      </div>

      <div className="container relative">
        <div className="flex flex-col items-center mb-16">
          <SectionHeader
            eyebrow="چرا گروه مشعوف"
            title="استانداردهای جهانی در هر درب"
            description="هر محصول گروه صنعتی مشعوف نتیجه دهه‌ها تحقیق، بهترین متریال و دقیق‌ترین فرایند تولید است."
            align="center"
            className="max-w-2xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.07,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className={cn(
                  'group relative p-6 rounded-2xl overflow-hidden',
                  'bg-surface border transition-all duration-400',
                  feature.borderColor,
                  'hover:shadow-lg',
                )}
              >
                {/* Gradient bg */}
                <div
                  className={cn(
                    'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400',
                    `bg-gradient-to-br ${feature.color}`,
                  )}
                />

                <div className="relative z-10">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center mb-5',
                      'bg-white/5 border border-white/8',
                      'group-hover:scale-110 transition-transform duration-300',
                    )}
                  >
                    <Icon className={cn('h-6 w-6', feature.iconColor)} />
                  </div>

                  <h3 className="font-bold text-white mb-2 text-base">{feature.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
