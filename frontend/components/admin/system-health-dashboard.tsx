'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  ExternalLink,
  Gauge,
  HardDrive,
  MemoryStick,
  RefreshCw,
  RotateCw,
  Server,
  Settings2,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type {
  HealthStatus,
  LiaraHealth,
  ResourceMetric,
  SupabaseHealth,
} from '@/lib/admin/system-health.server'
import { restartLiaraAppAction } from '@/app/(admin)/admin/actions'

type ProviderTab = 'supabase' | 'liara' | 'application'

interface Props {
  supabase: SupabaseHealth
  liara: LiaraHealth
  applicationMetrics: Array<{ name: string; value: number }>
}

const STATUS_STYLES: Record<HealthStatus, string> = {
  healthy: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  critical: 'border-red-500/20 bg-red-500/10 text-red-300',
  unknown: 'border-white/10 bg-white/5 text-zinc-400',
}

const STATUS_LABELS: Record<HealthStatus, string> = {
  healthy: 'سالم',
  warning: 'نیاز به توجه',
  critical: 'بحرانی',
  unknown: 'نامشخص',
}

function StatusIcon({ status, className }: { status: HealthStatus; className?: string }) {
  if (status === 'healthy') return <CheckCircle2 className={cn('text-emerald-400', className)} />
  if (status === 'warning') return <AlertTriangle className={cn('text-amber-400', className)} />
  if (status === 'critical') return <XCircle className={cn('text-red-400', className)} />
  return <Activity className={cn('text-zinc-500', className)} />
}

function metricIcon(key: string) {
  if (key.includes('memory')) return MemoryStick
  if (key.includes('disk') || key.includes('database-size')) return HardDrive
  if (key.includes('connection')) return Database
  if (key.includes('uptime')) return Clock3
  if (key.includes('cpu') || key === 'load') return Cpu
  return Gauge
}

function ResourceCard({ metric }: { metric: ResourceMetric }) {
  const Icon = metricIcon(metric.key)
  const progressVariant =
    metric.status === 'critical'
      ? 'danger'
      : metric.status === 'healthy'
        ? 'success'
        : metric.status === 'warning'
          ? 'gold'
          : 'muted'

  return (
    <div className="rounded-2xl border border-white/8 bg-[#181818] p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03]">
            <Icon className="h-4.5 w-4.5 text-zinc-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-zinc-500">{metric.label}</p>
            <p className="mt-1 truncate text-base font-black text-white">{metric.formatted}</p>
          </div>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold',
            STATUS_STYLES[metric.status],
          )}
        >
          {STATUS_LABELS[metric.status]}
        </span>
      </div>

      {metric.percent !== undefined && (
        <div>
          <Progress value={metric.percent} variant={progressVariant} />
          <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
            <span>۰٪</span>
            <span>{new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(metric.percent)}٪</span>
            <span>۱۰۰٪</span>
          </div>
        </div>
      )}

      {metric.hint && <p className="mt-3 text-[11px] leading-5 text-zinc-600">{metric.hint}</p>}
    </div>
  )
}

function ConnectionBanner({
  connected,
  configured,
  error,
  provider,
}: {
  connected: boolean
  configured: boolean
  error?: string
  provider: string
}) {
  if (connected) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        اتصال زنده به {provider} برقرار است.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div>
          <p className="text-sm font-bold text-amber-300">
            {configured ? `ارتباط با ${provider} برقرار نشد` : `${provider} هنوز پیکربندی نشده`}
          </p>
          {error && <p className="mt-1 text-xs leading-5 text-amber-200/70">{error}</p>}
        </div>
      </div>
    </div>
  )
}

function SupabasePanel({ data }: { data: SupabaseHealth }) {
  const base = data.dashboardUrl

  return (
    <div className="space-y-5">
      <ConnectionBanner
        connected={data.connected}
        configured={data.configured}
        error={data.error}
        provider="Supabase"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => <ResourceCard key={metric.key} metric={metric} />)}
      </div>

      {data.services.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-white/8 bg-[#181818]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-white">سلامت سرویس‌های Supabase</h2>
              <p className="mt-1 text-xs text-zinc-500">وضعیت رسمی Management API</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-gold" />
          </div>
          <div className="grid grid-cols-1 divide-y divide-white/5 sm:grid-cols-2 sm:divide-x sm:divide-x-reverse sm:divide-y-0 xl:grid-cols-4">
            {data.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between gap-3 px-5 py-4">
                <span className="text-sm text-zinc-300">{service.name}</span>
                <span className={cn('text-xs', service.healthy ? 'text-emerald-400' : 'text-amber-400')}>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-white/8 bg-[#181818] p-5">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-white">مدیریت Supabase</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            تغییر پلن، حجم دیسک و تنظیمات حساس از داشبورد رسمی انجام می‌شود تا اطلاعات پرداخت و کلیدها وارد مرورگر نشوند.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {base && (
            <>
              <Button asChild variant="dark" size="sm">
                <Link href={base} target="_blank" rel="noreferrer">
                  داشبورد پروژه <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="dark" size="sm">
                <Link href={`${base}/reports/database`} target="_blank" rel="noreferrer">
                  گزارش دیتابیس
                </Link>
              </Button>
              <Button asChild variant="dark" size="sm">
                <Link href={`${base}/settings/database`} target="_blank" rel="noreferrer">
                  تنظیمات منابع
                </Link>
              </Button>
              <Button asChild variant="dark" size="sm">
                <Link href={`${base}/advisors/security`} target="_blank" rel="noreferrer">
                  Security Advisor
                </Link>
              </Button>
              <Button asChild variant="dark" size="sm">
                <Link href={`${base}/logs/explorer`} target="_blank" rel="noreferrer">
                  لاگ‌ها
                </Link>
              </Button>
            </>
          )}
        </div>
        {!data.managementApiConfigured && (
          <p className="mt-4 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5 text-[11px] leading-5 text-zinc-500">
            برای نمایش سلامت جداگانه Auth، Database، Storage و Realtime متغیر
            <code className="mx-1 text-zinc-300">SUPABASE_ACCESS_TOKEN</code>
            را در لیارا تنظیم کنید. متریک منابع بدون آن هم کار می‌کند.
          </p>
        )}
      </section>
    </div>
  )
}

