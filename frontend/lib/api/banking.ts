import { createClient } from '@/lib/supabase/client'

export interface BankAccount {
  id: string
  bank_name: string
  account_holder: string
  account_number: string | null
  card_number: string | null
  iban: string | null
  branch_name: string | null
  description: string | null
  is_active: boolean
  is_verified: boolean
  display_order: number
  created_at: string
}

export interface BankTransferReceipt {
  id: string
  user_id: string
  bank_account_id: string
  order_id: string | null
  amount: number
  transferred_at: string
  tracking_code: string | null
  receipt_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  user_note: string | null
  admin_note: string | null
  created_at: string
  bank_account?: Pick<BankAccount, 'bank_name' | 'account_holder' | 'card_number' | 'iban'>
  user?: { first_name: string; last_name: string; phone: string | null }
}

export type BankAccountInput = Pick<
  BankAccount,
  'bank_name' | 'account_holder' | 'account_number' | 'card_number' | 'iban' |
  'branch_name' | 'description' | 'display_order'
>

export async function getVisibleBankAccounts(): Promise<BankAccount[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('is_active', true)
    .eq('is_verified', true)
    .order('display_order')
  if (error) throw error
  return data as BankAccount[]
}

export async function getAdminBankAccounts(): Promise<BankAccount[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .order('display_order')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as BankAccount[]
}

export async function createBankAccount(input: BankAccountInput): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('ابتدا وارد حساب مدیریت شوید')
  const { error } = await supabase.from('bank_accounts').insert({
    ...input,
    account_number: input.account_number || null,
    card_number: input.card_number?.replace(/\D/g, '') || null,
    iban: input.iban?.replace(/\s/g, '').toUpperCase() || null,
    branch_name: input.branch_name || null,
    description: input.description || null,
    created_by: user.id,
  })
  if (error) throw error
}

export async function setBankAccountVisibility(
  id: string,
  isVerified: boolean,
  isActive: boolean,
): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('ابتدا وارد حساب مدیریت شوید')
  const { error } = await supabase
    .from('bank_accounts')
    .update({
      is_verified: isVerified,
      is_active: isVerified ? isActive : false,
      verified_by: isVerified ? user.id : null,
      verified_at: isVerified ? new Date().toISOString() : null,
    })
    .eq('id', id)
  if (error) throw error
}

export async function getAdminBankTransferReceipts(): Promise<BankTransferReceipt[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bank_transfer_receipts')
    .select(`
      *,
      bank_account:bank_accounts(bank_name, account_holder, card_number, iban),
      user:users(first_name, last_name, phone)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as BankTransferReceipt[]
}

export async function getMyBankTransferReceipts(): Promise<BankTransferReceipt[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('ابتدا وارد حساب کاربری شوید')
  const { data, error } = await supabase
    .from('bank_transfer_receipts')
    .select('*, bank_account:bank_accounts(bank_name, account_holder, card_number, iban)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as BankTransferReceipt[]
}

export async function submitBankTransfer(input: {
  bankAccountId: string
  amount: number
  transferredAt: string
  trackingCode?: string
  orderId?: string
  userNote?: string
  receiptFile?: File
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('ابتدا وارد حساب کاربری شوید')

  let receiptPath: string | null = null
  if (input.receiptFile) {
    const extension = input.receiptFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    receiptPath = `${user.id}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from('payment-receipts')
      .upload(receiptPath, input.receiptFile, { upsert: false })
    if (uploadError) throw uploadError
  }

  const { error } = await supabase.from('bank_transfer_receipts').insert({
    user_id: user.id,
    bank_account_id: input.bankAccountId,
    order_id: input.orderId || null,
    amount: input.amount,
    transferred_at: new Date(input.transferredAt).toISOString(),
    tracking_code: input.trackingCode?.trim() || null,
    receipt_url: receiptPath,
    user_note: input.userNote?.trim() || null,
  })
  if (error) throw error
}

export async function reviewBankTransfer(
  id: string,
  status: 'approved' | 'rejected',
  adminNote: string,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('bank_transfer_receipts')
    .update({ status, admin_note: adminNote.trim() || null })
    .eq('id', id)
    .eq('status', 'pending')
  if (error) throw error
}

export async function getReceiptSignedUrl(path: string): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from('payment-receipts')
    .createSignedUrl(path, 300)
  if (error) throw error
  return data.signedUrl
}
