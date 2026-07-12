import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '../product-form'

export default async function NewProductPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: framePrices }] = await Promise.all([
    supabase.from('product_categories').select('id, name, parent_id').eq('is_active', true).order('"order"'),
    supabase
      .from('frame_price_list')
      .select('id, frame_type, color_name, price_3klaf')
      .eq('is_active', true)
      .order('sort_order'),
  ])

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/admin/products" className="hover:text-white transition-colors">محصولات</Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-white">محصول جدید</span>
      </div>

      <div>
        <h1 className="text-2xl font-black text-white">افزودن محصول</h1>
        <p className="text-muted text-sm mt-1">اطلاعات محصول جدید را وارد کنید</p>
      </div>

      <ProductForm categories={categories ?? []} framePrices={framePrices ?? []} />
    </div>
  )
}
