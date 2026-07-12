import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductDetailClient, type ProductData } from './product-detail-client'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const row = await getProductRow(slug)
  const product = row ? {
    name: row.meta_title || row.name,
    description: row.meta_description || row.short_description || row.description,
    price: Number(row.price),
    image: row.og_image_url || row.images.find((image) => image.is_primary)?.url || row.images[0]?.url || `${SITE_URL}/og-image.jpg`,
  } : {
    name: 'محصول گروه صنعتی مشعوف',
    description: 'درب‌های ساختمانی با ساختار فولادی و ضمانت رسمی ۵ ساله',
    price: 0,
    image: `${SITE_URL}/og-image.jpg`,
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

  if (!slug) notFound()
  const row = await getProductRow(slug)

  return <ProductDetailClient slug={slug} initialProduct={row ? mapDetailProduct(row) : undefined} />
}

interface ProductRow {
  id: string
  sku: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  short_description: string | null
  description: string
  is_new: boolean
  is_featured: boolean
  stock_left: number
  stock_right: number
  dimension_options: string[]
  allow_custom_dimensions: boolean
  meta_title: string | null
  meta_description: string | null
  og_image_url: string | null
  category: { name: string; slug: string } | null
  images: { url: string; is_primary: boolean; order: number }[]
  specifications: { label: string; value: string; unit: string | null; group: string | null; order: number }[]
}

async function getProductRow(slug: string): Promise<ProductRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(`
      id, sku, name, slug, price, compare_price, short_description, description,
      is_new, is_featured, stock_left, stock_right, dimension_options,
      allow_custom_dimensions, meta_title, meta_description, og_image_url,
      category:product_categories(name, slug),
      images:product_images(url, is_primary, "order"),
      specifications:product_specifications(label, value, unit, "group", "order")
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  return data as unknown as ProductRow | null
}

function mapDetailProduct(row: ProductRow): ProductData {
  const images = row.images.slice().sort((a, b) => a.order - b.order)
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    comparePrice: row.compare_price ? Number(row.compare_price) : null,
    category: row.category ?? { name: 'محصولات', slug: 'products' },
    shortDescription: row.short_description ?? row.description.slice(0, 180),
    description: row.description,
    specs: row.specifications
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        label: item.label,
        value: item.value,
        unit: item.unit ?? undefined,
        group: item.group ?? 'مشخصات فنی',
      })),
    image: images.find((image) => image.is_primary)?.url || images[0]?.url || '/images/placeholder-product.webp',
    isNew: row.is_new,
    badge: row.is_featured ? 'ویژه' : null,
    stockLeft: row.stock_left,
    stockRight: row.stock_right,
    dimensionOptions: row.dimension_options ?? [],
    allowCustomDimensions: row.allow_custom_dimensions,
  }
}
