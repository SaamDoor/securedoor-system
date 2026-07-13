import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '../../product-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product, error }, { data: categories }, { data: framePrices }] = await Promise.all([
    supabase
      .from('products')
      .select('*, images:product_images(*), specifications:product_specifications(*)')
      .eq('id', id)
      .single(),
    supabase.from('product_categories').select('id, name, parent_id').eq('is_active', true).order('"order"', { ascending: true }),
    supabase
      .from('frame_price_list')
      .select('id, frame_type, color_name, price_3klaf')
      .eq('is_active', true)
      .order('sort_order'),
  ])

  if (error || !product) notFound()

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/admin/products" className="hover:text-white transition-colors">محصولات</Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-white">{product.name}</span>
      </div>

      <div>
        <h1 className="text-2xl font-black text-white">ویرایش محصول</h1>
        <p className="text-muted text-sm mt-1">{product.name}</p>
      </div>

      <ProductForm product={product} categories={categories ?? []} framePrices={framePrices ?? []} />
    </div>
  )
}
