import { createClient } from '@/lib/supabase/server'
import type { Product, StockStatus } from '@/types'
import type { ShopCatalogParams, ShopCategory } from '@/lib/shop/catalog.types'

export type { ShopCatalogParams, ShopCategory, ShopSortBy } from '@/lib/shop/catalog.types'

export const PRODUCTS_PER_PAGE = 12

export interface ShopCatalogResult {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
  categories: ShopCategory[]
  activeCategory: ShopCategory | null
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
  images: { id: string; url: string; alt: string | null; is_primary: boolean; order: number }[] | null
  specifications?: {
    id: string
    label: string
    value: string
    unit: string | null
    group: string | null
    order: number
  }[] | null
}

const PRODUCT_SELECT = `
  id, sku, name, slug, short_description, description, price, compare_price, cost_price,
  category_id, tags, stock, stock_status, weight, width, height, depth, dimension_unit,
  is_active, is_featured, is_new, view_count, review_count, average_rating, created_at, updated_at,
  category:product_categories(id, name, slug, "order", is_active),
  images:product_images(id, url, alt, is_primary, "order"),
  specifications:product_specifications(id, label, value, unit, "group", "order")
`

export function mapShopProduct(row: RawProduct): Product {
  const category = row.category ?? {
    id: row.category_id,
    name: 'بدون دسته‌بندی',
    slug: 'uncategorized',
    order: 0,
    is_active: true,
  }

  const images = (row.images ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .filter((image) => Boolean(image.url) && !image.url.startsWith('/products/'))
    .map((image) => ({
      id: image.id,
      productId: row.id,
      url: image.url,
      alt: image.alt ?? undefined,
      isPrimary: image.is_primary,
      order: image.order,
    }))

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
    images,
    attributes: [],
    specifications: (row.specifications ?? []).map((item) => ({
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
    averageRating: Number(row.average_rating ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchShopCategories(): Promise<ShopCategory[]> {
  const supabase = await createClient()

  const [{ data: categories, error }, { data: products, error: productsError }] = await Promise.all([
    supabase
      .from('product_categories')
      .select('id, name, slug, description, image_url, parent_id, order, is_active')
      .eq('is_active', true)
      .order('order', { ascending: true }),
    supabase.from('products').select('category_id').eq('is_active', true),
  ])

  if (error) throw error
  if (productsError) throw productsError

  const counts = new Map<string, number>()
  for (const product of products ?? []) {
    if (!product.category_id) continue
    counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1)
  }

  const mapped: ShopCategory[] = (categories ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.image_url,
    parentId: category.parent_id,
    order: category.order,
    productCount: counts.get(category.id) ?? 0,
    children: [],
  }))

  const byId = new Map(mapped.map((category) => [category.id, category]))
  const roots: ShopCategory[] = []

  for (const category of mapped) {
    if (category.parentId && byId.has(category.parentId)) {
      byId.get(category.parentId)!.children.push(category)
    } else {
      roots.push(category)
    }
  }

  // Roll up child counts into parents for filter display
  for (const root of roots) {
    root.productCount += root.children.reduce((sum, child) => sum + child.productCount, 0)
  }

  return roots
}

function resolveCategoryIds(
  categories: ShopCategory[],
  slug?: string,
): { ids: string[] | null; active: ShopCategory | null } {
  if (!slug) return { ids: null, active: null }

  const flat: ShopCategory[] = []
  for (const root of categories) {
    flat.push(root, ...root.children)
  }

  const active = flat.find((category) => category.slug === slug) ?? null
  if (!active) return { ids: [], active: null }

  const ids = [active.id, ...active.children.map((child) => child.id)]
  return { ids, active }
}

export async function fetchShopCatalog(params: ShopCatalogParams = {}): Promise<ShopCatalogResult> {
  const supabase = await createClient()
  const page = Math.max(1, params.page ?? 1)
  const limit = Math.max(1, Math.min(48, params.limit ?? PRODUCTS_PER_PAGE))
  const from = (page - 1) * limit
  const to = from + limit - 1

  const categories = await fetchShopCategories()
  const { ids: categoryIds, active: activeCategory } = resolveCategoryIds(categories, params.category)

  // Unknown category slug → empty result
  if (params.category && categoryIds && categoryIds.length === 0) {
    return {
      products: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      categories,
      activeCategory: null,
    }
  }

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('is_active', true)

  if (categoryIds?.length) query = query.in('category_id', categoryIds)
  if (params.search?.trim()) {
    const term = params.search.trim()
    query = query.or(`name.ilike.%${term}%,short_description.ilike.%${term}%,sku.ilike.%${term}%`)
  }
  if (params.minPrice != null) query = query.gte('price', params.minPrice)
  if (params.maxPrice != null) query = query.lte('price', params.maxPrice)
  if (params.featured) query = query.eq('is_featured', true)
  if (params.inStock) query = query.eq('stock_status', 'in_stock')

  const sortBy = params.sortBy ?? 'newest'
  // Featured products rise first for default/featured sorts (admin priority)
  if (sortBy === 'price_asc') query = query.order('price', { ascending: true })
  else if (sortBy === 'price_desc') query = query.order('price', { ascending: false })
  else if (sortBy === 'most_viewed') {
    query = query.order('is_featured', { ascending: false }).order('view_count', { ascending: false })
  } else if (sortBy === 'best_rated') {
    query = query.order('is_featured', { ascending: false }).order('average_rating', { ascending: false })
  } else if (sortBy === 'oldest') {
    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: true })
  } else if (sortBy === 'featured') {
    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  } else {
    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  }

  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  const total = count ?? 0
  return {
    products: ((data ?? []) as unknown as RawProduct[]).map(mapShopProduct),
    total,
    page,
    limit,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    categories,
    activeCategory,
  }
}

export async function fetchFeaturedShopProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  const featured = ((data ?? []) as unknown as RawProduct[]).map(mapShopProduct)
  if (featured.length >= Math.min(4, limit)) return featured

  // Fallback: newest active products so homepage is never empty after first real product
  const { data: newest, error: newestError } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (newestError) throw newestError
  return ((newest ?? []) as unknown as RawProduct[]).map(mapShopProduct)
}

export async function fetchShopProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  // Best-effort view increment
  void supabase.rpc('increment_product_view', { product_slug: slug })

  return mapShopProduct(data as unknown as RawProduct)
}

export async function fetchRelatedShopProducts(
  categoryId: string,
  excludeId: string,
  limit = 4,
): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return ((data ?? []) as unknown as RawProduct[]).map(mapShopProduct)
}
