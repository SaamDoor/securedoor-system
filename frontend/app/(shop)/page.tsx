import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/hero-section'
import { FramePriceListSection } from '@/components/home/frame-price-list-section'
import { FeaturesSection } from '@/components/home/features-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { StatsSection } from '@/components/home/stats-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { FaqSection } from '@/components/home/faq-section'
import { FeaturedProductsSection } from '@/components/home/featured-products-section'
import { EngineeringToolsSection } from '@/components/home/engineering-tools-section'
import { ProcessSection } from '@/components/home/process-section'
import { CertificatesSection } from '@/components/home/certificates-section'
import { BlogHighlightsSection } from '@/components/home/blog-highlights-section'
import { ContactCtaSection } from '@/components/home/contact-cta-section'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/constants'
import {
  faqSchema,
  jsonLdScript,
  localBusinessSchema,
  organizationSchema,
} from '@/lib/seo'
import { fetchFramePrices } from '@/lib/api/google-sheets'
import { fetchFeaturedShopProducts, fetchShopCategories } from '@/lib/shop/catalog.server'

export const metadata: Metadata = {
  title: `درب ضد سرقت و چهارچوب فلزی | ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  keywords: [
    'درب ضد سرقت',
    'درب ضدسرقت',
    'درب ضد سرقت مازندران',
    'چهارچوب فلزی فرانسوی',
    'چهارچوب فلزی مکزیکی',
    'درب اتاقی',
    'دستگیره',
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `درب ضد سرقت و چهارچوب فلزی | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'fa_IR',
    type: 'website',
  },
}

export const revalidate = 120

const HOME_FAQS = [
  {
    question: 'چگونه می‌توانم سفارش بدهم؟',
    answer:
      'برای ثبت سفارش، محصول مورد نظر را به سبد خرید اضافه کرده و مراحل تسویه حساب را طی کنید یا با کارخانه مشعوف تماس بگیرید.',
  },
  {
    question: 'آیا نصب درب توسط تیم گروه مشعوف انجام می‌شود؟',
    answer:
      'بله، تیم متخصص گروه صنعتی مشعوف در استان مازندران و شمال کشور خدمات نصب ارائه می‌دهد.',
  },
  {
    question: 'آیا فروش عمده درب ضد سرقت دارید؟',
    answer:
      'بله؛ برای پیمانکاران و فروشگاه‌ها قیمت همکاری عمده از طریق واحد فروش اعلام می‌شود.',
  },
]

const CATEGORY_IMAGE_FALLBACKS: Array<{ match: RegExp; image: string; accent: string }> = [
  {
    match: /ضد\s*سرقت|zed-?sereqat|anti.?theft/i,
    image: '/images/categories/category-anti-theft-doors.webp',
    accent: '#C8A85D',
  },
  {
    match: /ضد\s*حریق|zed-?hariq|fire/i,
    image: '/images/categories/category-fireproof-doors-desktop.webp',
    accent: '#E74C3C',
  },
  {
    match: /آپارتمان|apartman/i,
    image: '/images/categories/category-apartment-doors.webp',
    accent: '#C8A85D',
  },
  {
    match: /ویلا|villa/i,
    image: '/images/categories/category-villa-doors-desktop.webp',
    accent: '#27AE60',
  },
]

function resolveCategoryVisual(name: string, slug: string, imageUrl: string | null) {
  const haystack = `${name} ${slug}`
  const fallback = CATEGORY_IMAGE_FALLBACKS.find((item) => item.match.test(haystack))
  return {
    imageUrl: imageUrl || fallback?.image || null,
    accent: fallback?.accent ?? '#C8A85D',
  }
}

export default async function HomePage() {
  // These sources are independent. Running them in parallel prevents a slow
  // Google/Supabase endpoint from blocking the other homepage sections.
  const [prices, featuredProducts, shopCategories] = await Promise.all([
    fetchFramePrices().catch(() => ({
      frenchPrices: [],
      mexicanPrices: [],
      lastUpdated: '',
    })),
    fetchFeaturedShopProducts(8).catch(() => []),
    fetchShopCategories().catch(() => []),
  ])
  const { frenchPrices, mexicanPrices, lastUpdated } = prices

  const featuredCards = featuredProducts.slice(0, 8).map((product) => {
    const primary = product.images.find((img) => img.isPrimary) ?? product.images[0]
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      comparePrice: product.comparePrice ?? null,
      category: product.category.name,
      isNew: product.isNew,
      isFeatured: product.isFeatured,
      image: primary?.url ?? null,
    }
  })

  const categoryCards = shopCategories.slice(0, 4).map((category) => {
    const visual = resolveCategoryVisual(category.name, category.slug, category.imageUrl)
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      productCount: category.productCount,
      imageUrl: visual.imageUrl,
      accent: visual.accent,
    }
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(organizationSchema())}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(localBusinessSchema())}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(HOME_FAQS))}
      />
      <HeroSection />
      <FramePriceListSection
        frenchPrices={frenchPrices}
        mexicanPrices={mexicanPrices}
        lastUpdated={lastUpdated}
      />
      <FeaturedProductsSection products={featuredCards} />
      <EngineeringToolsSection />
      <FeaturesSection />
      <CategoriesSection categories={categoryCards} />
      <StatsSection />
      <ProcessSection />
      <TestimonialsSection />
      <CertificatesSection />
      <BlogHighlightsSection />
      <FaqSection />
      <ContactCtaSection />
    </>
  )
}
