import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Star,
  FileText,
  MessageSquare,
  Package,
  Upload,
  Clock,
  CheckCircle2,
  BarChart3,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
//  DATA FETCHING
// ─────────────────────────────────────────────────────────────────────────────

async function getVipData(userId: string) {
  const supabase = await createClient()

  const [profileRes, ordersRes, quotesRes, ticketsRes, tierRes] = await Promise.all([
    supabase
      .from('users')
      .select('first_name, last_name, builder_tier')
      .eq('id', userId)
      .single(),

    supabase
      .from('orders')
      .select('id, order_number, status, total, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('bulk_quotes')
      .select('id, quote_number, title, status, quoted_amount, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('support_tickets')
      .select('id, ticket_number, subject, status, priority, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('builder_tier_config')
      .select('tier, label, discount_percentage, benefits')
      .eq('is_active', true),
  ])

  return {
    profile:  profileRes.data,
    orders:   ordersRes.data ?? [],
    quotes:   quotesRes.data ?? [],
    tickets:  ticketsRes.data ?? [],
    tierList: tierRes.data ?? [],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default async function VipDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { profile, orders, quotes, tickets, tierList } = await getVipData(user.id)

  const currentTierConfig = tierList.find((t) => t.tier === profile?.builder_tier)

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">داشبورد VIP</h1>
          <p className="mt-1 text-sm text-zinc-400">
            خوش آمدید، {profile?.first_name} {profile?.last_name}
          </p>
        </div>
        {profile?.builder_tier && (
          <TierBadge tier={profile.builder_tier} />
        )}
      </div>

      {/* Active Tier Card */}
      {currentTierConfig && (
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" />
            <h2 className="font-semibold text-amber-300">سطح {currentTierConfig.label}</h2>
          </div>
          <p className="mb-4 text-2xl font-bold text-amber-400">
            {currentTierConfig.discount_percentage}٪ تخفیف ثابت
          </p>
          <div className="flex flex-wrap gap-2">
            {(currentTierConfig.benefits as string[]).map((b) => (
              <span
                key={b}
                className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid gap-3 sm:grid-cols-3">
        <a
          href="/user/vip-dashboard/quotes/new"
          className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 transition-colors hover:border-amber-500/50 hover:bg-zinc-800"
        >
          <Upload className="h-5 w-5 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-zinc-200">درخواست پیش‌فاکتور انبوه</p>
            <p className="text-xs text-zinc-500">آپلود نقشه و مشخصات</p>
          </div>
        </a>
        <a
          href="/user/vip-dashboard/tickets/new"
          className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 transition-colors hover:border-blue-500/50 hover:bg-zinc-800"
        >
          <MessageSquare className="h-5 w-5 text-blue-400" />
          <div>
            <p className="text-sm font-medium text-zinc-200">تیکت اولویت‌دار</p>
            <p className="text-xs text-zinc-500">پشتیبانی VIP</p>
          </div>
        </a>
        <a
          href="/user/vip-dashboard/orders"
          className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 transition-colors hover:border-emerald-500/50 hover:bg-zinc-800"
        >
          <BarChart3 className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-zinc-200">گزارش خرید</p>
            <p className="text-xs text-zinc-500">تاریخچه سفارشات</p>
          </div>
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bulk Quotes */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <FileText className="h-4 w-4 text-amber-400" />
              پیش‌فاکتورهای انبوه
            </h2>
            <a
              href="/user/vip-dashboard/quotes"
              className="text-xs text-zinc-500 hover:text-amber-400 transition-colors"
            >
              همه
            </a>
          </div>
          {quotes.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">هیچ درخواستی ثبت نشده</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {quotes.map((q) => (
                <div key={q.id} className="py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-zinc-200">{q.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500 font-mono">{q.quote_number}</p>
                    </div>
                    <QuoteBadge status={q.status} />
                  </div>
                  {q.quoted_amount && (
                    <p className="mt-1 text-xs text-amber-400">
                      {formatIRR(q.quoted_amount)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Priority Tickets */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              تیکت‌های پشتیبانی
            </h2>
            <a
              href="/user/vip-dashboard/tickets"
              className="text-xs text-zinc-500 hover:text-blue-400 transition-colors"
            >
              همه
            </a>
          </div>
          {tickets.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">تیکتی یافت نشد</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {tickets.map((t) => (
                <a
                  key={t.id}
                  href={`/user/vip-dashboard/tickets/${t.id}`}
                  className="block py-3 hover:bg-zinc-800/50 -mx-5 px-5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-zinc-200 truncate max-w-[180px]">{t.subject}</p>
                      <p className="mt-0.5 text-xs text-zinc-500 font-mono">{t.ticket_number}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <TicketStatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recent Orders */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Package className="h-4 w-4 text-emerald-400" />
          سفارشات اخیر
        </h2>
        {orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">سفارشی یافت نشد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                  <th className="pb-2 text-right font-medium">شماره سفارش</th>
                  <th className="pb-2 text-right font-medium">مبلغ</th>
                  <th className="pb-2 text-right font-medium">وضعیت</th>
                  <th className="pb-2 text-right font-medium">تاریخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 font-mono text-xs text-zinc-400">{o.order_number}</td>
                    <td className="py-3 text-zinc-200">{formatIRR(o.total)}</td>
                    <td className="py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="py-3 text-xs text-zinc-500">
                      {new Date(o.created_at).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, { label: string; className: string }> = {
    bronze:   { label: 'برنز',       className: 'border-orange-600/40 bg-orange-600/10 text-orange-400' },
    silver:   { label: 'نقره‌ای',   className: 'border-zinc-400/40   bg-zinc-400/10   text-zinc-300' },
    gold:     { label: 'طلایی',     className: 'border-amber-400/40  bg-amber-400/10  text-amber-400' },
    platinum: { label: 'پلاتینیوم', className: 'border-sky-400/40    bg-sky-400/10    text-sky-300' },
  }
  const { label, className } = map[tier] ?? { label: tier, className: 'border-zinc-700 bg-zinc-800 text-zinc-400' }
  return (
    <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      <Star className="h-3 w-3" />
      {label}
    </span>
  )
}

function QuoteBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    submitted: { label: 'ثبت شده',    className: 'bg-zinc-700    text-zinc-300' },
    reviewing: { label: 'در بررسی',   className: 'bg-blue-500/15  text-blue-400' },
    quoted:    { label: 'پیش‌فاکتور', className: 'bg-amber-500/15 text-amber-400' },
    accepted:  { label: 'پذیرفته شد', className: 'bg-emerald-500/15 text-emerald-400' },
    rejected:  { label: 'رد شد',      className: 'bg-red-500/15   text-red-400' },
    cancelled: { label: 'لغو شد',     className: 'bg-zinc-700    text-zinc-500' },
  }
  const { label, className } = map[status] ?? { label: status, className: 'bg-zinc-700 text-zinc-300' }
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}>{label}</span>
}

function TicketStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    open:        { label: 'باز',       className: 'bg-blue-500/15  text-blue-400' },
    in_progress: { label: 'در حال بررسی', className: 'bg-amber-500/15 text-amber-400' },
    resolved:    { label: 'حل شد',    className: 'bg-emerald-500/15 text-emerald-400' },
    closed:      { label: 'بسته',     className: 'bg-zinc-700     text-zinc-500' },
  }
  const { label, className } = map[status] ?? { label: status, className: 'bg-zinc-700 text-zinc-300' }
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}>{label}</span>
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; className: string }> = {
    low:    { label: 'پایین',    className: 'text-zinc-500' },
    normal: { label: 'عادی',    className: 'text-zinc-400' },
    high:   { label: 'بالا',    className: 'text-amber-400' },
    urgent: { label: 'فوری',    className: 'text-red-400' },
  }
  const { label, className } = map[priority] ?? { label: priority, className: 'text-zinc-500' }
  return <span className={`text-[10px] ${className}`}>{label}</span>
}

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending:       { label: 'در انتظار',   className: 'bg-zinc-700    text-zinc-300' },
    confirmed:     { label: 'تأیید شده',  className: 'bg-blue-500/15  text-blue-400' },
    processing:    { label: 'در حال ساخت', className: 'bg-amber-500/15 text-amber-400' },
    shipped:       { label: 'ارسال شد',   className: 'bg-purple-500/15 text-purple-400' },
    delivered:     { label: 'تحویل شد',  className: 'bg-emerald-500/15 text-emerald-400' },
    cancelled:     { label: 'لغو شد',    className: 'bg-red-500/15   text-red-400' },
  }
  const { label, className } = map[status] ?? { label: status, className: 'bg-zinc-700 text-zinc-300' }
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}>{label}</span>
}

function formatIRR(amount: number) {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' ﷼'
}
