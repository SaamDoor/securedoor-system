'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'رمز عبور حداقل ۸ کاراکتر باشد')
      .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد')
      .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

type Stage = 'checking' | 'form' | 'done' | 'invalid'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('checking')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  // Verify that a valid session exists (set by /auth/callback after recovery link)
  useEffect(() => {
    async function checkSession() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setStage(session ? 'form' : 'invalid')
    }
    checkSession()
  }, [])

  async function onSubmit(data: FormData) {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      toast.error('خطا در تغییر رمز عبور. لطفاً دوباره تلاش کنید.', { duration: 6000 })
      return
    }

    // Sign out so user must login with new password (prevents stale session)
    await supabase.auth.signOut()
    setStage('done')
  }

  // ── Checking session ──
  if (stage === 'checking') {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
        <p className="text-muted text-sm">در حال بررسی...</p>
      </div>
    )
  }

  // ── Invalid / expired link ──
  if (stage === 'invalid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-5 py-8"
      >
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
          <Lock className="h-8 w-8 text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">لینک منقضی شده</h2>
          <p className="text-muted text-sm leading-relaxed">
            لینک بازیابی رمز عبور منقضی یا نامعتبر است.<br />
            لطفاً مجدداً درخواست بازیابی دهید.
          </p>
        </div>
        <Button
          variant="gold"
          className="w-full"
          onClick={() => router.push('/auth/forgot-password')}
        >
          درخواست مجدد
        </Button>
      </motion.div>
    )
  }

  // ── Done ──
  if (stage === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-5 py-8"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">رمز تغییر کرد</h2>
          <p className="text-muted text-sm">رمز عبور جدید با موفقیت تنظیم شد. اکنون می‌توانید وارد شوید.</p>
        </div>
        <Button variant="gold" className="w-full" onClick={() => router.push('/auth/login')}>
          ورود به حساب
        </Button>
      </motion.div>
    )
  }

  // ── Form ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">رمز عبور جدید</h1>
        <p className="text-muted">رمز عبور جدید خود را انتخاب کنید.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="رمز عبور جدید"
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

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          loading={isSubmitting}
          leftIcon={<Lock className="h-5 w-5" />}
        >
          ذخیره رمز عبور جدید
        </Button>
      </form>
    </motion.div>
  )
}
