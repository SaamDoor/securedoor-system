import { fetchAdminProductsServer } from '@/lib/api/products-admin.server'
import { ProductsClient, type AdminProductRow } from './products-client'

export default async function AdminProductsPage() {
  let products: AdminProductRow[] = []
  let error: string | undefined

  try {
    products = (await fetchAdminProductsServer()) as unknown as AdminProductRow[]
  } catch (err) {
    error = err instanceof Error ? err.message : 'خطا در بارگذاری محصولات'
  }

  if (error) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-black text-white">مدیریت محصولات</h1>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-8 text-center text-sm text-red-400">
          {error}
        </div>
      </div>
    )
  }

  return <ProductsClient initialProducts={products} />
}
