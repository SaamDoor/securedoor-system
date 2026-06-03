import type { Metadata } from 'next'
import { ProductsPageClient } from './products-client'

export const metadata: Metadata = {
  title: 'محصولات | گروه صنعتی مشعوف',
  description:
    'مشاهده کامل درب‌های ضد سرقت، چهارچوب‌های فلزی، درب‌های اتاقی و درب‌های حیاطی گروه صنعتی مشعوف. با بهترین کیفیت و قیمت مناسب.',
}

interface SearchParams {
  category?: string
  search?: string
  minPrice?: string
  maxPrice?: string
  sortBy?: string
  page?: string
  featured?: string
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  return <ProductsPageClient searchParams={params} />
}
