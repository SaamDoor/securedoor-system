'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر باشد'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    try {
      // In production: call auth API
      await new Promise((r) => setTimeout(r, 1000))
      toast.success('خوش آمدید! در حال انتقال...')
      router.push('/user/dashboard')
    } catch {
      toast.error('اطلاعات ورود اشتباه است')
    }
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
            <input
              type="checkbox"
              className="accent-gold"
              {...register('rememberMe')}
            />
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

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-xs text-muted">یا</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* Google login placeholder */}
        <button
          type="button"
          className="w-full h-11 rounded-xl border border-white/15 flex items-center justify-center gap-3 text-sm text-muted hover:text-white hover:border-white/30 transition-all"
        >
          <span>🔵</span>
          ورود با Google
        </button>
      </form>

      {/* Admin hint for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 rounded-xl bg-gold/5 border border-gold/20 text-xs text-muted">
          <span className="text-gold font-semibold">Dev:</span> admin@samdoor.com / password123
        </div>
      )}
    </motion.div>
  )
}
