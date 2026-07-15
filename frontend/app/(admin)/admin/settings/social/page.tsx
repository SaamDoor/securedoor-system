'use client'
import { useEffect, useState } from 'react'
import { Save, Link } from 'lucide-react'
import { toast } from 'sonner'
import { getSettingsAction, saveSettingsAction } from '../../actions'

export default function SocialSettingsPage() {
  const [form, setForm] = useState({
    instagram: '',
    telegram: '',
    whatsapp: '',
    youtube: '',
    linkedin: '',
    aparat: '',
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
        instagram: String(map.get('social_instagram') ?? ''),
        telegram: String(map.get('social_telegram') ?? ''),
        whatsapp: String(map.get('social_whatsapp') ?? ''),
        youtube: String(map.get('social_youtube') ?? ''),
        linkedin: String(map.get('social_linkedin') ?? ''),
        aparat: String(map.get('social_aparat') ?? ''),
      })
      setLoading(false)
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const result = await saveSettingsAction([
      { key: 'social_instagram', value: form.instagram, group: 'social' },
      { key: 'social_telegram', value: form.telegram, group: 'social' },
      { key: 'social_whatsapp', value: form.whatsapp, group: 'social' },
      { key: 'social_youtube', value: form.youtube, group: 'social' },
      { key: 'social_linkedin', value: form.linkedin, group: 'social' },
      { key: 'social_aparat', value: form.aparat, group: 'social' },
    ])
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('شبکه‌های اجتماعی ذخیره شد')
  }

  const fields = [
    { key: 'instagram', label: 'اینستاگرام', placeholder: 'https://instagram.com/username' },
    { key: 'telegram', label: 'تلگرام', placeholder: 'https://t.me/username' },
    { key: 'whatsapp', label: 'واتساپ', placeholder: 'https://wa.me/09XXXXXXXXX' },
    { key: 'youtube', label: 'یوتیوب', placeholder: 'https://youtube.com/@channel' },
    { key: 'linkedin', label: 'لینکدین', placeholder: 'https://linkedin.com/company/...' },
    { key: 'aparat', label: 'آپارات', placeholder: 'https://aparat.com/username' },
  ]

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">شبکه‌های اجتماعی</h1>
          <p className="text-zinc-400 mt-1">لینک صفحات شبکه‌های اجتماعی خود را وارد کنید</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 space-y-5">
          {loading && <p className="text-sm text-zinc-400">در حال بارگذاری تنظیمات...</p>}
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-1">
                <Link size={14} /> {field.label}
              </label>
              <input
                type="text"
                value={(form as any)[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none placeholder:text-zinc-500"
              />
            </div>
          ))}

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
