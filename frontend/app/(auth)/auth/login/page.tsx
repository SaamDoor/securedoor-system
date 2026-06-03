'use client'

import { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر باشد'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

const ADMIN_ROLES = ['super_admin', 'admin', 'manager', 'support'] as const
type AdminRole = (typeof ADMIN_ROLES)[number]

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'ایمیل یا رمز عبور اشتباه است'
  if (message.includes('Email not confirmed'))
    return 'لطفاً ابتدا ایمیل خود را تأیید کنید'
  if (message.includes('Too many requests'))
    return 'تعداد تلاش‌ها بیش از حد مجاز است. چند دقیقه صبر کنید'
  if (message.includes('User not found'))
    return 'کاربری با این ایمیل یافت نشد'
  if (message.includes('Email link is invalid or has expired'))
    return 'لینک تأیید ایمیل منقضی شده است. لطفاً دوباره تلاش کنید'
  return 'خطا در ورود. لطفاً دوباره تلاش کنید'
}

// Map ?auth_error= codes that Supabase appends when redirecting back after failure
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  otp_expired:
    'لینک تأیید ایمیل منقضی شده است. دوباره ثبت‌نام کنید تا ایمیل جدید ارسال شود.',
  access_denied:
    'دسترسی رد شد. لطفاً دوباره تلاش کنید.',
  auth_callback_failed:
    'تأیید ایمیل ناموفق بود. لطفاً دوباره ثبت‌نام کنید.',
  invalid_request:
    'لینک تأیید نامعتبر است. لطفاً دوباره ثبت‌نام کنید.',
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)

  // Show a Persian toast when Supabase redirects here with ?auth_error=
  useEffect(() => {
    const authError = searchParams.get('auth_error')
    if (!authError) return
    const msg = AUTH_ERROR_MESSAGES[authError] ?? 'خطایی در احراز هویت رخ داد. لطفاً دوباره تلاش کنید.'
    toast.error(msg, { duration: 8000 })
    // Clean the param from the URL without a page reload
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
    const supabase = createClient()

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    })

    if (error) {
      toast.error(mapAuthError(error.message), { duration: 5000 })
      return
    }

    if (!authData.user) {
      toast.error('خطا در ورود. لطفاً دوباره تلاش کنید')
      return
    }

    // Fetch profile to determine role and display name
    const { data: profile } = await supabase
      .from('users')
      .select('role, first_name, last_name')
      .eq('id', authData.user.id)
      .single()

    const role = (profile?.role ?? 'customer') as string
    const displayName =
      profile?.first_name
        ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
        : data.email

    // Write role hint cookie for middleware fast-path (not a security boundary)
    const maxAge = data.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24
    document.cookie = `user_role=${role}; path=/; SameSite=Lax; Max-Age=${maxAge}`

    toast.success(`خوش آمدید، ${displayName}!`, { duration: 3000 })

    const redirect = searchParams.get('redirect')
    if (redirect?.startsWith('/') && !redirect.startsWith('/auth')) {
      router.push(redirect)
      router.refresh()
      return
    }

    router.push(ADMIN_ROLES.includes(role as AdminRole) ? '/admin' : '/user/dashboard')
    router.refresh()
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
          <Link href="/auth/register" className="text-gold hover:text-gold-light transition-colors font-medium">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="ایمیل"
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          leftIcon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          {...register('email')}
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
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-xs text-muted">یا</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        <button
          type="button"
          className="w-full h-11 rounded-xl border border-white/15 flex items-center justify-center gap-3 text-sm text-muted hover:text-white hover:border-white/30 transition-all duration-200"
          onClick={() => toast.info('ورود با Google به زودی فعال می‌شود')}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          ورود با Google
        </button>
      </form>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-5"><div className="h-10 bg-white/5 rounded-xl" /><div className="h-10 bg-white/5 rounded-xl" /><div className="h-12 bg-white/10 rounded-xl" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
