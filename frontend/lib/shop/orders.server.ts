import { createClient } from '@/lib/supabase/server'
import type { CreateOrderInput, ShopPaymentMethod } from '@/lib/shop/checkout.types'
import { fetchShopPaymentSettings } from '@/lib/shop/payment-settings.server'

export interface CreatedOrderResult {
  orderId: string
  orderNumber: string
  total: number
  paymentMethod: ShopPaymentMethod
  paymentStatus: 'pending' | 'paid'
  nextStep: 'await_transfer' | 'await_installment' | 'await_gateway' | 'cod' | 'done'
}

function generateOrderNumber() {
  const stamp = Date.now().toString().slice(-8)
  const rand = Math.floor(Math.random() * 900 + 100)
  return `MSH-${stamp}${rand}`
}

function isMethodEnabled(method: ShopPaymentMethod, settings: Awaited<ReturnType<typeof fetchShopPaymentSettings>>) {
  switch (method) {
    case 'online':
      return settings.enableOnline
    case 'digipay':
      return settings.enableDigipay
    case 'snappay':
      return settings.enableSnappay
    case 'bank_transfer':
      return settings.enableBankTransfer
    case 'card_to_card':
      return settings.enableCardToCard
    case 'cash_on_delivery':
      return settings.enableCod
    default:
      return false
  }
}

function nextStepFor(method: ShopPaymentMethod): CreatedOrderResult['nextStep'] {
  if (method === 'bank_transfer' || method === 'card_to_card') return 'await_transfer'
  if (method === 'digipay' || method === 'snappay') return 'await_installment'
  if (method === 'online') return 'await_gateway'
  if (method === 'cash_on_delivery') return 'cod'
  return 'done'
}

export async function createShopOrder(input: CreateOrderInput): Promise<CreatedOrderResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('برای ثبت سفارش ابتدا وارد حساب شوید')

  if (!input.items.length) throw new Error('سبد خرید خالی است')
  if (!input.shippingAddress.fullName.trim()) throw new Error('نام گیرنده الزامی است')
  if (!input.shippingAddress.phone.trim()) throw new Error('شماره تماس الزامی است')
  if (!input.shippingAddress.address.trim()) throw new Error('آدرس الزامی است')
  if (!input.shippingAddress.city.trim() || !input.shippingAddress.province.trim()) {
    throw new Error('استان و شهر الزامی است')
  }

  const settings = await fetchShopPaymentSettings()
  if (!isMethodEnabled(input.paymentMethod, settings)) {
    throw new Error('این روش پرداخت فعلاً فعال نیست')
  }

  // Validate products exist & are active; use DB prices for safety
  const productIds = input.items.map((item) => item.productId)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, slug, sku, price, is_active')
    .in('id', productIds)

  if (productsError) throw productsError

  const byId = new Map((products ?? []).map((p) => [p.id as string, p]))
  for (const item of input.items) {
    const product = byId.get(item.productId)
    if (!product || !product.is_active) {
      throw new Error(`محصول «${item.name}» در دسترس نیست`)
    }
  }

  const lines = input.items.map((item) => {
    const product = byId.get(item.productId)!
    const unitPrice = Number(product.price)
    const quantity = Math.max(1, Math.floor(item.quantity))
    return {
      product_id: item.productId,
      quantity,
      unit_price: unitPrice,
      total_price: unitPrice * quantity,
      discount: 0,
      product_snapshot: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        image: item.image ?? null,
        options: item.options ?? {},
      },
    }
  })

  const subtotal = lines.reduce((sum, line) => sum + line.total_price, 0)
  const shippingCost = subtotal >= 5_000_000 ? 0 : 350_000
  const tax = Math.round(subtotal * (settings.taxRatePercent / 100))
  const total = subtotal + shippingCost + tax
  const orderNumber = generateOrderNumber()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      status: 'pending',
      payment_status: 'pending',
      payment_method: input.paymentMethod,
      shipping_address: {
        full_name: input.shippingAddress.fullName.trim(),
        phone: input.shippingAddress.phone.trim(),
        province: input.shippingAddress.province.trim(),
        city: input.shippingAddress.city.trim(),
        address: input.shippingAddress.address.trim(),
        postal_code: input.shippingAddress.postalCode?.trim() || null,
      },
      subtotal,
      discount: 0,
      shipping_cost: shippingCost,
      tax,
      total,
      customer_note: [
        input.customerNote?.trim(),
        input.transferRef?.trim() ? `کد پیگیری واریز: ${input.transferRef.trim()}` : null,
      ]
        .filter(Boolean)
        .join('\n') || null,
    })
    .select('id, order_number, total')
    .single()

  if (orderError) throw orderError

  const { error: itemsError } = await supabase.from('order_items').insert(
    lines.map((line) => ({ ...line, order_id: order.id })),
  )
  if (itemsError) throw itemsError

  const gateway =
    input.paymentMethod === 'online'
      ? 'zarinpal'
      : input.paymentMethod === 'digipay'
        ? 'digipay'
        : input.paymentMethod === 'snappay'
          ? 'snappay'
          : input.paymentMethod === 'bank_transfer' || input.paymentMethod === 'card_to_card'
            ? 'manual_bank'
            : 'cod'

  const { error: paymentError } = await supabase.from('payments').insert({
    order_id: order.id,
    amount: total,
    method: input.paymentMethod,
    status: 'pending',
    gateway,
    gateway_ref: input.transferRef?.trim() || null,
    gateway_response: {
      source: 'checkout',
      created_via: 'shop_checkout',
    },
  })
  if (paymentError) throw paymentError

  return {
    orderId: order.id as string,
    orderNumber: order.order_number as string,
    total: Number(order.total),
    paymentMethod: input.paymentMethod,
    paymentStatus: 'pending',
    nextStep: nextStepFor(input.paymentMethod),
  }
}
