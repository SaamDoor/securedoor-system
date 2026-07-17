import 'server-only'

import { getSupabaseUrl } from '@/lib/supabase/env'

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown'

export interface ResourceMetric {
  key: string
  label: string
  value: number | null
  formatted: string
  unit?: string
  percent?: number
  status: HealthStatus
  hint?: string
}

export interface ServiceHealth {
  name: string
  status: string
  healthy: boolean
}

export interface SupabaseHealth {
  configured: boolean
  connected: boolean
  projectRef: string | null
  projectUrl: string | null
  dashboardUrl: string | null
  metrics: ResourceMetric[]
  services: ServiceHealth[]
  sampledAt: string
  error?: string
  managementApiConfigured: boolean
}

export interface LiaraHealth {
  configured: boolean
  connected: boolean
  appName: string
  dashboardUrl: string
  status?: string
  plan?: string
  metrics: ResourceMetric[]
  sampledAt: string
  error?: string
  canRestart: boolean
}

interface PromSample {
  name: string
  labels: Record<string, string>
  value: number
}

function parsePrometheus(text: string): PromSample[] {
  const samples: PromSample[] = []

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const match = line.match(
      /^([a-zA-Z_:][a-zA-Z0-9_:]*)(?:\{([^}]*)\})?\s+(-?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?|NaN|[+-]Inf)(?:\s+\d+)?$/,
    )
    if (!match) continue

    const value = Number(match[3])
    if (!Number.isFinite(value)) continue

    const labels: Record<string, string> = {}
    const labelText = match[2]
    if (labelText) {
      const labelPattern = /([a-zA-Z_][a-zA-Z0-9_]*)="((?:\\.|[^"])*)"/g
      let labelMatch: RegExpExecArray | null
      while ((labelMatch = labelPattern.exec(labelText)) !== null) {
        labels[labelMatch[1]] = labelMatch[2].replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      }
    }

    samples.push({ name: match[1], labels, value })
  }

  return samples
}

function values(samples: PromSample[], name: string) {
  return samples.filter((sample) => sample.name === name).map((sample) => sample.value)
}

function sum(samples: PromSample[], name: string): number | null {
  const list = values(samples, name)
  return list.length ? list.reduce((total, value) => total + value, 0) : null
}

function max(samples: PromSample[], name: string): number | null {
  const list = values(samples, name)
  return list.length ? Math.max(...list) : null
}

function firstSum(samples: PromSample[], names: string[]): number | null {
  for (const name of names) {
    const value = sum(samples, name)
    if (value !== null) return value
  }
  return null
}

function firstMax(samples: PromSample[], names: string[]): number | null {
  for (const name of names) {
    const value = max(samples, name)
    if (value !== null) return value
  }
  return null
}

function clampPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return undefined
  return Math.max(0, Math.min(100, value))
}

function statusForPercent(value: number | undefined, warning: number, critical: number): HealthStatus {
  if (value === undefined) return 'unknown'
  if (value >= critical) return 'critical'
  if (value >= warning) return 'warning'
  return 'healthy'
}

function formatNumber(value: number | null, digits = 0) {
  if (value === null || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: digits }).format(value)
}

function formatBytes(bytes: number | null) {
  if (bytes === null || !Number.isFinite(bytes)) return '—'
  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت']
  let value = Math.max(0, bytes)
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${formatNumber(value, value < 10 ? 2 : 1)} ${units[unit]}`
}

function formatDuration(seconds: number | null) {
  if (seconds === null || seconds < 0 || !Number.isFinite(seconds)) return '—'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `${formatNumber(days)} روز و ${formatNumber(hours)} ساعت`
  return `${formatNumber(hours)} ساعت`
}

function deriveProjectRef(url: string) {
  try {
    return new URL(url).hostname.split('.')[0] || null
  } catch {
    return null
  }
}

async function fetchSupabaseServices(projectRef: string): Promise<ServiceHealth[]> {
  const token = process.env.SUPABASE_ACCESS_TOKEN
  if (!token) return []

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/health`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(8_000),
  })

  if (!response.ok) return []
  const payload: unknown = await response.json()
  const rows = Array.isArray(payload)
    ? payload
    : typeof payload === 'object' && payload && 'services' in payload
      ? (payload as { services?: unknown }).services
      : []

  if (!Array.isArray(rows)) return []

  return rows.flatMap((row) => {
    if (!row || typeof row !== 'object') return []
    const item = row as Record<string, unknown>
    const name = String(item.name ?? item.service ?? 'service')
    const status = String(item.status ?? 'UNKNOWN')
    return [{ name, status, healthy: /healthy|active/i.test(status) }]
  })
}

