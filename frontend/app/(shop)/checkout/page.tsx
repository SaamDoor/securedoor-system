import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchShopPaymentSettings } from '@/lib/shop/payment-settings.server'
import { SITE_NAME } from '@/lib/constants'
import { CheckoutClient } from './checkout-client'

export const metadata: Metadata = {
  title: `تسویه حساب | ${SITE_NAME}`,
  description: 'تکمیل سفارش و انتخاب روش پرداخت',
}

export default async function CheckoutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/checkout')
  }

  const [{ data: profile }, paymentSettings] = await Promise.all([
    supabase
      .from('users')
      .select('first_name, last_name, phone, email')
      .eq('id', user.id)
      .maybeSingle(),
    fetchShopPaymentSettings(),
  ])

  return (
    <CheckoutClient
      paymentSettings={paymentSettings}
      defaultProfile={{
        fullName: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim(),
        phone: profile?.phone ?? '',
        email: profile?.email ?? user.email ?? '',
      }}
    />
  )
}
