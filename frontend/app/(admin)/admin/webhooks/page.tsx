'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Webhook, CheckCircle, XCircle, Clock, Trash2, Edit, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toPersianNumber, formatJalaliDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { WebhookEvent } from '@/types/api'

interface WebhookItem {
  id: string
  name: string
  url: string
  events: WebhookEvent[]
  isActive: boolean
  successCount: number
  failureCount: number
  lastTriggeredAt?: string
}

const ALL_EVENTS: { value: WebhookEvent; label: string }[] = [
  { value: 'order_created', label: 'ثبت سفارش' },
  { value: 'order_updated', label: 'بروزرسانی سفارش' },
  { value: 'order_cancelled', label: 'لغو سفارش' },
  { value: 'payment_success', label: 'پرداخت موفق' },
  { value: 'payment_failed', label: 'پرداخت ناموفق' },
  { value: 'user_registered', label: 'ثبت‌نام کاربر' },
  { value: 'product_created', label: 'ایجاد محصول' },
  { value: 'product_updated', label: 'بروزرسانی محصول' },
  { value: 'inventory_changed', label: 'تغییر موجودی' },
  { value: 'review_submitted', label: 'ثبت نظر' },
]

const WEBHOOKS: WebhookItem[] = [
  {
    id: '1',
    name: 'اعلان سفارش به CRM',
    url: 'https://crm.example.com/webhook/orders',
    events: ['order_created', 'order_updated'],
    isActive: true,
    successCount: 142,
    failureCount: 3,
    lastTriggeredAt: '2025-01-30',
  },
  {
    id: '2',
    name: 'پیامک پرداخت',
    url: 'https://sms.example.com/webhook/payment',
    events: ['payment_success', 'payment_failed'],
    isActive: true,
    successCount: 87,
    failureCount: 0,
    lastTriggeredAt: '2025-01-29',
  },
  {
    id: '3',
    name: 'همگام‌سازی انبار',
    url: 'https://erp.example.com/webhook/inventory',
    events: ['inventory_changed'],
    isActive: false,
    successCount: 0,
    failureCount: 5,
    lastTriggeredAt: undefined,
  },
]

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(WEBHOOKS)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([])

  const toggleEvent = (event: WebhookEvent) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    )
  }

  const toggleActive = (id: string) => {
    setWebhooks((prev) =>
      prev.map((wh) => wh.id === id ? { ...wh, isActive: !wh.isActive } : wh),
    )
  }

  const deleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id))
  }

  const totalSuccess = webhooks.reduce((s, wh) => s + wh.successCount, 0)
  const totalFailure = webhooks.reduce((s, wh) => s + wh.failureCount, 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مدیریت وب‌هوک‌ها</h1>
          <p className="text-sm text-[#A0A0A0]">{toPersianNumber(webhooks.length)} وب‌هوک</p>
        </div>
        <Button
          variant="gold"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => { setSelectedEvents([]); setIsDialogOpen(true) }}
        >
          وب‌هوک جدید
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          [
            { label: 'کل وب‌هوک‌ها', value: webhooks.length, color: 'text-white' },
            { label: 'فعال', value: webhooks.filter((w) => w.isActive).length, color: 'text-[#27AE60]' },
            { label: 'موفق (۳۰ روز)', value: totalSuccess, color: 'text-[#C8A85D]' },
            { label: 'ناموفق (۳۰ روز)', value: totalFailure, color: 'text-[#E74C3C]' },
          ] as { label: string; value: number; color: string }[]
        ).map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl bg-[#181818] border border-white/8 text-center">
            <div className={cn('text-2xl font-black', color)}>{toPersianNumber(value)}</div>
            <div className="text-xs text-[#A0A0A0] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Webhooks list */}
      <div className="space-y-4">
        {webhooks.map((wh, i) => (
          <motion.div
            key={wh.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              'rounded-2xl p-5 border transition-all duration-200',
              wh.isActive ? 'bg-[#181818] border-white/8' : 'bg-[#181818]/60 border-white/5 opacity-70',
            )}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  wh.isActive ? 'bg-[#C8A85D]/10 border border-[#C8A85D]/20' : 'bg-white/5 border border-white/8',
                )}>
                  <Webhook className={cn('h-5 w-5', wh.isActive ? 'text-[#C8A85D]' : 'text-[#A0A0A0]')} />
                </div>
                <div>
                  <div className="font-bold text-white">{wh.name}</div>
                  <div className="text-xs text-[#A0A0A0] font-mono mt-0.5">{wh.url}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {wh.isActive
                  ? <Badge variant="success" size="sm" dot>فعال</Badge>
                  : <Badge variant="muted" size="sm" dot>غیرفعال</Badge>
                }
              </div>
            </div>

            {/* Events */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {wh.events.map((ev) => (
                <span
                  key={ev}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#C8A85D]/10 text-[#C8A85D] border border-[#C8A85D]/20"
                >
                  {ALL_EVENTS.find((e) => e.value === ev)?.label ?? ev}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5 text-xs">
                <span className="flex items-center gap-1 text-[#27AE60]">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {toPersianNumber(wh.successCount)} موفق
                </span>
                <span className="flex items-center gap-1 text-[#E74C3C]">
                  <XCircle className="h-3.5 w-3.5" />
                  {toPersianNumber(wh.failureCount)} ناموفق
                </span>
                {wh.lastTriggeredAt && (
                  <span className="flex items-center gap-1 text-[#A0A0A0]">
                    <Clock className="h-3.5 w-3.5" />
                    آخرین: {formatJalaliDate(wh.lastTriggeredAt)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleActive(wh.id)}
                  aria-label={wh.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                  className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-white hover:border-white/20 transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button
                  aria-label="ویرایش"
                  className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-[#C8A85D] hover:border-[#C8A85D]/30 transition-all"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteWebhook(wh.id)}
                  aria-label="حذف"
                  className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-[#A0A0A0] hover:text-[#E74C3C] hover:border-[#C0392B]/30 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>وب‌هوک جدید</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <Input label="نام وب‌هوک" placeholder="مثال: اعلان سفارش" />
            <Input label="آدرس (URL)" placeholder="https://example.com/webhook" />
            <Input label="کلید مخفی (اختیاری)" placeholder="برای تأیید درخواست‌ها" />

            <div>
              <label className="text-sm font-medium text-[#A0A0A0] block mb-3">رویدادها</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_EVENTS.map((event) => (
                  <label key={event.value} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="accent-[#C8A85D]"
                      checked={selectedEvents.includes(event.value)}
                      onChange={() => toggleEvent(event.value)}
                    />
                    <span className="text-xs text-[#A0A0A0] group-hover:text-white transition-colors">
                      {event.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="gold" size="md" className="flex-1">
                ایجاد وب‌هوک
              </Button>
              <Button variant="dark" size="md" onClick={() => setIsDialogOpen(false)}>
                انصراف
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
