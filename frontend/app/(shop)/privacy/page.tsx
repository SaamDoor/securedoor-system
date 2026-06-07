import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `حریم خصوصی — ${SITE_NAME}`,
  description: 'سیاست حریم خصوصی گروه صنعتی مشعوف',
}

const sections = [
  {
    title: '۱. اطلاعاتی که جمع‌آوری می‌کنیم',
    body: 'هنگام ثبت‌نام، اطلاعات پایه مانند نام، شماره موبایل و آدرس ایمیل (اختیاری) از شما دریافت می‌شود. همچنین اطلاعات سفارش، آدرس تحویل و سابقه خرید شما ذخیره می‌شود. در صورت تماس با پشتیبانی، محتوای مکالمه ثبت خواهد شد.',
  },
  {
    title: '۲. نحوه استفاده از اطلاعات',
    body: 'اطلاعات شما برای پردازش سفارش، ارسال اطلاعیه‌های سفارش، بهبود خدمات و ارتباطات پشتیبانی استفاده می‌شود. ممکن است با رضایت شما، اطلاعیه‌های تبلیغاتی یا معرفی محصولات جدید برایتان ارسال کنیم.',
  },
  {
    title: '۳. حفاظت از اطلاعات',
    body: 'تمامی داده‌ها روی سرورهای امن با رمزگذاری SSL/TLS ذخیره می‌شوند. دسترسی به اطلاعات کاربران تنها برای کارکنان مجاز امکان‌پذیر است. ما هرگز اطلاعات شما را به اشخاص ثالث بدون رضایت شما نمی‌فروشیم یا واگذار نمی‌کنیم.',
  },
  {
    title: '۴. اشتراک‌گذاری اطلاعات',
    body: 'اطلاعات شما فقط در موارد زیر در اختیار اشخاص ثالث قرار می‌گیرد: الزامات قانونی یا حکم قضایی؛ شرکای حمل‌ونقل جهت تحویل سفارش (نام و آدرس تحویل)؛ درگاه‌های پرداخت جهت پردازش تراکنش (بدون دسترسی به اطلاعات کامل شما).',
  },
  {
    title: '۵. کوکی‌ها',
    body: 'وب‌سایت ما از کوکی‌های ضروری برای مدیریت نشست و ورود کاربر استفاده می‌کند. کوکی‌های تحلیلی برای بهبود تجربه کاربری ممکن است استفاده شوند. می‌توانید کوکی‌ها را در مرورگر خود مدیریت کنید، اما غیرفعال‌کردن آن‌ها ممکن است برخی امکانات را محدود کند.',
  },
  {
    title: '۶. حقوق شما',
    body: 'شما حق دارید هر زمان به اطلاعات شخصی خود دسترسی داشته باشید، آن‌ها را ویرایش کنید یا حساب کاربری خود را حذف کنید. برای اعمال این حقوق با پشتیبانی ما تماس بگیرید.',
  },
  {
    title: '۷. به‌روزرسانی سیاست حریم خصوصی',
    body: 'این سیاست ممکن است دوره‌ای به‌روز شود. تغییرات مهم از طریق اطلاعیه در وب‌سایت اعلام خواهند شد. آخرین ویرایش: خرداد ۱۴۰۵.',
  },
]

export default function PrivacyPage() {
  return (
    <main dir="rtl" className="bg-black min-h-screen">
      {/* Hero */}
      <div className="relative py-20 border-b border-white/8 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-gold/5 blur-[120px]" />
        </div>
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">Privacy</span>
            <div className="h-px w-8 bg-gold" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">حریم خصوصی</h1>
          <p className="text-muted max-w-lg mx-auto">
            نحوه جمع‌آوری، استفاده و حفاظت از اطلاعات شخصی شما توسط گروه صنعتی مشعوف.
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
          <p className="text-white font-semibold mb-2">سؤال درباره حریم خصوصی؟</p>
          با ما از طریق تماس تلفنی در ارتباط باشید:
          <br />
          <a href="tel:09003286539" className="text-gold hover:text-gold-light transition-colors" dir="ltr">
            0900 328 6539
          </a>
        </div>
      </div>
    </main>
  )
}
