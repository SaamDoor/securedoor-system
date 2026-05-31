'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { updateProfileSchema, changePasswordSchema } from '@/lib/validations/auth'
import type { UpdateProfileFormData, ChangePasswordFormData } from '@/lib/validations/auth'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function UserProfilePage() {
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: 'مهمان',
      lastName: 'کاربری',
      phone: '09120000000',
      bio: '',
      company: '',
      website: '',
    },
  })

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onProfileSubmit(_data: UpdateProfileFormData) {
    await new Promise((r) => setTimeout(r, 1000))
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  async function onPasswordSubmit(_data: ChangePasswordFormData) {
    await new Promise((r) => setTimeout(r, 1000))
    setPasswordSaved(true)
    passwordForm.reset()
    setTimeout(() => setPasswordSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-white">پروفایل من</h1>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">اطلاعات شخصی</TabsTrigger>
          <TabsTrigger value="password">تغییر رمز عبور</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="rounded-2xl bg-[#181818] border border-white/8 p-6">
            {/* Avatar */}
            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-white/8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-[#C8A85D]/10 border border-[#C8A85D]/20 flex items-center justify-center text-3xl font-black text-[#C8A85D]">
                  م
                </div>
                <button
                  aria-label="تغییر تصویر"
                  className="absolute -bottom-1 -left-1 w-7 h-7 rounded-lg bg-[#C8A85D] flex items-center justify-center"
                >
                  <Camera className="h-3.5 w-3.5 text-black" />
                </button>
              </div>
              <div>
                <div className="font-bold text-white text-lg">مهمان کاربری</div>
                <div className="text-sm text-[#A0A0A0]">مشتری ویژه</div>
              </div>
            </div>

            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="نام"
                  error={profileForm.formState.errors.firstName?.message}
                  {...profileForm.register('firstName')}
                />
                <Input
                  label="نام خانوادگی"
                  error={profileForm.formState.errors.lastName?.message}
                  {...profileForm.register('lastName')}
                />
              </div>

              <Input
                label="شماره موبایل"
                type="tel"
                error={profileForm.formState.errors.phone?.message}
                {...profileForm.register('phone')}
              />

              <Input
                label="نام شرکت (اختیاری)"
                error={profileForm.formState.errors.company?.message}
                {...profileForm.register('company')}
              />

              <Input
                label="وبسایت (اختیاری)"
                type="url"
                placeholder="https://example.com"
                error={profileForm.formState.errors.website?.message}
                {...profileForm.register('website')}
              />

              <Textarea
                label="بیوگرافی (اختیاری)"
                placeholder="درباره خودتان بنویسید..."
                error={profileForm.formState.errors.bio?.message}
                {...profileForm.register('bio')}
              />

              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  variant="gold"
                  size="md"
                  loading={profileForm.formState.isSubmitting}
                >
                  ذخیره تغییرات
                </Button>
                {profileSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-[#27AE60]">
                    <CheckCircle className="h-4 w-4" />
                    ذخیره شد
                  </span>
                )}
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="password">
          <div className="rounded-2xl bg-[#181818] border border-white/8 p-6 max-w-md">
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5" noValidate>
              <Input
                label="رمز عبور فعلی"
                type="password"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register('currentPassword')}
              />
              <Input
                label="رمز عبور جدید"
                type="password"
                hint="حداقل ۸ کاراکتر، شامل حروف بزرگ و اعداد"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register('newPassword')}
              />
              <Input
                label="تکرار رمز عبور جدید"
                type="password"
                error={passwordForm.formState.errors.confirmNewPassword?.message}
                {...passwordForm.register('confirmNewPassword')}
              />

              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  variant="gold"
                  size="md"
                  loading={passwordForm.formState.isSubmitting}
                >
                  تغییر رمز عبور
                </Button>
                {passwordSaved && (
                  <span className="flex items-center gap-1.5 text-sm text-[#27AE60]">
                    <CheckCircle className="h-4 w-4" />
                    رمز تغییر کرد
                  </span>
                )}
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
