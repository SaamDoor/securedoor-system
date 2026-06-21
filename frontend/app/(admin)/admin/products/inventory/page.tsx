import { Package, AlertTriangle, XCircle, CheckCircle } from 'lucide-react'

const mockInventory = [
  { id: 1, name: 'درب ضد سرقت استاندارد', sku: 'SD-001', stock: 24, threshold: 5, status: 'کافی' },
  { id: 2, name: 'درب ضد سرقت دوبل', sku: 'SD-002', stock: 3, threshold: 5, status: 'کم' },
  { id: 3, name: 'درب چوبی MDF', sku: 'WD-001', stock: 0, threshold: 3, status: 'ناموجود' },
  { id: 4, name: 'چهارچوب فلزی Z-پروفیل', sku: 'FR-001', stock: 42, threshold: 10, status: 'کافی' },
  { id: 5, name: 'درب اتوماتیک پارکینگ', sku: 'AD-001', stock: 7, threshold: 5, status: 'کافی' },
  { id: 6, name: 'چهارچوب آلومینیومی', sku: 'FR-002', stock: 2, threshold: 8, status: 'کم' },
]

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  'کافی': { color: 'text-green-400', icon: <CheckCircle size={14} /> },
  'کم': { color: 'text-yellow-400', icon: <AlertTriangle size={14} /> },
  'ناموجود': { color: 'text-red-400', icon: <XCircle size={14} /> },
}

export default function InventoryPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">موجودی انبار</h1>
          <p className="text-zinc-400 mt-1">مدیریت موجودی و هشدارهای کمبود</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">محصول</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">SKU</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">موجودی</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">آستانه هشدار</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {mockInventory.map(item => {
                const cfg = statusConfig[item.status]
                return (
                  <tr key={item.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-amber-400" />
                        <span className="text-zinc-100 font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm font-mono">{item.sku}</td>
                    <td className="px-6 py-4 text-zinc-100 font-semibold">{item.stock}</td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{item.threshold}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 text-sm font-medium ${cfg.color}`}>
                        {cfg.icon} {item.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
