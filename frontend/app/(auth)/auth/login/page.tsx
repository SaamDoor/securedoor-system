'use client'

import { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn, Phone, Lock, Mail, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { signInWithPassword } from '@/app/actions/auth'
import { isValidIranPhone } from '@/lib/utils'

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  identifier: z.string().min(1, 'شماره موبایل یا ایمیل را وارد کنید'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر باشد'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapAuthError(message?: string): string {
  if (!message) return 'خطا در ورود. لطفاً دوباره تلاش کنید'
  if (message.includes('Invalid login credentials') || message.includes('invalid_credentials'))
    return 'شماره موبایل/ایمیل یا رمز عبور اشتباه است'
  if (message.includes('Too many requests') || message.includes('too_many_requests'))
    return 'تعداد تلاش‌ها بیش از حد مجاز است. چند دقیقه صبر کنید'
  if (message.includes('User not found') || message.includes('user_not_found'))
    return 'کاربری با این مشخصات یافت نشد'
  if (message.includes('Email not confirmed'))
    return 'ایمیل شما تأیید نشده است. لطفاً ایمیل خود را بررسی کنید'
  if (message.includes('Supabase') || message.includes('fetch') || message.includes('network'))
    return 'خطا در ارتباط با سرور. لطفاً اتصال اینترنت را بررسی کنید'
  return message
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  otp_expired: 'لینک منقضی شده است. لطفاً دوباره تلاش کنید.',
  access_denied: 'دسترسی رد شد. لطفاً دوباره تلاش کنید.',
  auth_callback_failed: 'احراز هویت ناموفق بود. لطفاً دوباره تلاش کنید.',
  invalid_request: 'درخواست نامعتبر است. لطفاً دوباره تلاش کنید.',
}

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('phone')
  const supabaseConfigured = isSupabaseConfigured()

  useEffect(() => {
    const authError = searchParams.get('auth_error')
    if (!authError) return
    const msg = AUTH_ERROR_MESSAGES[authError] ?? 'خطایی رخ داد. لطفاً دوباره تلاش کنید.'
    toast.error(msg, { duration: 8000 })
    const clean = new URL(window.location.href)
    clean.searchParams.delete('auth_error')
    window.history.replaceState({}, '', clean.toString())
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  })

  async function onSubmit(data: LoginFormData) {
    try {
      const result = await signInWithPassword(data.identifier, data.password, loginMode)
      // If we get here (no redirect), it means there was an error
      if (result && !result.ok) {
        setError('identifier', { message: ' ' })
        setError('password', { message: ' ' })
        toast.error(mapAuthError(result.error), { duration: 6000 })
      }
    } catch (err) {
      // NEXT_REDIRECT throws — navigation is happening, ignore it
      if (err instanceof Error && (err.message === 'NEXT_REDIRECT' || err.message.includes('NEXT_REDIRECT'))) {
        return
      }
      // Real error (e.g. Supabase not configured, network failure)
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(mapAuthError(msg), { duration: 6000 })
    }
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

      {/* Supabase not configured warning */}
      {!supabaseConfigured && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25"
        >
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-amber-400 font-bold text-sm mb-1">پیکربندی Supabase ناقص است</p>
            <p className="text-amber-400/70 text-xs leading-relaxed">
              متغیرهای محیطی{' '}
              <code className="bg-amber-500/15 px-1 rounded text-amber-300">NEXT_PUBLIC_SUPABASE_URL</code> و{' '}
              <code className="bg-amber-500/15 px-1 rounded text-amber-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
              در فایل <code className="bg-amber-500/15 px-1 rounded text-amber-300">.env.local</code> تنظیم نشده‌اند.
              آن‌ها را از داشبورد Supabase → Project → Settings → API پر کنید.
            </p>
          </div>
        </motion.div>
      )}

      {/* Mode toggle */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/8 mb-6">
        {(['phone', 'email'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setLoginMode(mode)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              loginMode === mode ? 'text-black' : 'text-muted hover:text-white'
            }`}
          >
            {loginMode === mode && (
              <motion.span
                layoutId="login-mode-bg"
                className="absolute inset-0 rounded-lg bg-gold-gradient"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {mode === 'phone' ? <Phone className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
              {mode === 'phone' ? 'شماره موبایل' : 'ایمیل'}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <AnimatePresence mode="wait">
          <motion.div
            key={loginMode}
            initial={{ opacity: 0, x: loginMode === 'phone' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Input
              label={loginMode === 'phone' ? 'شماره موبایل' : 'آدرس ایمیل'}
              type={loginMode === 'phone' ? 'tel' : 'email'}
              placeholder={loginMode === 'phone' ? '09123456789' : 'admin@example.com'}
              error={errors.identifier?.message && errors.identifier.message !== ' ' ? errors.identifier.message : undefined}
              leftIcon={loginMode === 'phone' ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              autoComplete={loginMode === 'phone' ? 'tel' : 'email'}
              dir={loginMode === 'phone' ? 'ltr' : 'ltr'}
              {...register('identifier')}
            />
          </motion.div>
        </AnimatePresence>

        <Input
          label="رمز عبور"
          type={showPassword ? 'text' : 'password'}
          placeholder="رمز عبور خود را وارد کنید"
          error={errors.password?.message && errors.password.message !== ' ' ? errors.password.message : undefined}
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
          <Link href="/auth/forgot-password" className="text-sm text-gold hover:text-gold-light transition-colors">
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
          disabled={!supabaseConfigured || isSubmitting}
        >
          {supabaseConfigured ? 'ورود' : 'پیکربندی Supabase ناقص'}
        </Button>
      </form>

      {/* Super admin hint */}
      <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
        <p className="text-xs text-muted leading-relaxed text-center">
          اگر با اکانت سوپر ادمین وارد می‌شوید و اکانت مستقیم در Supabase با ایمیل ساخته شده،{' '}
          <button onClick={() => setLoginMode('email')} className="text-gold hover:underline">
            حالت ایمیل
          </button>{' '}
          را انتخاب کنید.
        </p>
      </div>
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
