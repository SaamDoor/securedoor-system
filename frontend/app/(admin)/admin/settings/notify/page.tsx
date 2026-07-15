'use client'
import { useEffect, useState } from 'react'
import { Save, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { getSettingsAction, saveSettingsAction } from '../../actions'

export default function NotifySettingsPage() {
  const [toggles, setToggles] = useState({
    newOrder: false,
    ticket: false,
    registration: false,
  })
  const [sendType, setSendType] = useState<'sms' | 'email' | 'both'>('both')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      const result = await getSettingsAction()
      if (!result.ok) {
        toast.error(result.error)
        setLoading(false)
        return
      }
      const map = new Map((result.data ?? []).map((item: Record<string, unknown>) => [String(item.key), item.value]))
      setToggles({
        newOrder: Boolean(map.get('notify_new_order') ?? true),
        ticket: Boolean(map.get('notify_new_ticket') ?? true),
        registration: Boolean(map.get('notify_user_registration') ?? false),
      })
      const type = String(map.get('notify_send_type') ?? 'both')
      setSendType(type === 'sms' || type === 'email' ? type : 'both')
      setLoading(false)
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const result = await saveSettingsAction([
      { key: 'notify_new_order', value: toggles.newOrder, group: 'notify' },
      { key: 'notify_new_ticket', value: toggles.ticket, group: 'notify' },
      { key: 'notify_user_registration', value: toggles.registration, group: 'notify' },
      { key: 'notify_send_type', value: sendType, group: 'notify' },
    ])
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('تنظیمات اطلاع‌رسانی ذخیره شد')
  }

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-zinc-700 last:border-0">
      <span className="text-zinc-300">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-amber-500' : 'bg-zinc-600'}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'right-1' : 'right-7'}`} />
      </button>
    </div>
  )

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تنظیمات اطلاع‌رسانی</h1>
          <p className="text-zinc-400 mt-1">انتخاب کنید کدام رویدادها اطلاع‌رسانی داشته باشند</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 space-y-2">
          {loading && <p className="pb-3 text-sm text-zinc-400">در حال بارگذاری تنظیمات...</p>}
          <Toggle
            label="اطلاع‌رسانی سفارش جدید"
            value={toggles.newOrder}
            onChange={v => setToggles({ ...toggles, newOrder: v })}
          />
          <Toggle
            label="اطلاع‌رسانی تیکت جدید"
            value={toggles.ticket}
            onChange={v => setToggles({ ...toggles, ticket: v })}
          />
          <Toggle
            label="اطلاع‌رسانی ثبت‌نام کاربر جدید"
            value={toggles.registration}
            onChange={v => setToggles({ ...toggles, registration: v })}
          />

          <div className="pt-4">
            <label className="block text-sm font-medium text-zinc-300 mb-3">نوع ارسال</label>
            <div className="flex gap-3">
              {([['sms', 'پیامک'], ['email', 'ایمیل'], ['both', 'هر دو']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setSendType(val)}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                    sendType === val
                      ? 'bg-amber-500 text-zinc-900'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              <Save size={16} />
              {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
