import type { Metadata } from 'next'
import { ProductsPageClient } from './products-client'

export const metadata: Metadata = {
  title: 'محصولات | سام درب',
  description:
    'مشاهده کامل درب‌های ضد سرقت، ضد حریق، آپارتمانی و ویلایی سام درب. با بهترین کیفیت و قیمت مناسب.',
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
