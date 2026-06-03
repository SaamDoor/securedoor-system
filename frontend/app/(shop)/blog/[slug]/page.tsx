import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Clock, Eye, Calendar, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatJalaliDate, toPersianNumber } from '@/lib/utils'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

interface BlogPageProps {
  params: Promise<{ slug: string }>
}

const POST_DATA = {
  title: 'راهنمای جامع انتخاب درب ضد سرقت مناسب برای آپارتمان',
  slug: 'guide-choose-security-door-apartment',
  excerpt: 'در این مقاله به بررسی معیارهای مهم در انتخاب درب ضد سرقت می‌پردازیم.',
  category: 'راهنمای خرید',
  readingTime: 8,
  viewCount: 4821,
  publishedAt: '2025-01-15',
  author: { name: 'تیم گروه مشعوف', role: 'کارشناس فنی' },
  content: `
## چرا انتخاب درب ضد سرقت مناسب مهم است؟

درب ورودی اولین خط دفاعی خانه شما است. یک درب ضد سرقت مناسب می‌تواند از ورود سارقان جلوگیری کند و در عین حال زیبایی محیط را حفظ کند.

## معیارهای اصلی انتخاب

### ۱. درجه امنیتی (Security Class)

طبق استاندارد EN 1627 اروپایی، درب‌های ضد سرقت به ۶ کلاس تقسیم می‌شوند:
- **Class 1-2**: مقاومت پایه در برابر سارقان غیرحرفه‌ای
- **Class 3-4**: مقاومت در برابر ابزارهای معمول
- **Class 5-6**: بالاترین سطح مقاومت برای محیط‌های حساس

برای آپارتمان‌های معمولی، حداقل **Class 3** توصیه می‌شود.

### ۲. جنس و کیفیت ساخت

بهترین درب‌های ضد سرقت از **فولاد گالوانیزه گرم** ساخته می‌شوند. به ضخامت ورق فولادی توجه کنید — حداقل **۱.۵ میلی‌متر** برای لنگه و **۲ میلی‌متر** برای قاب.

### ۳. سیستم قفل

تعداد نقاط قفل مستقیماً بر امنیت تأثیر می‌گذارد:
- **۳-۴ نقطه**: مناسب برای آپارتمان‌های عادی
- **۵-۷ نقطه**: بهترین انتخاب برای طبقات پایین
- **۷+ نقطه**: برای مناطق پرخطر

### ۴. عایق‌بندی

یک درب خوب باید:
- **عایق صوتی** داشته باشد (حداقل ۳۵ دسیبل کاهش صدا)
- **عایق حرارتی** مناسب برای صرفه‌جویی در انرژی

## نکات مهم در خرید

✅ همیشه از فروشندگان دارای گواهینامه معتبر خرید کنید.
✅ ضمانت‌نامه رسمی بخواهید — حداقل ۵ سال.
✅ از تیم نصب حرفه‌ای استفاده کنید.
✅ ابعاد دقیق درگاه را قبل از خرید اندازه بگیرید.

## جمع‌بندی

انتخاب درب ضد سرقت مناسب یک سرمایه‌گذاری بلندمدت در امنیت خانه شماست. با توجه به معیارهای ذکر شده، می‌توانید بهترین گزینه را برای نیاز و بودجه خود انتخاب کنید.
  `,
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `${POST_DATA.title} | ${SITE_NAME}`,
    description: POST_DATA.excerpt,
    openGraph: {
      title: POST_DATA.title,
      description: POST_DATA.excerpt,
      type: 'article',
      publishedTime: POST_DATA.publishedAt,
      authors: [POST_DATA.author.name],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params
  if (!slug) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: POST_DATA.title,
    description: POST_DATA.excerpt,
    author: { '@type': 'Person', name: POST_DATA.author.name },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    datePublished: POST_DATA.publishedAt,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-black">
        {/* Breadcrumb */}
        <div className="bg-[#121212] border-b border-white/8">
          <div className="container py-3">
            <nav className="flex items-center gap-2 text-sm text-[#A0A0A0]">
              <Link href="/" className="hover:text-[#C8A85D] transition-colors">خانه</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/blog" className="hover:text-[#C8A85D] transition-colors">وبلاگ</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white line-clamp-1">{POST_DATA.title}</span>
            </nav>
          </div>
        </div>

        <div className="container py-12">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <Badge variant="gold" size="md" className="mb-4">{POST_DATA.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                {POST_DATA.title}
              </h1>
              <p className="text-[#A0A0A0] text-lg leading-relaxed mb-6">{POST_DATA.excerpt}</p>

              <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-white/8">
                <div className="flex items-center gap-5 text-sm text-[#A0A0A0]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[#C8A85D]" />
                    {formatJalaliDate(POST_DATA.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[#C8A85D]" />
                    {toPersianNumber(POST_DATA.readingTime)} دقیقه مطالعه
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-[#C8A85D]" />
                    {toPersianNumber(POST_DATA.viewCount.toLocaleString('fa-IR'))}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#A0A0A0]">{POST_DATA.author.name}</span>
                  <button
                    aria-label="اشتراک‌گذاری"
                    className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-[#A0A0A0] hover:text-[#C8A85D] hover:border-[#C8A85D]/30 transition-all"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </header>

            {/* Cover image */}
            <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 mb-10" />

            {/* Content */}
            <div
              className="prose prose-invert prose-lg max-w-none"
              style={{
                color: '#A0A0A0',
                lineHeight: 1.9,
              }}
            >
              {POST_DATA.content.trim().split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={i} className="text-2xl font-black text-white mt-10 mb-4">
                      {line.slice(3)}
                    </h2>
                  )
                }
                if (line.startsWith('### ')) {
                  return (
                    <h3 key={i} className="text-xl font-bold text-white mt-8 mb-3">
                      {line.slice(4)}
                    </h3>
                  )
                }
                if (line.startsWith('- ') || line.startsWith('✅ ') || line.startsWith('**')) {
                  return (
                    <p key={i} className="text-[#A0A0A0] mb-2">
                      {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </p>
                  )
                }
                if (line.trim() === '') return null
                return (
                  <p key={i} className="text-[#A0A0A0] mb-4">
                    {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </p>
                )
              })}
            </div>

            {/* Back link */}
            <div className="mt-12 pt-8 border-t border-white/8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[#C8A85D] hover:text-[#E7D3A5] transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
                بازگشت به وبلاگ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
