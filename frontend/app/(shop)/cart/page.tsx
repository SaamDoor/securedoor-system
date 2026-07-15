'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice, toPersianNumber, cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const hydrated = useCartStore((s) => s.hydrated)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const subtotalFn = useCartStore((s) => s.subtotal)

  const authUser = useAuthStore((s) => s.user)
  const userDiscountPct = authUser?.specialDiscountPercent ?? 0

  const subtotal = subtotalFn()
  const userDiscount = userDiscountPct > 0 ? Math.round(subtotal * (userDiscountPct / 100)) : 0
  const shipping = subtotal === 0 || subtotal >= 5_000_000 ? 0 : 350_000
  const total = Math.max(0, subtotal - userDiscount + shipping)

  if (!hydrated) {
    return <div className="min-h-screen bg-black" />
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/8 bg-white/5">
            <ShoppingCart className="h-10 w-10 text-[#A0A0A0]" />
          </div>
          <h2 className="mb-3 text-2xl font-black text-white">سبد خرید شما خالی است</h2>
          <p className="mb-8 text-[#A0A0A0]">محصولات مورد نظر خود را به سبد اضافه کنید.</p>
          <Button asChild variant="gold" size="lg">
            <Link href="/products">
              مشاهده محصولات
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div
        className="pb-12 pt-28"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(200,168,93,0.06) 0%, transparent 60%), linear-gradient(180deg, #0F0F0F 0%, #0B0B0B 100%)',
        }}
      >
        <div className="container">
          <h1 className="flex items-center gap-3 text-3xl font-black text-white">
            <ShoppingCart className="h-8 w-8 text-[#C8A85D]" />
            سبد خرید
            <span className="text-lg font-normal text-[#A0A0A0]">
              ({toPersianNumber(items.length)} محصول)
            </span>
          </h1>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                className="flex gap-5 rounded-2xl border border-white/8 bg-[#181818] p-5"
              >
                <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-900">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                  ) : (
                    <Package className="h-8 w-8 text-zinc-700" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-xs text-[#A0A0A0]">کد: {item.sku}</div>
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="mb-3 text-sm font-bold text-white transition-colors hover:text-[#C8A85D]">
                      {item.name}
                    </h3>
                  </Link>
                  {item.options && Object.keys(item.options).length > 0 && (
                    <div className="mb-3 text-xs text-zinc-500">
                      {Object.entries(item.options)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 overflow-hidden rounded-xl border border-white/15">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center text-[#A0A0A0] transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-white">
                        {toPersianNumber(item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center text-[#A0A0A0] transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-base font-black text-white">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        aria-label="حذف از سبد"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 text-[#A0A0A0] transition-all hover:border-[#C0392B]/30 hover:text-[#E74C3C]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-white/8 bg-[#181818] p-6">
              <h3 className="mb-6 text-lg font-bold text-white">خلاصه سفارش</h3>

              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">جمع کل</span>
                  <span className="font-medium text-white">{formatPrice(subtotal)}</span>
                </div>
                {userDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">تخفیف ویژه ({toPersianNumber(userDiscountPct)}٪)</span>
                    <span className="font-medium text-green-400">-{formatPrice(userDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">هزینه ارسال</span>
                  <span className={cn('font-medium', shipping === 0 ? 'text-[#27AE60]' : 'text-white')}>
                    {shipping === 0 ? 'رایگان' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="h-px bg-white/8" />
                <div className="flex justify-between">
                  <span className="font-bold text-white">مبلغ نهایی</span>
                  <span className="text-lg font-black text-[#C8A85D]">{formatPrice(total)}</span>
                </div>
              </div>

              <Button asChild variant="gold" size="lg" className="w-full">
                <Link href="/checkout">ادامه و تسویه حساب</Link>
              </Button>

              <Link
                href="/products"
                className="mt-4 flex items-center justify-center gap-2 text-sm text-[#A0A0A0] transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                ادامه خرید از فروشگاه
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
