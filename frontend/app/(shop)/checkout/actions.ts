'use server'

import { createShopOrder } from '@/lib/shop/orders.server'
import type { CreateOrderInput } from '@/lib/shop/checkout.types'

export async function placeOrderAction(input: CreateOrderInput) {
  try {
    const result = await createShopOrder(input)
    return { ok: true as const, data: result }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'ثبت سفارش ناموفق بود',
    }
  }
}
