import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { fetchFeaturedShopProducts } from '@/lib/shop/catalog.server'
import { MaterialsCalculatorClient } from './materials-calculator-client'
import { getProductPath } from '@/lib/shop/product-path'

export const metadata: Metadata = {
  title: `محاسبه‌گر هوشمند مصالح ساختمان | ${SITE_NAME}`,
  description:
    'محاسبه آنلاین بتن، میلگرد، سیمان، شن، ماسه، بلوک، آجر و گچ. برآورد سریع و حرفه‌ای المانی بدون ذخیره اطلاعات پروژه — گروه صنعتی مشعوف.',
  alternates: { canonical: `${SITE_URL}/tools/materials-calculator` },
  openGraph: {
    title: `محاسبه‌گر هوشمند مصالح ساختمان | ${SITE_NAME}`,
    description: 'قبل از خرید مصالح، مقدار موردنیاز پروژه را رایگان محاسبه کنید.',
    url: `${SITE_URL}/tools/materials-calculator`,
    type: 'website',
  },
}

export const revalidate = 300

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'محاسبه‌گر هوشمند مصالح ساختمان مشعوف',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IRR' },
  url: `${SITE_URL}/tools/materials-calculator`,
  provider: { '@type': 'Organization', name: SITE_NAME },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'آیا محاسبه‌گر مصالح رایگان است؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'بله. استفاده از محاسبه‌گر مصالح ساختمان گروه صنعتی مشعوف کاملاً رایگان است.',
      },
    },
    {
      '@type': 'Question',
      name: 'آیا اطلاعات پروژه ذخیره می‌شود؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'خیر. محاسبات سمت مرورگر انجام می‌شود و جزئیات پروژه ذخیره نمی‌گردد. فقط در صورت درخواست گزارش، شماره موبایل ثبت می‌شود.',
      },
    },
    {
      '@type': 'Question',
      name: 'تفاوت محاسبه سریع و حرفه‌ای چیست؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'حالت سریع بر اساس زیربنا برآورد می‌کند. حالت حرفه‌ای المان‌های فونداسیون، ستون، تیر، سقف و دیوار را جداگانه محاسبه می‌کند.',
      },
    },
  ],
}

export default async function MaterialsCalculatorPage() {
  const products = await fetchFeaturedShopProducts(12).catch(() => [])
  const recommendable = products.map((p) => {
    const image = p.images.find((i) => i.isPrimary) ?? p.images[0]
    return {
      id: p.id,
      name: p.name,
      href: getProductPath(p),
      price: p.price,
      image: image?.url ?? null,
      categoryName: p.category.name,
      tags: p.tags ?? [],
    }
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MaterialsCalculatorClient products={recommendable} />
    </>
  )
}
