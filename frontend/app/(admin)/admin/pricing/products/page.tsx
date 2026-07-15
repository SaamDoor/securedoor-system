import { formatJalaliDate, formatPrice } from '@/lib/utils'
import { fetchAdminProductsServer } from '@/lib/api/products-admin.server'

export default async function ProductPricingPage() {
  let products: Record<string, unknown>[] = []
  let error: string | null = null
  try {
    products = (await fetchAdminProductsServer()) as Record<string, unknown>[]
  } catch (e) {
    error = e instanceof Error ? e.message : 'خطای دریافت محصولات'
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">قیمت‌گذاری محصولات</h1>
          <p className="text-zinc-400 mt-1">مدیریت قیمت محصولات و قیمت‌های مقایسه‌ای</p>
        </div>
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام محصول</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قیمت فعلی</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">قیمت مقایسه</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">آخرین تغییر</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">محصولی برای قیمت‌گذاری یافت نشد</td>
                </tr>
              ) : products.map((p) => (
                <tr key={String(p.id)} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100 font-medium">{String(p.name ?? '—')}</td>
                  <td className="px-6 py-4 text-zinc-100 font-semibold">{formatPrice(Number(p.price ?? 0))}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm line-through">
                    {Number(p.compare_price ?? 0) > 0 ? formatPrice(Number(p.compare_price)) : '—'}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{p.created_at ? formatJalaliDate(String(p.created_at)) : '—'}</td>
                  <td className="px-6 py-4 text-zinc-500 text-sm">مشاهده</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
