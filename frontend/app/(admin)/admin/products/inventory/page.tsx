import { fetchAdminCategoriesServer } from '@/lib/api/products-admin.server'
import { InventoryClient } from './inventory-client'

export default async function InventoryPage() {
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

  return <InventoryClient categories={categories} />
}
