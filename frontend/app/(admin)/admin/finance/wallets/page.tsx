import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const mockWallets = [
  { id: 1, user: 'احمد رضایی', balance: 1250000, lastTx: '+۲۵۰,۰۰۰ ت', lastTxDate: '۱۴۰۳/۰۴/۰۲', type: 'plus' },
  { id: 2, user: 'مریم احمدی', balance: 3700000, lastTx: '+۵۰۰,۰۰۰ ت', lastTxDate: '۱۴۰۳/۰۴/۰۱', type: 'plus' },
  { id: 3, user: 'علی کریمی', balance: 890000, lastTx: '-۱۱۰,۰۰۰ ت', lastTxDate: '۱۴۰۳/۰۳/۳۰', type: 'minus' },
  { id: 4, user: 'فاطمه موسوی', balance: 5200000, lastTx: '+۱,۲۰۰,۰۰۰ ت', lastTxDate: '۱۴۰۳/۰۳/۲۸', type: 'plus' },
]

export default function WalletsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">کیف پول کاربران</h1>
          <p className="text-zinc-400 mt-1">مدیریت موجودی و تراکنش‌های کیف پول</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">کاربر</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">موجودی (تومان)</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">آخرین تراکنش</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {mockWallets.map(w => (
                <tr key={w.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-amber-400" />
                      <span className="text-zinc-100 font-medium">{w.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-100 font-semibold">
                    {w.balance.toLocaleString('fa')} تومان
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 text-sm font-medium ${w.type === 'plus' ? 'text-green-400' : 'text-red-400'}`}>
                      {w.type === 'plus' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {w.lastTx}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{w.lastTxDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
