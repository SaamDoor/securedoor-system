import { createClient } from '@/lib/supabase/server'
import {
  ShoppingCart, Users, DollarSign, TrendingUp, Package,
  MessageSquare, CreditCard, AlertCircle, Clock, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Activity, Shield, Zap,
  FileText, BarChart3, Star, Percent,
} from 'lucide-react'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────────────────────────────

async function getStats() {
  const supabase = await createClient()

  const ago30 = new Date(Date.now() - 30 * 86400_000).toISOString()
  const ago7  = new Date(Date.now() - 7  * 86400_000).toISOString()

  const [
    ordersRes, orders7dRes,
    usersRes,  users7dRes,
    payoutsRes,
    ticketsRes,
    quotesRes,
    revenue30dRes, revenue7dRes,
    productsRes,
    auditRes,
  ] = await Promise.all([
    supabase.from('orders').select('id,total,status,created_at', { count: 'exact' }).gte('created_at', ago30),
    supabase.from('orders').select('id', { count: 'exact' }).gte('created_at', ago7),
    supabase.from('users').select('role', { count: 'exact' }),
    supabase.from('users').select('id', { count: 'exact' }).gte('created_at', ago7),
    supabase.from('payout_requests').select('id,amount', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('support_tickets').select('id,subject,priority,is_vip,created_at', { count: 'exact' })
      .in('status', ['open', 'in_progress']).order('created_at', { ascending: false }).limit(5),
    supabase.from('bulk_quotes').select('id,quote_number,title,created_at', { count: 'exact' })
      .in('status', ['submitted', 'reviewing']).order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('total').in('status', ['confirmed', 'processing', 'shipped', 'delivered']).gte('created_at', ago30),
    supabase.from('orders').select('total').in('status', ['confirmed', 'processing', 'shipped', 'delivered']).gte('created_at', ago7),
    supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('audit_logs').select('id,action,resource,created_at').order('created_at', { ascending: false }).limit(10),
  ])

  const revenue30d = (revenue30dRes.data ?? []).reduce((s, o) => s + Number(o.total), 0)
  const revenue7d  = (revenue7dRes.data  ?? []).reduce((s, o) => s + Number(o.total), 0)

  return {
    orderCount30d:      ordersRes.count     ?? 0,
    orderCount7d:       orders7dRes.count   ?? 0,
    userCount:          usersRes.count      ?? 0,
    userCount7d:        users7dRes.count    ?? 0,
    pendingPayouts:     payoutsRes.data     ?? [],
    pendingPayoutCount: payoutsRes.count    ?? 0,
    openTickets:        ticketsRes.data     ?? [],
    openTicketCount:    ticketsRes.count    ?? 0,
    pendingQuotes:      quotesRes.data      ?? [],
    pendingQuoteCount:  quotesRes.count     ?? 0,
    activeProducts:     productsRes.count   ?? 0,
    revenue30d,
    revenue7d,
    recentAudit:        auditRes.data       ?? [],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default async function SuperDashboardPage() {
  const s = await getStats()

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6" dir="rtl">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">مرکز کنترل سوپر ادمین</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">سیستم آنلاین</span>
          </div>
        </div>
      </div>

      {/* ── Alert banners ────────────────────────────────────────────────── */}
      {(s.openTicketCount > 0 || s.pendingQuoteCount > 0 || s.pendingPayoutCount > 0) && (
        <div className="flex flex-wrap gap-2">
          {s.openTicketCount > 0 && (
            <AlertBanner
              icon={MessageSquare} color="blue"
              label={`${toFa(s.openTicketCount)} تیکت باز`}
              href="/admin/super-dashboard/support/tickets"
            />
          )}
          {s.pendingQuoteCount > 0 && (
            <AlertBanner
              icon={Package} color="amber"
              label={`${toFa(s.pendingQuoteCount)} پیش‌فاکتور انبوه`}
              href="/admin/super-dashboard/support/quotes"
            />
          )}
          {s.pendingPayoutCount > 0 && (
            <AlertBanner
              icon={CreditCard} color="red"
              label={`${toFa(s.pendingPayoutCount)} برداشت در انتظار`}
              href="/admin/super-dashboard/finance/payouts"
            />
          )}
        </div>
      )}

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          icon={DollarSign} label="درآمد ۳۰ روز"
          value={formatIRR(s.revenue30d)}
          sub={`${formatIRR(s.revenue7d)} این هفته`}
          color="emerald"
          href="/admin/super-dashboard/finance/revenue"
          trend={s.revenue7d > 0 ? 'up' : 'flat'}
        />
        <KpiCard
          icon={ShoppingCart} label="سفارشات ۳۰ روز"
          value={toFa(s.orderCount30d)}
          sub={`${toFa(s.orderCount7d)} این هفته`}
          color="blue"
          href="/admin/orders"
          trend={s.orderCount7d > 0 ? 'up' : 'flat'}
        />
        <KpiCard
          icon={Users} label="کل کاربران"
          value={toFa(s.userCount)}
          sub={`+${toFa(s.userCount7d)} این هفته`}
          color="purple"
          href="/admin/users"
          trend="up"
        />
        <KpiCard
          icon={Package} label="محصولات فعال"
          value={toFa(s.activeProducts)}
          sub="در سایت"
          color="indigo"
          href="/admin/products"
          trend="flat"
        />
        <KpiCard
          icon={CreditCard} label="برداشت در انتظار"
          value={toFa(s.pendingPayoutCount)}
          sub="درخواست همکار"
          color="amber"
          href="/admin/super-dashboard/finance/payouts"
          badge={s.pendingPayoutCount > 0}
          trend={s.pendingPayoutCount > 0 ? 'warn' : 'flat'}
        />
        <KpiCard
          icon={MessageSquare} label="تیکت‌های باز"
          value={toFa(s.openTicketCount)}
          sub="نیاز به پاسخ"
          color="red"
          href="/admin/super-dashboard/support/tickets"
          badge={s.openTicketCount > 0}
          trend={s.openTicketCount > 0 ? 'warn' : 'flat'}
        />
      </div>

      {/* ── Revenue mini-bar chart ───────────────────────────────────────── */}
      <RevenueBar revenue30d={s.revenue30d} revenue7d={s.revenue7d} />

      {/* ── Three-column grid ────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Open Tickets */}
        <Panel
          icon={MessageSquare} iconColor="text-blue-400"
          title="تیکت‌های باز" href="/admin/super-dashboard/support/tickets"
        >
          {s.openTickets.length === 0 ? <Empty text="تیکتی وجود ندارد" /> : (
            <div className="divide-y divide-zinc-800">
              {s.openTickets.map((t) => (
                <div key={t.id} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-zinc-200 truncate">{t.subject}</p>
                    {t.is_vip && <VIPBadge />}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <PriorityDot priority={t.priority} />
                    <span className="text-xs text-zinc-600">{toLocalDate(t.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Pending Quotes */}
        <Panel
          icon={Package} iconColor="text-amber-400"
          title="پیش‌فاکتورهای انبوه" href="/admin/super-dashboard/support/quotes"
        >
          {s.pendingQuotes.length === 0 ? <Empty text="درخواستی وجود ندارد" /> : (
            <div className="divide-y divide-zinc-800">
              {s.pendingQuotes.map((q) => (
                <div key={q.id} className="py-3">
                  <p className="text-sm text-zinc-200 truncate">{q.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500 font-mono">{q.quote_number}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">{toLocalDate(q.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Audit log */}
        <Panel
          icon={Activity} iconColor="text-zinc-400"
          title="لاگ فعالیت سیستم" href="/admin/super-dashboard/logs/audit"
        >
          {s.recentAudit.length === 0 ? <Empty text="رویدادی ثبت نشده" /> : (
            <div className="divide-y divide-zinc-800">
              {s.recentAudit.map((log) => (
                <div key={log.id} className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 uppercase">
                      {log.action}
                    </span>
                    <span className="text-xs text-zinc-500 truncate">{log.resource}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-700">{toLocalDate(log.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* ── Quick actions grid ───────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          دسترسی سریع
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((l) => (
            <QuickLink key={l.href} {...l} />
          ))}
        </div>
      </div>

      {/* ── System health ────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3">
        {HEALTH_CHECKS.map((h) => (
          <div key={h.label} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <h.icon className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-zinc-400">{h.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${h.status === 'ok' ? 'bg-emerald-500' : h.status === 'warn' ? 'bg-amber-500' : 'bg-red-500'}`} />
              <span className={`text-xs font-semibold ${h.status === 'ok' ? 'text-emerald-400' : h.status === 'warn' ? 'text-amber-400' : 'text-red-400'}`}>
                {h.status === 'ok' ? 'عادی' : h.status === 'warn' ? 'هشدار' : 'خطا'}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { href: '/admin/products/new',                         label: 'افزودن محصول جدید',      icon: Package,       color: 'amber'   },
  { href: '/admin/super-dashboard/pricing/frames',        label: 'لیست قیمت چهارچوب',     icon: DollarSign,    color: 'emerald' },
  { href: '/admin/super-dashboard/settings/hero',         label: 'تنظیمات هیرو و بنر',    icon: Star,          color: 'blue'    },
  { href: '/admin/super-dashboard/seo/pages',             label: 'مدیریت سئو صفحات',      icon: TrendingUp,    color: 'purple'  },
  { href: '/admin/super-dashboard/finance/payouts',       label: 'تأیید برداشت همکاران',  icon: CreditCard,    color: 'red'     },
  { href: '/admin/super-dashboard/pricing/tiers',         label: 'سطح‌بندی سازندگان',     icon: Percent,       color: 'amber'   },
  { href: '/admin/super-dashboard/blog/new',              label: 'نوشتن پست وبلاگ',       icon: FileText,      color: 'zinc'    },
  { href: '/admin/super-dashboard/logs/audit',            label: 'لاگ ممیزی کامل',        icon: AlertCircle,   color: 'zinc'    },
  { href: '/admin/super-dashboard/users/broadcast',       label: 'پیام دسته‌جمعی',        icon: Zap,           color: 'emerald' },
  { href: '/admin/super-dashboard/support/kb',            label: 'پایگاه دانش',           icon: FileText,      color: 'blue'    },
  { href: '/admin/super-dashboard/finance/revenue',       label: 'گزارش درآمد کامل',      icon: BarChart3,     color: 'emerald' },
  { href: '/admin/super-dashboard/settings/security',     label: 'تنظیمات امنیتی',       icon: Shield,        color: 'red'     },
] as const

const HEALTH_CHECKS = [
  { label: 'دیتابیس Supabase',  icon: Activity, status: 'ok'   as const },
  { label: 'فضای ذخیره‌سازی',   icon: Package,  status: 'ok'   as const },
  { label: 'سرویس ایمیل/پیامک', icon: Zap,      status: 'ok'   as const },
]

// ─────────────────────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon, label, value, sub, color, href, badge, trend,
}: {
  icon:   React.ElementType
  label:  string
  value:  string
  sub:    string
  color:  'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'indigo'
  href:   string
  badge?: boolean
  trend?: 'up' | 'down' | 'flat' | 'warn'
}) {
  const palette = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue:    'text-blue-400    bg-blue-500/10    border-blue-500/20',
    purple:  'text-purple-400  bg-purple-500/10  border-purple-500/20',
    amber:   'text-amber-400   bg-amber-500/10   border-amber-500/20',
    red:     'text-red-400     bg-red-500/10     border-red-500/20',
    indigo:  'text-indigo-400  bg-indigo-500/10  border-indigo-500/20',
  }
  return (
    <Link
      href={href}
      className="group relative rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-800/50"
    >
      {badge && <span className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-amber-500" />}
      <div className={`mb-3 inline-flex rounded-lg border p-1.5 ${palette[color]}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-lg font-black text-zinc-100 tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] text-zinc-500">{label}</p>
      <div className="mt-2 flex items-center gap-1">
        {trend === 'up'   && <ArrowUpRight   className="h-3 w-3 text-emerald-500" />}
        {trend === 'down' && <ArrowDownRight  className="h-3 w-3 text-red-400" />}
        {trend === 'warn' && <AlertCircle     className="h-3 w-3 text-amber-400" />}
        <span className="text-[11px] text-zinc-600 truncate">{sub}</span>
      </div>
      <ArrowUpRight className="absolute left-3 top-3 h-3 w-3 text-zinc-700 transition-colors group-hover:text-zinc-500" />
    </Link>
  )
}

function RevenueBar({ revenue30d, revenue7d }: { revenue30d: number; revenue7d: number }) {
  const pct7d = revenue30d > 0 ? Math.round((revenue7d / revenue30d) * 100) : 0
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <BarChart3 className="h-4 w-4 text-amber-400" />
          نسبت درآمد هفتگی به ماهانه
        </h2>
        <Link href="/admin/super-dashboard/finance/revenue" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          گزارش کامل ←
        </Link>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs text-zinc-500">
            <span>۳۰ روز گذشته</span>
            <span className="font-mono text-zinc-300">{formatIRR(revenue30d)}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-zinc-800">
            <div className="h-full rounded-full bg-gradient-to-l from-amber-500 to-amber-400" style={{ width: '100%' }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs text-zinc-500">
            <span>۷ روز گذشته ({toFa(pct7d)}٪)</span>
            <span className="font-mono text-emerald-400">{formatIRR(revenue7d)}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${Math.max(pct7d, 2)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertBanner({
  icon: Icon, label, href, color,
}: {
  icon:  React.ElementType
  label: string
  href:  string
  color: 'blue' | 'amber' | 'red'
}) {
  const c = {
    blue:  'border-blue-500/30  bg-blue-500/10  text-blue-400',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    red:   'border-red-500/30   bg-red-500/10   text-red-400',
  }
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80 ${c[color]}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
      <ArrowUpRight className="h-3 w-3 mr-auto opacity-60" />
    </Link>
  )
}

function Panel({
  icon: Icon, iconColor, title, href, children,
}: {
  icon:      React.ElementType
  iconColor: string
  title:     string
  href:      string
  children:  React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          {title}
        </h2>
        <Link href={href} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          همه ←
        </Link>
      </div>
      {children}
    </section>
  )
}

function QuickLink({
  href, label, icon: Icon, color,
}: {
  href:  string
  label: string
  icon:  React.ElementType
  color: string
}) {
  const colors: Record<string, string> = {
    amber:   'text-amber-400   bg-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    blue:    'text-blue-400    bg-blue-500/10',
    purple:  'text-purple-400  bg-purple-500/10',
    red:     'text-red-400     bg-red-500/10',
    zinc:    'text-zinc-400    bg-zinc-700/50',
  }
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-200"
    >
      <div className={`rounded-lg p-1.5 ${colors[color]}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      {label}
    </Link>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-zinc-600">{text}</p>
}

function VIPBadge() {
  return (
    <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
      VIP
    </span>
  )
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low:    'bg-zinc-600',
    normal: 'bg-zinc-500',
    high:   'bg-amber-500',
    urgent: 'bg-red-500 animate-pulse',
  }
  return <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors[priority] ?? 'bg-zinc-600'}`} />
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatIRR(amount: number): string {
  if (amount === 0) return '—'
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1).replace('.', '.')} میلیارد`
  if (amount >= 1_000_000)     return `${Math.round(amount / 1_000_000)} میلیون`
  return new Intl.NumberFormat('fa-IR').format(amount) + ' ﷼'
}

function toFa(n: number): string {
  return n.toLocaleString('fa-IR')
}

function toLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
