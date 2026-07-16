import type { Metadata } from 'next'
import Link from 'next/link'
import { generateSeo } from '@/lib/seo'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = generateSeo({
  title: 'گواهینامه‌ها و افتخارات',
  description: `گواهینامه‌ها و استانداردهای کیفیت ${SITE_NAME} در تولید درب ضد سرقت و چهارچوب فلزی.`,
  path: '/certificates',
})

export default function CertificatesPage() {
  return (
    <div className="bg-black min-h-screen" dir="rtl">
      <div className="container px-4 sm:px-6 py-12 max-w-3xl space-y-6">
        <h1 className="text-2xl sm:text-4xl font-black text-white">گواهینامه‌ها و افتخارات</h1>
        <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
          {SITE_NAME} تولید خود را بر پایه استانداردهای ایمنی و کیفیت بنا کرده است؛ از جمله
          توجه به مقاومت در برابر نفوذ و استانداردهای مرتبط با درب‌های امنیتی و آتش‌نشانی.
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed">
          برای مشاهده جزئیات گواهینامه‌ها و نمونه‌پروژه‌ها می‌توانید از صفحه درباره ما و بخش
          گواهینامه‌های صفحه اصلی استفاده کنید یا با واحد فروش هماهنگ شوید.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/about" className="text-gold hover:underline">درباره مشعوف</Link>
          <Link href="/#certificates" className="text-gold hover:underline">گواهینامه‌ها در صفحه اصلی</Link>
        </div>
      </div>
    </div>
  )
}
