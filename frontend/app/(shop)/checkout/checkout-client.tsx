'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Landmark,
  Loader2,
  Package,
  ShieldCheck,
  Smartphone,
  Truck,
  WalletCards,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice, toPersianNumber, cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { placeOrderAction } from './actions'
import type { ShopPaymentMethod, ShopPaymentSettings } from '@/lib/shop/checkout.types'
import { PROVINCES } from '@/lib/constants'

interface CheckoutClientProps {
  paymentSettings: ShopPaymentSettings
  defaultProfile: { fullName: string; phone: string; email: string }
}

const METHOD_META: Array<{
  id: ShopPaymentMethod
  title: string
  description: string
  icon: typeof CreditCard
  enabledKey: keyof ShopPaymentSettings
}> = [
  {
    id: 'online',
    title: 'درگاه آنلاین',
    description: 'پرداخت آنی با کارت بانکی از طریق درگاه امن',
    icon: CreditCard,
    enabledKey: 'enableOnline',
  },
  {
    id: 'digipay',
    title: 'دیجی‌پی (اقساطی)',
    description: 'خرید اقساطی از طریق دیجی‌پی',
    icon: Smartphone,
    enabledKey: 'enableDigipay',
  },
  {
    id: 'snappay',
    title: 'اسنپ‌پی (اقساطی)',
    description: 'خرید اقساطی از طریق اسنپ‌پی',
    icon: WalletCards,
    enabledKey: 'enableSnappay',
  },
  {
    id: 'bank_transfer',
    title: 'واریز شبا / ساتنا / پایا',
    description: 'انتقال به حساب اعلام‌شده در پنل مشعوف',
    icon: Landmark,
    enabledKey: 'enableBankTransfer',
  },
  {
    id: 'card_to_card',
    title: 'کارت‌به‌کارت',
    description: 'واریز به شماره کارت اعلام‌شده',
    icon: Building2,
    enabledKey: 'enableCardToCard',
  },
  {
    id: 'cash_on_delivery',
    title: 'پرداخت در محل',
    description: 'پرداخت هنگام تحویل (در صورت فعال بودن)',
    icon: Truck,
    enabledKey: 'enableCod',
  },
]

