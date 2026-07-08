'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Tag, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  quantity: number
  sku: string
}

const INITIAL_ITEMS: CartItem[] = [
  {
    id: '1',
    name: 'درب ضد سرقت آرتوس پلاتینیوم',
    slug: 'artus-platinum',
    price: 28_500_000,
    quantity: 1,
    sku: 'SD-1001',
  },
  {
    id: '2',
    name: 'درب ضد سرقت رگال مشکی',
    slug: 'regal-black',
    price: 19_800_000,
    quantity: 2,
    sku: 'SD-1002',
  },
]

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const authUser = useAuthStore((s) => s.user)
  const userDiscountPct = authUser?.specialDiscountPercent ?? 0

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const userDiscount = userDiscountPct > 0 ? Math.round(subtotal * (userDiscountPct / 100)) : 0
  const discount = (couponApplied ? Math.round(subtotal * 0.1) : 0) + userDiscount
  const shipping = subtotal >= 5_000_000 ? 0 : 350_000
  const total = subtotal - discount + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-10 w-10 text-[#A0A0A0]" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">سبد خرید شما خالی است</h2>
          <p className="text-[#A0A0A0] mb-8">محصولات مورد نظر خود را به سبد اضافه کنید.</p>
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
        className="pt-28 pb-12"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(200,168,93,0.06) 0%, transparent 60%), linear-gradient(180deg, #0F0F0F 0%, #0B0B0B 100%)',
        }}
      >
        <div className="container">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-[#C8A85D]" />
            سبد خرید
            <span className="text-[#A0A0A0] text-lg font-normal">
              ({toPersianNumber(items.length)} محصول)
            </span>
          </h1>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-5 p-5 rounded-2xl bg-[#181818] border border-white/8"
              >
                {/* Image placeholder */}
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex-shrink-0 flex items-center justify-center">
                  <Package className="h-8 w-8 text-zinc-700" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#A0A0A0] mb-1">کد: {item.sku}</div>
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-bold text-white hover:text-[#C8A85D] transition-colors text-sm mb-3">
                      {item.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-xl border border-white/15 overflow-hidden">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-9 h-9 flex items-center justify-center text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-white text-sm font-bold">
                        {toPersianNumber(item.quantity)}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-9 h-9 flex items-center justify-center text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="font-black text-white text-base">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="حذف از سبد"
                        className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-[#E74C3C] hover:border-[#C0392B]/30 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 sticky top-24">
              <h3 className="font-bold text-white mb-6 text-lg">خلاصه سفارش</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#A0A0A0]">جمع کل</span>
                  <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                </div>
                {userDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">تخفیف ویژه ({toPersianNumber(userDiscountPct)}٪)</span>
                    <span className="text-green-400 font-medium">-{formatPrice(userDiscount)}</span>
                  </div>
                )}
                {couponApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">کد تخفیف</span>
                    <span className="text-[#27AE60] font-medium">-{formatPrice(Math.round(subtotal * 0.1))}</span>
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
                  <span className="font-black text-[#C8A85D] text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="کد تخفیف"
                    leftIcon={<Tag className="h-4 w-4" />}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button
                    variant="dark"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={() => { if (couponCode) setCouponApplied(true) }}
                  >
                    اعمال
                  </Button>
                </div>
                {couponApplied && (
                  <p className="text-xs text-[#27AE60] mt-1.5">✓ کد تخفیف اعمال شد</p>
                )}
              </div>

              <Button asChild variant="gold" size="lg" className="w-full">
                <Link href="/checkout">ادامه خرید</Link>
              </Button>

              <Link
                href="/products"
                className="flex items-center justify-center gap-2 mt-4 text-sm text-[#A0A0A0] hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                ادامه خرید
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
