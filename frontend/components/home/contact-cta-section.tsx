'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Phone, ArrowLeft, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CONTACT, WHATSAPP_BUSINESS } from '@/lib/constants'

const GOOGLE_MAPS_EMBED_URL =
  'https://www.google.com/maps?q=%D8%AA%D9%88%D9%84%DB%8C%D8%AF%DB%8C%20%DA%AF%D8%B1%D9%88%D9%87%20%D8%B5%D9%86%D8%B9%D8%AA%DB%8C%20%D9%85%D8%B4%D8%B9%D9%88%D9%81&output=embed'

const NAVIGATION_LINKS = [
  {
    label: 'مسیریابی با نشان',
    href: 'https://nshn.ir/537b1NmyGFj-5d',
  },
  {
    label: 'مسیریابی با گوگل مپ',
    href: 'https://maps.app.goo.gl/BmLQhuE3MYbmVve98',
  },
] as const

export function ContactCtaSection() {
  return (
    <section className="section-padding bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/8 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gold/5 blur-[150px]" />

        {/* Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              rgba(200,168,93,0.8) 0px,
              rgba(200,168,93,0.8) 1px,
              transparent 1px,
              transparent 40px
            )`,
          }}
        />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-gold" />
            <span className="text-gold text-sm font-semibold tracking-widest">
              تماس با ما
            </span>
            <div className="h-px w-12 bg-gold" />
          </div>

          <h2 className="section-title mb-6">آماده کمک به شما هستیم</h2>

          <p className="section-subtitle mb-12 max-w-2xl mx-auto">
            از انتخاب محصول تا نصب و پشتیبانی، تیم متخصص گروه صنعتی مشعوف در
            تمام مراحل همراه شماست. با ما تماس بگیرید.
          </p>

          {/* CTA cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {[
              {
                icon: '📞',
                title: 'تماس تلفنی',
                value: CONTACT.phone,
                href: `tel:${CONTACT.phone.replace(/[^0-9]/g, '')}`,
                desc: 'شنبه تا پنجشنبه',
                color: 'border-gold/30 hover:border-gold',
              },
              {
                icon: '💬',
                title: 'واتساپ',
                value: 'ارسال پیام',
                href: `https://wa.me/${WHATSAPP_BUSINESS.phone}?text=${encodeURIComponent(WHATSAPP_BUSINESS.defaultMessage)}`,
                desc: '۲۴ ساعته',
                color: 'border-green-500/30 hover:border-green-500',
              },
              {
                icon: '✉️',
                title: 'ایمیل',
                value: CONTACT.email,
                href: `mailto:${CONTACT.email}`,
                desc: 'پاسخ در ۲۴ ساعت',
                color: 'border-blue-500/30 hover:border-blue-500',
              },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className={`group p-6 rounded-2xl bg-surface border transition-all duration-300 ${item.color} hover:shadow-lg block`}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="font-bold text-white mb-1">{item.title}</div>
                <div className="text-gold font-semibold text-sm mb-1">
                  {item.value}
                </div>
                <div className="text-xs text-muted">{item.desc}</div>
              </a>
            ))}
          </div>

          {/* Main CTA */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Button
              asChild
              variant="gold"
              size="xl"
              rightIcon={<ArrowLeft className="h-5 w-5" />}
            >
              <Link href="/contact">درخواست مشاوره رایگان</Link>
            </Button>
            <Button asChild variant="dark" size="xl">
              <Link href="/products">مشاهده محصولات</Link>
            </Button>
          </div>
        </motion.div>

        {/* ── Address widget ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-white/8 bg-surface p-4">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900 lg:aspect-auto lg:h-full lg:min-h-[360px]">
                <iframe
                  src={GOOGLE_MAPS_EMBED_URL}
                  className="w-full h-full object-cover rounded-2xl border border-white/10"
                  loading="lazy"
                  title="نقشه تولیدی گروه صنعتی مشعوف"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{
                    filter:
                      'brightness(0.8) invert(1) contrast(0.9) saturate(0.5)',
                  }}
                />
              </div>

              <div className="flex flex-col justify-between gap-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-3">
                    <MapPin className="h-4 w-4 text-gold flex-shrink-0" />
                    <div>
                      <div className="text-white/50 text-xs mb-0.5">آدرس</div>
                      <div className="text-white text-sm leading-snug">
                        {CONTACT.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-3">
                    <Phone className="h-4 w-4 text-gold flex-shrink-0" />
                    <div>
                      <div className="text-white/50 text-xs mb-0.5">تلفن</div>
                      <a
                        href={`tel:${CONTACT.phone}`}
                        className="text-white text-sm font-bold hover:text-gold transition-colors"
                        dir="ltr"
                      >
                        {CONTACT.phoneFa}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-3">
                    <Clock className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white/50 text-xs mb-0.5">
                        ساعات کاری
                      </div>
                      <div className="text-white text-sm">
                        {CONTACT.workingHours}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  {NAVIGATION_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-bold text-gold transition-colors hover:border-gold hover:bg-gold/15 hover:text-gold-light"
                    >
                      <MapPin className="h-4 w-4" />
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
