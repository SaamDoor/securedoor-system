'use client'
import { useEffect, useState } from 'react'
import { RefreshCw, Edit, Save } from 'lucide-react'
import { toast } from 'sonner'
import { getSettingsAction, saveSettingsAction } from '../../actions'

const currencies = [
  { code: 'USD', name: 'دلار آمریکا', flag: '🇺🇸', rate: '58,200' },
  { code: 'EUR', name: 'یورو', flag: '🇪🇺', rate: '63,100' },
  { code: 'GBP', name: 'پوند انگلیس', flag: '🇬🇧', rate: '73,400' },
]

export default function CurrencyPage() {
  const [manualOverride, setManualOverride] = useState(false)
  const [rates, setRates] = useState(currencies.map(c => ({ ...c })))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      const result = await getSettingsAction()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      const map = new Map((result.data ?? []).map((item: Record<string, unknown>) => [String(item.key), item.value]))
      setManualOverride(Boolean(map.get('currency_manual_override') ?? false))
      setRates((prev) => prev.map((item) => ({
        ...item,
        rate: String(map.get(`currency_rate_${item.code.toLowerCase()}`) ?? item.rate),
      })))
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const entries: { key: string; value: unknown; group?: string }[] = rates.map((item) => ({
      key: `currency_rate_${item.code.toLowerCase()}`,
      value: Number(String(item.rate).replaceAll(',', '').trim() || 0),
      group: 'currency',
    }))
    entries.push({ key: 'currency_manual_override', value: manualOverride, group: 'currency' })
    const result = await saveSettingsAction(entries)
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('نرخ‌های ارز ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">نرخ ارز</h1>
            <p className="text-zinc-400 mt-1">مدیریت نرخ ارزهای خارجی به تومان</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 transition-colors">
            <RefreshCw size={16} />
            بروزرسانی خودکار
          </button>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-100 font-medium">تنظیم دستی نرخ ارز</p>
              <p className="text-zinc-500 text-sm mt-0.5">غیرفعال کردن بروزرسانی خودکار</p>
            </div>
            <button
              onClick={() => setManualOverride(!manualOverride)}
              className={`relative w-12 h-6 rounded-full transition-colors ${manualOverride ? 'bg-amber-500' : 'bg-zinc-600'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${manualOverride ? 'right-1' : 'right-7'}`} />
            </button>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-700 text-xs text-zinc-500">
            آخرین بروزرسانی: ۱۴۰۳/۰۴/۰۲ ساعت ۱۴:۰۰
          </div>
          <div className="divide-y divide-zinc-700">
            {rates.map((c, i) => (
              <div key={c.code} className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.flag}</span>
                  <div>
                    <p className="text-zinc-100 font-semibold">{c.code}</p>
                    <p className="text-zinc-400 text-sm">{c.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {manualOverride ? (
                    <input
                      type="text"
                      value={c.rate}
                      onChange={e => {
                        const updated = [...rates]
                        updated[i] = { ...updated[i], rate: e.target.value }
                        setRates(updated)
                      }}
                      className="bg-zinc-700 text-zinc-100 rounded-lg px-3 py-1.5 border border-zinc-600 focus:border-amber-500 focus:outline-none text-left font-mono w-32"
                      dir="ltr"
                    />
                  ) : (
                    <span className="text-amber-400 font-bold font-mono">{c.rate} تومان</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {manualOverride && (
          <div className="mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              <Save size={16} />
              {saving ? 'در حال ذخیره...' : 'ذخیره نرخ‌ها'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
