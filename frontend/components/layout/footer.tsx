import Link from 'next/link'
import { Phone, Mail, MapPin, Instagram, Send, Youtube, Linkedin } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { CONTACT, SITE_NAME, SOCIAL_LINKS } from '@/lib/constants'

const footerLinks = {
  products: [
    { label: 'درب ضد سرقت', href: '/products?category=darb-zed-sereqat' },
    { label: 'درب ضد حریق', href: '/products?category=darb-zed-hariq' },
    { label: 'درب آپارتمانی', href: '/products?category=darb-apartmani' },
    { label: 'درب ویلایی', href: '/products?category=darb-villaei' },
    { label: 'متعلقات و یراق‌آلات', href: '/products?category=moteallaqat' },
  ],
  company: [
    { label: 'درباره سام درب', href: '/about' },
    { label: 'افتخارات و گواهینامه‌ها', href: '/certificates' },
    { label: 'نمایندگی‌ها', href: '/branches' },
    { label: 'وبلاگ', href: '/blog' },
    { label: 'تماس با ما', href: '/contact' },
    { label: 'فرصت‌های شغلی', href: '/careers' },
  ],
  support: [
    { label: 'راهنمای خرید', href: '/guide/buying' },
    { label: 'راهنمای نصب', href: '/guide/installation' },
    { label: 'ضمانت‌نامه', href: '/warranty' },
    { label: 'پیگیری سفارش', href: '/track-order' },
    { label: 'سوالات متداول', href: '/faq' },
    { label: 'قوانین و مقررات', href: '/terms' },
  ],
}

const socialLinks = [
  { href: SOCIAL_LINKS.instagram, icon: Instagram, label: 'اینستاگرام' },
  { href: SOCIAL_LINKS.telegram, icon: Send, label: 'تلگرام' },
  { href: SOCIAL_LINKS.youtube, icon: Youtube, label: 'یوتیوب' },
  { href: SOCIAL_LINKS.linkedin, icon: Linkedin, label: 'لینکدین' },
]

export function Footer() {
  return (
    <footer className="bg-charcoal border-t border-white/8">
      {/* ── CTA Banner ── */}
      <div className="border-b border-white/8">
        <div className="container py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-8 rounded-2xl bg-gold-gradient">
            <div>
              <h3 className="text-2xl font-black text-black mb-1">
                مشاوره رایگان دارید؟
              </h3>
              <p className="text-black/70">
                کارشناسان ما آماده پاسخگویی هستند.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={`tel:${CONTACT.phone.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-2 bg-black text-gold px-6 py-3 rounded-xl font-bold hover:bg-black/80 transition-colors"
              >
                <Phone className="h-5 w-5" />
                {CONTACT.phone}
              </a>
              <Link
                href="/contact"
                className="flex items-center gap-2 bg-white/20 text-black px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors"
              >
                تماس با ما
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main footer ── */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="w-12 h-12 bg-gold-gradient rounded-xl flex items-center justify-center shadow-gold-sm">
                <span className="text-black font-black text-xl">س</span>
              </div>
              <div>
                <div className="text-xl font-black text-white">سام درب</div>
                <div className="text-xs text-gold tracking-widest">SAM DOOR CO.</div>
              </div>
            </Link>

            <p className="text-muted text-sm leading-relaxed mb-6 max-w-xs">
              پیشرو در ساخت درب‌های ضد سرقت لوکس با بیش از ۲۰ سال تجربه.
              ترکیب بی‌نظیر طراحی مدرن، متریال‌های برتر و تکنولوژی پیشرفته.
            </p>

            {/* Contact info */}
            <div className="space-y-3 mb-6">
              <a
                href={`tel:${CONTACT.phone.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-3 text-sm text-muted hover:text-gold transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-gold" />
                </div>
                {CONTACT.phone}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-3 text-sm text-muted hover:text-gold transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-gold" />
                </div>
                {CONTACT.email}
              </a>
              <div className="flex items-start gap-3 text-sm text-muted">
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-gold" />
                </div>
                {CONTACT.address}
              </div>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ href, icon: Icon, label }) => href && (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 hover:bg-gold/10 transition-all duration-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gold rounded-full" />
              محصولات
            </h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-gold transition-colors hover:translate-x-[-4px] inline-block duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gold rounded-full" />
              شرکت
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-gold transition-colors hover:translate-x-[-4px] inline-block duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gold rounded-full" />
              پشتیبانی
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-gold transition-colors hover:translate-x-[-4px] inline-block duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div className="border-t border-white/8">
        <div className="container py-8">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: '🔒', label: 'پرداخت امن' },
              { icon: '🏆', label: 'ضمانت اصالت کالا' },
              { icon: '🚚', label: 'ارسال سراسری' },
              { icon: '📞', label: 'پشتیبانی ۲۴/۷' },
              { icon: '↩️', label: 'ضمانت بازگشت کالا' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted">
                <span className="text-base">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/5 bg-black/40">
        <div className="container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
            <p>
              © {new Date().getFullYear()} {SITE_NAME} — تمامی حقوق محفوظ است.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-gold transition-colors">
                حریم خصوصی
              </Link>
              <Link href="/terms" className="hover:text-gold transition-colors">
                قوانین استفاده
              </Link>
              <Link href="/sitemap.xml" className="hover:text-gold transition-colors">
                نقشه سایت
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
