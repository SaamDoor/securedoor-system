import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'
import { generateSeo } from '@/lib/seo'
import { fetchShopCatalog } from '@/lib/shop/catalog.server'
import { ProductsPageClient } from './products-client'

export const metadata: Metadata = generateSeo({
  title: 'محصولات — درب ضد سرقت، چهارچوب فلزی، درب اتاقی',
  description:
    `مشاهده کامل درب‌های ضد سرقت، چهارچوب‌های فلزی فرانسوی و مکزیکی، درب‌های اتاقی، ملامینه و ABS از ${SITE_NAME}. خرید مستقیم کارخانه در مازندران.`,
  keywords: [
    'درب ضد سرقت',
    'چهارچوب فلزی',
    'درب اتاقی',
    'دستگیره',
  ],
  path: '/products',
})

export const revalidate = 60

interface SearchParams {
  category?: string
  search?: string
  minPrice?: string
  maxPrice?: string
  sortBy?: string
  page?: string
  featured?: string
  inStock?: string
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams

  const catalog = await fetchShopCatalog({
    category: params.category,
    search: params.search,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sortBy: params.sortBy ?? 'newest',
    page: params.page ? Number(params.page) : 1,
    featured: params.featured === 'true',
    inStock: params.inStock === 'true',
  })

  return (
    <ProductsPageClient
      searchParams={params}
      products={catalog.products}
      categories={catalog.categories}
      activeCategory={catalog.activeCategory}
      total={catalog.total}
      page={catalog.page}
      totalPages={catalog.totalPages}
    />
  )
}
