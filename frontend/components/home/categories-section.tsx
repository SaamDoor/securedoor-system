'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { cn } from '@/lib/utils'

type CategoryImage =
  | { default: string; desktop?: never; mobile?: never }
  | { desktop: string; mobile: string; default?: never }

const categories = [
  {
    name: 'درب ضد سرقت',
    slug: 'darb-zed-sereqat',
    count: '۴۸ محصول',
    description: 'بالاترین سطح امنیت با قفل‌های چند نقطه‌ای',
    accent: '#C8A85D',
    size: 'large',
    image: {
      default: '/images/categories/category-anti-theft-doors.webp',
    } as CategoryImage,
  },
  {
    name: 'درب ضد حریق',
    slug: 'darb-zed-hariq',
    count: '۲۴ محصول',
    description: 'مقاوم در برابر آتش تا ۱۲۰ دقیقه',
    accent: '#E74C3C',
    size: 'small',
    image: {
      desktop: '/images/categories/category-fireproof-doors-desktop.webp',
      mobile: '/images/categories/category-fireproof-doors-mobile.webp',
    } as CategoryImage,
  },
  {
    name: 'درب آپارتمانی',
    slug: 'darb-apartmani',
    count: '۳۶ محصول',
    description: 'طراحی مدرن برای فضاهای آپارتمانی',
    accent: '#C8A85D',
    size: 'small',
    image: {
      default: '/images/categories/category-apartment-doors.webp',
    } as CategoryImage,
  },
  {
    name: 'درب ویلایی',
    slug: 'darb-villaei',
    count: '۱۸ محصول',
    description: 'لوکس‌ترین درب‌ها برای ویلا و خانه‌های مستقل',
    accent: '#27AE60',
    size: 'large',
    image: {
      desktop: '/images/categories/category-villa-doors-desktop.webp',
      mobile: '/images/categories/category-villa-doors-mobile.webp',
    } as CategoryImage,
  },
]

export function CategoriesSection() {
  return (
    <section className="section-padding bg-black relative overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between mb-12">
          <SectionHeader
            eyebrow="دسته‌بندی‌ها"
            title="هر فضا، یک راه‌حل"
            description="محصولات گروه صنعتی مشعوف برای هر نوع ساختمان و کاربری طراحی شده‌اند."
          />
          <Link
            href="/categories"
            className="hidden lg:flex items-center gap-2 text-gold hover:text-gold-light text-sm font-medium transition-colors"
          >
            همه دسته‌بندی‌ها
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Large card — left (col-span-5) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:col-span-5"
          >
            <CategoryCard category={categories[0]} large />
          </motion.div>

          {/* Two small cards — middle (col-span-4) */}
          <div className="lg:col-span-4 grid gap-4">
            {[categories[1], categories[2]].map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1 + 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <CategoryCard category={cat} />
              </motion.div>
            ))}
          </div>

          {/* Large card — right (col-span-3) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="lg:col-span-3"
          >
            <CategoryCard category={categories[3]} large />
          </motion.div>
        </div>

        <div className="flex lg:hidden justify-center mt-8">
          <Link
            href="/categories"
            className="flex items-center gap-2 text-gold text-sm font-medium"
          >
            همه دسته‌بندی‌ها
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function CategoryCard({
  category,
  large = false,
}: {
  category: (typeof categories)[0]
  large?: boolean
}) {
  const { image } = category
  const hasResponsive = 'desktop' in image && image.desktop !== undefined

  return (
    <Link href={`/categories/${category.slug}`} className="group block">
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-slate-900',
          'border border-white/8 group-hover:border-white/20 transition-all duration-400',
          large
            ? 'aspect-[4/3] lg:aspect-[3/4]'
            : 'aspect-[4/3] lg:aspect-[3/2]',
        )}
      >
        {/* ── Background images ── */}
        {hasResponsive ? (
          <>
            {/*
              Each variant lives in its own absolute inset-0 wrapper so the
              responsive visibility class (hidden/block) targets a block element,
              not the <img> itself. The fill <img> is then relative to this wrapper
              (which is itself a containing block because position: absolute).
            */}
            <div className="absolute inset-0 hidden md:block">
              <Image
                src={(image as { desktop: string; mobile: string }).desktop}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
                priority={false}
              />
            </div>
            <div className="absolute inset-0 block md:hidden">
              <Image
                src={(image as { desktop: string; mobile: string }).mobile}
                alt={category.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority={false}
              />
            </div>
          </>
        ) : (
          <div className="absolute inset-0">
            <Image
              src={(image as { default: string }).default}
              alt={category.name}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 42vw, 100vw"
              priority={false}
            />
          </div>
        )}

        {/* ── Gold corner accent — z-10 sits above images ── */}
        <div
          className="absolute top-0 right-0 w-24 h-24 opacity-20 transition-opacity duration-300 group-hover:opacity-40 z-10"
          style={{
            background: `radial-gradient(circle at top right, ${category.accent}, transparent 70%)`,
          }}
        />

        {/* ── Dark bottom gradient overlay — keeps text readable ── */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

        {/* ── Text content — z-20 sits above all overlays ── */}
        <div className="absolute bottom-0 right-0 left-0 p-6 z-20">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-semibold mb-3"
            style={{
              background: `rgba(${hexToRgb(category.accent)}, 0.15)`,
              color: category.accent,
              border: `1px solid rgba(${hexToRgb(category.accent)}, 0.3)`,
            }}
          >
            {category.count}
          </div>

          <h3
            className={cn(
              'font-black text-white mb-1',
              large ? 'text-xl' : 'text-base',
            )}
          >
            {category.name}
          </h3>

          {large && (
            <p className="text-sm text-muted mb-4">{category.description}</p>
          )}

          <div
            className="flex items-center gap-2 text-sm font-medium transition-all duration-300"
            style={{ color: category.accent }}
          >
            مشاهده محصولات
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>

        {/* ── Hover colour glow ── */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at center, rgba(${hexToRgb(category.accent)}, 0.06), transparent 70%)`,
          }}
        />
      </div>
    </Link>
  )
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '200, 168, 93'
}
