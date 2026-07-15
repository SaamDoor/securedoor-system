'use client'
import { useEffect, useState } from 'react'
import { Save, DollarSign, Landmark, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { getSettingsAction, saveSettingsAction } from '../../actions'

type FormState = {
  vatPercent: string
  commissionPercent: string
  minWithdrawal: string
  maxDiscount: string
  enableOnline: boolean
  enableDigipay: boolean
  enableSnappay: boolean
  enableBankTransfer: boolean
  enableCardToCard: boolean
  enableCod: boolean
  bankName: string
  accountHolder: string
  accountNumber: string
  iban: string
  cardNumber: string
  bankInstructions: string
}

const DEFAULTS: FormState = {
  vatPercent: '9',
  commissionPercent: '5',
  minWithdrawal: '500000',
  maxDiscount: '30',
  enableOnline: true,
  enableDigipay: true,
  enableSnappay: true,
  enableBankTransfer: true,
  enableCardToCard: true,
  enableCod: false,
  bankName: 'بانک ملت',
  accountHolder: 'گروه صنعتی مشعوف',
  accountNumber: '',
  iban: '',
  cardNumber: '',
  bankInstructions:
    'پس از واریز، شماره پیگیری و مبلغ را برای پشتیبانی ارسال کنید. شناسه واریز = شماره سفارش.',
}

function asBool(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') return value
  if (value === 'true' || value === 1 || value === '1') return true
  if (value === 'false' || value === 0 || value === '0') return false
  return fallback
}

function asString(value: unknown, fallback = '') {
  if (typeof value === 'string') return value
  if (value == null) return fallback
  return String(value)
}

export default function FinancialSettingsPage() {
  const [form, setForm] = useState<FormState>(DEFAULTS)
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
        vatPercent: String(map.get('tax_rate_percent') ?? DEFAULTS.vatPercent),
        commissionPercent: String(map.get('global_commission_pct') ?? DEFAULTS.commissionPercent),
        minWithdrawal: String(map.get('min_payout_amount') ?? DEFAULTS.minWithdrawal),
        maxDiscount: String(map.get('max_discount_percent') ?? DEFAULTS.maxDiscount),
        enableOnline: asBool(map.get('payment_enable_online'), true),
        enableDigipay: asBool(map.get('payment_enable_digipay'), true),
        enableSnappay: asBool(map.get('payment_enable_snappay'), true),
        enableBankTransfer: asBool(map.get('payment_enable_bank_transfer'), true),
        enableCardToCard: asBool(map.get('payment_enable_card_to_card'), true),
        enableCod: asBool(map.get('payment_enable_cod'), false),
        bankName: asString(map.get('payment_bank_name'), DEFAULTS.bankName),
        accountHolder: asString(map.get('payment_account_holder'), DEFAULTS.accountHolder),
        accountNumber: asString(map.get('payment_account_number')),
        iban: asString(map.get('payment_iban')),
        cardNumber: asString(map.get('payment_card_number')),
        bankInstructions: asString(map.get('payment_bank_instructions'), DEFAULTS.bankInstructions),
      })
      setLoading(false)
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const result = await saveSettingsAction([
      { key: 'tax_rate_percent', value: Number(form.vatPercent || 0), group: 'financial' },
      { key: 'global_commission_pct', value: Number(form.commissionPercent || 0), group: 'financial' },
      { key: 'min_payout_amount', value: Number(form.minWithdrawal || 0), group: 'financial' },
      { key: 'max_discount_percent', value: Number(form.maxDiscount || 0), group: 'financial' },
      { key: 'payment_enable_online', value: form.enableOnline, group: 'payment' },
      { key: 'payment_enable_digipay', value: form.enableDigipay, group: 'payment' },
      { key: 'payment_enable_snappay', value: form.enableSnappay, group: 'payment' },
      { key: 'payment_enable_bank_transfer', value: form.enableBankTransfer, group: 'payment' },
      { key: 'payment_enable_card_to_card', value: form.enableCardToCard, group: 'payment' },
      { key: 'payment_enable_cod', value: form.enableCod, group: 'payment' },
      { key: 'payment_bank_name', value: form.bankName, group: 'payment' },
      { key: 'payment_account_holder', value: form.accountHolder, group: 'payment' },
      { key: 'payment_account_number', value: form.accountNumber, group: 'payment' },
      { key: 'payment_iban', value: form.iban, group: 'payment' },
      { key: 'payment_card_number', value: form.cardNumber, group: 'payment' },
      { key: 'payment_bank_instructions', value: form.bankInstructions, group: 'payment' },
    ])
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('تنظیمات مالی و پرداخت ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تنظیمات مالی و پرداخت</h1>
          <p className="mt-1 text-zinc-400">
            روش‌های پرداخت فروشگاه و اطلاعات حساب بانکی که به مشتری در تسویه حساب نشان داده می‌شود
          </p>
        </div>

        <div className="space-y-6">
          {loading && <p className="text-sm text-zinc-400">در حال بارگذاری تنظیمات...</p>}

          <section className="space-y-5 rounded-xl bg-zinc-800 p-6">
            <div className="flex items-center gap-2 font-semibold text-zinc-100">
              <DollarSign size={18} className="text-amber-400" />
              پارامترهای مالی
            </div>
            <Field label="درصد مالیات ارزش افزوده (%)">
              <input
                type="number"
                value={form.vatPercent}
                onChange={(e) => setForm({ ...form, vatPercent: e.target.value })}
                min="0"
                max="100"
                className={inputClass}
              />
            </Field>
            <Field label="درصد کمیسیون همکاران (%)">
              <input
                type="number"
                value={form.commissionPercent}
                onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })}
                min="0"
                max="100"
                className={inputClass}
              />
            </Field>
            <Field label="حداقل مبلغ برداشت (تومان)">
              <input
                type="number"
                value={form.minWithdrawal}
                onChange={(e) => setForm({ ...form, minWithdrawal: e.target.value })}
                min="0"
                className={inputClass}
              />
            </Field>
            <Field label="حداکثر تخفیف (%)">
              <input
                type="number"
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                min="0"
                max="100"
                className={inputClass}
              />
            </Field>
          </section>

          <section className="space-y-4 rounded-xl bg-zinc-800 p-6">
            <div className="flex items-center gap-2 font-semibold text-zinc-100">
              <CreditCard size={18} className="text-amber-400" />
              روش‌های پرداخت فعال در فروشگاه
            </div>
            {(
              [
                ['enableOnline', 'درگاه آنلاین (زرین‌پال / آیدی‌پی)'],
                ['enableDigipay', 'دیجی‌پی (اقساطی)'],
                ['enableSnappay', 'اسنپ‌پی (اقساطی)'],
                ['enableBankTransfer', 'واریز شبا / ساتنا / پایا'],
                ['enableCardToCard', 'کارت‌به‌کارت'],
                ['enableCod', 'پرداخت در محل'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center justify-between rounded-lg bg-zinc-700/40 px-4 py-3">
                <span className="text-sm text-zinc-200">{label}</span>
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="h-4 w-4 accent-amber-500"
                />
              </label>
            ))}
          </section>

          <section className="space-y-5 rounded-xl bg-zinc-800 p-6">
            <div className="flex items-center gap-2 font-semibold text-zinc-100">
              <Landmark size={18} className="text-amber-400" />
              اطلاعات حساب برای واریز مشتری
            </div>
            <Field label="نام بانک">
              <input
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="صاحب حساب">
              <input
                value={form.accountHolder}
                onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="شماره حساب">
              <input
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                className={inputClass}
                dir="ltr"
              />
            </Field>
            <Field label="شماره شبا (IR...)">
              <input
                value={form.iban}
                onChange={(e) => setForm({ ...form, iban: e.target.value })}
                className={inputClass}
                dir="ltr"
                placeholder="IRxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </Field>
            <Field label="شماره کارت (برای کارت‌به‌کارت)">
              <input
                value={form.cardNumber}
                onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                className={inputClass}
                dir="ltr"
              />
            </Field>
            <Field label="راهنمای واریز برای مشتری">
              <textarea
                value={form.bankInstructions}
                onChange={(e) => setForm({ ...form, bankInstructions: e.target.value })}
                rows={3}
                className={inputClass}
              />
            </Field>
          </section>

          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-2.5 font-semibold text-zinc-900 transition-colors hover:bg-amber-400 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-2.5 text-zinc-100 focus:border-amber-500 focus:outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-300">{label}</label>
      {children}
    </div>
  )
}
