import { createClient } from '@/lib/supabase/client'
import type { Product, ProductFilter, StockStatus } from '@/types'

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

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN CRUD
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminProductImageInput {
  url: string
  alt?: string
  isPrimary?: boolean
  order?: number
}

export interface AdminProductInput {
  name: string
  slug: string
  sku: string
  category_id: string
  short_description?: string | null
  description: string
  price: number
  compare_price?: number | '' | null
  stock: number
  stock_status: StockStatus
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  meta_title?: string | null
  meta_description?: string | null
  linked_frame_ids?: string[]
}

function toProductRow(input: AdminProductInput) {
  return {
    name: input.name,
    slug: input.slug,
    sku: input.sku,
    category_id: input.category_id,
    short_description: input.short_description || null,
    description: input.description,
    price: input.price,
    compare_price: input.compare_price || null,
    stock: input.stock,
    stock_status: input.stock_status,
    is_active: input.is_active,
    is_featured: input.is_featured,
    is_new: input.is_new,
    meta_title: input.meta_title || null,
    meta_description: input.meta_description || null,
    linked_frame_ids: input.linked_frame_ids ?? [],
  }
}

/** Replaces a product's image set — deletes existing rows then inserts the new ones. */
async function replaceProductImages(productId: string, images: AdminProductImageInput[]) {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('product_images')
    .delete()
    .eq('product_id', productId)
  if (deleteError) throw deleteError

  if (!images.length) return

  const rows = images.map((img, idx) => ({
    product_id: productId,
    url: img.url,
    alt: img.alt ?? null,
    is_primary: img.isPrimary ?? idx === 0,
    order: img.order ?? idx,
  }))

  const { error: insertError } = await supabase.from('product_images').insert(rows)
  if (insertError) throw insertError
}

/** Fetches the full product list for the admin table — no `is_active` filter. */
export async function getAdminProducts(search = '') {
  const supabase = createClient()

  let query = supabase
    .from('products')
    .select(`
      id, sku, name, price, stock, stock_status, is_active, is_featured, view_count, created_at,
      category:product_categories(id, name),
      images:product_images(url, is_primary)
    `)
    .order('created_at', { ascending: false })

  if (search.trim()) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

/** Fetches a single product (with its images) for the edit form. */
export async function getAdminProductById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createProduct(input: AdminProductInput, images: AdminProductImageInput[] = []) {
  const supabase = createClient()

  const { data: product, error } = await supabase
    .from('products')
    .insert(toProductRow(input))
    .select('*')
    .single()

  if (error) throw error

  if (images.length) {
    await replaceProductImages(product.id, images)
  }

  return product
}

export async function updateProduct(
  id: string,
  input: AdminProductInput,
  images?: AdminProductImageInput[],
) {
  const supabase = createClient()

  const { data: product, error } = await supabase
    .from('products')
    .update({ ...toProductRow(input), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error

  if (images) {
    await replaceProductImages(id, images)
  }

  return product
}

export async function deleteProduct(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

/** Uploads images to the public `products` storage bucket and returns their public URLs. */
export async function uploadProductImages(files: File[]): Promise<string[]> {
  const supabase = createClient()
  const urls: string[] = []

  for (const file of files) {
    const ext = file.name.split('.').pop()
    const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage.from('products').upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
    })
    if (error) throw error

    const { data } = supabase.storage.from('products').getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return urls
}

/** Fetches active frame price rows for the product-form's frame-linking section. */
export async function getFramePriceOptions() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('frame_price_list')
    .select('id, frame_type, color_name, price_3klaf')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
}
