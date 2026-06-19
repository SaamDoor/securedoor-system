import Link from 'next/link'
import { Phone, Mail, MapPin, Instagram, Send } from 'lucide-react'
import { CONTACT, SOCIAL_LINKS } from '@/lib/constants'

const footerLinks = {
  products: [
    { label: 'درب ضد سرقت',       href: '/products?category=darb-zed-sereqat' },
    { label: 'درب ضد حریق',        href: '/products?category=darb-zed-hariq' },
    { label: 'درب آپارتمانی',      href: '/products?category=darb-apartmani' },
    { label: 'درب ویلایی',         href: '/products?category=darb-villaei' },
    { label: 'متعلقات و یراق‌آلات', href: '/products?category=moteallaqat' },
  ],
  company: [
    { label: 'درباره گروه مشعوف',     href: '/about' },
    { label: 'افتخارات و گواهینامه‌ها', href: '/certificates', prefetch: false },
    { label: 'نمایندگی‌ها',            href: '/branches',     prefetch: false },
    { label: 'وبلاگ',                 href: '/blog' },
    { label: 'تماس با ما',            href: '/contact' },
    { label: 'فرصت‌های شغلی',         href: '/careers',      prefetch: false },
  ],
  support: [
    { label: 'راهنمای خرید',    href: '/guide/buying',       prefetch: false },
    { label: 'راهنمای نصب',     href: '/guide/installation', prefetch: false },
    { label: 'ضمانت‌نامه',      href: '/warranty',           prefetch: false },
    { label: 'پیگیری سفارش',   href: '/user/orders' },
    { label: 'سوالات متداول',  href: '/faq',                prefetch: false },
    { label: 'قوانین و مقررات', href: '/terms' },
  ],
}

const socialLinks = [
  { href: SOCIAL_LINKS.instagram, icon: Instagram, label: 'اینستاگرام' },
  { href: SOCIAL_LINKS.telegram,  icon: Send,      label: 'تلگرام' },
  {
    href: SOCIAL_LINKS.eitaa,
    label: 'ایتا',
    icon: ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.23.23 0 0 0-.07-.2c-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.07-.78 4.19-1.82 6.98-3.02 8.38-3.61 3.99-1.66 4.82-1.95 5.36-1.96.12 0 .38.03.55.18.14.12.18.29.2.46l-.03.18z" />
      </svg>
    ),
  },
  {
    href: SOCIAL_LINKS.rubika,
    label: 'روبیکا',
    icon: ({ className }: { className?: string }) => (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
      </svg>
    ),
  },
]

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/8">

      {/* ── CTA Banner ── */}
      <div className="border-b border-white/8">
        <div className="container px-4 sm:px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-8 rounded-2xl bg-primary-gradient">
            <div>
              <h3 className="text-2xl font-black text-white mb-1">
                مشاوره رایگان دارید؟
              </h3>
              <p className="text-white/75">
                کارشناسان ما آماده پاسخگویی هستند.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`tel:${CONTACT.phone.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
              >
                <Phone className="h-5 w-5" />
                {CONTACT.phone}
              </a>
              <Link
                href="/contact"
                className="flex items-center gap-2 bg-white/15 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/25 transition-all duration-200 active:scale-95"
              >
                تماس با ما
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div className="container px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="w-12 h-12 bg-primary-gradient rounded-xl flex items-center justify-center shadow-primary-sm">
                <span className="text-white font-black text-xl">س</span>
              </div>
              <div>
                <div className="text-xl font-black text-white">
                  گروه صنعتی مشعوف
                </div>
                <div className="text-xs text-primary tracking-widest">
                  MASHOUF INDUSTRIAL GROUP
                </div>
              </div>
            </Link>

            <p className="text-muted text-sm leading-relaxed mb-6 max-w-xs">
              پیشرو در ساخت درب‌های ضد سرقت لوکس با بیش از یک دهه تجربه. ترکیب
              بی‌نظیر طراحی مدرن، متریال‌های برتر و تکنولوژی پیشرفته.
            </p>

            {/* Contact info */}
            <div className="space-y-3 mb-6">
              <a
                href={`tel:${CONTACT.phone.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                {CONTACT.phone}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                {CONTACT.email}
              </a>
              <div className="flex items-start gap-3 text-sm text-muted">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                {CONTACT.address}
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ href, icon: Icon, label }) =>
                href && (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-muted transition-all duration-300 hover:text-primary hover:border-primary/30 hover:bg-primary/10 hover:-translate-y-1"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full" />
              محصولات
            </h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-primary transition-all duration-200 hover:translate-x-[-4px] inline-block"
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
              <span className="w-1 h-4 bg-primary rounded-full" />
              شرکت
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={'prefetch' in link ? link.prefetch : undefined}
                    className="text-sm text-muted hover:text-primary transition-all duration-200 hover:translate-x-[-4px] inline-block"
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
              <span className="w-1 h-4 bg-primary rounded-full" />
              پشتیبانی
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={'prefetch' in link ? link.prefetch : undefined}
                    className="text-sm text-muted hover:text-primary transition-all duration-200 hover:translate-x-[-4px] inline-block"
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
        <div className="container px-4 sm:px-6 py-8">
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
        <div className="container px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
            <p>© 2026 گروه صنعتی مشعوف — تمامی حقوق محفوظ است.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy"    className="hover:text-primary transition-colors">حریم خصوصی</Link>
              <Link href="/terms"      className="hover:text-primary transition-colors">قوانین استفاده</Link>
              <Link href="/sitemap.xml" className="hover:text-primary transition-colors">نقشه سایت</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
