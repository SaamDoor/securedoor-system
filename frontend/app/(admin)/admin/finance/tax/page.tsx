'use client'
import { useEffect, useState } from 'react'
import { Save, Percent } from 'lucide-react'
import { toast } from 'sonner'
import { getSettingsAction, saveSettingsAction } from '../../actions'

export default function TaxPage() {
  const [vatRate, setVatRate] = useState('')
  const [applyOnFrames, setApplyOnFrames] = useState(false)
  const [applyOnInstall, setApplyOnInstall] = useState(false)
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
      setVatRate(String(map.get('tax_rate_percent') ?? '9'))
      setApplyOnFrames(Boolean(map.get('tax_apply_on_frames') ?? true))
      setApplyOnInstall(Boolean(map.get('tax_apply_on_install') ?? false))
      setLoading(false)
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const result = await saveSettingsAction([
      { key: 'tax_rate_percent', value: Number(vatRate || 0), group: 'financial' },
      { key: 'tax_apply_on_frames', value: applyOnFrames, group: 'financial' },
      { key: 'tax_apply_on_install', value: applyOnInstall, group: 'financial' },
    ])
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('تنظیمات مالیات ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تنظیمات مالیات</h1>
          <p className="text-zinc-400 mt-1">پیکربندی نرخ مالیات ارزش افزوده</p>
        </div>
        {loading && <p className="mb-4 text-sm text-zinc-400">در حال دریافت تنظیمات مالیات...</p>}

        <div className="bg-zinc-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              نرخ ارزش افزوده (%)
            </label>
            <input
              type="number"
              value={vatRate}
              onChange={e => setVatRate(e.target.value)}
              min="0" max="100"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-y border-zinc-700">
            <div>
              <p className="text-zinc-300 font-medium">اعمال مالیات بر چهارچوب</p>
              <p className="text-xs text-zinc-500 mt-0.5">شامل مالیات بر قیمت چهارچوب‌ها</p>
            </div>
            <button
              onClick={() => setApplyOnFrames(!applyOnFrames)}
              className={`relative w-12 h-6 rounded-full transition-colors ${applyOnFrames ? 'bg-amber-500' : 'bg-zinc-600'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${applyOnFrames ? 'right-1' : 'right-7'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-zinc-700">
            <div>
              <p className="text-zinc-300 font-medium">اعمال مالیات بر نصب</p>
              <p className="text-xs text-zinc-500 mt-0.5">شامل مالیات بر هزینه نصب</p>
            </div>
            <button
              onClick={() => setApplyOnInstall(!applyOnInstall)}
              className={`relative w-12 h-6 rounded-full transition-colors ${applyOnInstall ? 'bg-amber-500' : 'bg-zinc-600'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${applyOnInstall ? 'right-1' : 'right-7'}`} />
            </button>
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
