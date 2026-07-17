import Link from 'next/link'
import {
  ArrowLeft,
  Award,
  Headphones,
  Instagram,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { CONTACT, SOCIAL_LINKS } from '@/lib/constants'
import type { ShopCategory } from '@/lib/shop/catalog.types'

const FALLBACK_PRODUCT_LINKS = [
  { label: 'همه محصولات', href: '/products' },
]

const footerLinks = {
  tools: [
    { label: 'محاسبه‌گر مصالح ساختمان', href: '/tools/materials-calculator' },
    { label: 'راهنمای محصولات', href: '/collections' },
    { label: 'درب ضد سرقت', href: '/collections/darb-zed-sereqat' },
    { label: 'چهارچوب فلزی فرانسوی', href: '/products/chaharcharb-felezi-faransavi' },
  ],
  company: [
    { label: 'درباره گروه مشعوف', href: '/about' },
    { label: 'افتخارات و گواهینامه‌ها', href: '/certificates' },
    { label: 'وبلاگ', href: '/blog' },
    { label: 'تماس با ما', href: '/contact' },
  ],
  support: [
    { label: 'ضمانت‌نامه', href: '/warranty' },
    { label: 'پیگیری سفارش', href: '/user/orders' },
    { label: 'سوالات متداول', href: '/faq' },
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

export function Footer({
  productCategories = [],
}: {
  productCategories?: ShopCategory[]
}) {
  const productLinks =
    productCategories.length > 0
      ? [
          ...productCategories.slice(0, 8).map((c) => ({
            label: c.name,
            href: `/products?category=${encodeURIComponent(c.slug)}`,
          })),
          { label: 'همه محصولات', href: '/products' },
        ]
      : FALLBACK_PRODUCT_LINKS

  return (
    /* ── Rounded-top card: sits inside a light or dark page bg ── */
    <footer className="relative overflow-hidden rounded-t-[2rem] border-t border-white/[0.06] bg-zinc-950 shadow-[0_-24px_80px_rgba(0,0,0,0.6)]">

      {/* ── Top highlight edge ── */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ════════════════════════════════════
          NEWSLETTER SECTION
      ════════════════════════════════════ */}
      <div className="relative border-b border-white/[0.06] overflow-hidden">
        {/* Background orb */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/6 blur-[80px]" />
        </div>
        <div className="container px-4 sm:px-6 py-16 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest mb-5">
              خبرنامه مشعوف
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
              اول از همه باخبر شو
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
              از جدیدترین محصولات، تخفیف‌های ویژه و مطالب آموزشی مشعوف در ایمیلت مطلع شو.
            </p>

            {/* Newsletter input */}
            <div className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="آدرس ایمیل شما..."
                  className="w-full h-12 rounded-full px-5 text-sm text-white placeholder:text-zinc-600 bg-white/[0.05] border border-white/[0.09] focus:border-primary/40 focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all duration-200 shadow-[inset_0_2px_6px_rgba(0,0,0,0.3)]"
                />
              </div>
              <button
                type="submit"
                className="flex-shrink-0 h-12 px-6 rounded-full bg-gradient-to-b from-[#D42B47] to-[#C41E3A] text-white text-sm font-bold transition-all duration-300 hover:from-[#E03050] hover:shadow-[0_8px_28px_rgba(196,30,58,0.5)] hover:scale-[1.03] active:scale-[0.97] shadow-[0_4px_18px_rgba(196,30,58,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]"
              >
                عضویت
              </button>
            </div>
            <p className="text-zinc-700 text-xs mt-4">بدون اسپم. هروقت خواستی لغو کن.</p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════ */}
      <div className="border-b border-white/[0.06]">
        <div className="container px-4 sm:px-6 py-12">
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 px-8 py-8 rounded-2xl overflow-hidden bg-gradient-to-br from-[#C41E3A] via-[#A51830] to-[#7A0020]">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-tl from-white/[0.04] to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div>
              <h3 className="text-2xl font-black text-white mb-1">مشاوره رایگان دارید؟</h3>
              <p className="text-white/65 text-sm">کارشناسان ما ۶ روز هفته آماده پاسخگویی هستند.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              <a
                href={`tel:${CONTACT.phone.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-white/90 hover:scale-[1.03] transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.25)] active:scale-[0.97]"
              >
                <Phone className="h-4 w-4" />
                {CONTACT.phone}
              </a>
              <Link
                href="/contact"
                className="flex items-center gap-2 bg-white/15 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-white/25 hover:scale-[1.02] transition-all duration-200 active:scale-[0.97]"
              >
                تماس با ما
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          MAIN GRID
      ════════════════════════════════════ */}
      <div className="container px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* ── Brand column (5/12) ── */}
          <div className="lg:col-span-5">
            <Link href="/" className="group inline-flex items-center gap-3 mb-7 w-fit">
              <Logo href={false} variant="icon-only" size="lg" />
              <div>
                <div className="text-lg font-black text-white group-hover:text-primary-400 transition-colors">
                  گروه صنعتی مشعوف
                </div>
                <div className="text-[10px] text-primary/70 tracking-[0.2em] font-semibold uppercase mt-0.5">
                  MASHOUF INDUSTRIAL GROUP
                </div>
              </div>
            </Link>

            <p className="text-zinc-500 text-sm leading-[1.9] mb-7 max-w-sm">
              پیشرو در ساخت درب‌های ضد سرقت لوکس با بیش از یک دهه تجربه. ترکیب
              بی‌نظیر طراحی مدرن، متریال‌های برتر و تکنولوژی پیشرفته.
            </p>

            {/* Contact */}
            <div className="space-y-3 mb-7">
              <a
                href={`tel:${CONTACT.phone.replace(/[^0-9]/g, '')}`}
                className="group/item flex items-center gap-3 text-sm text-zinc-500 hover:text-primary transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary/15 transition-colors">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                </div>
                {CONTACT.phone}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="group/item flex items-center gap-3 text-sm text-zinc-500 hover:text-primary transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary/15 transition-colors">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                </div>
                {CONTACT.email}
              </a>
              <div className="flex items-start gap-3 text-sm text-zinc-500">
                <div className="w-8 h-8 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
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
                    className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-zinc-500 transition-all duration-300 hover:text-primary hover:border-primary/30 hover:bg-primary/10 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(196,30,58,0.2)]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ),
              )}
            </div>
          </div>

          {/* ── Link columns (7/12 split 3 ways) ── */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Products */}
            <div>
              <h4 className="font-bold text-white mb-5 flex items-center gap-2 text-sm">
                <span className="w-1 h-4 bg-gradient-to-b from-[#D42B47] to-[#C41E3A] rounded-full shadow-[0_0_8px_rgba(196,30,58,0.4)]" />
                محصولات
              </h4>
              <ul className="space-y-3">
                {productLinks.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-primary transition-all duration-200 hover:translate-x-[-3px] inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Engineering tools */}
            <div>
              <h4 className="font-bold text-white mb-5 flex items-center gap-2 text-sm">
                <span className="w-1 h-4 bg-gradient-to-b from-[#D42B47] to-[#C41E3A] rounded-full shadow-[0_0_8px_rgba(196,30,58,0.4)]" />
                ابزارهای مهندسی
              </h4>
              <ul className="space-y-3">
                {footerLinks.tools.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-primary transition-all duration-200 hover:translate-x-[-3px] inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-white mb-5 flex items-center gap-2 text-sm">
                <span className="w-1 h-4 bg-gradient-to-b from-[#D42B47] to-[#C41E3A] rounded-full shadow-[0_0_8px_rgba(196,30,58,0.4)]" />
                شرکت
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-primary transition-all duration-200 hover:translate-x-[-3px] inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-white mb-5 flex items-center gap-2 text-sm">
                <span className="w-1 h-4 bg-gradient-to-b from-[#D42B47] to-[#C41E3A] rounded-full shadow-[0_0_8px_rgba(196,30,58,0.4)]" />
                پشتیبانی
              </h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-primary transition-all duration-200 hover:translate-x-[-3px] inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          TRUST BADGES
      ════════════════════════════════════ */}
      <div className="border-t border-white/[0.05]">
        <div className="container px-4 py-8 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { icon: ShieldCheck, label: 'پرداخت امن', caption: 'تراکنش محافظت‌شده' },
              { icon: Award, label: 'ضمانت اصالت', caption: 'تضمین کیفیت کالا' },
              { icon: Truck, label: 'ارسال سراسری', caption: 'به تمام نقاط کشور' },
              { icon: Headphones, label: 'پشتیبانی', caption: 'همراه شما پس از خرید' },
              { icon: RotateCcw, label: 'ضمانت بازگشت', caption: 'خرید با اطمینان' },
            ].map(({ icon: Icon, label, caption }) => (
              <div
                key={label}
                className="group flex min-h-20 items-center gap-3 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-primary/[0.06] sm:p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-200 sm:text-sm">{label}</div>
                  <div className="mt-1 hidden text-[10px] text-zinc-600 sm:block">{caption}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          BOTTOM BAR
      ════════════════════════════════════ */}
      <div className="border-t border-white/[0.05] bg-black/30">
        <div className="container px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-700">
            <p>© ۱۴۰۵ گروه صنعتی مشعوف — تمامی حقوق محفوظ است.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy"     className="hover:text-primary transition-colors">حریم خصوصی</Link>
              <Link href="/terms"       className="hover:text-primary transition-colors">قوانین استفاده</Link>
              <Link href="/sitemap.xml" className="hover:text-primary transition-colors">نقشه سایت</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
