'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plug, CheckCircle, XCircle, Settings, RefreshCw,
  ExternalLink, Plus, Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const integrations = [
  {
    id: '1',
    name: 'زرین‌پال',
    slug: 'zarinpal',
    category: 'payment',
    description: 'درگاه پرداخت آنلاین زرین‌پال با بالاترین نرخ موفقیت',
    logo: '💳',
    isActive: true,
    isConfigured: true,
    lastTested: '۲ ساعت پیش',
    status: 'connected',
  },
  {
    id: '2',
    name: 'آیدی پی',
    slug: 'idpay',
    category: 'payment',
    description: 'درگاه پرداخت IDPay با پشتیبانی تمام بانک‌های ایران',
    logo: '🏦',
    isActive: false,
    isConfigured: false,
    lastTested: null,
    status: 'disconnected',
  },
  {
    id: '3',
    name: 'SMS.ir',
    slug: 'sms-ir',
    category: 'sms',
    description: 'سرویس ارسال پیامک با پنل اختصاصی و قابلیت‌های پیشرفته',
    logo: '📱',
    isActive: true,
    isConfigured: true,
    lastTested: '۳۰ دقیقه پیش',
    status: 'connected',
  },
  {
    id: '4',
    name: 'کاوه‌نگار',
    slug: 'kavenegar',
    category: 'sms',
    description: 'ارسال پیامک و تماس صوتی از طریق API کاوه‌نگار',
    logo: '📞',
    isActive: false,
    isConfigured: false,
    lastTested: null,
    status: 'disconnected',
  },
  {
    id: '5',
    name: 'دیجی‌کالا',
    slug: 'digikala',
    category: 'marketplace',
    description: 'همگام‌سازی محصولات و سفارشات با مارکتپلیس دیجی‌کالا',
    logo: '🛒',
    isActive: false,
    isConfigured: false,
    lastTested: null,
    status: 'disconnected',
  },
  {
    id: '6',
    name: 'باسلام',
    slug: 'basalam',
    category: 'marketplace',
    description: 'اتصال به فروشگاه باسلام و مدیریت موجودی',
    logo: '🏪',
    isActive: false,
    isConfigured: false,
    lastTested: null,
    status: 'disconnected',
  },
  {
    id: '7',
    name: 'ترب',
    slug: 'torob',
    category: 'marketplace',
    description: 'نمایش قیمت در سایت مقایسه قیمت ترب',
    logo: '📊',
    isActive: true,
    isConfigured: true,
    lastTested: '۱ روز پیش',
    status: 'connected',
  },
]

const categoryLabels: Record<string, string> = {
  payment: 'پرداخت',
  sms: 'پیامک',
  marketplace: 'مارکت‌پلیس',
  shipping: 'حمل و نقل',
}

const categoryColors: Record<string, string> = {
  payment: 'text-gold',
  sms: 'text-blue-400',
  marketplace: 'text-purple-400',
  shipping: 'text-green-400',
}

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(integrations.map((i) => i.category)))]

  const filtered = activeCategory === 'all'
    ? integrations
    : integrations.filter((i) => i.category === activeCategory)

  const connectedCount = integrations.filter((i) => i.isActive && i.isConfigured).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">مرکز یکپارچه‌سازی</h1>
          <p className="text-muted text-sm">
            {connectedCount} از {integrations.length} سرویس متصل
          </p>
        </div>
        <Button variant="gold" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
          افزودن سرویس سفارشی
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'متصل', value: connectedCount, color: 'text-success-light' },
          { label: 'قطع', value: integrations.filter((i) => !i.isActive).length, color: 'text-danger-light' },
          { label: 'پرداخت', value: integrations.filter((i) => i.category === 'payment').length, color: 'text-gold' },
          { label: 'پیامک', value: integrations.filter((i) => i.category === 'sms').length, color: 'text-blue-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl bg-surface border border-white/8 text-center">
            <div className={cn('text-2xl font-black mb-1', color)}>{value}</div>
            <div className="text-xs text-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              activeCategory === cat
                ? 'bg-gold text-black'
                : 'bg-surface border border-white/8 text-muted hover:text-white',
            )}
          >
            {cat === 'all' ? 'همه سرویس‌ها' : categoryLabels[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Integrations grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((integration, i) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              'p-5 rounded-2xl bg-surface border transition-all duration-300',
              integration.isActive && integration.isConfigured
                ? 'border-success/20 hover:border-success/40'
                : 'border-white/8 hover:border-white/20',
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-2xl">
                  {integration.logo}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{integration.name}</h3>
                  <span className={cn('text-xs font-medium', categoryColors[integration.category])}>
                    {categoryLabels[integration.category]}
                  </span>
                </div>
              </div>

              {integration.isActive && integration.isConfigured ? (
                <CheckCircle className="h-5 w-5 text-success-light flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-muted flex-shrink-0" />
              )}
            </div>

            <p className="text-xs text-muted leading-relaxed mb-4">{integration.description}</p>

            {integration.lastTested && (
              <div className="text-2xs text-muted mb-3">
                آخرین تست: {integration.lastTested}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant={integration.isConfigured ? 'dark' : 'gold'}
                size="sm"
                leftIcon={
                  integration.isConfigured
                    ? <Settings className="h-3.5 w-3.5" />
                    : <Plug className="h-3.5 w-3.5" />
                }
                className="flex-1"
              >
                {integration.isConfigured ? 'تنظیمات' : 'اتصال'}
              </Button>

              {integration.isConfigured && (
                <button className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-muted hover:text-white hover:border-white/20 transition-all">
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}

              <button className="w-8 h-8 rounded-lg border border-white/8 flex items-center justify-center text-muted hover:text-white hover:border-white/20 transition-all">
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Webhook section link */}
      <div className="p-5 rounded-2xl bg-gold/5 border border-gold/20 flex items-center gap-4">
        <Zap className="h-8 w-8 text-gold flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-bold text-white mb-1">وب‌هوک‌ها</h3>
          <p className="text-sm text-muted">
            رویدادهای سیستم را به سرویس‌های خارجی ارسال کنید. از ۱۰ رویداد پشتیبانی می‌شود.
          </p>
        </div>
        <Button asChild variant="gold-outline" size="sm">
          <a href="/admin/webhooks">مدیریت وب‌هوک‌ها</a>
        </Button>
      </div>
    </div>
  )
}
