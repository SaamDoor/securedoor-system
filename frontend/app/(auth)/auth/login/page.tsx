'use client'

import { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn, Phone, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { signInWithPassword } from '@/app/actions/auth'
import { isValidIranPhone } from '@/lib/utils'

const loginSchema = z.object({
  phone: z
    .string()
    .refine(
      isValidIranPhone,
      'شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)',
    ),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر باشد'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'شماره موبایل یا رمز عبور اشتباه است'
  if (message.includes('Too many requests'))
    return 'تعداد تلاش‌ها بیش از حد مجاز است. چند دقیقه صبر کنید'
  if (message.includes('User not found'))
    return 'کاربری با این شماره موبایل یافت نشد'
  return 'خطا در ورود. لطفاً دوباره تلاش کنید'
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  otp_expired: 'لینک منقضی شده است. لطفاً دوباره تلاش کنید.',
  access_denied: 'دسترسی رد شد. لطفاً دوباره تلاش کنید.',
  auth_callback_failed: 'احراز هویت ناموفق بود. لطفاً دوباره تلاش کنید.',
  invalid_request: 'درخواست نامعتبر است. لطفاً دوباره تلاش کنید.',
}

function LoginForm() {
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)

  // Show Persian toast for ?auth_error= params from Supabase redirects
  useEffect(() => {
    const authError = searchParams.get('auth_error')
    if (!authError) return
    const msg =
      AUTH_ERROR_MESSAGES[authError] ?? 'خطایی رخ داد. لطفاً دوباره تلاش کنید.'
    toast.error(msg, { duration: 8000 })
    const clean = new URL(window.location.href)
    clean.searchParams.delete('auth_error')
    window.history.replaceState({}, '', clean.toString())
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  })

  async function onSubmit(data: LoginFormData) {
    const result = await signInWithPassword(data.phone, data.password)
    toast.error(mapAuthError(result.error), { duration: 5000 })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">ورود به حساب</h1>
        <p className="text-muted">
          حساب ندارید؟{' '}
          <Link
            href="/auth/register"
            className="text-gold hover:text-gold-light transition-colors font-medium"
          >
            ثبت‌نام کنید
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="شماره موبایل"
          type="tel"
          placeholder="09123456789"
          error={errors.phone?.message}
          leftIcon={<Phone className="h-4 w-4" />}
          autoComplete="tel"
          dir="ltr"
          {...register('phone')}
        />

        <Input
          label="رمز عبور"
          type={showPassword ? 'text' : 'password'}
          placeholder="رمز عبور خود را وارد کنید"
          error={errors.password?.message}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted hover:text-white transition-colors"
              aria-label={showPassword ? 'پنهان کردن رمز' : 'نمایش رمز'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          autoComplete="current-password"
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-gold w-4 h-4 rounded"
              {...register('rememberMe')}
            />
            <span className="text-sm text-muted">مرا به یاد بسپار</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-gold hover:text-gold-light transition-colors"
          >
            فراموشی رمز عبور
          </Link>
        </div>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          leftIcon={<LogIn className="h-5 w-5" />}
        >
          ورود
        </Button>
      </form>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-5">
          <div className="h-10 bg-white/5 rounded-xl" />
          <div className="h-10 bg-white/5 rounded-xl" />
          <div className="h-12 bg-white/10 rounded-xl" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
