import { createClient } from '@/lib/supabase/client'
import type { PayoutRequest, Wallet, WalletTransaction } from '@/types'

export interface RequestPayoutInput {
  amount: number
  method: 'iban' | 'wallet_credit' | 'card'
  iban?: string
  bankName?: string
  accountHolder?: string
  userNote?: string
}

async function getCurrentUserId(): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw error ?? new Error('Not authenticated')
  return data.user.id
}

/** Fetches the wallet belonging to the current user. */
export async function getWalletBalance(): Promise<Wallet> {
  const supabase = createClient()
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data as unknown as Wallet
}

/** Paginated transaction history for the current user's wallet. */
export async function getWalletTransactions(page = 1, limit = 20) {
  const supabase = createClient()
  const userId = await getCurrentUserId()

  const { data, error, count } = await supabase
    .from('wallet_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) throw error

  return {
    transactions: (data ?? []) as unknown as WalletTransaction[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

/** Submits a payout request against the current user's wallet. */
export async function requestPayout(input: RequestPayoutInput): Promise<PayoutRequest> {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  const wallet = await getWalletBalance()

  const { data, error } = await supabase
    .from('payout_requests')
    .insert({
      user_id: userId,
      wallet_id: wallet.id,
      amount: input.amount,
      method: input.method,
      iban: input.iban,
      bank_name: input.bankName,
      account_holder: input.accountHolder,
      user_note: input.userNote,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as unknown as PayoutRequest
}

/** Lists the current user's own payout requests, most recent first. */
export async function getPayoutRequests(): Promise<PayoutRequest[]> {
  const supabase = createClient()
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false })

  if (error) throw error
  return data as unknown as PayoutRequest[]
}
