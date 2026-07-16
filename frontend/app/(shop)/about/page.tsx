import type { Metadata } from 'next'
import { Shield, Award, Users, Wrench, Building2, Phone } from 'lucide-react'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'
import { generateSeo } from '@/lib/seo'

export const metadata: Metadata = generateSeo({
  title: 'درباره ما — کارخانه درب ضد سرقت مازندران',
  description:
    'گروه صنعتی مشعوف، تولیدکننده درب ضد سرقت، چهارچوب فلزی فرانسوی و مکزیکی و درب اتاقی در قائم‌شهر، مازندران.',
  keywords: ['درب ضد سرقت مازندران', 'کارخانه درب مشعوف', 'درب ضدسرقت شمال'],
  path: '/about',
})

const stats = [
  { value: 'یک دهه+', label: 'تجربه تخصصی' },
  { value: '+۵۰۰۰', label: 'پروژه اجراشده' },
  { value: '+۱۰۰', label: 'نمایندگی فعال' },
  { value: '۱۰', label: 'سال ضمانت' },
]

const values = [
  { icon: Shield, title: 'کیفیت بی‌타협', body: 'استفاده از بهترین مواد اولیه و فرآیندهای تولید استاندارد بین‌المللی' },
  { icon: Award, title: 'استاندارد EN 1627', body: 'محصولات ما مطابق با استاندارد اروپایی Class 6 — بالاترین سطح مقاومت' },
  { icon: Users, title: 'تیم متخصص', body: 'مهندسان و کارشناسان با بیش از یک دهه تجربه در صنعت درب‌سازی' },
  { icon: Wrench, title: 'نصب تخصصی', body: 'تیم نصب حرفه‌ای در سراسر کشور — از خرید تا بهره‌برداری کامل' },
]

export default function AboutPage() {
  return (
    <main dir="rtl" className="bg-black min-h-screen">

      {/* ── Hero ── */}
      <section className="relative py-24 border-b border-white/8 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-1/3 w-[500px] h-[500px] rounded-full bg-gold/6 blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-gold/4 blur-[100px]" />
        </div>
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-gold" />
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">About Us</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-5 leading-tight">
            گروه صنعتی{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg,#C8A85D 0%,#E7D3A5 50%,#C8A85D 100%)' }}
            >
              مشعوف
            </span>
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-2xl mx-auto">
            با بیش از یک دهه تجربه در تولید درب‌های ضد سرقت و محصولات ساختمانی لوکس،
            گروه صنعتی مشعوف به اعتماد هزاران خانواده و پروژه صنعتی در سراسر ایران افتخار می‌کند.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-white/8">
        <div className="container py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center p-6 rounded-2xl bg-surface border border-white/8">
                <div
                  className="text-4xl font-black mb-2 text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg,#C8A85D,#E7D3A5)' }}
                >
                  {s.value}
                </div>
                <div className="text-muted text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="container py-20 max-w-3xl">
        <h2 className="text-2xl font-black text-white mb-6">داستان ما</h2>
        <div className="space-y-4 text-muted leading-loose text-sm">
          <p>
            گروه صنعتی مشعوف از سال ۱۳۹۰ فعالیت خود را آغاز کرد و از سال ۱۳۹۵ به‌صورت تخصصی در زمینه تولید درب‌های ضد سرقت و چهارچوب‌های فلزی فعالیت می‌کند.
            آنچه با یک کارگاه کوچک در مازندران آغاز شد، امروز به یکی از معتبرترین برندهای تولیدکننده درب ضد سرقت در کشور تبدیل شده است.
          </p>
          <p>
            ما باور داریم که امنیت یک حق اساسی است، نه یک لوکس. به همین دلیل تلاش می‌کنیم محصولاتی ارائه دهیم که
            هم از بالاترین استانداردهای مقاومت برخوردار باشند و هم با طراحی زیبا با محیط زندگی شما هماهنگ باشند.
          </p>
          <p>
            تمامی محصولات ما در کارخانه مجهز مازندران با استفاده از ورق فولادی ۲ میلیمتری، جوشکاری صنعتی دقیق
            و رنگ کوره‌ای الکترواستاتیک تولید می‌شوند. فرآیند کیفیت‌سنجی ما شامل بیش از ۲۰ مرحله بازرسی است.
          </p>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="border-t border-white/8">
        <div className="container py-20">
          <h2 className="text-2xl font-black text-white mb-10 text-center">ارزش‌های ما</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, body }) => (
              <div key={title} className="p-6 rounded-2xl bg-surface border border-white/8 hover:border-gold/25 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="text-white font-bold text-sm mb-2">{title}</h3>
                <p className="text-muted text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-white/8">
        <div className="container py-20 text-center">
          <Building2 className="h-10 w-10 text-gold mx-auto mb-5" />
          <h2 className="text-2xl font-black text-white mb-3">آماده همکاری با شما هستیم</h2>
          <p className="text-muted mb-8 max-w-md mx-auto">
            برای دریافت مشاوره رایگان، استعلام قیمت یا بازدید از نمونه‌کارها با ما تماس بگیرید.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gold-gradient text-black hover:opacity-90 transition-opacity"
            >
              <Phone className="h-4 w-4" />
              تماس با ما
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border border-gold/40 text-gold hover:bg-gold/5 transition-colors"
            >
              مشاهده محصولات
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