function LiaraPanel({ data }: { data: LiaraHealth }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function restart() {
    if (!window.confirm('اپ لیارا برای چند لحظه ری‌استارت می‌شود. ادامه می‌دهید؟')) return

    startTransition(async () => {
      const result = await restartLiaraAppAction()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('درخواست ری‌استارت لیارا ثبت شد')
      setTimeout(() => router.refresh(), 5_000)
    })
  }

  return (
    <div className="space-y-5">
      <ConnectionBanner
        connected={data.connected}
        configured={data.configured}
        error={data.error}
        provider="لیارا"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {data.metrics.map((metric) => <ResourceCard key={metric.key} metric={metric} />)}
      </div>

      <section className="rounded-2xl border border-white/8 bg-[#181818] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">مدیریت اپ {data.appName}</h2>
            <p className="mt-1 text-xs text-zinc-500">
              وضعیت: {data.status || '—'} {data.plan ? `· پلن: ${data.plan}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="dark" size="sm">
              <Link href={data.dashboardUrl} target="_blank" rel="noreferrer">
                پنل لیارا <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="gold-outline"
              size="sm"
              disabled={!data.canRestart || isPending}
              onClick={restart}
            >
              <RotateCw className={cn('h-3.5 w-3.5', isPending && 'animate-spin')} />
              ری‌استارت امن
            </Button>
          </div>
        </div>
        {!data.configured && (
          <p className="mt-4 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5 text-[11px] leading-5 text-zinc-500">
            برای دریافت CPU، RAM و دیسک و فعال‌کردن ری‌استارت، توکن API لیارا را با نام
            <code className="mx-1 text-zinc-300">LIARA_API_TOKEN</code>
            و نام اپ را با
            <code className="mx-1 text-zinc-300">LIARA_APP_NAME=mashuf</code>
            در متغیرهای محیطی لیارا قرار دهید.
          </p>
        )}
      </section>
    </div>
  )
}

function ApplicationPanel({ metrics }: { metrics: Props['applicationMetrics'] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      {metrics.map((metric) => (
        <div key={metric.name} className="rounded-2xl border border-white/8 bg-[#181818] p-5">
          <p className="text-xs text-zinc-500">{metric.name}</p>
          <p className="mt-2 text-xl font-black text-white">
            {new Intl.NumberFormat('fa-IR').format(metric.value)}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            دیتابیس پاسخ‌گو
          </div>
        </div>
      ))}
    </div>
  )
}

export function SystemHealthDashboard({ supabase, liara, applicationMetrics }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<ProviderTab>('supabase')
  const [isRefreshing, startRefresh] = useTransition()

  useEffect(() => {
    const timer = window.setInterval(() => {
      startRefresh(() => router.refresh())
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [router])

  const tabs: Array<{ id: ProviderTab; label: string; icon: typeof Database; connected: boolean }> = [
    { id: 'supabase', label: 'Supabase', icon: Database, connected: supabase.connected },
    { id: 'liara', label: 'لیارا', icon: Server, connected: liara.connected },
    { id: 'application', label: 'اپلیکیشن', icon: Activity, connected: true },
  ]

  const sampledAt = tab === 'liara' ? liara.sampledAt : supabase.sampledAt

  return (
    <div className="mx-auto max-w-[1600px] space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-gold">
            <Activity className="h-4 w-4" />
            مانیتورینگ زنده
          </div>
          <h1 className="text-2xl font-black text-white">وضعیت و منابع سیستم</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Supabase، سرور لیارا و شاخص‌های عملیاتی فروشگاه
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-[11px] text-zinc-600 sm:block">
            آخرین دریافت: {new Date(sampledAt).toLocaleTimeString('fa-IR')}
          </span>
          <Button
            type="button"
            variant="dark"
            size="sm"
            disabled={isRefreshing}
            onClick={() => startRefresh(() => router.refresh())}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
            به‌روزرسانی
          </Button>
        </div>
      </div>

      <div className="flex w-full gap-1 overflow-x-auto rounded-2xl border border-white/8 bg-zinc-900/80 p-1.5 hide-scrollbar sm:w-fit">
        {tabs.map(({ id, label, icon: Icon, connected }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-colors',
              tab === id
                ? 'bg-gold text-white'
                : 'text-zinc-500 hover:bg-white/5 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className={cn('h-1.5 w-1.5 rounded-full', connected ? 'bg-emerald-400' : 'bg-amber-400')} />
          </button>
        ))}
      </div>

      {tab === 'supabase' && <SupabasePanel data={supabase} />}
      {tab === 'liara' && <LiaraPanel data={liara} />}
      {tab === 'application' && <ApplicationPanel metrics={applicationMetrics} />}

      <div className="flex items-center gap-2 text-[11px] text-zinc-600">
        <Settings2 className="h-3.5 w-3.5" />
        داده‌ها هر ۶۰ ثانیه به‌روزرسانی می‌شوند. هیچ کلید محرمانه‌ای به مرورگر ارسال نمی‌شود.
      </div>
    </div>
  )
}
