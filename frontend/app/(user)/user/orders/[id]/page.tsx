import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Package, MapPin, CreditCard, Download, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { BadgeVariant } from '@/components/ui/badge'
import { formatPrice, toPersianNumber, formatJalaliDate } from '@/lib/utils'
import type { OrderStatus } from '@/types'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

const statusBadgeVariant: Record<OrderStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
  processing: 'gold',
  shipped: 'gold',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'muted',
  on_hold: 'warning',
}

const statusLabel: Record<OrderStatus, string> = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شده',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
  refunded: 'مسترد شده',
  on_hold: 'معلق',
}

const TRACKING_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'ثبت سفارش' },
  { status: 'confirmed', label: 'تأیید سفارش' },
  { status: 'processing', label: 'در حال تولید' },
  { status: 'shipped', label: 'ارسال شده' },
  { status: 'delivered', label: 'تحویل داده شده' },
]

const STEP_ORDER: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `سفارش #${id} | گروه صنعتی مشعوف` }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  if (!id) notFound()

  const currentStatus: OrderStatus = 'processing'
  const currentStepIndex = STEP_ORDER.indexOf(currentStatus)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#A0A0A0]">
        <Link href="/user/orders" className="hover:text-[#C8A85D] transition-colors">سفارشات</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-white">SD-20250118-002</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white mb-1">SD-20250118-002</h1>
          <p className="text-sm text-[#A0A0A0]">
            ثبت شده در {formatJalaliDate('2025-01-18', { includeTime: true })}
          </p>
        </div>
        <Badge variant={statusBadgeVariant[currentStatus]} size="lg" dot>
          {statusLabel[currentStatus]}
        </Badge>
      </div>

      {/* Tracking steps */}
      <div className="rounded-2xl bg-[#181818] border border-white/8 p-6">
        <h3 className="font-bold text-white mb-6">پیگیری سفارش</h3>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-5 right-5 left-5 h-0.5 bg-white/8" />
          <div
            className="absolute top-5 right-5 h-0.5 bg-gradient-to-l from-[#C8A85D] to-[#C8A85D]"
            style={{ width: `${(currentStepIndex / (TRACKING_STEPS.length - 1)) * 100}%` }}
          />

          <div className="relative flex justify-between">
            {TRACKING_STEPS.map((step, i) => {
              const isDone = i <= currentStepIndex
              return (
                <div key={step.status} className="flex flex-col items-center gap-2">
                  <div
                    className={
                      isDone
                        ? 'w-10 h-10 rounded-full bg-[#C8A85D] flex items-center justify-center'
                        : 'w-10 h-10 rounded-full bg-[#181818] border-2 border-white/15 flex items-center justify-center'
                    }
                  >
                    {isDone ? (
                      <Package className="h-4 w-4 text-black" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                    )}
                  </div>
                  <span className={
                    'text-xs font-medium hidden sm:block ' +
                    (isDone ? 'text-[#C8A85D]' : 'text-[#A0A0A0]')
                  }>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Order items */}
        <div className="lg:col-span-2 rounded-2xl bg-[#181818] border border-white/8 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8">
            <h3 className="font-bold text-white">محصولات</h3>
          </div>
          <div className="divide-y divide-white/5">
            {[
              { name: 'درب رگال مشکی', sku: 'SD-1002', qty: 2, price: 19_800_000 },
            ].map((item) => (
              <div key={item.sku} className="flex items-center gap-4 p-5">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{item.name}</div>
                  <div className="text-xs text-[#A0A0A0]">کد: {item.sku}</div>
                  <div className="text-xs text-[#A0A0A0]">تعداد: {toPersianNumber(item.qty)}</div>
                </div>
                <div className="font-black text-white">{formatPrice(item.price * item.qty)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary + info */}
        <div className="space-y-4">
          {/* Price summary */}
          <div className="rounded-2xl bg-[#181818] border border-white/8 p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#C8A85D]" />
              خلاصه پرداخت
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#A0A0A0]">جمع کل</span>
                <span className="text-white">{formatPrice(39_600_000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A0A0A0]">هزینه ارسال</span>
                <span className="text-[#27AE60]">رایگان</span>
              </div>
              <div className="h-px bg-white/8 my-2" />
              <div className="flex justify-between">
                <span className="font-bold text-white">مبلغ نهایی</span>
                <span className="font-black text-[#C8A85D] text-base">{formatPrice(39_600_000)}</span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[#1F8A4D]/10 border border-[#1F8A4D]/20">
              <div className="text-xs text-[#27AE60] font-medium">پرداخت آنلاین ✓</div>
              <div className="text-xs text-[#A0A0A0]">کد پیگیری: ۱۲۳۴۵۶۷۸</div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-2xl bg-[#181818] border border-white/8 p-5">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#C8A85D]" />
              آدرس تحویل
            </h3>
            <div className="text-sm text-[#A0A0A0] space-y-1">
              <div className="text-white font-medium">مهندس رضایی</div>
              <div>تهران، خیابان ولیعصر، پلاک ۱۲۳</div>
              <div className="flex items-center gap-1 text-[#C8A85D]">
                <Phone className="h-3 w-3" />
                ۰۹۱۲***۴۵۶۷
              </div>
            </div>
          </div>

          {/* Invoice download */}
          <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#C8A85D]/5 border border-[#C8A85D]/20 hover:bg-[#C8A85D]/10 transition-colors group">
            <Download className="h-5 w-5 text-[#C8A85D]" />
            <div className="text-right">
              <div className="text-sm font-semibold text-white group-hover:text-[#C8A85D] transition-colors">
                دانلود فاکتور
              </div>
              <div className="text-xs text-[#A0A0A0]">فرمت PDF</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
