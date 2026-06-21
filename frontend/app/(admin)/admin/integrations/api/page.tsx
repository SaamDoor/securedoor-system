'use client'
import { useState } from 'react'
import { Save, Key, Eye, EyeOff } from 'lucide-react'

export default function ApiConfigPage() {
  const [showKey, setShowKey] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [form, setForm] = useState({
    name: 'درگاه پرداخت زرین‌پال',
    endpoint: 'https://api.zarinpal.com/pg/v4',
    apiKey: '',
    rateLimit: '100',
  })

  const handleSave = () => {
    alert('تنظیمات API ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">پیکربندی API</h1>
          <p className="text-zinc-400 mt-1">مدیریت کلیدهای API و تنظیمات اتصال</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">نام API</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Endpoint URL</label>
            <input
              type="text"
              value={form.endpoint}
              onChange={e => setForm({ ...form, endpoint: e.target.value })}
              dir="ltr"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1 flex items-center gap-1">
              <Key size={14} /> API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={form.apiKey}
                onChange={e => setForm({ ...form, apiKey: e.target.value })}
                dir="ltr"
                className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none font-mono text-sm pl-12"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">محدودیت نرخ (درخواست/دقیقه)</label>
            <input
              type="number"
              value={form.rateLimit}
              onChange={e => setForm({ ...form, rateLimit: e.target.value })}
              min="1"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-y border-zinc-700">
            <p className="text-zinc-300 font-medium">وضعیت اتصال</p>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-amber-500' : 'bg-zinc-600'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'right-1' : 'right-7'}`} />
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              <Save size={16} />
              ذخیره تنظیمات
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
