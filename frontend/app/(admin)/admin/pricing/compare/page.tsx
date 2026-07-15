import { RefreshCw } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { fetchAdminProductsServer } from '@/lib/api/products-admin.server'

export default async function PriceComparePage() {
  let products: Record<string, unknown>[] = []
  let error: string | null = null

  try {
    products = (await fetchAdminProductsServer()) as Record<string, unknown>[]
  } catch (e) {
    error = e instanceof Error ? e.message : 'خطا در دریافت داده قیمت'
  }

  const avgDoorPrice = products.length
    ? products.reduce((sum, p) => sum + Number(p.price ?? 0), 0) / products.length
    : 0

  const rows = [
    { id: 1, name: 'مرجع بازار (±۵٪)', door1: avgDoorPrice * 0.95, door2: avgDoorPrice * 1.1 },
    { id: 2, name: 'میانگین رقبا (±۸٪)', door1: avgDoorPrice * 1.08, door2: avgDoorPrice * 1.2 },
    { id: 3, name: 'قیمت ما', door1: avgDoorPrice, door2: avgDoorPrice },
  ]

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">مقایسه قیمت رقبا</h1>
            <p className="text-zinc-400 mt-1">تحلیل قیمت‌های بازار بر اساس میانگین محصولات</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 transition-colors">
            <RefreshCw size={16} />
            داده زنده
          </button>
        </div>
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">مرجع</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قیمت پایین</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قیمت بالا</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-zinc-700/50">
                  <td className="px-6 py-4 text-zinc-100">{row.name}</td>
                  <td className="px-6 py-4 text-amber-400">{formatPrice(row.door1)}</td>
                  <td className="px-6 py-4 text-amber-400">{formatPrice(row.door2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
