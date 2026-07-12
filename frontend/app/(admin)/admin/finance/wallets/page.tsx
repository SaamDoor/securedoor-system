import { Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function WalletsPage() {
  const supabase = await createClient()
  const { data: wallets, error } = await supabase
    .from('wallets')
    .select('id, balance, pending_balance, lifetime_earned, updated_at, user:users(first_name, last_name, phone)')
    .order('updated_at', { ascending: false })

  return (
    <div dir="rtl" className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">کیف پول کاربران</h1>
          <p className="mt-1 text-zinc-400">موجودی واقعی کیف پول‌ها؛ افزایش موجودی فقط از طریق تراکنش ثبت می‌شود.</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{error.message}</div>
        ) : (
        <div className="overflow-x-auto rounded-xl bg-zinc-800">
          <table className="min-w-[760px] w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">کاربر</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">موجودی (تومان)</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">در انتظار</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">مجموع دریافتی</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">آخرین تغییر</th>
              </tr>
            </thead>
            <tbody>
              {(wallets ?? []).map((wallet) => {
                const user = Array.isArray(wallet.user) ? wallet.user[0] : wallet.user
                return (
                <tr key={wallet.id} className="border-b border-zinc-700/50 transition-colors hover:bg-zinc-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-amber-400" />
                      <div>
                        <div className="font-medium text-zinc-100">{user?.first_name} {user?.last_name}</div>
                        <div className="text-xs text-zinc-500">{user?.phone ?? '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-100 font-semibold">
                    {Number(wallet.balance).toLocaleString('fa-IR')} تومان
                  </td>
                  <td className="px-6 py-4 text-sm text-amber-400">{Number(wallet.pending_balance).toLocaleString('fa-IR')} تومان</td>
                  <td className="px-6 py-4 text-sm text-emerald-400">{Number(wallet.lifetime_earned).toLocaleString('fa-IR')} تومان</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{new Date(wallet.updated_at).toLocaleString('fa-IR')}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        )}
    </div>
  )
}
