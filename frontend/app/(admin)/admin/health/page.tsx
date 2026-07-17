import { SystemHealthDashboard } from '@/components/admin/system-health-dashboard'
import { getDashboardStatsAction, getSystemResourcesAction } from '../actions'

export default async function HealthPage() {
  const [resourceResult, statsResult] = await Promise.all([
    getSystemResourcesAction(),
    getDashboardStatsAction(),
  ])

  const stats = statsResult.ok ? statsResult.data : null
  const applicationMetrics = [
    { name: 'سفارش‌ها', value: stats?.orderCount ?? 0 },
    { name: 'محصولات', value: stats?.productCount ?? 0 },
    { name: 'کاربران', value: stats?.userCount ?? 0 },
    { name: 'تیکت‌های باز', value: stats?.openTickets ?? 0 },
    { name: 'نظرات معلق', value: stats?.pendingReviews ?? 0 },
  ]

  if (!resourceResult.ok) {
    return (
      <div dir="rtl" className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-black text-white">وضعیت و منابع سیستم</h1>
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {resourceResult.error}
        </div>
      </div>
    )
  }

  return (
    <SystemHealthDashboard
      supabase={resourceResult.data.supabase}
      liara={resourceResult.data.liara}
      applicationMetrics={applicationMetrics}
    />
  )
}
