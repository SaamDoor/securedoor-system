import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  type AdminProductImageInput,
  type AdminProductInput,
  type AdminProductSpecificationInput,
} from '@/lib/api/products'

function toProductRow(input: AdminProductInput) {
  const splitList = (value?: string | null) =>
    value
      ? value.split(/[,،]/).map((item) => item.trim()).filter(Boolean)
      : []

  return {
    name: input.name,
    slug: input.slug,
    sku: input.sku,
    category_id: input.category_id,
    brand: input.brand || null,
    short_description: input.short_description || null,
    description: input.description,
    body_content: input.body_content || null,
    tags: splitList(input.tags),
    price: input.price,
    compare_price: input.compare_price || null,
    cost_price: input.cost_price || null,
    stock: (input.stock_left ?? 0) + (input.stock_right ?? 0),
    stock_left: input.stock_left ?? 0,
    stock_right: input.stock_right ?? 0,
    low_stock_threshold: input.low_stock_threshold ?? 5,
    stock_status: input.stock_status,
    weight: input.weight || null,
    width: input.width || null,
    height: input.height || null,
    depth: input.depth || null,
    dimension_unit: input.dimension_unit ?? 'cm',
    dimension_options: [
      input.dimension_option_1,
      input.dimension_option_2,
      input.dimension_option_3,
    ].filter((item): item is string => Boolean(item?.trim())).map((item) => item.trim()),
    allow_custom_dimensions: input.allow_custom_dimensions ?? false,
    is_active: input.is_active,
    is_featured: input.is_featured,
    is_new: input.is_new,
    meta_title: input.meta_title || null,
    meta_description: input.meta_description || null,
    focus_keyword: input.focus_keyword || null,
    canonical_url: input.canonical_url || null,
    robots: input.robots || null,
    og_title: input.og_title || null,
    og_description: input.og_description || null,
    og_image_url: input.og_image_url || null,
    faq_pairs: input.faq_pairs ?? [],
    ai_summary: input.ai_summary || null,
    entity_keywords: splitList(input.entity_keywords),
    linked_frame_ids: input.linked_frame_ids ?? [],
  }
}

async function replaceProductImages(
  supabase: SupabaseClient,
  productId: string,
  images: AdminProductImageInput[],
) {
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

async function replaceProductSpecifications(
  supabase: SupabaseClient,
  productId: string,
  specifications: AdminProductSpecificationInput[],
) {
  const { error: deleteError } = await supabase
    .from('product_specifications')
    .delete()
    .eq('product_id', productId)
  if (deleteError) throw deleteError

  const rows = specifications
    .filter((item) => item.label.trim() && item.value.trim())
    .map((item, index) => ({
      product_id: productId,
      label: item.label.trim(),
      value: item.value.trim(),
      unit: item.unit?.trim() || null,
      group: item.group?.trim() || null,
      order: item.order ?? index,
    }))

  if (!rows.length) return
  const { error } = await supabase.from('product_specifications').insert(rows)
  if (error) throw error
}

export interface AdminCategoryRow {
  id: string
  parent_id: string | null
  name: string
  slug: string
  description: string | null
  order: number
  is_active: boolean
  products: { count: number }[]
}

export interface CategorySaveInput {
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  order: number
  is_active: boolean
}

async function getServerClient() {
  return createClient()
}

export async function fetchAdminProductsServer(search = '') {
  const supabase = await getServerClient()

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

export async function fetchAdminCategoriesServer() {
  const supabase = await getServerClient()

  const [{ data, error }, { data: productRows, error: productsError }] = await Promise.all([
    supabase
      .from('product_categories')
      .select('id, parent_id, name, slug, description, "order", is_active')
      .order('"order"', { ascending: true }),
    supabase.from('products').select('category_id'),
  ])

  if (error) throw error
  if (productsError) throw productsError

  const counts = new Map<string, number>()
  for (const product of productRows ?? []) {
    counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1)
  }

  return ((data ?? []) as Omit<AdminCategoryRow, 'products'>[]).map((category) => ({
    ...category,
    products: [{ count: counts.get(category.id) ?? 0 }],
  }))
}

export async function saveCategoryServer(editingId: string | undefined, payload: CategorySaveInput) {
  const supabase = await getServerClient()

  const { error } = editingId
    ? await supabase.from('product_categories').update(payload).eq('id', editingId)
    : await supabase.from('product_categories').insert(payload)

  if (error) throw error
}

export async function deleteCategoryServer(id: string) {
  const supabase = await getServerClient()
  const { error } = await supabase.from('product_categories').delete().eq('id', id)
  if (error) throw error
}

export async function createProductServer(
  input: AdminProductInput,
  images: AdminProductImageInput[] = [],
  specifications: AdminProductSpecificationInput[] = [],
) {
  const supabase = await getServerClient()

  const { data: product, error } = await supabase
    .from('products')
    .insert(toProductRow(input))
    .select('*')
    .single()

  if (error) throw error

  if (images.length) {
    await replaceProductImages(supabase, product.id, images)
  }
  if (specifications.length) {
    await replaceProductSpecifications(supabase, product.id, specifications)
  }

  return product
}

export async function updateProductServer(
  id: string,
  input: AdminProductInput,
  images?: AdminProductImageInput[],
  specifications?: AdminProductSpecificationInput[],
) {
  const supabase = await getServerClient()

  const { data: product, error } = await supabase
    .from('products')
    .update({ ...toProductRow(input), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error

  if (images) {
    await replaceProductImages(supabase, id, images)
  }
  if (specifications) {
    await replaceProductSpecifications(supabase, id, specifications)
  }

  return product
}
