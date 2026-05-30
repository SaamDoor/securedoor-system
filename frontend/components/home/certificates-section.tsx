'use client'

import { motion } from 'framer-motion'
import { SectionHeader } from '@/components/ui/section-header'

const certificates = [
  { name: 'EN 1627 Class 6', issuer: 'اتحادیه اروپا', year: '۲۰۲۳', emoji: '🇪🇺' },
  { name: 'ISO 9001:2015', issuer: 'سازمان جهانی استاندارد', year: '۲۰۲۳', emoji: '🌍' },
  { name: 'استاندارد ملی ۱۴۸۵', issuer: 'سازمان ملی استاندارد ایران', year: '۲۰۲۳', emoji: '🇮🇷' },
  { name: 'گواهینامه REI 90', issuer: 'مرکز تحقیقات آتش‌نشانی', year: '۲۰۲۲', emoji: '🔥' },
  { name: 'CE Marking', issuer: 'اتحادیه اروپا', year: '۲۰۲۳', emoji: '✅' },
  { name: 'جایزه صنعت برتر', issuer: 'اتحادیه صنفی کشور', year: '۱۴۰۲', emoji: '🏆' },
]

const trustedBrands = [
  'گروه سرمایه‌گذاری هشت بهشت',
  'شرکت ساختمانی راهبرد',
  'مجموعه هتل‌های ایران',
  'وزارت مسکن و شهرسازی',
  'شرکت ملی نفت ایران',
  'گروه بهمن',
]

export function CertificatesSection() {
  return (
    <section className="section-padding bg-black relative overflow-hidden">
      <div className="container">
        <div className="flex flex-col items-center mb-16">
          <SectionHeader
            eyebrow="گواهینامه‌ها"
            title="معتبرترین استانداردهای جهانی"
            description="محصولات سام درب دارای معتبرترین گواهینامه‌های ایمنی و کیفیت در سطح ملی و بین‌المللی هستند."
            align="center"
            className="max-w-2xl"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {certificates.map((cert, i) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-surface border border-white/8 text-center hover:border-gold/30 transition-all duration-300 hover:shadow-gold-sm"
            >
              <div className="text-3xl mb-3">{cert.emoji}</div>
              <div className="text-xs font-bold text-white mb-1">{cert.name}</div>
              <div className="text-2xs text-muted">{cert.issuer}</div>
              <div className="text-2xs text-gold mt-1">{cert.year}</div>
            </motion.div>
          ))}
        </div>

        {/* Trusted by */}
        <div className="border-t border-white/8 pt-12">
          <p className="text-center text-sm text-muted mb-8 tracking-wider">
            مورد اعتماد بیش از ۵۰۰ شرکت و سازمان معتبر
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {trustedBrands.map((brand, i) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-sm text-muted/60 font-medium hover:text-muted transition-colors"
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
