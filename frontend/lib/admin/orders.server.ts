import { createClient } from '@/lib/supabase/server'
import type { OrderStatus, PaymentStatus } from '@/types'

export interface AdminOrderRow {
  id: string
  order_number: string
  status: OrderStatus
  payment_status: PaymentStatus
  total: number
  created_at: string
  user: { first_name: string | null; last_name: string | null; phone: string | null; email: string } | null
  items: { id: string }[] | null
}

export async function fetchAdminOrdersServer(search = '', status?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('orders')
    .select(`
      id, order_number, status, payment_status, total, created_at,
      user:users(first_name, last_name, phone, email),
      items:order_items(id)
    `)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)
  if (search.trim()) query = query.or(`order_number.ilike.%${search}%,customer_note.ilike.%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as AdminOrderRow[]
}

export async function updateOrderStatusServer(orderId: string, status: OrderStatus, note?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
  if (error) throw error

  await supabase.from('order_status_history').insert({
    order_id: orderId,
    status,
    note: note ?? null,
    created_by: user?.id ?? null,
  })
}

export async function fetchOrderReturnsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('order_returns')
    .select(`
      id, reason, status, refund_amount, created_at,
      order:orders(order_number, total),
      user:users(first_name, last_name, phone)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function updateReturnStatusServer(id: string, status: string, adminNote?: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('order_returns')
    .update({ status, admin_note: adminNote ?? null })
    .eq('id', id)
  if (error) throw error
}

export async function fetchShippingMethodsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('shipping_methods')
    .select('*')
    .order('order', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function saveShippingMethodServer(input: Record<string, unknown>, id?: string) {
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('shipping_methods').update(input).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from('shipping_methods').insert(input).select('id').single()
  if (error) throw error
  return data.id as string
}
