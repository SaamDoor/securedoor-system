import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `قوانین و مقررات — ${SITE_NAME}`,
  description: 'قوانین و مقررات استفاده از خدمات گروه صنعتی مشعوف',
}

const sections = [
  {
    title: '۱. پذیرش قوانین',
    body: 'استفاده از وب‌سایت و خدمات گروه صنعتی مشعوف به منزله پذیرش کلیه قوانین و مقررات مندرج در این صفحه است. در صورت عدم موافقت با هر یک از بندهای زیر، لطفاً از استفاده از خدمات ما خودداری کنید.',
  },
  {
    title: '۲. خدمات',
    body: 'گروه صنعتی مشعوف فروشنده مستقیم درب‌های ضد سرقت، چهارچوب‌های فلزی و محصولات ساختمانی لوکس است. تمامی محصولات مطابق با استانداردهای ملی و بین‌المللی تولید و ارائه می‌شوند. گروه مشعوف حق توقف، تغییر یا به‌روزرسانی خدمات را در هر زمان برای خود محفوظ می‌دارد.',
  },
  {
    title: '۳. سفارش و پرداخت',
    body: 'قیمت‌های نمایش‌داده‌شده به تومان بوده و ممکن است بدون اطلاع قبلی تغییر کنند. سفارش نهایی پس از تأیید کتبی یا تلفنی از سوی کارشناسان مشعوف رسمیت می‌یابد. پرداخت از طریق درگاه امن اینترنتی یا کارت‌به‌کارت انجام می‌شود.',
  },
  {
    title: '۴. تحویل و نصب',
    body: 'زمان تحویل بسته به موجودی انبار و موقعیت جغرافیایی متفاوت است و در هنگام ثبت سفارش به اطلاع خریدار خواهد رسید. نصب توسط تیم متخصص مشعوف یا نصابان مجاز انجام می‌شود. هزینه حمل‌ونقل بر اساس مسافت محاسبه می‌گردد.',
  },
  {
    title: '۵. ضمانت و گارانتی',
    body: 'تمام محصولات گروه صنعتی مشعوف دارای ضمانت‌نامه ۵ ساله هستند. ضمانت شامل عیوب تولیدی و مواد اولیه می‌باشد و رویدادهایی مانند آسیب‌های فیزیکی عمدی، نصب غیرمجاز و استفاده نادرست را در بر نمی‌گیرد.',
  },
  {
    title: '۶. مرجوعی',
    body: 'در صورت وجود عیب تولیدی، خریدار می‌تواند تا ۷ روز پس از تحویل درخواست بررسی و مرجوعی ثبت کند. کالای مرجوعی باید در شرایط اولیه و بدون آسیب باشد. هزینه مرجوعی در موارد غیر از عیب تولیدی بر عهده خریدار است.',
  },
  {
    title: '۷. حریم خصوصی',
    body: 'اطلاعات شخصی شما نزد ما محفوظ است و هرگز بدون رضایت شما در اختیار اشخاص ثالث قرار نخواهد گرفت. برای اطلاعات بیشتر به صفحه حریم خصوصی مراجعه کنید.',
  },
  {
    title: '۸. تغییرات قوانین',
    body: 'گروه صنعتی مشعوف حق تغییر این قوانین را در هر زمان دارد. تغییرات از زمان انتشار در این صفحه لازم‌الاجرا خواهند بود. ادامه استفاده از خدمات به منزله پذیرش قوانین جدید است.',
  },
]

export default function TermsPage() {
  return (
    <main dir="rtl" className="bg-black min-h-screen">
      {/* Hero */}
      <div className="relative py-20 border-b border-white/8 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-gold/5 blur-[120px]" />
        </div>
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">Legal</span>
            <div className="h-px w-8 bg-gold" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">قوانین و مقررات</h1>
          <p className="text-muted max-w-lg mx-auto">
            لطفاً پیش از استفاده از خدمات گروه صنعتی مشعوف، این قوانین را با دقت مطالعه کنید.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-16 max-w-3xl">
        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-black text-white mb-3">{s.title}</h2>
              <p className="text-muted leading-loose text-sm">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-14 p-6 rounded-2xl bg-surface border border-white/8 text-sm text-muted leading-relaxed">
          <p className="text-white font-semibold mb-2">اطلاعات تماس</p>
          برای هرگونه سؤال درباره قوانین با ما تماس بگیرید:
          <br />
          تلفن:{' '}
          <a href="tel:09003286539" className="text-gold hover:text-gold-light transition-colors" dir="ltr">
            0900 328 6539
          </a>
        </div>
      </div>
    </main>
  )
}
