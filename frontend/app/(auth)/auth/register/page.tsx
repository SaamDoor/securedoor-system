'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, UserPlus, Mail, Lock, Phone, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { isValidIranPhone, phoneToAuthEmail } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'نام حداقل ۲ کاراکتر باشد').max(50),
    lastName: z.string().min(2, 'نام خانوادگی حداقل ۲ کاراکتر باشد').max(50),
    phone: z.string().refine(isValidIranPhone, 'شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)'),
    email: z
      .string()
      .optional()
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'ایمیل معتبر وارد کنید'),
    password: z
      .string()
      .min(8, 'رمز عبور حداقل ۸ کاراکتر باشد')
      .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد')
      .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(Boolean, 'پذیرش قوانین الزامی است'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

function mapRegisterError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('user already registered') || m.includes('already been registered') || m.includes('already registered'))
    return 'این شماره موبایل قبلاً ثبت شده است. لطفاً وارد شوید'
  if (m.includes('too many requests') || m.includes('rate limit') || m.includes('over_email_send_rate_limit'))
    return 'تعداد تلاش‌ها بیش از حد مجاز است. چند دقیقه صبر کنید'
  if (m.includes('password should be at least') || m.includes('weak_password'))
    return 'رمز عبور باید حداقل ۸ کاراکتر باشد'
  if (m.includes('email address is invalid') || m.includes('invalid email') || m.includes('email_address_invalid'))
    return 'خطای داخلی در فرمت ایمیل. لطفاً با پشتیبانی تماس بگیرید'
  if (m.includes('signup_disabled') || m.includes('signups not allowed'))
    return 'ثبت‌نام در حال حاضر غیرفعال است. لطفاً بعداً تلاش کنید'
  if (m.includes('database error') || m.includes('unexpected_failure'))
    return 'خطای موقت سرور. لطفاً دوباره تلاش کنید'
  return `خطا در ثبت‌نام: ${message}`
}

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false },
  })

  async function onSubmit(data: RegisterFormData) {
    const supabase = createClient()

    // Build the internal auth email from phone — never shown to user
    const authEmail = phoneToAuthEmail(data.phone)

    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          phone: data.phone.trim(),
          // Store real email in metadata if provided; used for contact/notifications only
          contact_email: data.email?.trim().toLowerCase() || null,
        },
        // No email redirect needed — phone-based accounts skip email confirmation
        emailRedirectTo: undefined,
      },
    })

    if (error) {
      console.error('[Register] Supabase signUp error:', error)
      toast.error(mapRegisterError(error.message), { duration: 8000 })
      return
    }

    toast.success('ثبت‌نام با موفقیت انجام شد! در حال ورود...', { duration: 3000 })

    // Auto sign-in immediately after registration (no email confirmation needed)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: data.password,
    })

    if (signInError) {
      // If email confirmation is still enabled in Dashboard, show a helpful message
      if (signInError.message.includes('Email not confirmed')) {
        toast.info(
          'لطفاً تأیید ایمیل را در داشبورد Supabase غیرفعال کنید (Authentication → Settings → Disable email confirmations)',
          { duration: 10000 }
        )
        router.push('/auth/login')
      } else {
        toast.error('ثبت‌نام شد اما ورود خودکار ناموفق بود. لطفاً وارد شوید.')
        router.push('/auth/login')
      }
      return
    }

    // Fetch profile to get role cookie
    const { data: sessionData } = await supabase.auth.getUser()
    if (sessionData.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', sessionData.user.id)
        .single()
      const role = profile?.role ?? 'customer'
      document.cookie = `user_role=${role}; path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
    }

    router.push('/user/dashboard')
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">ایجاد حساب کاربری</h1>
        <p className="text-muted">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link href="/auth/login" className="text-gold hover:text-gold-light transition-colors font-medium">
            وارد شوید
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="نام"
            placeholder="نام"
            error={errors.firstName?.message}
            leftIcon={<User className="h-4 w-4" />}
            autoComplete="given-name"
            {...register('firstName')}
          />
          <Input
            label="نام خانوادگی"
            placeholder="نام خانوادگی"
            error={errors.lastName?.message}
            autoComplete="family-name"
            {...register('lastName')}
          />
        </div>

        {/* Phone — required, primary identifier */}
        <Input
          label="شماره موبایل *"
          type="tel"
          placeholder="09123456789"
          error={errors.phone?.message}
          leftIcon={<Phone className="h-4 w-4" />}
          autoComplete="tel"
          dir="ltr"
          hint="شماره موبایل نام کاربری شما خواهد بود"
          {...register('phone')}
        />

        {/* Email — optional */}
        <Input
          label="ایمیل (اختیاری)"
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          leftIcon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          hint="برای دریافت اطلاعیه‌ها و پشتیبانی (الزامی نیست)"
          {...register('email')}
        />

        <Input
          label="رمز عبور"
          type={showPassword ? 'text' : 'password'}
          placeholder="حداقل ۸ کاراکتر"
          error={errors.password?.message}
          hint="شامل حروف بزرگ انگلیسی و اعداد باشد"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted hover:text-white transition-colors"
              aria-label={showPassword ? 'پنهان کردن رمز' : 'نمایش رمز'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          autoComplete="new-password"
          {...register('password')}
        />

        <Input
          label="تکرار رمز عبور"
          type={showConfirm ? 'text' : 'password'}
          placeholder="رمز عبور را تکرار کنید"
          error={errors.confirmPassword?.message}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-muted hover:text-white transition-colors"
              aria-label={showConfirm ? 'پنهان کردن رمز' : 'نمایش رمز'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <div className="pt-1">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-0.5 accent-gold w-4 h-4 rounded flex-shrink-0"
              {...register('acceptTerms')}
            />
            <span className="text-sm text-muted leading-relaxed">
              <Link href="/terms" className="text-gold hover:text-gold-light transition-colors">قوانین و مقررات</Link>
              {' '}و{' '}
              <Link href="/privacy" className="text-gold hover:text-gold-light transition-colors">حریم خصوصی</Link>
              {' '}گروه صنعتی مشعوف را می‌پذیرم.
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs text-danger mt-1.5 flex items-center gap-1">
              <span aria-hidden="true">⚠</span>
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          leftIcon={<UserPlus className="h-5 w-5" />}
        >
          ثبت‌نام
        </Button>
      </form>
    </motion.div>
  )
}
