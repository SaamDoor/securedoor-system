'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Package } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { toPersianNumber, cn } from '@/lib/utils'

export interface HomeCategoryCard {
  id: string
  name: string
  slug: string
  description: string | null
  productCount: number
  imageUrl: string | null
  accent: string
}

interface CategoriesSectionProps {
  categories: HomeCategoryCard[]
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (!categories.length) return null

  return (
    <section className="section-padding relative overflow-hidden bg-black">
      <div className="container">
        <div className="mb-12 flex items-end justify-between">
          <SectionHeader
            eyebrow="دسته‌بندی‌ها"
            title="هر فضا، یک راه‌حل"
            description="دسته‌بندی‌های فعال پنل مدیریت — همان‌هایی که در سوپر ادمین کنترل می‌شوند."
          />
          <Link
            href="/products"
            className="hidden items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-gold-light lg:flex"
          >
            همه محصولات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.65,
                delay: i * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="min-w-0"
            >
              <CategoryCard category={category} />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-center lg:hidden">
          <Link href="/products" className="flex items-center gap-2 text-sm font-medium text-gold">
            همه محصولات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function CategoryCard({ category }: { category: HomeCategoryCard }) {
  return (
    <Link href={`/products?category=${encodeURIComponent(category.slug)}`} className="group block h-full">
      <div
        className={cn(
          'relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900 sm:aspect-[5/4] lg:aspect-[16/10]',
          'border border-white/8 shadow-[0_18px_50px_rgba(0,0,0,0.25)] transition-all duration-500',
          'group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-[0_24px_70px_rgba(0,0,0,0.45)]',
        )}
      >
        {category.imageUrl ? (
          <div className="absolute inset-0">
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(min-width: 640px) 50vw, 100vw"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
            <Package className="h-14 w-14 text-zinc-700" />
          </div>
        )}

        <div
          className="absolute right-0 top-0 z-10 h-24 w-24 opacity-20 transition-opacity duration-300 group-hover:opacity-40"
          style={{
            background: `radial-gradient(circle at top right, ${category.accent}, transparent 70%)`,
          }}
        />

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6">
          <div
            className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-2xs font-semibold"
            style={{
              background: `rgba(${hexToRgb(category.accent)}, 0.15)`,
              color: category.accent,
              border: `1px solid rgba(${hexToRgb(category.accent)}, 0.3)`,
            }}
          >
            {toPersianNumber(category.productCount)} محصول
          </div>

          <h3 className="mb-1 text-lg font-black text-white sm:text-xl">{category.name}</h3>

          {category.description && (
            <p className="mb-3 line-clamp-1 text-xs text-white/65 sm:text-sm">{category.description}</p>
          )}

          <div
            className="flex items-center gap-2 text-sm font-medium transition-all duration-300"
            style={{ color: category.accent }}
          >
            مشاهده محصولات
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </div>
        </div>
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
