import type { Metadata } from 'next'
import { fetchFramePrices } from '@/lib/api/google-sheets'
import { FrenchFrameClient } from './french-frame-client'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `چهارچوب فلزی فرانسوی | ${SITE_NAME}`,
  description:
    'چهارچوب فلزی فرانسوی با ضخامت ۲ میلیمتر، رنگ کوره‌ای الکترواستاتیک، لولا پارس کلون — موجود در ۴ رنگ. قابل سفارش در ابعاد دلخواه.',
  openGraph: {
    title: `چهارچوب فلزی فرانسوی | ${SITE_NAME}`,
    description: 'چهارچوب فلزی فرانسوی ضخامت ۲ میلی‌متر — رنگ کوره‌ای — ۴ رنگ',
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

  return <FrenchFrameClient frenchPrices={frenchPrices} lastUpdated={lastUpdated} />
}
