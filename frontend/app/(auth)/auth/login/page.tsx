'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
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
  if (message.includes('Invalid login credentials')) return 'ایمیل یا رمز عبور اشتباه است'
  if (message.includes('Email not confirmed')) return 'لطفاً ابتدا ایمیل خود را تأیید کنید'
  if (message.includes('Too many requests')) return 'تعداد تلاش‌ها بیش از حد مجاز است. چند دقیقه صبر کنید'
  if (message.includes('User not found')) return 'کاربری با این ایمیل یافت نشد'
  return 'خطا در ورود. لطفاً دوباره تلاش کنید'
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    const supabase = createClient()

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error(mapAuthError(error.message))
      return
    }

    if (!authData.user) {
      toast.error('خطا در ورود. لطفاً دوباره تلاش کنید')
      return
    }

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

    document.cookie = `user_role=${role}; path=/; SameSite=Lax; Max-Age=86400`

    toast.success(`خوش آمدید، ${displayName}!`)

    const redirect = searchParams.get('redirect')
    if (redirect?.startsWith('/')) {
      router.push(redirect)
      router.refresh()
      return
    }

    if (ADMIN_ROLES.includes(role as AdminRole)) {
      router.push('/admin')
    } else {
      router.push('/user/dashboard')
    }
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">ورود به حساب</h1>
        <p className="text-muted">
          حساب ندارید؟{' '}
          <Link href="/auth/register" className="text-gold hover:text-gold-light transition-colors">
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
          {...register('email')}
        />

        <Input
          label="رمز عبور"
          type={showPassword ? 'text' : 'password'}
          placeholder="رمز عبور خود را وارد کنید"
          error={errors.password?.message}
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-gold" {...register('rememberMe')} />
            <span className="text-sm text-muted">مرا به یاد بسپار</span>
          </label>
          <Link href="/auth/forgot-password" className="text-sm text-gold hover:text-gold-light">
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
          className="w-full h-11 rounded-xl border border-white/15 flex items-center justify-center gap-3 text-sm text-muted hover:text-white hover:border-white/30 transition-all"
        >
          <span>🔵</span>
          ورود با Google
        </button>
      </form>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