export async function fetchSupabaseHealth(): Promise<SupabaseHealth> {
  const sampledAt = new Date().toISOString()
  const projectUrl = getSupabaseUrl()
  const projectRef = projectUrl ? deriveProjectRef(projectUrl) : null
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const managementApiConfigured = Boolean(process.env.SUPABASE_ACCESS_TOKEN)

  if (!projectUrl || !projectRef || !secretKey) {
    return {
      configured: false,
      connected: false,
      projectRef,
      projectUrl: projectUrl || null,
      dashboardUrl: projectRef ? `https://supabase.com/dashboard/project/${projectRef}` : null,
      metrics: [],
      services: [],
      sampledAt,
      managementApiConfigured,
      error: 'کلید Secret/Service Role برای Metrics API تنظیم نشده است.',
    }
  }

  try {
    const [metricsResponse, services] = await Promise.all([
      fetch(`${projectUrl}/customer/v1/privileged/metrics`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`service_role:${secretKey}`).toString('base64')}`,
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(12_000),
      }),
      fetchSupabaseServices(projectRef).catch(() => []),
    ])

    if (!metricsResponse.ok) {
      throw new Error(
        metricsResponse.status === 401
          ? 'کلید Supabase برای Metrics API معتبر نیست؛ Secret API Key جدید را تنظیم کنید.'
          : `Metrics API با کد ${metricsResponse.status} پاسخ داد.`,
      )
    }

    const samples = parsePrometheus(await metricsResponse.text())

    const totalMemory = max(samples, 'node_memory_MemTotal_bytes')
    const availableMemory = max(samples, 'node_memory_MemAvailable_bytes')
    const memoryPercent =
      totalMemory && availableMemory !== null
        ? clampPercent(((totalMemory - availableMemory) / totalMemory) * 100)
        : undefined

    const cpuRows = samples.filter((sample) => sample.name === 'node_cpu_seconds_total')
    const cpuCores = new Set(cpuRows.map((sample) => sample.labels.cpu).filter(Boolean)).size || null
    const load5 = max(samples, 'node_load5')
    const loadPercent =
      load5 !== null && cpuCores ? clampPercent((load5 / cpuCores) * 100) : undefined

    const dbSizeBytes = firstMax(samples, ['pg_database_size_bytes'])
    const legacyDbSizeMb = firstMax(samples, ['pg_database_size_mb'])
    const dbSizeMb = dbSizeBytes !== null ? dbSizeBytes / 1024 / 1024 : legacyDbSizeMb
    const connections = firstSum(samples, [
      'connection_stats_connection_count',
      'pg_stat_database_num_backends',
    ])
    const maxConnections = firstMax(samples, [
      'max_connections_connection_count',
      'pg_settings_max_connections',
      'pg_settings_max_connections_value',
    ])
    const connectionPercent =
      connections !== null && maxConnections
        ? clampPercent((connections / maxConnections) * 100)
        : undefined

    const cacheHits = firstSum(samples, [
      'pg_stat_database_blks_hit_total',
      'pg_stat_database_blks_hit',
    ])
    const diskReads = firstSum(samples, [
      'pg_stat_database_blks_read_total',
      'pg_stat_database_blks_read',
    ])
    const cachePercent =
      cacheHits !== null && diskReads !== null && cacheHits + diskReads > 0
        ? clampPercent((cacheHits / (cacheHits + diskReads)) * 100)
        : undefined

    const commits = firstSum(samples, [
      'pg_stat_database_xact_commit_total',
      'pg_stat_database_xact_commit',
    ])
    const rollbacks = firstSum(samples, [
      'pg_stat_database_xact_rollback_total',
      'pg_stat_database_xact_rollback',
    ])
    const deadlocks = firstSum(samples, [
      'pg_stat_database_deadlocks_total',
      'pg_stat_database_deadlocks',
    ])
    const bootTime = max(samples, 'node_boot_time_seconds')
    const uptime = bootTime ? Date.now() / 1000 - bootTime : null

    const metrics: ResourceMetric[] = [
      {
        key: 'load',
        label: 'بار پردازنده',
        value: loadPercent ?? null,
        formatted:
          load5 === null
            ? '—'
            : `${formatNumber(load5, 2)}${cpuCores ? ` / ${formatNumber(cpuCores)} هسته` : ''}`,
        unit: 'Load 5m',
        percent: loadPercent,
        status: statusForPercent(loadPercent, 75, 90),
        hint: 'نسبت Load پنج‌دقیقه‌ای به تعداد هسته‌ها',
      },
      {
        key: 'memory',
        label: 'حافظه RAM',
        value: memoryPercent ?? null,
        formatted:
          totalMemory === null
            ? '—'
            : `${formatBytes(totalMemory - (availableMemory ?? totalMemory))} از ${formatBytes(totalMemory)}`,
        percent: memoryPercent,
        status: statusForPercent(memoryPercent, 80, 92),
      },
      {
        key: 'database-size',
        label: 'حجم دیتابیس',
        value: dbSizeMb,
        formatted: dbSizeMb === null ? '—' : `${formatNumber(dbSizeMb, 1)} مگابایت`,
        status: dbSizeMb === null ? 'unknown' : dbSizeMb >= 450 ? 'critical' : dbSizeMb >= 350 ? 'warning' : 'healthy',
        hint: 'در پلن رایگان، نزدیک‌شدن به ۵۰۰MB مهم است.',
      },
      {
        key: 'connections',
        label: 'اتصال‌های PostgreSQL',
        value: connections,
        formatted:
          connections === null
            ? '—'
            : `${formatNumber(connections)}${maxConnections ? ` از ${formatNumber(maxConnections)}` : ''}`,
        percent: connectionPercent,
        status: statusForPercent(connectionPercent, 75, 90),
      },
      {
        key: 'cache',
        label: 'نرخ موفقیت کش',
        value: cachePercent ?? null,
        formatted: cachePercent === undefined ? '—' : `${formatNumber(cachePercent, 1)}٪`,
        percent: cachePercent,
        status:
          cachePercent === undefined
            ? 'unknown'
            : cachePercent < 90
              ? 'critical'
              : cachePercent < 97
                ? 'warning'
                : 'healthy',
      },
      {
        key: 'transactions',
        label: 'تراکنش‌ها',
        value: commits,
        formatted:
          commits === null
            ? '—'
            : `${formatNumber(commits)} موفق / ${formatNumber(rollbacks ?? 0)} بازگشتی`,
        status:
          rollbacks && commits && rollbacks / Math.max(commits + rollbacks, 1) > 0.05
            ? 'warning'
            : 'healthy',
      },
      {
        key: 'deadlocks',
        label: 'بن‌بست‌های دیتابیس',
        value: deadlocks,
        formatted: formatNumber(deadlocks),
        status: deadlocks === null ? 'unknown' : deadlocks > 0 ? 'warning' : 'healthy',
      },
      {
        key: 'uptime',
        label: 'زمان فعالیت',
        value: uptime,
        formatted: formatDuration(uptime),
        status: uptime === null ? 'unknown' : 'healthy',
      },
    ]

    return {
      configured: true,
      connected: true,
      projectRef,
      projectUrl,
      dashboardUrl: `https://supabase.com/dashboard/project/${projectRef}`,
      metrics,
      services,
      sampledAt,
      managementApiConfigured,
    }
  } catch (error) {
    return {
      configured: true,
      connected: false,
      projectRef,
      projectUrl,
      dashboardUrl: `https://supabase.com/dashboard/project/${projectRef}`,
      metrics: [],
      services: [],
      sampledAt,
      managementApiConfigured,
      error: error instanceof Error ? error.message : 'دریافت متریک‌های Supabase ناموفق بود.',
    }
  }
}

