import { fetchAdminCategoriesServer, type AdminCategoryRow } from '@/lib/api/products-admin.server'
import { CategoriesClient } from './categories-client'

export default async function ProductCategoriesPage() {
  let error: string | undefined
  let categories: AdminCategoryRow[] = []

  try {
    categories = await fetchAdminCategoriesServer()
  } catch (err) {
    error = err instanceof Error ? err.message : 'دریافت دسته‌بندی‌ها ناموفق بود'
  }

  if (error) {
    return (
      <div dir="rtl" className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-black text-white">دسته‌بندی محصولات</h1>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-8 text-center text-sm text-red-400">
          {error}
        </div>
      </div>
    )
  }

  return <CategoriesClient initialCategories={categories} />
}
