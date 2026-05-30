import { createClient } from '@/lib/supabase/client'
import type { Product, ProductFilter } from '@/types'

export async function getProducts(filter: ProductFilter = {}) {
  const supabase = createClient()

  let query = supabase
    .from('products')
    .select(`
      *,
      category:product_categories(*),
      images:product_images(*),
      attributes:product_attribute_values(*, attribute:product_attributes(*)),
      specifications:product_specifications(*),
      downloads:product_downloads(*)
    `)
    .eq('is_active', true)

  if (filter.categoryId) query = query.eq('category_id', filter.categoryId)
  if (filter.minPrice) query = query.gte('price', filter.minPrice)
  if (filter.maxPrice) query = query.lte('price', filter.maxPrice)
  if (filter.isFeatured !== undefined) query = query.eq('is_featured', filter.isFeatured)
  if (filter.inStock) query = query.gt('stock', 0)
  if (filter.search) {
    query = query.or(`name.ilike.%${filter.search}%,short_description.ilike.%${filter.search}%`)
  }

  switch (filter.sortBy) {
    case 'price_asc': query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'most_viewed': query = query.order('view_count', { ascending: false }); break
    case 'best_rated': query = query.order('average_rating', { ascending: false }); break
    case 'oldest': query = query.order('created_at', { ascending: true }); break
    default: query = query.order('created_at', { ascending: false })
  }

  const page = filter.page ?? 1
  const limit = filter.limit ?? 12
  query = query.range((page - 1) * limit, page * limit - 1)

  const { data, error, count } = await query

  if (error) throw error

  return {
    products: (data ?? []) as unknown as Product[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export async function getProductBySlug(slug: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:product_categories(*),
      images:product_images(*),
      attributes:product_attribute_values(*, attribute:product_attributes(*)),
      specifications:product_specifications(*),
      downloads:product_downloads(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) throw error

  // Increment view count asynchronously
  supabase.rpc('increment_product_view', { product_slug: slug }).then(() => {})

  return data as unknown as Product
}

export async function getFeaturedProducts(limit = 8) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, compare_price, stock_status,
      average_rating, review_count, is_new, is_featured,
      category:product_categories(name, slug),
      images:product_images(url, alt, is_primary, "order")
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as unknown as Product[]
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, compare_price, stock_status,
      average_rating, review_count, is_new,
      images:product_images(url, alt, is_primary)
    `)
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(limit)

  if (error) throw error
  return data as unknown as Product[]
}

export async function getCategories() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('is_active', true)
    .order('"order"', { ascending: true })

  if (error) throw error
  return data
}
