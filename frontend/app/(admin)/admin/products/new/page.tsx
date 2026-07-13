import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '../product-form'

export default async function NewProductPage() {
  const supabase = await createClient()

  const [
    { data: categories, error: categoriesError },
    { data: framePrices, error: framePricesError },
  ] = await Promise.all([
    supabase.from('product_categories').select('id, name, parent_id').eq('is_active', true).order('"order"', { ascending: true }),
    supabase
      .from('frame_price_list')
      .select('id, frame_type, color_name, price_3klaf')
      .eq('is_active', true)
      .order('sort_order'),
  ])

  // #region agent log
  fetch('http://127.0.0.1:7589/ingest/5a232d27-556f-403d-98b2-82415887fe5c',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8b5927'},body:JSON.stringify({sessionId:'8b5927',runId:'pre-fix',hypothesisId:'H4',location:'products/new/page.tsx',message:'new product page data fetch',data:{categoryCount:categories?.length??0,categoriesError:categoriesError?.message??null,framePricesError:framePricesError?.message??null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

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
