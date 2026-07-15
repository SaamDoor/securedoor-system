'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, XCircle, Save, RefreshCw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getSettingsAction, saveSettingsAction } from '../actions'

const baseIntegrations = [
  { key: 'integration_zarinpal_enabled', name: 'زرین‌پال', category: 'پرداخت', description: 'درگاه پرداخت آنلاین' },
  { key: 'integration_idpay_enabled', name: 'آیدی‌پی', category: 'پرداخت', description: 'درگاه جایگزین پرداخت' },
  { key: 'integration_sms_ir_enabled', name: 'SMS.ir', category: 'پیامک', description: 'ارسال پیامک تراکنشی' },
  { key: 'integration_kavenegar_enabled', name: 'کاوه‌نگار', category: 'پیامک', description: 'ارسال پیامک و اعلان' },
  { key: 'integration_torob_enabled', name: 'ترب', category: 'مارکت‌پلیس', description: 'همگام‌سازی قیمت با ترب' },
]

export default function IntegrationsPage() {
  const [states, setStates] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      const result = await getSettingsAction()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      const map = new Map((result.data ?? []).map((item: Record<string, unknown>) => [String(item.key), item.value]))
      const nextState: Record<string, boolean> = {}
      baseIntegrations.forEach((item) => {
        nextState[item.key] = Boolean(map.get(item.key) ?? false)
      })
      setStates(nextState)
    })()
  }, [])

  const connectedCount = useMemo(() => Object.values(states).filter(Boolean).length, [states])

  const saveAll = async () => {
    setSaving(true)
    const result = await saveSettingsAction(
      baseIntegrations.map((item) => ({ key: item.key, value: Boolean(states[item.key]), group: 'integrations' })),
    )
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('وضعیت یکپارچه‌سازی‌ها ذخیره شد')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مرکز یکپارچه‌سازی</h1>
          <p className="text-muted text-sm">
            {connectedCount} از {baseIntegrations.length} سرویس فعال
          </p>
        </div>
        <Button variant="gold" size="sm" leftIcon={saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} onClick={saveAll}>
          {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'متصل', value: connectedCount, color: 'text-success-light' },
          { label: 'قطع', value: baseIntegrations.length - connectedCount, color: 'text-danger-light' },
          { label: 'پرداخت', value: baseIntegrations.filter((i) => i.category === 'پرداخت').length, color: 'text-gold' },
          { label: 'پیامک', value: baseIntegrations.filter((i) => i.category === 'پیامک').length, color: 'text-blue-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl bg-surface border border-white/8 text-center">
            <div className={color + ' text-2xl font-black mb-1'}>{value}</div>
            <div className="text-xs text-muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {baseIntegrations.map((integration) => (
          <div
            key={integration.key}
            className={`p-5 rounded-2xl bg-surface border transition-all duration-300 ${
              states[integration.key] ? 'border-success/20 hover:border-success/40' : 'border-white/8 hover:border-white/20'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-bold text-white text-sm">{integration.name}</h3>
                  <span className="text-xs font-medium text-zinc-400">
                    {integration.category}
                  </span>
                </div>
              </div>

              {states[integration.key] ? (
                <CheckCircle className="h-5 w-5 text-success-light flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-muted flex-shrink-0" />
              )}
            </div>

            <p className="text-xs text-muted leading-relaxed mb-4">{integration.description}</p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStates((prev) => ({ ...prev, [integration.key]: !prev[integration.key] }))}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  states[integration.key] ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-700 text-zinc-300'
                }`}
              >
                {states[integration.key] ? 'فعال' : 'غیرفعال'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl bg-gold/5 border border-gold/20 flex items-center gap-4">
        <Zap className="h-8 w-8 text-gold flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-bold text-white mb-1">وب‌هوک‌ها</h3>
          <p className="text-sm text-muted">
            رویدادهای سیستم را به سرویس‌های خارجی ارسال کنید. وضعیت فعال‌سازی در جدول تنظیمات ذخیره می‌شود.
          </p>
        </div>
        <Button asChild variant="gold-outline" size="sm">
          <a href="/admin/webhooks">مدیریت وب‌هوک‌ها</a>
        </Button>
      </div>
    </div>
  )
}
