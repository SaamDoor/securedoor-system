import { createClient } from '@/lib/supabase/server'
import {
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  MessageSquare,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
//  DATA FETCHING
// ─────────────────────────────────────────────────────────────────────────────

async function getSuperDashboardStats() {
  const supabase = await createClient()

  const [
    ordersRes,
    usersRes,
    pendingPayoutsRes,
    openTicketsRes,
    pendingQuotesRes,
    revenueRes,
    recentAuditRes,
  ] = await Promise.all([
    // Total orders + today
    supabase
      .from('orders')
      .select('id, total, status, created_at', { count: 'exact' })
      .gte('created_at', new Date(Date.now() - 30 * 86400_000).toISOString()),

    // User counts by role
    supabase
      .from('users')
      .select('role', { count: 'exact' }),

    // Pending payout requests
    supabase
      .from('payout_requests')
      .select('id, amount, user_id', { count: 'exact' })
      .eq('status', 'pending'),

    // Open tickets
    supabase
      .from('support_tickets')
      .select('id, subject, priority, is_vip, created_at', { count: 'exact' })
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(5),

    // Pending quotes
    supabase
      .from('bulk_quotes')
      .select('id, quote_number, title, user_id, created_at', { count: 'exact' })
      .in('status', ['submitted', 'reviewing'])
      .order('created_at', { ascending: false })
      .limit(5),

    // Revenue last 30 days
    supabase
      .from('orders')
      .select('total')
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered'])
      .gte('created_at', new Date(Date.now() - 30 * 86400_000).toISOString()),

    // Audit log
    supabase
      .from('audit_logs')
      .select('id, action, resource, resource_id, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const revenue30d = (revenueRes.data ?? []).reduce((s, o) => s + Number(o.total), 0)

  return {
    orderCount30d:      ordersRes.count ?? 0,
    userCount:          usersRes.count ?? 0,
    pendingPayouts:     pendingPayoutsRes.data ?? [],
    pendingPayoutCount: pendingPayoutsRes.count ?? 0,
    openTickets:        openTicketsRes.data ?? [],
    openTicketCount:    openTicketsRes.count ?? 0,
    pendingQuotes:      pendingQuotesRes.data ?? [],
    pendingQuoteCount:  pendingQuotesRes.count ?? 0,
    revenue30d,
    recentAudit:        recentAuditRes.data ?? [],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default async function SuperDashboardPage() {
  const {
    orderCount30d,
    userCount,
    pendingPayoutCount,
    openTicketCount,
    pendingQuoteCount,
    revenue30d,
    openTickets,
    pendingQuotes,
    recentAudit,
  } = await getSuperDashboardStats()

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">مرکز کنترل سوپر ادمین</h1>
        <p className="mt-1 text-sm text-zinc-500">
          نمای کلی عملکرد سیستم · {new Date().toLocaleDateString('fa-IR')}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={DollarSign}
          label="درآمد ۳۰ روز"
          value={formatIRR(revenue30d)}
          color="emerald"
          href="/admin/super-dashboard/finance/revenue"
        />
        <KpiCard
          icon={ShoppingCart}
          label="سفارشات ۳۰ روز"
          value={orderCount30d.toLocaleString('fa-IR')}
          color="blue"
          href="/admin/orders"
        />
        <KpiCard
          icon={Users}
          label="کل کاربران"
          value={userCount.toLocaleString('fa-IR')}
          color="purple"
          href="/admin/users"
        />
        <KpiCard
          icon={CreditCard}
          label="برداشت در انتظار"
          value={pendingPayoutCount.toLocaleString('fa-IR')}
          color="amber"
          href="/admin/super-dashboard/finance/payouts"
          badge={pendingPayoutCount > 0}
        />
      </div>

      {/* Alert Row */}
      {(openTicketCount > 0 || pendingQuoteCount > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {openTicketCount > 0 && (
            <AlertBanner
              icon={MessageSquare}
              label={`${openTicketCount.toLocaleString('fa-IR')} تیکت باز`}
              sub="نیاز به رسیدگی"
              href="/admin/super-dashboard/support/tickets"
              color="blue"
            />
          )}
          {pendingQuoteCount > 0 && (
            <AlertBanner
              icon={Package}
              label={`${pendingQuoteCount.toLocaleString('fa-IR')} پیش‌فاکتور در انتظار`}
              sub="درخواست‌های انبوه VIP"
              href="/admin/super-dashboard/support/quotes"
              color="amber"
            />
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Open Tickets */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <SectionHeader
            icon={MessageSquare}
            title="تیکت‌های باز"
            href="/admin/super-dashboard/support/tickets"
            iconColor="text-blue-400"
          />
          {openTickets.length === 0 ? (
            <EmptyState text="تیکتی وجود ندارد" />
          ) : (
            <div className="divide-y divide-zinc-800">
              {openTickets.map((t) => (
                <div key={t.id} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-zinc-200 truncate">{t.subject}</p>
                    {t.is_vip && (
                      <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-400">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <PriorityDot priority={t.priority} />
                    <span className="text-xs text-zinc-600">
                      {new Date(t.created_at).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending Quotes */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <SectionHeader
            icon={Package}
            title="پیش‌فاکتورهای انبوه"
            href="/admin/super-dashboard/support/quotes"
            iconColor="text-amber-400"
          />
          {pendingQuotes.length === 0 ? (
            <EmptyState text="درخواستی وجود ندارد" />
          ) : (
            <div className="divide-y divide-zinc-800">
              {pendingQuotes.map((q) => (
                <div key={q.id} className="py-3">
                  <p className="text-sm text-zinc-200 truncate">{q.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500 font-mono">{q.quote_number}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    {new Date(q.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Audit Log */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <SectionHeader
            icon={AlertCircle}
            title="لاگ ممیزی"
            href="/admin/super-dashboard/logs/audit"
            iconColor="text-zinc-400"
          />
          {recentAudit.length === 0 ? (
            <EmptyState text="رویدادی ثبت نشده" />
          ) : (
            <div className="divide-y divide-zinc-800">
              {recentAudit.map((log) => (
                <div key={log.id} className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-sm bg-zinc-700 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 uppercase">
                      {log.action}
                    </span>
                    <span className="text-xs text-zinc-500">{log.resource}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-600">
                    {new Date(log.created_at).toLocaleString('fa-IR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick Links Grid */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-zinc-400">دسترسی سریع</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink href="/admin/super-dashboard/pricing/frames"  label="لیست قیمت چهارچوب"   icon={DollarSign}  />
          <QuickLink href="/admin/super-dashboard/settings/hero"   label="تنظیمات هیرو و بنر"  icon={Package}     />
          <QuickLink href="/admin/super-dashboard/seo/pages"       label="مدیریت سئو"           icon={TrendingUp}  />
          <QuickLink href="/admin/super-dashboard/media"           label="کتابخانه رسانه"       icon={Package}     />
          <QuickLink href="/admin/super-dashboard/finance/payouts" label="تأیید برداشت همکاران" icon={CreditCard}  />
          <QuickLink href="/admin/super-dashboard/pricing/tiers"   label="تیرهای تخفیف سازنده"  icon={Users}       />
          <QuickLink href="/admin/super-dashboard/roles"           label="مدیریت نقش‌ها"        icon={Users}       />
          <QuickLink href="/admin/super-dashboard/logs/audit"      label="لاگ ممیزی کامل"       icon={AlertCircle} />
        </div>
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon, label, value, color, href, badge,
}: {
  icon:   React.ElementType
  label:  string
  value:  string
  color:  'emerald' | 'blue' | 'purple' | 'amber'
  href:   string
  badge?: boolean
}) {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue:    'bg-blue-500/10    text-blue-400    border-blue-500/20',
    purple:  'bg-purple-500/10  text-purple-400  border-purple-500/20',
    amber:   'bg-amber-500/10   text-amber-400   border-amber-500/20',
  }
  return (
    <Link
      href={href}
      className="group relative rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
    >
      {badge && (
        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-amber-500" />
      )}
      <div className={`mb-3 inline-flex rounded-lg border p-2 ${colors[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-bold text-zinc-100">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
      <ArrowUpRight className="absolute left-4 top-4 h-3.5 w-3.5 text-zinc-700 transition-colors group-hover:text-zinc-500" />
    </Link>
  )
}

function AlertBanner({
  icon: Icon, label, sub, href, color,
}: {
  icon:  React.ElementType
  label: string
  sub:   string
  href:  string
  color: 'blue' | 'amber'
}) {
  const colors = {
    blue:  'border-blue-500/30  bg-blue-500/10  text-blue-400',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  }
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-xl border px-5 py-3 transition-opacity hover:opacity-80 ${colors[color]}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs opacity-70">{sub}</p>
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 opacity-60" />
    </Link>
  )
}

function SectionHeader({
  icon: Icon, title, href, iconColor,
}: {
  icon:      React.ElementType
  title:     string
  href:      string
  iconColor: string
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className={`flex items-center gap-2 text-sm font-semibold text-zinc-300`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
        {title}
      </h2>
      <Link href={href} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
        همه ←
      </Link>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-zinc-600">{text}</p>
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low:    'bg-zinc-600',
    normal: 'bg-zinc-500',
    high:   'bg-amber-500',
    urgent: 'bg-red-500',
  }
  return <span className={`h-1.5 w-1.5 rounded-full ${colors[priority] ?? 'bg-zinc-600'}`} />
}

function QuickLink({
  href, label, icon: Icon,
}: {
  href:  string
  label: string
  icon:  React.ElementType
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
    >
      <Icon className="h-4 w-4 text-zinc-600" />
      {label}
    </Link>
  )
}

function formatIRR(amount: number) {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' ﷼'
}
