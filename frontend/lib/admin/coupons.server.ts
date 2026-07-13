import { createClient } from '@/lib/supabase/server'

export interface CouponRow {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  usage_limit: number | null
  usage_count: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
}

export async function fetchCouponsServer() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as CouponRow[]
}

export async function saveCouponServer(input: Partial<CouponRow> & { code: string; type: string; value: number }, id?: string) {
  const supabase = await createClient()
  if (id) {
    const { error } = await supabase.from('coupons').update(input).eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase.from('coupons').insert(input).select('id').single()
  if (error) throw error
  return data.id as string
}

export async function deleteCouponServer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) throw error
}
