import { createClient } from '@/lib/supabase/server'
import type { ShopPaymentSettings } from '@/lib/shop/checkout.types'

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (value == null) return fallback
  return String(value)
}

function asBool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  return fallback
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export async function fetchShopPaymentSettings(): Promise<ShopPaymentSettings> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', [
      'payment_enable_online',
      'payment_enable_digipay',
      'payment_enable_snappay',
      'payment_enable_bank_transfer',
      'payment_enable_card_to_card',
      'payment_enable_cod',
      'payment_bank_name',
      'payment_account_holder',
      'payment_account_number',
      'payment_iban',
      'payment_card_number',
      'payment_bank_instructions',
      'tax_rate_percent',
    ])

  if (error) throw error

  const map = new Map((data ?? []).map((row) => [row.key as string, row.value]))

  return {
    enableOnline: asBool(map.get('payment_enable_online'), true),
    enableDigipay: asBool(map.get('payment_enable_digipay'), true),
    enableSnappay: asBool(map.get('payment_enable_snappay'), true),
    enableBankTransfer: asBool(map.get('payment_enable_bank_transfer'), true),
    enableCardToCard: asBool(map.get('payment_enable_card_to_card'), true),
    enableCod: asBool(map.get('payment_enable_cod'), false),
    taxRatePercent: asNumber(map.get('tax_rate_percent'), 9),
    bank: {
      bankName: asString(map.get('payment_bank_name'), 'بانک ملت'),
      accountHolder: asString(map.get('payment_account_holder'), 'گروه صنعتی مشعوف'),
      accountNumber: asString(map.get('payment_account_number')),
      iban: asString(map.get('payment_iban')),
      cardNumber: asString(map.get('payment_card_number')),
      instructions: asString(
        map.get('payment_bank_instructions'),
        'پس از واریز، شماره پیگیری را برای پشتیبانی ارسال کنید. شناسه واریز = شماره سفارش.',
      ),
    },
  }
}
