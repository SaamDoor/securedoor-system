import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import {
  breadcrumbSchema,
  faqSchema,
  generateSeo,
  jsonLdScript,
} from '@/lib/seo'
import {
  getAllSeoCollectionSlugs,
  getSeoCollection,
} from '@/lib/seo/collections'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllSeoCollectionSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const collection = getSeoCollection(slug)
  if (!collection) return { title: 'صفحه یافت نشد' }

  return generateSeo({
    title: collection.title,
    description: collection.description,
    keywords: collection.keywords,
    path: `/collections/${collection.slug}`,
  })
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params
  const collection = getSeoCollection(slug)
  if (!collection) notFound()

  const related = collection.relatedSlugs
    .map((s) => getSeoCollection(s))
    .filter(Boolean)

  const breadcrumb = breadcrumbSchema([
    { name: 'خانه', url: SITE_URL },
    { name: 'راهنمای محصولات', url: `${SITE_URL}/collections` },
    { name: collection.title, url: `${SITE_URL}/collections/${collection.slug}` },
  ])

  return (
    <div className="bg-black min-h-screen" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumb)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(collection.faqs))}
      />

      <div className="border-b border-white/8 bg-zinc-950">
        <div className="container px-4 sm:px-6 py-10 sm:py-14 max-w-4xl">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <Link href="/" className="hover:text-gold transition-colors">خانه</Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-gold transition-colors">راهنمای محصولات</Link>
            <span>/</span>
            <span className="text-zinc-300">{collection.title}</span>
          </nav>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-4">
            {collection.h1}
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
            {collection.intro}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="gold">
              <Link href={collection.ctaHref}>
                {collection.ctaLabel}
                <ArrowLeft className="h-4 w-4 mr-1" />
              </Link>
            </Button>
            <Button asChild variant="gold-outline">
              <Link href="/contact">مشاوره رایگان</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-4 sm:px-6 py-12 max-w-4xl space-y-10">
        {collection.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-bold text-white mb-3">{section.heading}</h2>
            <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">{section.body}</p>
          </section>
        ))}

        <section className="rounded-2xl border border-white/8 bg-zinc-950 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-5">سوالات متداول درباره {collection.title}</h2>
          <div className="space-y-5">
            {collection.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold text-white text-sm mb-1.5 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed pr-6">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">صفحات مرتبط</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((item) => (
                <Link
                  key={item!.slug}
                  href={`/collections/${item!.slug}`}
                  className="rounded-xl border border-white/8 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 hover:border-gold/30 hover:text-white transition-colors"
                >
                  {item!.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="text-xs text-zinc-600">
          {SITE_NAME} — تولیدکننده درب ضد سرقت، چهارچوب فلزی و درب اتاقی در مازندران.
        </p>
      </div>
    </div>
  )
}
