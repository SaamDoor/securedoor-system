import { ArrowLeft } from 'lucide-react'
import { formatJalaliDate, formatPrice } from '@/lib/utils'
import { fetchAdminProductsServer } from '@/lib/api/products-admin.server'

export default async function PriceHistoryPage() {
  let rows: {
    id: string
    product: string
    before: number
    after: number
    by: string
    date: string
  }[] = []
  let error: string | null = null

  try {
    const products = await fetchAdminProductsServer()
    rows = (products as Record<string, unknown>[])
      .filter((item) => Number(item.compare_price ?? 0) > 0 && Number(item.compare_price) !== Number(item.price))
      .map((item) => ({
        id: `p-${String(item.id)}`,
        product: String(item.name ?? 'محصول'),
        before: Number(item.compare_price ?? 0),
        after: Number(item.price ?? 0),
        by: 'ادمین',
        date: String(item.created_at ?? new Date().toISOString()),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (e) {
    error = e instanceof Error ? e.message : 'خطا در دریافت تاریخچه قیمت'
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تاریخچه تغییر قیمت</h1>
          <p className="text-zinc-400 mt-1">محصولاتی که قیمت مقایسه‌ای متفاوت دارند</p>
        </div>
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">محصول</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قبل</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">بعد</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تغییر</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">تغییری ثبت نشده</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} className="border-b border-zinc-700/50">
                  <td className="px-6 py-4 text-zinc-100">{row.product}</td>
                  <td className="px-6 py-4 text-zinc-400">{formatPrice(row.before)}</td>
                  <td className="px-6 py-4 text-amber-400">{formatPrice(row.after)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs ${row.after < row.before ? 'text-green-400' : 'text-red-400'}`}>
                      <ArrowLeft size={12} />
                      {formatPrice(Math.abs(row.after - row.before))}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{formatJalaliDate(row.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
