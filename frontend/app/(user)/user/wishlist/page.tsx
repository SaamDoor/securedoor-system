'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, toPersianNumber } from '@/lib/utils'

interface WishlistItem {
  id: string
  name: string
  slug: string
  price: number
  isInStock: boolean
  category: string
  isNew: boolean
}

const INITIAL_ITEMS: WishlistItem[] = [
  {
    id: '1',
    name: 'درب ضد سرقت آرتوس پلاتینیوم',
    slug: 'artus-platinum',
    price: 28_500_000,
    isInStock: true,
    category: 'درب ضد سرقت',
    isNew: true,
  },
  {
    id: '2',
    name: 'درب ویلایی گراند رویال',
    slug: 'grand-royal',
    price: 54_900_000,
    isInStock: false,
    category: 'درب ویلایی',
    isNew: false,
  },
  {
    id: '3',
    name: 'درب ضد حریق فایر مکس ۹۰',
    slug: 'fire-max-90',
    price: 35_200_000,
    isInStock: true,
    category: 'درب ضد حریق',
    isNew: true,
  },
]

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(INITIAL_ITEMS)

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-black text-white">علاقه‌مندی‌ها</h1>
        <div className="text-center py-20">
          <Heart className="h-12 w-12 mx-auto mb-4 text-[#A0A0A0]/30" />
          <h3 className="font-bold text-white mb-2">لیست علاقه‌مندی‌ها خالی است</h3>
          <p className="text-[#A0A0A0] mb-6 text-sm">
            محصولات مورد علاقه‌تان را ذخیره کنید تا بعداً پیدا کنید.
          </p>
          <Button asChild variant="gold" size="md">
            <Link href="/products">مشاهده محصولات</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">علاقه‌مندی‌ها</h1>
        <span className="text-sm text-[#A0A0A0]">{toPersianNumber(items.length)} محصول</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl bg-[#181818] border border-white/8 overflow-hidden group hover:border-[#C8A85D]/30 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative bg-gradient-to-br from-zinc-800 to-zinc-900" style={{ aspectRatio: '4/3' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-10 w-10 text-zinc-700" />
                </div>

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                  {item.isNew && <Badge variant="success" size="sm">جدید</Badge>}
                  {!item.isInStock && <Badge variant="danger" size="sm">ناموجود</Badge>}
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  aria-label="حذف از علاقه‌مندی‌ها"
                  className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-[#E74C3C] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="text-xs text-[#A0A0A0] mb-1">{item.category}</div>
                <Link href={`/products/${encodeURI(item.slug || item.id)}`}>
                  <h3 className="font-bold text-white text-sm mb-3 hover:text-[#C8A85D] transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between">
                  <div className="font-black text-white">{formatPrice(item.price)}</div>
                  <Button
                    variant="gold"
                    size="sm"
                    disabled={!item.isInStock}
                    leftIcon={<ShoppingCart className="h-3.5 w-3.5" />}
                  >
                    {item.isInStock ? 'خرید' : 'ناموجود'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
