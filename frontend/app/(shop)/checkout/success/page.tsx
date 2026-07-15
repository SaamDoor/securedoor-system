import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Landmark, Phone, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice, toPersianNumber } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'
import { fetchShopPaymentSettings } from '@/lib/shop/payment-settings.server'

export const metadata: Metadata = {
  title: `سفارش ثبت شد | ${SITE_NAME}`,
}

interface SuccessPageProps {
  searchParams: Promise<{
    order?: string
    method?: string
    step?: string
    total?: string
  }>
}

const METHOD_LABEL: Record<string, string> = {
  online: 'درگاه آنلاین',
  digipay: 'دیجی‌پی',
  snappay: 'اسنپ‌پی',
  bank_transfer: 'واریز بانکی / شبا',
  card_to_card: 'کارت‌به‌کارت',
  cash_on_delivery: 'پرداخت در محل',
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const orderNumber = params.order ?? '—'
  const method = params.method ?? ''
  const step = params.step ?? ''
  const total = Number(params.total ?? 0)
  const payment = await fetchShopPaymentSettings()

  return (
    <div className="min-h-screen bg-black px-4 py-24" dir="rtl">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/8 bg-[#141414] p-8 text-center shadow-[0_40px_100px_rgba(0,0,0,0.45)]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h1 className="mb-2 text-3xl font-black text-white">سفارش شما ثبت شد</h1>
        <p className="mb-6 text-sm text-zinc-400">
          شماره سفارش:{' '}
          <span className="font-bold tracking-wide text-gold" dir="ltr">
            {orderNumber}
          </span>
        </p>

        <div className="mb-6 space-y-2 rounded-2xl border border-white/8 bg-black/30 p-5 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">روش پرداخت</span>
            <span className="font-medium text-white">{METHOD_LABEL[method] ?? method}</span>
          </div>
          {total > 0 && (
            <div className="flex justify-between">
              <span className="text-zinc-500">مبلغ</span>
              <span className="font-black text-gold">{formatPrice(total)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-zinc-500">وضعیت پرداخت</span>
            <span className="font-medium text-amber-300">در انتظار تأیید</span>
          </div>
        </div>

        {(step === 'await_transfer' || method === 'bank_transfer' || method === 'card_to_card') && (
          <div className="mb-6 rounded-2xl border border-gold/25 bg-gold/[0.05] p-5 text-right">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gold">
              <Landmark className="h-4 w-4" />
              اطلاعات واریز
            </div>
            <div className="space-y-2 text-sm text-zinc-300">
              <p>بانک: {payment.bank.bankName}</p>
              <p>صاحب حساب: {payment.bank.accountHolder}</p>
              {payment.bank.iban && (
                <p dir="ltr" className="text-left">
                  شبا: {payment.bank.iban}
                </p>
              )}
              {payment.bank.cardNumber && method === 'card_to_card' && (
                <p dir="ltr" className="text-left">
                  کارت: {payment.bank.cardNumber}
                </p>
              )}
              <p className="text-xs leading-6 text-zinc-500">
                {payment.bank.instructions} شناسه سفارش شما{' '}
                <span className="text-gold" dir="ltr">
                  {orderNumber}
                </span>{' '}
                است.
              </p>
            </div>
          </div>
        )}

        {(step === 'await_installment' || method === 'digipay' || method === 'snappay') && (
          <p className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-400">
            سفارش اقساطی ثبت شد. تیم فروش برای تکمیل فرآیند{' '}
            {METHOD_LABEL[method] ?? 'اقساط'} با شما تماس می‌گیرد
            {total > 0 ? ` (مبلغ ${toPersianNumber(formatPrice(total))})` : ''}.
          </p>
        )}

        {step === 'await_gateway' && (
          <p className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-400">
            سفارش ثبت شد. اتصال مستقیم به درگاه به‌محض تکمیل تنظیمات مرچنت در پنل یکپارچه‌سازی فعال
            می‌شود؛ پشتیبانی در صورت نیاز با شما هماهنگ خواهد کرد.
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="gold" size="lg">
            <Link href="/user/orders">
              <ShoppingBag className="ml-2 h-4 w-4" />
              پیگیری سفارش
            </Link>
          </Button>
          <Button asChild variant="gold-outline" size="lg">
            <Link href="/products">ادامه خرید</Link>
          </Button>
        </div>

        <a
          href="tel:09003286539"
          className="mt-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-gold"
        >
          <Phone className="h-4 w-4" />
          پشتیبانی: ۰۹۰۰ ۳۲۸ ۶۵۳۹
        </a>
      </div>
    </div>
  )
}
