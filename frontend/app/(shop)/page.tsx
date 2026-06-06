import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/hero-section'
import { FramePriceListSection } from '@/components/home/frame-price-list-section'
import { FeaturesSection } from '@/components/home/features-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { StatsSection } from '@/components/home/stats-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { FaqSection } from '@/components/home/faq-section'
import { FeaturedProductsSection } from '@/components/home/featured-products-section'
import { ProcessSection } from '@/components/home/process-section'
import { CertificatesSection } from '@/components/home/certificates-section'
import { BlogHighlightsSection } from '@/components/home/blog-highlights-section'
import { ContactCtaSection } from '@/components/home/contact-cta-section'
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/constants'
import { fetchFramePrices } from '@/lib/api/google-sheets'

export const metadata: Metadata = {
  title: `${SITE_NAME} — درب ضد سرقت لوکس`,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — درب ضد سرقت لوکس`,
    description: SITE_DESCRIPTION,
    type: 'website',
  },
}

export const revalidate = 600

export default async function HomePage() {
  const { frenchPrices, mexicanPrices } = await fetchFramePrices()

  return (
    <>
      <HeroSection />
      <FramePriceListSection frenchPrices={frenchPrices} mexicanPrices={mexicanPrices} />
      <FeaturedProductsSection />
      <FeaturesSection />
      <CategoriesSection />
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
