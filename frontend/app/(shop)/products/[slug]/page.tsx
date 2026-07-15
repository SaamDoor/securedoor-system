import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchRelatedShopProducts } from '@/lib/shop/catalog.server'
import { decodeProductParam, isProductUuid } from '@/lib/shop/product-path'
import { ProductDetailClient, type ProductDetailData, type RelatedProductCard } from './product-detail-client'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

interface ProductRow {
  id: string
  sku: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  short_description: string | null
  description: string | null
  is_new: boolean
  is_featured: boolean
  is_active: boolean
  stock_left: number | null
  stock_right: number | null
  dimension_options: string[] | null
  allow_custom_dimensions: boolean | null
  meta_title: string | null
  meta_description: string | null
  og_image_url: string | null
  category_id: string
  tags: string[] | null
  category: { name: string; slug: string } | null
  images: { url: string; alt: string | null; is_primary: boolean; order: number }[] | null
  specifications: { label: string; value: string; unit: string | null; group: string | null; order: number }[] | null
}

const PRODUCT_SELECT = `
  id, sku, name, slug, price, compare_price, short_description, description,
  is_new, is_featured, is_active, stock_left, stock_right, dimension_options,
  allow_custom_dimensions, meta_title, meta_description, og_image_url, category_id, tags,
  category:product_categories(name, slug),
  images:product_images(url, alt, is_primary, "order"),
  specifications:product_specifications(label, value, unit, "group", "order")
`

async function getProductRow(param: string): Promise<ProductRow | null> {
  const key = decodeProductParam(param)
  if (!key) return null

  const supabase = await createClient()
  let query = supabase.from('products').select(PRODUCT_SELECT).eq('is_active', true)

  if (isProductUuid(key)) {
    query = query.eq('id', key)
  } else {
    query = query.eq('slug', key)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error('[product-detail] lookup failed', { key, error })
    return null
  }

  if (data) return data as unknown as ProductRow

  // Fallbacks: sku, or slug without decoding quirks
  const { data: bySku, error: skuError } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('sku', key)
    .maybeSingle()

  if (skuError) {
    console.error('[product-detail] sku lookup failed', { key, skuError })
    return null
  }

  return (bySku as unknown as ProductRow | null) ?? null
}

function mapDetailProduct(row: ProductRow): ProductDetailData {
  const description = row.description ?? ''
  const images = (row.images ?? [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .filter((image) => Boolean(image.url) && !image.url.startsWith('/products/'))
    .map((image) => ({
      url: image.url,
      alt: image.alt ?? row.name,
    }))

  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    comparePrice: row.compare_price ? Number(row.compare_price) : null,
    category: row.category ?? { name: 'محصولات', slug: '' },
    shortDescription: row.short_description ?? description.slice(0, 180),
    description,
    tags: row.tags ?? [],
    specs: (row.specifications ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        label: item.label,
        value: item.value,
        unit: item.unit ?? undefined,
        group: item.group ?? 'مشخصات فنی',
      })),
    images,
    isNew: row.is_new,
    isFeatured: row.is_featured,
    stockLeft: row.stock_left ?? 0,
    stockRight: row.stock_right ?? 0,
    dimensionOptions: row.dimension_options ?? [],
    allowCustomDimensions: row.allow_custom_dimensions ?? false,
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const row = await getProductRow(slug)

  if (!row) {
    return { title: `محصول یافت نشد | ${SITE_NAME}` }
  }

  const images = row.images ?? []
  const primaryImage =
    row.og_image_url ||
    images.find((image) => image.is_primary)?.url ||
    images[0]?.url ||
    `${SITE_URL}/og-image.jpg`

  const title = row.meta_title || row.name
  const description = row.meta_description || row.short_description || row.description || ''

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: primaryImage }],
      type: 'website',
    },
    other: {
      'product:price:amount': String(row.price),
      'product:price:currency': 'IRR',
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  if (!slug) notFound()

  const row = await getProductRow(slug)
  if (!row) notFound()

  const supabase = await createClient()
  void supabase.rpc('increment_product_view', { product_slug: row.slug })

  const relatedRaw = await fetchRelatedShopProducts(row.category_id, row.id, 4).catch(() => [])
  const related: RelatedProductCard[] = relatedRaw.map((product) => {
    const primary = product.images.find((img) => img.isPrimary) ?? product.images[0]
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: primary?.url ?? null,
      category: product.category.name,
    }
  })

  return <ProductDetailClient product={mapDetailProduct(row)} related={related} />
}
