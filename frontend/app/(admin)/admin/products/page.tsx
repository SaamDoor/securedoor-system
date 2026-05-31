'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Edit, Trash2, Eye, Package, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { BadgeVariant } from '@/components/ui/badge'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import type { StockStatus } from '@/types/product'
import { cn } from '@/lib/utils'

interface AdminProduct {
  id: string
  sku: string
  name: string
  category: string
  price: number
  stock: number
  stockStatus: StockStatus
  isActive: boolean
  isFeatured: boolean
  viewCount: number
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

const PRODUCTS: AdminProduct[] = [
  { id: '1', sku: 'SD-1001', name: 'درب ضد سرقت آرتوس پلاتینیوم', category: 'درب ضد سرقت', price: 28_500_000, stock: 5, stockStatus: 'in_stock', isActive: true, isFeatured: true, viewCount: 4821 },
  { id: '2', sku: 'SD-1002', name: 'درب ضد سرقت رگال مشکی', category: 'درب آپارتمانی', price: 19_800_000, stock: 12, stockStatus: 'in_stock', isActive: true, isFeatured: false, viewCount: 3142 },
  { id: '3', sku: 'SD-1003', name: 'درب ضد حریق فایر مکس ۹۰', category: 'درب ضد حریق', price: 35_200_000, stock: 0, stockStatus: 'out_of_stock', isActive: true, isFeatured: true, viewCount: 2895 },
  { id: '4', sku: 'SD-1004', name: 'درب ویلایی گراند رویال', category: 'درب ویلایی', price: 54_900_000, stock: 3, stockStatus: 'in_stock', isActive: true, isFeatured: true, viewCount: 5634 },
  { id: '5', sku: 'SD-1005', name: 'درب اداری پرمیوم گلد', category: 'درب اداری', price: 22_000_000, stock: 8, stockStatus: 'in_stock', isActive: false, isFeatured: false, viewCount: 1820 },
]

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')

  const filtered = PRODUCTS.filter(
    (p) =>
      p.name.includes(search) ||
      p.sku.includes(search) ||
      p.category.includes(search),
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت محصولات</h1>
          <p className="text-sm text-[#A0A0A0]">{toPersianNumber(PRODUCTS.length)} محصول</p>
        </div>
        <Button
          asChild
          variant="gold"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          <Link href="/admin/products/new">افزودن محصول</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="جستجو در محصولات..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="dark" size="sm" leftIcon={<Filter className="h-4 w-4" />}>
          فیلتر
        </Button>
      </div>

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
              <TableHead>قیمت</TableHead>
              <TableHead>موجودی</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>بازدید</TableHead>
              <TableHead className="text-center">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product, i) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="hover:bg-white/3 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex-shrink-0 flex items-center justify-center">
                      <Package className="h-4 w-4 text-zinc-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{product.name}</div>
                      <div className="text-xs text-[#A0A0A0]">{product.sku}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
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
                  <div className="flex flex-col gap-1">
                    <Badge variant={stockStatusVariant[product.stockStatus]} size="sm" dot>
                      {stockStatusLabel[product.stockStatus]}
                    </Badge>
                    {!product.isActive && (
                      <Badge variant="muted" size="sm">غیرفعال</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[#A0A0A0]">{toPersianNumber(product.viewCount.toLocaleString('fa-IR'))}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Link
                      href={`/products/${product.id}`}
                      aria-label="مشاهده"
                      className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-[#C8A85D] hover:border-[#C8A85D]/30 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      aria-label="ویرایش"
                      className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-white hover:border-white/20 transition-all"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      aria-label="حذف"
                      className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-[#E74C3C] hover:border-[#C0392B]/30 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[#A0A0A0]">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>محصولی یافت نشد.</p>
        </div>
      )}
    </div>
  )
}
