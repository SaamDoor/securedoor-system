'use client'

import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/section-header'

const certificates = [
  { name: 'گواهینامه ۲۴۰ دقیقه‌ای', issuer: 'مرکز تحقیقات آتش‌نشانی', year: '۱۴۰۳', emoji: '🔥' },
  { name: 'ISO 9001:2015', issuer: 'سازمان جهانی استاندارد', year: '۲۰۲۳', emoji: '🌍' },
  { name: 'استاندارد ملی ۱۴۸۵', issuer: 'سازمان ملی استاندارد ایران', year: '۲۰۲۳', emoji: '🇮🇷' },
  { name: 'تأییدیه مقاومت حریق', issuer: 'سازمان آتش‌نشانی', year: '۱۴۰۳', emoji: '🚒' },
  { name: 'CE Marking', issuer: 'اتحادیه اروپا', year: '۲۰۲۳', emoji: '✅' },
  { name: 'جایزه صنعت برتر', issuer: 'اتحادیه صنفی کشور', year: '۱۴۰۲', emoji: '🏆' },
]

export function CertificatesSection() {
  return (
    <section className="section-padding bg-black relative overflow-hidden">
      <div className="container">
        <div className="mb-12 flex flex-col items-center sm:mb-16">
          <SectionHeader
            eyebrow="گواهینامه‌ها"
            title="گواهینامه ۲۴۰ دقیقه‌ای آتش‌نشانی"
            description="محصولات گروه صنعتی مشعوف با تمرکز بر ایمنی، دارای گواهینامه مقاومت در برابر حریق تا ۲۴۰ دقیقه از مراجع آتش‌نشانی هستند."
            align="center"
            className="max-w-2xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {certificates.map((cert, i) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-white/8 bg-surface p-4 text-center transition-all duration-300 hover:border-gold/30 hover:shadow-gold-sm sm:p-5"
            >
              <div className="text-3xl mb-3">{cert.emoji}</div>
              <div className="mb-1 line-clamp-2 min-h-10 text-xs font-bold text-white">{cert.name}</div>
              <div className="text-2xs text-muted">{cert.issuer}</div>
              <div className="text-2xs text-gold mt-1">{cert.year}</div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
