'use client'
import { useEffect, useState } from 'react'
import { Save, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { getSettingsAction, saveSettingsAction } from '../../actions'

export default function SecuritySettingsPage() {
  const [form, setForm] = useState({
    maxLoginAttempts: '',
    lockDuration: '',
    tokenExpiry: '',
  })
  const [twoFactor, setTwoFactor] = useState(false)
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
      setForm({
        maxLoginAttempts: String(map.get('security_max_login_attempts') ?? '5'),
        lockDuration: String(map.get('security_lock_duration_min') ?? '30'),
        tokenExpiry: String(map.get('security_token_expiry_hours') ?? '24'),
      })
      setTwoFactor(Boolean(map.get('security_two_factor_required') ?? false))
      setLoading(false)
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const result = await saveSettingsAction([
      { key: 'security_max_login_attempts', value: Number(form.maxLoginAttempts || 5), group: 'security' },
      { key: 'security_lock_duration_min', value: Number(form.lockDuration || 30), group: 'security' },
      { key: 'security_token_expiry_hours', value: Number(form.tokenExpiry || 24), group: 'security' },
      { key: 'security_two_factor_required', value: twoFactor, group: 'security' },
    ])
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('تنظیمات امنیتی ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تنظیمات امنیتی</h1>
          <p className="text-zinc-400 mt-1">پارامترهای امنیتی سیستم را پیکربندی کنید</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 space-y-5">
          {loading && <p className="text-sm text-zinc-400">در حال بارگذاری تنظیمات...</p>}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">حداکثر تلاش ورود</label>
            <input
              type="number"
              value={form.maxLoginAttempts}
              onChange={e => setForm({ ...form, maxLoginAttempts: e.target.value })}
              min="1" max="20"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-500 mt-1">تعداد تلاش ناموفق قبل از قفل حساب</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">مدت قفل حساب (دقیقه)</label>
            <input
              type="number"
              value={form.lockDuration}
              onChange={e => setForm({ ...form, lockDuration: e.target.value })}
              min="1"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-y border-zinc-700">
            <div>
              <p className="text-zinc-300 font-medium">نیاز به تأیید دو مرحله‌ای</p>
              <p className="text-xs text-zinc-500 mt-0.5">فعال‌سازی OTP برای ورود به پنل ادمین</p>
            </div>
            <button
              onClick={() => setTwoFactor(!twoFactor)}
              className={`relative w-12 h-6 rounded-full transition-colors ${twoFactor ? 'bg-amber-500' : 'bg-zinc-600'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${twoFactor ? 'right-1' : 'right-7'}`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">مدت اعتبار توکن (ساعت)</label>
            <input
              type="number"
              value={form.tokenExpiry}
              onChange={e => setForm({ ...form, tokenExpiry: e.target.value })}
              min="1"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-500 mt-1">مدت زمان اعتبار توکن ورود کاربران</p>
          </div>

          <div className="pt-2">
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
