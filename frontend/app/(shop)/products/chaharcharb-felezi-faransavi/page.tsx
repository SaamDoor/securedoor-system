import type { Metadata } from 'next'
import { fetchFramePrices } from '@/lib/api/google-sheets'
import { FrenchFrameClient } from './french-frame-client'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { breadcrumbSchema, jsonLdScript } from '@/lib/seo'

export const metadata: Metadata = {
  title: `چهارچوب فلزی فرانسوی | ${SITE_NAME}`,
  description:
    'چهارچوب فلزی فرانسوی با ضخامت ۲ میلیمتر، رنگ کوره‌ای الکترواستاتیک، لولا پارس کلون — موجود در ۴ رنگ. قابل سفارش در ابعاد دلخواه از کارخانه مشعوف.',
  keywords: [
    'چهارچوب فلزی فرانسوی',
    'چهارچوب فرانسوی',
    'قیمت چهارچوب فرانسوی',
    'چهارچوب فلزی',
  ],
  alternates: {
    canonical: `${SITE_URL}/products/chaharcharb-felezi-faransavi`,
  },
  openGraph: {
    title: `چهارچوب فلزی فرانسوی | ${SITE_NAME}`,
    description: 'چهارچوب فلزی فرانسوی ضخامت ۲ میلی‌متر — رنگ کوره‌ای — ۴ رنگ',
    url: `${SITE_URL}/products/chaharcharb-felezi-faransavi`,
    locale: 'fa_IR',
    type: 'website',
  },
}

export const revalidate = 600

export default async function FrenchFramePage() {
  let frenchPrices: import('@/lib/api/google-sheets').PriceRow[] = []
  let lastUpdated = ''

  try {
    const data = await fetchFramePrices()
    frenchPrices = data.frenchPrices
    lastUpdated = data.lastUpdated
  } catch {
    // client component uses built-in fallback prices
  }

  const breadcrumb = breadcrumbSchema([
    { name: 'خانه', url: SITE_URL },
    { name: 'محصولات', url: `${SITE_URL}/products` },
    {
      name: 'چهارچوب فلزی فرانسوی',
      url: `${SITE_URL}/products/chaharcharb-felezi-faransavi`,
    },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumb)}
      />
      <FrenchFrameClient frenchPrices={frenchPrices} lastUpdated={lastUpdated} />
    </>
  )
}
