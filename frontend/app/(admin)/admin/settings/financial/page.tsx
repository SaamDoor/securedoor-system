'use client'
import { useState } from 'react'
import { Save, DollarSign } from 'lucide-react'

export default function FinancialSettingsPage() {
  const [form, setForm] = useState({
    vatPercent: '9',
    commissionPercent: '5',
    minWithdrawal: '500000',
    maxDiscount: '30',
  })

  const handleSave = () => {
    alert('تنظیمات مالی ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تنظیمات مالی</h1>
          <p className="text-zinc-400 mt-1">پارامترهای مالی سیستم را پیکربندی کنید</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">درصد مالیات ارزش افزوده (%)</label>
            <input
              type="number"
              value={form.vatPercent}
              onChange={e => setForm({ ...form, vatPercent: e.target.value })}
              min="0" max="100"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-500 mt-1">درصد مالیات ارزش افزوده اعمال‌شده بر سفارشات</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">درصد کمیسیون همکاران (%)</label>
            <input
              type="number"
              value={form.commissionPercent}
              onChange={e => setForm({ ...form, commissionPercent: e.target.value })}
              min="0" max="100"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-500 mt-1">درصد کمیسیون پرداختی به همکاران فروش</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">حداقل مبلغ برداشت (تومان)</label>
            <input
              type="number"
              value={form.minWithdrawal}
              onChange={e => setForm({ ...form, minWithdrawal: e.target.value })}
              min="0"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">حداکثر تخفیف (%)</label>
            <input
              type="number"
              value={form.maxDiscount}
              onChange={e => setForm({ ...form, maxDiscount: e.target.value })}
              min="0" max="100"
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-500 mt-1">سقف تخفیف قابل اعمال بر سفارشات</p>
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
