'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Eye } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { Badge } from '@/components/ui/badge'
import { toPersianNumber, formatJalaliDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const posts = [
  {
    id: '1',
    title: 'راهنمای جامع انتخاب درب ضد سرقت مناسب برای آپارتمان',
    slug: 'guide-choose-security-door',
    excerpt: 'در این مقاله به بررسی معیارهای مهم در انتخاب درب ضد سرقت می‌پردازیم...',
    category: 'راهنمای خرید',
    readingTime: 8,
    viewCount: 4821,
    publishedAt: '2025-01-15',
    coverImage: '/blog/post-1.jpg',
    featured: true,
  },
  {
    id: '2',
    title: 'چگونه از درب ضد سرقت نگهداری کنیم؟',
    slug: 'security-door-maintenance',
    excerpt: 'نکات کلیدی برای نگهداری و افزایش عمر مفید درب‌های ضد سرقت...',
    category: 'آموزش نصب',
    readingTime: 5,
    viewCount: 3142,
    publishedAt: '2025-01-10',
    coverImage: '/blog/post-2.jpg',
    featured: false,
  },
  {
    id: '3',
    title: 'مقایسه درب‌های ضد حریق: REI 60 در مقابل REI 90',
    slug: 'fire-door-comparison',
    excerpt: 'تفاوت‌های اساسی بین درب‌های ضد حریق با رده‌بندی‌های مختلف...',
    category: 'اخبار صنعت',
    readingTime: 6,
    viewCount: 2895,
    publishedAt: '2025-01-05',
    coverImage: '/blog/post-3.jpg',
    featured: false,
  },
]

export function BlogHighlightsSection() {
  const featuredPost = posts[0]
  const regularPosts = posts.slice(1)

  return (
    <section className="section-padding bg-charcoal relative overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between mb-12">
          <SectionHeader
            eyebrow="وبلاگ"
            title="آخرین مطالب"
            description="مقالات تخصصی در حوزه امنیت، طراحی و انتخاب درب."
          />
          <Link
            href="/blog"
            className="hidden lg:flex items-center gap-2 text-gold hover:text-gold-light text-sm font-medium transition-colors"
          >
            همه مقالات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Featured post */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            <BlogCard post={featuredPost} large />
          </motion.div>

          {/* Regular posts */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {regularPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function BlogCard({
  post,
  large = false,
}: {
  post: (typeof posts)[0]
  large?: boolean
}) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-surface border border-white/8',
          'hover:border-gold/25 transition-all duration-400 hover:shadow-gold-sm',
          'flex',
          large ? 'flex-col h-full' : 'flex-row gap-4 p-4',
        )}
      >
        {/* Image */}
        <div
          className={cn(
            'bg-zinc-900 overflow-hidden flex-shrink-0',
            large ? 'aspect-[16/9] rounded-none' : 'w-24 h-24 rounded-xl',
          )}
        >
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 group-hover:scale-105 transition-transform duration-500" />
        </div>

        {/* Content */}
        <div className={cn('flex flex-col', large ? 'p-6' : 'flex-1 min-w-0')}>
          <Badge variant="gold" size="sm" className="mb-3 self-start">
            {post.category}
          </Badge>

          <h3
            className={cn(
              'font-bold text-white group-hover:text-gold-light transition-colors mb-2',
              large ? 'text-xl line-clamp-2' : 'text-sm line-clamp-2',
            )}
          >
            {post.title}
          </h3>

          {large && (
            <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-2">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted mt-auto">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {toPersianNumber(post.readingTime)} دقیقه
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {toPersianNumber(post.viewCount.toLocaleString('fa-IR'))}
            </span>
            <span className="mr-auto text-gold">
              {formatJalaliDate(post.publishedAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
