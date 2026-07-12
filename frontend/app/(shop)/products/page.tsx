import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Product, StockStatus } from '@/types'
import { ProductsPageClient } from './products-client'

export const metadata: Metadata = {
  title: `محصولات | ${SITE_NAME}`,
  description:
    `مشاهده کامل درب‌های ضد سرقت، چهارچوب‌های فلزی، درب‌های اتاقی و درب‌های حیاطی ${SITE_NAME}. با بهترین کیفیت و قیمت مناسب.`,
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
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select(`
      *,
      category:product_categories(id, name, slug, "order", is_active),
      images:product_images(id, url, alt, is_primary, "order"),
      specifications:product_specifications(id, label, value, unit, "group", "order")
    `)
    .eq('is_active', true)

  if (params.search) query = query.or(`name.ilike.%${params.search}%,short_description.ilike.%${params.search}%`)
  if (params.minPrice) query = query.gte('price', Number(params.minPrice))
  if (params.maxPrice) query = query.lte('price', Number(params.maxPrice))
  if (params.featured === 'true') query = query.eq('is_featured', true)

  if (params.sortBy === 'price_asc') query = query.order('price', { ascending: true })
  else if (params.sortBy === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data } = await query
  const products = ((data ?? []) as unknown as RawProduct[])
    .map(mapProduct)
    .filter((product) => !params.category || product.category.slug === params.category)

  return <ProductsPageClient searchParams={params} products={products} />
}

interface RawProduct {
  id: string
  sku: string
  name: string
  slug: string
  short_description: string | null
  description: string
  price: number
  compare_price: number | null
  cost_price: number | null
  category_id: string
  tags: string[] | null
  stock: number
  stock_status: StockStatus
  weight: number | null
  width: number | null
  height: number | null
  depth: number | null
  dimension_unit: 'cm' | 'mm' | 'm'
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  view_count: number
  review_count: number
  average_rating: number
  created_at: string
  updated_at: string
  category: { id: string; name: string; slug: string; order: number; is_active: boolean } | null
  images: { id: string; url: string; alt: string | null; is_primary: boolean; order: number }[]
  specifications: { id: string; label: string; value: string; unit: string | null; group: string | null; order: number }[]
}

function mapProduct(row: RawProduct): Product {
  const category = row.category ?? {
    id: row.category_id,
    name: 'بدون دسته‌بندی',
    slug: 'uncategorized',
    order: 0,
    is_active: true,
  }
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description ?? undefined,
    description: row.description,
    price: Number(row.price),
    comparePrice: row.compare_price ? Number(row.compare_price) : undefined,
    costPrice: row.cost_price ? Number(row.cost_price) : undefined,
    categoryId: row.category_id,
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      order: category.order,
      isActive: category.is_active,
    },
    images: row.images
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((image) => ({
        id: image.id,
        productId: row.id,
        url: image.url,
        alt: image.alt ?? undefined,
        isPrimary: image.is_primary,
        order: image.order,
      })),
    attributes: [],
    specifications: row.specifications.map((item) => ({
      id: item.id,
      productId: row.id,
      label: item.label,
      value: item.value,
      unit: item.unit ?? undefined,
      group: item.group ?? undefined,
      order: item.order,
    })),
    downloads: [],
    tags: row.tags ?? [],
    stock: row.stock,
    stockStatus: row.stock_status,
    weight: row.weight ?? undefined,
    dimensions: {
      width: row.width ?? undefined,
      height: row.height ?? undefined,
      depth: row.depth ?? undefined,
      unit: row.dimension_unit,
    },
    isActive: row.is_active,
    isFeatured: row.is_featured,
    isNew: row.is_new,
    viewCount: row.view_count,
    reviewCount: row.review_count,
    averageRating: Number(row.average_rating),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
