'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Search, Edit, Package, ArrowUpDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { BadgeVariant } from '@/components/ui/badge'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import { getAdminProducts } from '@/lib/api/products'
import type { StockStatus } from '@/types/product'
import { cn } from '@/lib/utils'
import { DeleteProductButton } from './delete-product-button'
import { ProductActiveToggle } from './product-active-toggle'

interface AdminProductRow {
  id: string
  sku: string
  name: string
  price: number
  stock: number
  stock_status: StockStatus
  is_active: boolean
  is_featured: boolean
  view_count: number
  category: { id: string; name: string } | null
  images: { url: string; is_primary: boolean }[] | null
}

const stockStatusVariant: Record<StockStatus, BadgeVariant> = {
  in_stock: 'success',
  out_of_stock: 'danger',
  pre_order: 'warning',
  discontinued: 'muted',
}

const stockStatusLabel: Record<StockStatus, string> = {
  in_stock: 'موجود',
  out_of_stock: 'ناموجود',
  pre_order: 'پیش‌سفارش',
  discontinued: 'متوقف',
}

function primaryImage(images: AdminProductRow['images']): string | null {
  if (!images?.length) return null
  return images.find((img) => img.is_primary)?.url ?? images[0].url
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<AdminProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (term: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminProducts(term)
      setProducts(data as unknown as AdminProductRow[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری محصولات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => load(search), 300)
    return () => clearTimeout(timer)
  }, [search, load])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت محصولات</h1>
          <p className="text-sm text-[#A0A0A0]">{toPersianNumber(products.length)} محصول</p>
        </div>
        <Button asChild variant="gold" size="sm">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            افزودن محصول
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="جستجو در نام یا کد محصول..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="text-center py-4 text-[#E74C3C] text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#A0A0A0]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-2xl bg-[#181818] border border-white/8 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
                      محصول
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>دسته‌بندی</TableHead>
                  <TableHead>قیمت پایه</TableHead>
                  <TableHead>موجودی</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>فعال</TableHead>
                  <TableHead className="text-center">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, i) => {
                  const thumb = primaryImage(product.images)
                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-white/3 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {thumb ? (
                              <Image src={thumb} alt={product.name} fill className="object-cover" />
                            ) : (
                              <Package className="h-4 w-4 text-zinc-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">{product.name}</div>
                            <div className="text-xs text-[#A0A0A0]" dir="ltr">{product.sku}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category?.name ?? '—'}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-white">{formatPrice(product.price)}</span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          'font-medium',
                          product.stock === 0 ? 'text-[#E74C3C]'
                          : product.stock <= 5 ? 'text-[#F0B429]'
                          : 'text-white',
                        )}>
                          {toPersianNumber(product.stock)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockStatusVariant[product.stock_status]} size="sm" dot>
                          {stockStatusLabel[product.stock_status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ProductActiveToggle id={product.id} isActive={product.is_active} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            aria-label="ویرایش"
                            className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-white hover:border-white/20 transition-all"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                          <DeleteProductButton id={product.id} name={product.name} />
                        </div>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 text-[#A0A0A0]">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>محصولی یافت نشد.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