export function CheckoutClient({ paymentSettings, defaultProfile }: CheckoutClientProps) {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const hydrated = useCartStore((s) => s.hydrated)
  const clearCart = useCartStore((s) => s.clearCart)
  const subtotal = useCartStore((s) => s.subtotal)

  const methods = METHOD_META.filter((m) => Boolean(paymentSettings[m.enabledKey]))

  const [paymentMethod, setPaymentMethod] = useState<ShopPaymentMethod | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    fullName: defaultProfile.fullName,
    phone: defaultProfile.phone,
    province: '',
    city: '',
    address: '',
    postalCode: '',
    note: '',
    transferRef: '',
  })

  useEffect(() => {
    if (methods.length && !paymentMethod) setPaymentMethod(methods[0].id)
  }, [methods, paymentMethod])

  const totals = useMemo(() => {
    const sub = subtotal()
    const shipping = sub >= 5_000_000 || sub === 0 ? 0 : 350_000
    const tax = Math.round(sub * (paymentSettings.taxRatePercent / 100))
    return { sub, shipping, tax, total: sub + shipping + tax }
  }, [items, paymentSettings.taxRatePercent, subtotal])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center">
        <Package className="h-14 w-14 text-zinc-700" />
        <h1 className="text-2xl font-black text-white">سبد خرید خالی است</h1>
        <Button asChild variant="gold" size="lg">
          <Link href="/products">بازگشت به محصولات</Link>
        </Button>
      </div>
    )
  }

  const needsTransferRef = paymentMethod === 'bank_transfer' || paymentMethod === 'card_to_card'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentMethod) {
      toast.error('روش پرداخت را انتخاب کنید')
      return
    }

    setSubmitting(true)
    const result = await placeOrderAction({
      paymentMethod,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        name: item.name,
        sku: item.sku,
        slug: item.slug,
        image: item.image,
        options: item.options,
      })),
      shippingAddress: {
        fullName: form.fullName,
        phone: form.phone,
        province: form.province,
        city: form.city,
        address: form.address,
        postalCode: form.postalCode,
      },
      customerNote: form.note,
      transferRef: form.transferRef,
    })
    setSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    clearCart()
    const q = new URLSearchParams({
      order: result.data.orderNumber,
      method: result.data.paymentMethod,
      step: result.data.nextStep,
      total: String(result.data.total),
    })
    router.push(`/checkout/success?${q.toString()}`)
  }

  return (
    <div className="min-h-screen bg-black" dir="rtl">
      <div
        className="pb-10 pt-28"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(200,168,93,0.07) 0%, transparent 55%), linear-gradient(180deg,#101010 0%,#0B0B0B 100%)',
        }}
      >
        <div className="container">
          <h1 className="text-3xl font-black text-white">تسویه حساب</h1>
          <p className="mt-2 text-sm text-zinc-400">اطلاعات ارسال را تکمیل کنید و روش پرداخت را انتخاب کنید.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="container grid gap-8 pb-16 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/8 bg-[#141414] p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-white">اطلاعات گیرنده</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="نام و نام خانوادگی">
                <Input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="مثال: علی رضایی"
                />
              </Field>
              <Field label="شماره موبایل">
                <Input
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="09xxxxxxxxx"
                  dir="ltr"
                />
              </Field>
              <Field label="استان">
                <select
                  required
                  value={form.province}
                  onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 text-sm text-white"
                >
                  <option value="">انتخاب استان</option>
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="شهر">
                <Input
                  required
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="شهر"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="آدرس کامل">
                  <textarea
                    required
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-gold"
                    placeholder="خیابان، پلاک، واحد..."
                  />
                </Field>
              </div>
              <Field label="کد پستی (اختیاری)">
                <Input
                  value={form.postalCode}
                  onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                  dir="ltr"
                />
              </Field>
              <Field label="یادداشت سفارش (اختیاری)">
                <Input
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="توضیح نصب، زمان تحویل و..."
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-white/8 bg-[#141414] p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-white">روش پرداخت</h2>
            {methods.length === 0 ? (
              <p className="text-sm text-zinc-400">هیچ روش پرداختی از پنل ادمین فعال نشده است.</p>
            ) : (
              <div className="space-y-3">
                {methods.map((method) => {
                  const Icon = method.icon
                  const active = paymentMethod === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border p-4 text-right transition-all',
                        active
                          ? 'border-gold bg-gold/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border',
                          active ? 'border-gold/40 bg-gold/15 text-gold' : 'border-white/10 text-zinc-400',
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn('block text-sm font-bold', active ? 'text-gold' : 'text-white')}>
                          {method.title}
                        </span>
                        <span className="mt-1 block text-xs text-zinc-500">{method.description}</span>
                      </span>
                      <span
                        className={cn(
                          'mt-1 h-4 w-4 rounded-full border',
                          active ? 'border-gold bg-gold' : 'border-white/25',
                        )}
                      />
                    </button>
                  )
                })}
              </div>
            )}

            {(paymentMethod === 'bank_transfer' || paymentMethod === 'card_to_card') && (
              <div className="mt-5 space-y-3 rounded-xl border border-gold/20 bg-gold/[0.05] p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gold">
                  <ShieldCheck className="h-4 w-4" />
                  اطلاعات حساب برای واریز (از پنل سوپر ادمین)
                </div>
                <InfoRow label="بانک" value={paymentSettings.bank.bankName} />
                <InfoRow label="صاحب حساب" value={paymentSettings.bank.accountHolder} />
                {paymentSettings.bank.accountNumber && (
                  <InfoRow label="شماره حساب" value={paymentSettings.bank.accountNumber} mono />
                )}
                {paymentSettings.bank.iban && (
                  <InfoRow label="شبا" value={paymentSettings.bank.iban} mono />
                )}
                {paymentMethod === 'card_to_card' && paymentSettings.bank.cardNumber && (
                  <InfoRow label="شماره کارت" value={paymentSettings.bank.cardNumber} mono />
                )}
                <p className="text-xs leading-6 text-zinc-400">{paymentSettings.bank.instructions}</p>
                <Field label="کد پیگیری واریز (در صورت انجام)">
                  <Input
                    value={form.transferRef}
                    onChange={(e) => setForm((f) => ({ ...f, transferRef: e.target.value }))}
                    placeholder="شماره پیگیری ساتنا / پایا / کارت"
                    dir="ltr"
                  />
                </Field>
              </div>
            )}

            {(paymentMethod === 'digipay' || paymentMethod === 'snappay') && (
              <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-6 text-zinc-400">
                پس از ثبت سفارش، وضعیت اقساطی برای بررسی فعال می‌شود. در صورت پیکربندی کامل درگاه در پنل
                یکپارچه‌سازی‌ها، مشتری به صفحهٔ {paymentMethod === 'digipay' ? 'دیجی‌پی' : 'اسنپ‌پی'} هدایت
                خواهد شد.
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-white/8 bg-[#141414] p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-bold text-white">خلاصه سفارش</h2>
          <div className="mb-5 max-h-64 space-y-3 overflow-y-auto">
            {items.map((item) => (
              <div key={item.productId} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium text-white">{item.name}</div>
                  <div className="text-xs text-zinc-500">
                    {toPersianNumber(item.quantity)} × {formatPrice(item.price)}
                  </div>
                </div>
                <div className="flex-shrink-0 font-bold text-white">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-white/8 pt-4 text-sm">
            <Row label="جمع کالا" value={formatPrice(totals.sub)} />
            <Row label="مالیات" value={formatPrice(totals.tax)} />
            <Row
              label="ارسال"
              value={totals.shipping === 0 ? 'رایگان' : formatPrice(totals.shipping)}
              accent={totals.shipping === 0}
            />
            <div className="flex items-center justify-between border-t border-white/8 pt-3">
              <span className="font-bold text-white">مبلغ قابل پرداخت</span>
              <span className="text-lg font-black text-gold">{formatPrice(totals.total)}</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="mt-6 w-full"
            disabled={submitting || !paymentMethod}
          >
            {submitting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                در حال ثبت...
              </>
            ) : (
              'ثبت نهایی سفارش'
            )}
          </Button>

          <Link
            href="/cart"
            className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            بازگشت به سبد
          </Link>

          {needsTransferRef && (
            <p className="mt-4 text-[11px] leading-5 text-zinc-500">
              می‌توانید ابتدا سفارش را ثبت کنید و کد پیگیری را بعداً به پشتیبانی اعلام کنید.
            </p>
          )}
        </aside>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      {children}
    </label>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className={cn('font-medium', accent ? 'text-green-400' : 'text-white')}>{value}</span>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className={cn('font-semibold text-white', mono && 'tracking-wide')} dir="ltr">
        {value || '—'}
      </span>
    </div>
  )
}
