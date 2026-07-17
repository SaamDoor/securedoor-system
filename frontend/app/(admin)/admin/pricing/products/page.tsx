import { fetchAdminCategoriesServer } from '@/lib/api/products-admin.server'
import { PricingClient } from './pricing-client'

export default async function ProductPricingPage() {
  let categories: { id: string; name: string; parent_id: string | null }[] = []
  try {
    const rows = await fetchAdminCategoriesServer()
    categories = rows.map((c) => ({
      id: c.id,
      name: c.name,
      parent_id: c.parent_id,
    }))
  } catch {
    categories = []
  }

  return (
    <div className="min-h-screen p-1 sm:p-2">
      <PricingClient categories={categories} />
    </div>
  )
}
