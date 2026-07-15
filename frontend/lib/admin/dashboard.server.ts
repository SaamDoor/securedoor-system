import { createClient } from '@/lib/supabase/server'

export async function fetchDashboardStatsServer() {
  const supabase = await createClient()

  const [
    ordersRes,
    productsRes,
    usersRes,
    revenueRes,
    ticketsRes,
    reviewsRes,
  ] = await Promise.all([
    supabase.from('orders').select('id, order_number, status, total, created_at', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('total').eq('payment_status', 'paid'),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('product_reviews').select('id', { count: 'exact', head: true }).eq('is_approved', false),
  ])

  const orders = ordersRes.data ?? []
  const revenue = (revenueRes.data ?? []).reduce((sum, o) => sum + Number(o.total ?? 0), 0)

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return {
    orderCount: ordersRes.count ?? orders.length,
    productCount: productsRes.count ?? 0,
    userCount: usersRes.count ?? 0,
    revenue,
    openTickets: ticketsRes.count ?? 0,
    pendingReviews: reviewsRes.count ?? 0,
    recentOrders,
    ordersByStatus: orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1
      return acc
    }, {}),
  }
}

export async function fetchAuditLogsServer(limit = 100) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, user:users(first_name, last_name, email)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function writeAuditLogServer(action: string, resource: string, resourceId?: string, newValue?: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('audit_logs').insert({
    user_id: user?.id ?? null,
    action,
    resource,
    resource_id: resourceId ?? null,
    new_value: newValue ?? null,
  })
}
