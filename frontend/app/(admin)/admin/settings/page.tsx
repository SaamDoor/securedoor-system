'use client'

import { useState } from 'react'
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

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [registrationEnabled, setRegistrationEnabled] = useState(true)
  const [autoApproveReviews, setAutoApproveReviews] = useState(false)

  async function handleSave() {
    await new Promise((r) => setTimeout(r, 800))
    setSaved(true)
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
          <Button variant="gold" size="sm" onClick={handleSave}>
            ذخیره همه تغییرات
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">عمومی</TabsTrigger>
          <TabsTrigger value="contact">اطلاعات تماس</TabsTrigger>
          <TabsTrigger value="social">شبکه‌های اجتماعی</TabsTrigger>
          <TabsTrigger value="shop">فروشگاه</TabsTrigger>
          <TabsTrigger value="system">سیستم</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 space-y-5">
            <Input label="نام سایت" defaultValue="گروه صنعتی مشعوف" />
            <Input
              label="آدرس سایت"
              defaultValue="https://mashuf.com"
              leftIcon={<Globe className="h-4 w-4" />}
            />
            <Textarea
              label="توضیحات سایت"
              defaultValue="گروه صنعتی تولیدی صنایع ساختمانی مشعوف — پیشرو در ساخت درب‌های ضد سرقت"
            />
            <Input
              label="ایمیل مدیر"
              type="email"
              defaultValue="info@mashuf.com"
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 space-y-5">
            <Input
              label="تلفن اصلی"
              defaultValue="۰۹۰۰ ۳۲۸ ۶۵۳۹"
              leftIcon={<Phone className="h-4 w-4" />}
            />
            <Input
              label="موبایل"
              defaultValue="۰۹۰۰ ۳۲۸ ۶۵۳۹"
              leftIcon={<Phone className="h-4 w-4" />}
            />
            <Input
              label="ایمیل عمومی"
              type="email"
              defaultValue="info@mashuf.com"
              leftIcon={<Mail className="h-4 w-4" />}
            />
            <Textarea
              label="آدرس"
              defaultValue="مازندران، شهرستان قائم شهر، بلوار سید نظام‌الدین، جاده قادیکلای بزرگ، روبروی ولیعصر ۳۶"
            />
            <Input
              label="ساعات کاری"
              defaultValue="شنبه تا چهارشنبه ۸ تا ۱۷، پنجشنبه ۸ تا ۱۳"
              leftIcon={<MapPin className="h-4 w-4" />}
            />
          </div>
        </TabsContent>

        <TabsContent value="social">
          <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 space-y-5">
            <Input
              label="اینستاگرام"
              placeholder="https://instagram.com/..."
              leftIcon={<Instagram className="h-4 w-4" />}
            />
            <Input
              label="تلگرام"
              placeholder="https://t.me/..."
              leftIcon={<Send className="h-4 w-4" />}
            />
            <Input label="واتساپ" placeholder="https://wa.me/..." />
            <Input
              label="لینکدین"
              placeholder="https://linkedin.com/company/..."
            />
            <Input label="یوتیوب" placeholder="https://youtube.com/@..." />
          </div>
        </TabsContent>

        <TabsContent value="shop">
          <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 space-y-5">
            <Input
              label="حداقل مبلغ سفارش (تومان)"
              type="number"
              defaultValue="500000"
            />
            <Input
              label="آستانه ارسال رایگان (تومان)"
              type="number"
              defaultValue="5000000"
            />
            <Input
              label="درصد مالیات بر ارزش افزوده"
              type="number"
              defaultValue="9"
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
                checked={autoApproveReviews}
                onCheckedChange={setAutoApproveReviews}
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
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
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
                checked={registrationEnabled}
                onCheckedChange={setRegistrationEnabled}
              />
            </div>

            {maintenanceMode && (
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
