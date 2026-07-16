'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle,
  Globe,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { getSettingsAction, saveSettingsAction } from '../actions'

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    siteName: '',
    siteUrl: '',
    siteDescription: '',
    adminEmail: '',
    contactPhone: '',
    contactMobile: '',
    contactEmail: '',
    contactAddress: '',
    workingHours: '',
    instagram: '',
    telegram: '',
    whatsapp: '',
    linkedin: '',
    youtube: '',
    minOrderAmount: '',
    freeShippingThreshold: '',
    taxRatePercent: '',
    autoApproveReviews: false,
    maintenanceMode: false,
    registrationEnabled: true,
  })

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
        siteName: String(map.get('site_name') ?? 'گروه صنعتی مشعوف'),
        siteUrl: String(map.get('site_url') ?? 'https://mashuf.com'),
        siteDescription: String(map.get('site_description') ?? ''),
        adminEmail: String(map.get('admin_email') ?? 'info@mashuf.com'),
        contactPhone: String(map.get('contact_phone') ?? ''),
        contactMobile: String(map.get('contact_phone_2') ?? ''),
        contactEmail: String(map.get('contact_email') ?? ''),
        contactAddress: String(map.get('contact_address') ?? ''),
        workingHours: String(map.get('working_hours') ?? ''),
        instagram: String(map.get('social_instagram') ?? ''),
        telegram: String(map.get('social_telegram') ?? ''),
        whatsapp: String(map.get('social_whatsapp') ?? ''),
        linkedin: String(map.get('social_linkedin') ?? ''),
        youtube: String(map.get('social_youtube') ?? ''),
        minOrderAmount: String(map.get('min_order_amount') ?? '500000'),
        freeShippingThreshold: String(map.get('free_shipping_threshold') ?? '5000000'),
        taxRatePercent: String(map.get('tax_rate_percent') ?? '9'),
        autoApproveReviews: Boolean(map.get('auto_approve_reviews') ?? false),
        maintenanceMode: Boolean(map.get('maintenance_mode') ?? false),
        registrationEnabled: Boolean(map.get('registration_enabled') ?? true),
      })
      setLoading(false)
    })()
  }, [])

  async function handleSave() {
    const result = await saveSettingsAction([
      { key: 'site_name', value: form.siteName, group: 'general' },
      { key: 'site_url', value: form.siteUrl, group: 'general' },
      { key: 'site_description', value: form.siteDescription, group: 'general' },
      { key: 'admin_email', value: form.adminEmail, group: 'general' },
      { key: 'contact_phone', value: form.contactPhone, group: 'contact' },
      { key: 'contact_phone_2', value: form.contactMobile, group: 'contact' },
      { key: 'contact_email', value: form.contactEmail, group: 'contact' },
      { key: 'contact_address', value: form.contactAddress, group: 'contact' },
      { key: 'working_hours', value: form.workingHours, group: 'contact' },
      { key: 'social_instagram', value: form.instagram, group: 'social' },
      { key: 'social_telegram', value: form.telegram, group: 'social' },
      { key: 'social_whatsapp', value: form.whatsapp, group: 'social' },
      { key: 'social_linkedin', value: form.linkedin, group: 'social' },
      { key: 'social_youtube', value: form.youtube, group: 'social' },
      { key: 'min_order_amount', value: Number(form.minOrderAmount || 0), group: 'shop' },
      { key: 'free_shipping_threshold', value: Number(form.freeShippingThreshold || 0), group: 'shop' },
      { key: 'tax_rate_percent', value: Number(form.taxRatePercent || 0), group: 'shop' },
      { key: 'auto_approve_reviews', value: form.autoApproveReviews, group: 'shop' },
      { key: 'maintenance_mode', value: form.maintenanceMode, group: 'system' },
      { key: 'registration_enabled', value: form.registrationEnabled, group: 'system' },
    ])
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setSaved(true)
    toast.success('تنظیمات ذخیره شد')
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">تنظیمات سیستم</h1>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-[#27AE60]">
              <CheckCircle className="h-4 w-4" />
              ذخیره شد
            </span>
          )}
          <Button variant="gold" size="sm" onClick={handleSave} disabled={loading}>
            ذخیره همه تغییرات
          </Button>
        </div>
      </div>
      {loading && <p className="text-sm text-[#A0A0A0]">در حال بارگذاری تنظیمات...</p>}

      <Tabs defaultValue="general">
        <TabsList className="mb-1 w-full sm:w-auto sm:flex-wrap">
          <TabsTrigger value="general">عمومی</TabsTrigger>
          <TabsTrigger value="contact">اطلاعات تماس</TabsTrigger>
          <TabsTrigger value="social">شبکه‌های اجتماعی</TabsTrigger>
          <TabsTrigger value="shop">فروشگاه</TabsTrigger>
          <TabsTrigger value="system">سیستم</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 space-y-5">
            <Input label="نام سایت" value={form.siteName} onChange={(e) => setForm((prev) => ({ ...prev, siteName: e.target.value }))} />
            <Input
              label="آدرس سایت"
              value={form.siteUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, siteUrl: e.target.value }))}
              leftIcon={<Globe className="h-4 w-4" />}
            />
            <Textarea
              label="توضیحات سایت"
              value={form.siteDescription}
              onChange={(e) => setForm((prev) => ({ ...prev, siteDescription: e.target.value }))}
            />
            <Input
              label="ایمیل مدیر"
              type="email"
              value={form.adminEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 space-y-5">
            <Input
              label="تلفن اصلی"
              value={form.contactPhone}
              onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
              leftIcon={<Phone className="h-4 w-4" />}
            />
            <Input
              label="موبایل"
              value={form.contactMobile}
              onChange={(e) => setForm((prev) => ({ ...prev, contactMobile: e.target.value }))}
              leftIcon={<Phone className="h-4 w-4" />}
            />
            <Input
              label="ایمیل عمومی"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
              leftIcon={<Mail className="h-4 w-4" />}
            />
            <Textarea
              label="آدرس"
              value={form.contactAddress}
              onChange={(e) => setForm((prev) => ({ ...prev, contactAddress: e.target.value }))}
            />
            <Input
              label="ساعات کاری"
              value={form.workingHours}
              onChange={(e) => setForm((prev) => ({ ...prev, workingHours: e.target.value }))}
              leftIcon={<MapPin className="h-4 w-4" />}
            />
          </div>
        </TabsContent>

        <TabsContent value="social">
          <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 space-y-5">
            <Input
              label="اینستاگرام"
              value={form.instagram}
              onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value }))}
              placeholder="https://instagram.com/..."
              leftIcon={<Instagram className="h-4 w-4" />}
            />
            <Input
              label="تلگرام"
              value={form.telegram}
              onChange={(e) => setForm((prev) => ({ ...prev, telegram: e.target.value }))}
              placeholder="https://t.me/..."
              leftIcon={<Send className="h-4 w-4" />}
            />
            <Input label="واتساپ" value={form.whatsapp} onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))} placeholder="https://wa.me/..." />
            <Input
              label="لینکدین"
              value={form.linkedin}
              onChange={(e) => setForm((prev) => ({ ...prev, linkedin: e.target.value }))}
              placeholder="https://linkedin.com/company/..."
            />
            <Input label="یوتیوب" value={form.youtube} onChange={(e) => setForm((prev) => ({ ...prev, youtube: e.target.value }))} placeholder="https://youtube.com/@..." />
          </div>
        </TabsContent>

        <TabsContent value="shop">
          <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 space-y-5">
            <Input
              label="حداقل مبلغ سفارش (تومان)"
              type="number"
              value={form.minOrderAmount}
              onChange={(e) => setForm((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
            />
            <Input
              label="آستانه ارسال رایگان (تومان)"
              type="number"
              value={form.freeShippingThreshold}
              onChange={(e) => setForm((prev) => ({ ...prev, freeShippingThreshold: e.target.value }))}
            />
            <Input
              label="درصد مالیات بر ارزش افزوده"
              type="number"
              value={form.taxRatePercent}
              onChange={(e) => setForm((prev) => ({ ...prev, taxRatePercent: e.target.value }))}
            />

            <div className="flex items-center justify-between py-3 border-b border-white/8">
              <div>
                <div className="font-medium text-white text-sm">
                  تأیید خودکار نظرات
                </div>
                <div className="text-xs text-[#A0A0A0]">
                  نظرات کاربران بدون بررسی منتشر می‌شوند
                </div>
              </div>
              <Switch
                checked={form.autoApproveReviews}
                onCheckedChange={(value) => setForm((prev) => ({ ...prev, autoApproveReviews: value }))}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 space-y-5">
            <div className="flex items-center justify-between py-3 border-b border-white/8">
              <div>
                <div className="font-medium text-white text-sm">
                  حالت تعمیرات
                </div>
                <div className="text-xs text-[#A0A0A0]">
                  سایت برای کاربران عادی غیرقابل دسترس می‌شود
                </div>
              </div>
              <Switch
                checked={form.maintenanceMode}
                onCheckedChange={(value) => setForm((prev) => ({ ...prev, maintenanceMode: value }))}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-white/8">
              <div>
                <div className="font-medium text-white text-sm">
                  امکان ثبت‌نام
                </div>
                <div className="text-xs text-[#A0A0A0]">
                  کاربران جدید می‌توانند ثبت‌نام کنند
                </div>
              </div>
              <Switch
                checked={form.registrationEnabled}
                onCheckedChange={(value) => setForm((prev) => ({ ...prev, registrationEnabled: value }))}
              />
            </div>

            {form.maintenanceMode && (
              <div className="p-4 rounded-xl bg-[#D49A2A]/10 border border-[#D49A2A]/20 text-sm text-[#F0B429]">
                ⚠️ حالت تعمیرات فعال است. کاربران عادی نمی‌توانند به سایت دسترسی
                داشته باشند.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
