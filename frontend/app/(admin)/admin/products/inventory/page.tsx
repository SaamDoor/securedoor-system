'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Loader2, Package, Save, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface InventoryRow {
  id: string
  name: string
  sku: string
  stock: number
  stock_left: number
  stock_right: number
  low_stock_threshold: number
  stock_status: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string>()

  const refresh = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock, stock_left, stock_right, low_stock_threshold, stock_status')
      .order('name')
    if (error) toast.error(error.message)
    else setProducts((data ?? []) as InventoryRow[])
    setLoading(false)
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  function update(id: string, key: 'stock_left' | 'stock_right' | 'low_stock_threshold', value: number) {
    setProducts((current) => current.map((product) =>
      product.id === id
        ? {
            ...product,
            [key]: Math.max(0, value),
            stock: key === 'low_stock_threshold'
              ? product.stock
              : (key === 'stock_left' ? Math.max(0, value) : product.stock_left)
                + (key === 'stock_right' ? Math.max(0, value) : product.stock_right),
          }
        : product,
    ))
  }

  async function save(product: InventoryRow) {
    setSavingId(product.id)
    const supabase = createClient()
    const total = product.stock_left + product.stock_right
    const { error } = await supabase
      .from('products')
      .update({
        stock_left: product.stock_left,
        stock_right: product.stock_right,
        stock: total,
        low_stock_threshold: product.low_stock_threshold,
        stock_status: total > 0 ? 'in_stock' : 'out_of_stock',
        updated_at: new Date().toISOString(),
      })
      .eq('id', product.id)
    setSavingId(undefined)
    if (error) toast.error(error.message)
    else toast.success(`موجودی «${product.name}» ذخیره شد`)
  }

  return (
    <div dir="rtl" className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">موجودی انبار</h1>
          <p className="mt-1 text-sm text-muted">موجودی چپ‌بازشو و راست‌بازشو هر محصول را مستقل مدیریت کنید.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/8 bg-surface">
          <table className="min-w-[900px] w-full">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.02]">
                <th className="px-5 py-3 text-right text-xs text-muted">محصول</th>
                <th className="px-5 py-3 text-right text-xs text-muted">SKU</th>
                <th className="px-5 py-3 text-right text-xs text-muted">چپ‌بازشو</th>
                <th className="px-5 py-3 text-right text-xs text-muted">راست‌بازشو</th>
                <th className="px-5 py-3 text-right text-xs text-muted">کل</th>
                <th className="px-5 py-3 text-right text-xs text-muted">هشدار</th>
                <th className="px-5 py-3 text-right text-xs text-muted">وضعیت</th>
                <th className="px-5 py-3 text-left text-xs text-muted">ذخیره</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-gold" /></td></tr>
              ) : products.map((product) => {
                const total = product.stock_left + product.stock_right
                const status = total === 0 ? 'ناموجود' : total <= product.low_stock_threshold ? 'کم' : 'کافی'
                return (
                  <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.025]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gold" />
                        <span className="font-medium text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted" dir="ltr">{product.sku}</td>
                    <td className="px-5 py-4"><StockInput value={product.stock_left} onChange={(value) => update(product.id, 'stock_left', value)} /></td>
                    <td className="px-5 py-4"><StockInput value={product.stock_right} onChange={(value) => update(product.id, 'stock_right', value)} /></td>
                    <td className="px-5 py-4 font-black text-white">{total.toLocaleString('fa-IR')}</td>
                    <td className="px-5 py-4"><StockInput value={product.low_stock_threshold} onChange={(value) => update(product.id, 'low_stock_threshold', value)} /></td>
                    <td className="px-5 py-4">
                      <span className={`flex items-center gap-1 text-sm font-medium ${status === 'کافی' ? 'text-emerald-400' : status === 'کم' ? 'text-amber-400' : 'text-red-400'}`}>
                        {status === 'کافی' ? <CheckCircle className="h-4 w-4" /> : status === 'کم' ? <AlertTriangle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-left">
                      <button onClick={() => save(product)} disabled={savingId === product.id} className="rounded-xl bg-gold/10 p-2.5 text-gold hover:bg-gold/20 disabled:opacity-50" aria-label="ذخیره موجودی">
                        {savingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
    </div>
  )
}

function StockInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-10 w-20 rounded-xl border border-white/10 bg-black/20 px-3 text-center text-sm text-white outline-none focus:border-gold"
    />
  )
}
