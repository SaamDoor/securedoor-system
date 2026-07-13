import { fetchAdminOrdersServer } from '@/lib/admin/orders.server'
import { OrdersClient } from './orders-client'

export default async function AdminOrdersPage() {
  let orders: Awaited<ReturnType<typeof fetchAdminOrdersServer>> = []
  let error: string | null = null
  try {
    orders = await fetchAdminOrdersServer()
  } catch (e) {
    error = e instanceof Error ? e.message : 'خطا در بارگذاری سفارشات'
  }
  return <OrdersClient initialOrders={orders} initialError={error} />
}
