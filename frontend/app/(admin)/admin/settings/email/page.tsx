'use client'
import { useEffect, useState } from 'react'
import { Save, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { getSettingsAction, saveSettingsAction } from '../../actions'

export default function EmailSettingsPage() {
  const [form, setForm] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: '',
    fromEmail: '',
  })
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
        smtpHost: String(map.get('smtp_host') ?? ''),
        smtpPort: String(map.get('smtp_port') ?? '587'),
        smtpUser: String(map.get('smtp_user') ?? ''),
        smtpPass: String(map.get('smtp_pass') ?? ''),
        fromEmail: String(map.get('smtp_from_email') ?? ''),
      })
      setLoading(false)
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const result = await saveSettingsAction([
      { key: 'smtp_host', value: form.smtpHost, group: 'email' },
      { key: 'smtp_port', value: Number(form.smtpPort || 587), group: 'email' },
      { key: 'smtp_user', value: form.smtpUser, group: 'email' },
      { key: 'smtp_pass', value: form.smtpPass, group: 'email' },
      { key: 'smtp_from_email', value: form.fromEmail, group: 'email' },
    ])
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('تنظیمات ایمیل ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تنظیمات ایمیل</h1>
          <p className="text-zinc-400 mt-1">پیکربندی سرور SMTP برای ارسال ایمیل</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 space-y-5">
          {loading && <p className="text-sm text-zinc-400">در حال بارگذاری تنظیمات...</p>}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">آدرس SMTP</label>
            <input
              type="text"
              value={form.smtpHost}
              onChange={e => setForm({ ...form, smtpHost: e.target.value })}
              placeholder="smtp.gmail.com"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">پورت</label>
            <input
              type="number"
              value={form.smtpPort}
              onChange={e => setForm({ ...form, smtpPort: e.target.value })}
              placeholder="587"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">نام کاربری SMTP</label>
            <input
              type="text"
              value={form.smtpUser}
              onChange={e => setForm({ ...form, smtpUser: e.target.value })}
              placeholder="user@gmail.com"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">رمز SMTP</label>
            <input
              type="password"
              value={form.smtpPass}
              onChange={e => setForm({ ...form, smtpPass: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">ایمیل فرستنده</label>
            <input
              type="email"
              value={form.fromEmail}
              onChange={e => setForm({ ...form, fromEmail: e.target.value })}
              placeholder="noreply@example.com"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
            />
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