function latestLiaraValue(series: unknown): number | null {
  if (!Array.isArray(series) || series.length === 0) return null
  const row = series[series.length - 1]
  if (!row || typeof row !== 'object') return null
  const raw = (row as Record<string, unknown>).value
  if (Array.isArray(raw)) {
    for (let index = raw.length - 1; index >= 0; index -= 1) {
      const value = Number(raw[index])
      if (Number.isFinite(value)) return value
    }
  }
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function extractLiaraProject(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') return {}
  const root = payload as Record<string, unknown>
  for (const key of ['project', 'data', 'result']) {
    if (root[key] && typeof root[key] === 'object' && !Array.isArray(root[key])) {
      return root[key] as Record<string, unknown>
    }
  }
  return root
}

export async function fetchLiaraHealth(): Promise<LiaraHealth> {
  const sampledAt = new Date().toISOString()
  const token = process.env.LIARA_API_TOKEN
  const appName = process.env.LIARA_APP_NAME || 'mashuf'
  const dashboardUrl = `https://console.liara.ir/apps/${encodeURIComponent(appName)}`

  if (!token) {
    return {
      configured: false,
      connected: false,
      appName,
      dashboardUrl,
      metrics: [],
      sampledAt,
      canRestart: false,
      error: 'متغیر LIARA_API_TOKEN در محیط اجرای برنامه تنظیم نشده است.',
    }
  }

  const headers = { Authorization: `Bearer ${token}` }

  try {
    const [summaryResponse, projectResponse] = await Promise.all([
      fetch(`https://api.iran.liara.ir/v1/projects/${encodeURIComponent(appName)}/metrics/summary`, {
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      }),
      fetch(`https://api.iran.liara.ir/v1/projects/${encodeURIComponent(appName)}`, {
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      }),
    ])

    if (!summaryResponse.ok) {
      throw new Error(
        summaryResponse.status === 401
          ? 'توکن API لیارا معتبر نیست.'
          : `API لیارا با کد ${summaryResponse.status} پاسخ داد.`,
      )
    }

    const summary = (await summaryResponse.json()) as Record<string, unknown>
    const project = projectResponse.ok
      ? extractLiaraProject(await projectResponse.json())
      : {}

    const cpu = latestLiaraValue(summary.cpuUsage)
    const memory = latestLiaraValue(summary.memoryUsage)
    const disks = Array.isArray(summary.disksUsage) ? summary.disksUsage : []
    const disk = disks[0] && typeof disks[0] === 'object'
      ? disks[0] as Record<string, unknown>
      : null
    const rawDiskUsage = disk ? Number(disk.usage) : Number.NaN
    const rawDiskSize = disk ? Number(disk.size) : Number.NaN
    const diskUsage = Number.isFinite(rawDiskUsage) ? rawDiskUsage : null
    const diskSize = Number.isFinite(rawDiskSize) ? rawDiskSize : null
    const diskPercent =
      diskUsage !== null && diskSize !== null && diskSize > 0
        ? clampPercent((diskUsage / diskSize) * 100)
        : undefined

    const metrics: ResourceMetric[] = [
      {
        key: 'liara-cpu',
        label: 'پردازنده',
        value: cpu,
        formatted: cpu === null ? '—' : `${formatNumber(cpu, 1)}٪`,
        percent: clampPercent(cpu),
        status: statusForPercent(clampPercent(cpu), 75, 90),
      },
      {
        key: 'liara-memory',
        label: 'حافظه RAM',
        value: memory,
        formatted: memory === null ? '—' : `${formatNumber(memory, 1)}٪`,
        percent: clampPercent(memory),
        status: statusForPercent(clampPercent(memory), 80, 92),
      },
      {
        key: 'liara-disk',
        label: disk ? String(disk.name ?? 'دیسک') : 'دیسک',
        value: diskUsage,
        formatted:
          diskUsage !== null && diskSize !== null
            ? `${formatBytes(diskUsage)} از ${formatBytes(diskSize)}`
            : 'دیسک دائمی متصل نیست',
        percent: diskPercent,
        status: statusForPercent(diskPercent, 80, 92),
      },
    ]

    return {
      configured: true,
      connected: true,
      appName,
      dashboardUrl,
      status: String(project.status ?? project.state ?? project.scale ?? 'فعال'),
      plan: String(project.plan ?? project.planID ?? project.type ?? ''),
      metrics,
      sampledAt,
      canRestart: true,
    }
  } catch (error) {
    return {
      configured: true,
      connected: false,
      appName,
      dashboardUrl,
      metrics: [],
      sampledAt,
      canRestart: false,
      error: error instanceof Error ? error.message : 'دریافت متریک‌های لیارا ناموفق بود.',
    }
  }
}
