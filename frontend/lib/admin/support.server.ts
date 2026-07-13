import { createClient } from '@/lib/supabase/server'

export async function fetchSupportTicketsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*, user:users(first_name, last_name, email, phone)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function updateTicketStatusServer(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id)
  if (error) throw error
}

export async function fetchBulkQuotesServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('bulk_quotes').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchKbArticlesServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('kb_articles').select('*').order('title')
  if (error) throw error
  return data ?? []
}

export async function fetchMessageTemplatesServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('message_templates').select('*').order('name')
  if (error) throw error
  return data ?? []
}

export async function fetchContactMessagesServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function markContactMessageReadServer(id: string, reply?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('contact_messages').update({
    is_read: true,
    is_replied: Boolean(reply),
    reply: reply ?? null,
    replied_by: reply ? user?.id : null,
    replied_at: reply ? new Date().toISOString() : null,
  }).eq('id', id)
  if (error) throw error
}
