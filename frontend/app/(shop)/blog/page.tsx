import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, Eye, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatJalaliDate, toPersianNumber } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'وبلاگ | سام درب',
  description: 'مقالات تخصصی در حوزه امنیت، طراحی و راهنمای انتخاب درب ضد سرقت',
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  readingTime: number
  viewCount: number
  publishedAt: string
  isFeatured: boolean
}

const POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'راهنمای جامع انتخاب درب ضد سرقت مناسب برای آپارتمان',
    slug: 'guide-choose-security-door-apartment',
    excerpt: 'در این مقاله به بررسی معیارهای مهم در انتخاب درب ضد سرقت می‌پردازیم و تمام نکاتی که باید قبل از خرید بدانید را مرور می‌کنیم.',
    category: 'راهنمای خرید',
    readingTime: 8,
    viewCount: 4821,
    publishedAt: '2025-01-15',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'چگونه از درب ضد سرقت نگهداری کنیم؟',
    slug: 'security-door-maintenance',
    excerpt: 'نکات کلیدی برای نگهداری و افزایش عمر مفید درب‌های ضد سرقت که باید بدانید.',
    category: 'آموزش نصب',
    readingTime: 5,
    viewCount: 3142,
    publishedAt: '2025-01-10',
    isFeatured: false,
  },
  {
    id: '3',
    title: 'مقایسه درب‌های ضد حریق: REI 60 در مقابل REI 90',
    slug: 'fire-door-comparison',
    excerpt: 'تفاوت‌های اساسی بین درب‌های ضد حریق با رده‌بندی‌های مختلف و کدام یک برای شما مناسب است.',
    category: 'اخبار صنعت',
    readingTime: 6,
    viewCount: 2895,
    publishedAt: '2025-01-05',
    isFeatured: false,
  },
  {
    id: '4',
    title: 'امنیت خانه در تعطیلات: نکات ضروری',
    slug: 'home-security-holidays',
    excerpt: 'پیش از سفر تعطیلات، این نکات امنیتی را رعایت کنید تا با خیال راحت به مسافرت بروید.',
    category: 'امنیت خانه',
    readingTime: 4,
    viewCount: 5634,
    publishedAt: '2024-12-28',
    isFeatured: false,
  },
  {
    id: '5',
    title: 'قفل‌های هوشمند و آینده درب‌های امنیتی',
    slug: 'smart-locks-future',
    excerpt: 'فناوری قفل‌های هوشمند چه تحولی در صنعت درب‌های امنیتی ایجاد کرده و در آینده چه خواهد شد.',
    category: 'اخبار صنعت',
    readingTime: 7,
    viewCount: 3289,
    publishedAt: '2024-12-20',
    isFeatured: false,
  },
  {
    id: '6',
    title: 'ترکیب درب ضد سرقت با دکوراسیون داخلی مدرن',
    slug: 'security-door-interior-design',
    excerpt: 'چگونه یک درب ضد سرقت را با طراحی داخلی منزل هماهنگ کنیم؟',
    category: 'طراحی داخلی',
    readingTime: 5,
    viewCount: 2100,
    publishedAt: '2024-12-15',
    isFeatured: false,
  },
]

const categories = ['همه', 'راهنمای خرید', 'آموزش نصب', 'اخبار صنعت', 'امنیت خانه', 'طراحی داخلی']

export default function BlogPage() {
  const featured = POSTS.find((p) => p.isFeatured)
  const rest = POSTS.filter((p) => !p.isFeatured)

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <div
        className="relative pt-28 pb-16 text-center overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(200,168,93,0.08) 0%, transparent 60%), linear-gradient(180deg, #0F0F0F 0%, #0B0B0B 100%)',
        }}
      >
        <div className="container">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#C8A85D]" />
            <span className="text-[#C8A85D] text-sm font-semibold tracking-widest">وبلاگ سام درب</span>
            <div className="h-px w-10 bg-[#C8A85D]" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4">دانش‌نامه تخصصی</h1>
          <p className="text-[#A0A0A0] max-w-xl mx-auto">
            مقالات تخصصی درباره امنیت، طراحی، و انتخاب درب مناسب
          </p>
        </div>
      </div>

      <div className="container py-12">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              className={
                cat === 'همه'
                  ? 'px-4 py-1.5 rounded-full text-sm font-medium bg-[#C8A85D] text-black'
                  : 'px-4 py-1.5 rounded-full text-sm font-medium bg-[#181818] border border-white/8 text-[#A0A0A0] hover:text-white hover:border-white/20 transition-colors'
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-10">
            <div className="relative rounded-2xl overflow-hidden bg-[#181818] border border-white/8 hover:border-[#C8A85D]/30 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(200,168,93,0.15)]">
              <div className="aspect-[21/7] bg-gradient-to-br from-zinc-800 to-zinc-900" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 right-0 left-0 p-8">
                <Badge variant="gold" size="md" className="mb-3">{featured.category}</Badge>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3 group-hover:text-[#E7D3A5] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-[#A0A0A0] mb-4 max-w-2xl line-clamp-2">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-[#A0A0A0]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {toPersianNumber(featured.readingTime)} دقیقه مطالعه
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    {toPersianNumber(featured.viewCount.toLocaleString('fa-IR'))} بازدید
                  </span>
                  <span className="text-[#C8A85D]">{formatJalaliDate(featured.publishedAt)}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <article className="h-full rounded-2xl bg-[#181818] border border-white/8 overflow-hidden hover:border-[#C8A85D]/30 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(200,168,93,0.15)]">
                <div className="aspect-[16/9] bg-gradient-to-br from-zinc-800 to-zinc-900 group-hover:scale-105 transition-transform duration-500 overflow-hidden" />
                <div className="p-5">
                  <Badge variant="gold" size="sm" className="mb-3">{post.category}</Badge>
                  <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-[#E7D3A5] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-[#A0A0A0] line-clamp-2 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-[#A0A0A0]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {toPersianNumber(post.readingTime)} دقیقه
                    </span>
                    <span className="flex items-center gap-1 text-[#C8A85D]">
                      ادامه مطلب
                      <ArrowLeft className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
