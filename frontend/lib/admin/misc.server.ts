import { createClient } from '@/lib/supabase/server'
import type { SettingKey } from '@/types/dashboard'

export async function fetchAllSettingsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('settings').select('*').order('group')
  if (error) throw error
  return data ?? []
}

export async function upsertSettingsServer(entries: { key: SettingKey | string; value: unknown; group?: string }[]) {
  const supabase = await createClient()
  const rows = entries.map((e) => ({
    key: e.key,
    value: e.value,
    group: e.group ?? 'general',
    updated_at: new Date().toISOString(),
  }))
  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' })
  if (error) throw error
}

export async function fetchMediaServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('media_library').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function saveMediaServer(input: Record<string, unknown>, id?: string) {
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('media_library').update(input).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from('media_library').insert(input).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function fetchProductReviewsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*, product:products(name), user:users(first_name, last_name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function setReviewApprovedServer(id: string, isApproved: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('product_reviews').update({
    is_approved: isApproved,
    approved_at: isApproved ? new Date().toISOString() : null,
  }).eq('id', id)
  if (error) throw error
}

export async function fetchWebhooksServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('webhooks').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function saveWebhookServer(input: Record<string, unknown>, id?: string) {
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('webhooks').update(input).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from('webhooks').insert(input).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function fetchWebhookLogsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('webhook_logs')
    .select('*, webhook:webhooks(name)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw error
  return data ?? []
}

export async function fetchFramePricesServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('frame_price_list').select('*').order('frame_type')
  if (error) throw error
  return data ?? []
}

export async function fetchBuilderTiersServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('builder_tier_config').select('*').order('min_orders')
  if (error) throw error
  return data ?? []
}

export async function fetchPayoutsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payout_requests')
    .select('*, user:users(first_name, last_name, email)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchInvoicesServer() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, order:orders(order_number, user:users(first_name, last_name))')
    .order('issued_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
