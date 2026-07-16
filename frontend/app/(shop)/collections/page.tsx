import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { generateSeo } from '@/lib/seo'
import { SEO_COLLECTIONS } from '@/lib/seo/collections'

export const metadata: Metadata = generateSeo({
  title: 'راهنمای محصولات و کلمات کلیدی',
  description:
    'راهنمای خرید درب ضد سرقت، درب ضدسرقت مازندران و شمال، فروش عمده، چهارچوب فلزی فرانسوی و مکزیکی، درب اتاقی، ملامینه، ABS و دستگیره از گروه صنعتی مشعوف.',
  keywords: [
    'درب ضد سرقت',
    'چهارچوب فلزی فرانسوی',
    'درب اتاقی',
    'دستگیره',
  ],
  path: '/collections',
})

export default function CollectionsIndexPage() {
  return (
    <div className="bg-black min-h-screen" dir="rtl">
      <div className="container px-4 sm:px-6 py-12 sm:py-16 max-w-5xl">
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-3">
          راهنمای خرید محصولات مشعوف
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-10 max-w-3xl">
          این صفحات برای راهنمایی خریداران بر اساس جستجوهای رایج طراحی شده‌اند؛
          از درب ضد سرقت در مازندران و شمال تا چهارچوب فلزی، درب اتاقی و دستگیره.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEO_COLLECTIONS.map((item) => (
            <Link
              key={item.slug}
              href={`/collections/${item.slug}`}
              className="group rounded-2xl border border-white/8 bg-zinc-950 p-5 hover:border-gold/30 transition-colors"
            >
              <h2 className="font-bold text-white mb-2 group-hover:text-gold transition-colors">
                {item.title}
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 mb-4">
                {item.description}
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-gold">
                مشاهده
                <ArrowLeft className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
