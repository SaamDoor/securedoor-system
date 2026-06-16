import { createClient } from '@/lib/supabase/client'
import type { SupportTicket, TicketMessage, TicketPriority, TicketStatus } from '@/types'

export interface CreateTicketInput {
  subject: string
  message: string
  orderId?: string
  priority?: TicketPriority
}

async function getCurrentUserId(): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw error ?? new Error('Not authenticated')
  return data.user.id
}

/** Creates a new support ticket and its opening message for the current user. */
export async function createTicket(input: CreateTicketInput): Promise<SupportTicket> {
  const supabase = createClient()
  const userId = await getCurrentUserId()

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: userId,
      order_id: input.orderId,
      subject: input.subject,
      priority: input.priority ?? 'normal',
    })
    .select('*')
    .single()

  if (error) throw error

  const { error: msgError } = await supabase.from('ticket_messages').insert({
    ticket_id: ticket.id,
    sender_id: userId,
    message: input.message,
  })

  if (msgError) throw msgError

  return ticket as unknown as SupportTicket
}

/** Lists the current user's own tickets, most recent first. */
export async function getUserTickets(): Promise<SupportTicket[]> {
  const supabase = createClient()
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as SupportTicket[]
}

/** Fetches every ticket for staff dashboards (support / admin / super_admin RLS). */
export async function getAllTickets(status?: TicketStatus): Promise<SupportTicket[]> {
  const supabase = createClient()

  let query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data as unknown as SupportTicket[]
}

/** Fetches the message thread for a single ticket, oldest first. */
export async function getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as unknown as TicketMessage[]
}

/** Adds a reply to a ticket — used by both the customer and staff. */
export async function replyToTicket(
  ticketId: string,
  message: string,
  isInternal = false,
): Promise<TicketMessage> {
  const supabase = createClient()
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('ticket_messages')
    .insert({ ticket_id: ticketId, sender_id: userId, message, is_internal: isInternal })
    .select('*')
    .single()

  if (error) throw error
  return data as unknown as TicketMessage
}

/** Updates ticket status/assignment — staff only (enforced by RLS). */
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
): Promise<SupportTicket> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status, resolved_at: status === 'resolved' ? new Date().toISOString() : null })
    .eq('id', ticketId)
    .select('*')
    .single()

  if (error) throw error
  return data as unknown as SupportTicket
}
