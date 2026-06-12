import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  TrendingUp,
  Wallet,
  CreditCard,
  Link2,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
//  DATA FETCHING
// ─────────────────────────────────────────────────────────────────────────────

async function getPartnerData(userId: string) {
  const supabase = await createClient()

  const [walletRes, referralsRes, payoutsRes, commissionRes] = await Promise.all([
    supabase
      .from('wallets')
      .select('balance, pending_balance, lifetime_earned')
      .eq('user_id', userId)
      .single(),

    supabase
      .from('affiliate_referrals')
      .select('id, commission_amount, status, created_at, referral_code')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('payout_requests')
      .select('id, amount, status, method, requested_at')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false })
      .limit(5),

    supabase.rpc('get_manager_commission', { p_user_id: userId }),
  ])

  return {
    wallet:      walletRes.data,
    referrals:   referralsRes.data ?? [],
    payouts:     payoutsRes.data ?? [],
    commissionPct: commissionRes.data ?? 5,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default async function PartnerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name, referral_code')
    .eq('id', user.id)
    .single()

  const { wallet, referrals, payouts, commissionPct } = await getPartnerData(user.id)

  const pendingCount  = referrals.filter((r) => r.status === 'pending').length
  const approvedTotal = referrals
    .filter((r) => r.status === 'approved' || r.status === 'completed')
    .reduce((sum, r) => sum + (r.commission_amount ?? 0), 0)

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-100">
          داشبورد همکار فروش
        </h1>
        <p className="text-sm text-zinc-400">
          خوش آمدید، {profile?.first_name} {profile?.last_name}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="موجودی کیف پول"
          value={formatIRR(wallet?.balance ?? 0)}
          sub="قابل برداشت"
          color="emerald"
        />
        <StatCard
          icon={Clock}
          label="در انتظار تأیید"
          value={formatIRR(wallet?.pending_balance ?? 0)}
          sub="کمیسیون در انتظار"
          color="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="کل درآمد"
          value={formatIRR(wallet?.lifetime_earned ?? 0)}
          sub="از ابتدای همکاری"
          color="blue"
        />
        <StatCard
          icon={CreditCard}
          label="نرخ کمیسیون"
          value={`${commissionPct}٪`}
          sub="نرخ اختصاصی شما"
          color="purple"
        />
      </div>

      {/* Referral Code Banner */}
      {profile?.referral_code && (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link2 className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-300">کد معرف اختصاصی شما</p>
              <p className="font-mono text-lg font-bold text-amber-400 tracking-widest">
                {profile.referral_code}
              </p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 rounded-lg border border-amber-500/40 px-4 py-2 text-sm text-amber-400 transition-colors hover:bg-amber-500/20"
            // Client-side copy handled via a Client Component wrapper in production
          >
            <Copy className="h-4 w-4" />
            کپی لینک
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Referrals */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            آخرین معرفی‌ها
          </h2>
          {referrals.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-6">هنوز معرفی‌ای ثبت نشده</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs text-zinc-500 font-mono">{r.referral_code}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {new Date(r.created_at).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-zinc-200">
                      {r.commission_amount ? formatIRR(r.commission_amount) : '—'}
                    </p>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Payout Requests */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <CreditCard className="h-4 w-4 text-amber-400" />
              درخواست‌های برداشت
            </h2>
            <a
              href="/partner/dashboard/payout"
              className="rounded-lg border border-amber-500/40 px-3 py-1 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              + درخواست جدید
            </a>
          </div>
          {payouts.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-6">هیچ درخواست برداشتی وجود ندارد</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {payouts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{formatIRR(p.amount)}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {new Date(p.requested_at).toLocaleDateString('fa-IR')}
                      {' · '}
                      {p.method === 'iban' ? 'شماره شبا' : 'کیف پول'}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon:  React.ElementType
  label: string
  value: string
  sub:   string
  color: 'emerald' | 'amber' | 'blue' | 'purple'
}) {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber:   'bg-amber-500/10   text-amber-400   border-amber-500/20',
    blue:    'bg-blue-500/10    text-blue-400    border-blue-500/20',
    purple:  'bg-purple-500/10  text-purple-400  border-purple-500/20',
  }
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className={`mb-3 inline-flex rounded-lg border p-2 ${colors[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-bold text-zinc-100">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
      <p className="text-[10px] text-zinc-600 mt-1">{sub}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending:   { label: 'در انتظار',  className: 'bg-amber-500/15   text-amber-400' },
    approved:  { label: 'تأیید شده', className: 'bg-emerald-500/15 text-emerald-400' },
    rejected:  { label: 'رد شده',    className: 'bg-red-500/15     text-red-400' },
    completed: { label: 'پرداخت شد', className: 'bg-blue-500/15    text-blue-400' },
  }
  const { label, className } = map[status] ?? { label: status, className: 'bg-zinc-700 text-zinc-300' }
  return (
    <span className={`mt-1 block rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}>
      {label}
    </span>
  )
}

function formatIRR(amount: number) {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' ﷼'
}
