import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from './product-detail-client'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params

  // In production: fetch from Supabase
  const product = {
    name: 'درب ضد سرقت آرتوس پلاتینیوم',
    description: 'درب ضد سرقت با استاندارد بین‌المللی Class 6 و ضمانت ۱۰ ساله',
    price: 28500000,
    image: `${SITE_URL}/products/door-1.jpg`,
  }

  return {
    title: `${product.name} | ${SITE_NAME}`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image }],
      type: 'website',
    },
    other: {
      'product:price:amount': String(product.price),
      'product:price:currency': 'IRR',
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params

  // In production: fetch from Supabase
  if (!slug) notFound()

  return <ProductDetailClient slug={slug} />
}
