'use client'
import { useState } from 'react'
import { Save, Bell } from 'lucide-react'

export default function NotifySettingsPage() {
  const [toggles, setToggles] = useState({
    newOrder: true,
    ticket: true,
    registration: false,
  })
  const [sendType, setSendType] = useState<'sms' | 'email' | 'both'>('both')

  const handleSave = () => {
    alert('تنظیمات اطلاع‌رسانی ذخیره شد')
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
