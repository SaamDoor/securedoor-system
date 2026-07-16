import type { Metadata } from 'next'
import Link from 'next/link'
import { generateSeo } from '@/lib/seo'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = generateSeo({
  title: 'ضمانت‌نامه محصولات',
  description: `شرایط ضمانت درب ضد سرقت، چهارچوب فلزی و درب اتاقی ${SITE_NAME}.`,
  path: '/warranty',
})

export default function WarrantyPage() {
  return (
    <div className="bg-black min-h-screen" dir="rtl">
      <div className="container px-4 sm:px-6 py-12 max-w-3xl space-y-6">
        <h1 className="text-2xl sm:text-4xl font-black text-white">ضمانت‌نامه</h1>
        <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
          محصولات {SITE_NAME} با ضمانت رسمی کارخانه عرضه می‌شوند. پوشش ضمانت شامل عیوب ساخت،
          عملکرد قفل و یراق‌های استاندارد نصب‌شده در کارخانه است.
        </p>
        <ul className="space-y-3 text-sm text-zinc-400 list-disc pr-5">
          <li>ضمانت شامل آسیب ناشی از نصب غیراستاندارد یا ضربه فیزیکی نمی‌شود.</li>
          <li>برای فعال‌سازی خدمات پس از فروش، فاکتور خرید را نگه دارید.</li>
          <li>در مازندران و شمال، هماهنگی سرویس از طریق واحد پشتیبانی انجام می‌شود.</li>
        </ul>
        <Link href="/contact" className="inline-block text-gold text-sm hover:underline">
          تماس برای پیگیری ضمانت
        </Link>
      </div>
    </div>
  )
}
