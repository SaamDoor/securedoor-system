'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { isValidIranPhone } from '@/lib/utils'

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'نام حداقل ۲ کاراکتر باشد'),
    lastName: z.string().min(2, 'نام خانوادگی حداقل ۲ کاراکتر باشد'),
    email: z.string().email('ایمیل معتبر وارد کنید'),
    phone: z.string().refine(isValidIranPhone, 'شماره موبایل معتبر وارد کنید'),
    password: z
      .string()
      .min(8, 'رمز عبور حداقل ۸ کاراکتر باشد')
      .regex(/[A-Z]/, 'رمز عبور باید حروف بزرگ داشته باشد')
      .regex(/[0-9]/, 'رمز عبور باید عدد داشته باشد'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(Boolean, 'پذیرش قوانین الزامی است'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

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
  })

  async function onSubmit(data: RegisterFormData) {
    try {
      await new Promise((r) => setTimeout(r, 1200))
      toast.success('ثبت‌نام با موفقیت انجام شد! لطفاً ایمیل خود را تأیید کنید.')
      router.push('/auth/verify-email')
    } catch {
      toast.error('خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">ایجاد حساب کاربری</h1>
        <p className="text-muted">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link href="/auth/login" className="text-gold hover:text-gold-light transition-colors">
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
            {...register('firstName')}
          />
          <Input
            label="نام خانوادگی"
            placeholder="نام خانوادگی"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="ایمیل"
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="شماره موبایل"
          type="tel"
          placeholder="09123456789"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="رمز عبور"
          type={showPassword ? 'text' : 'password'}
          placeholder="حداقل ۸ کاراکتر"
          error={errors.password?.message}
          hint="رمز عبور باید شامل حروف بزرگ و اعداد باشد"
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('password')}
        />

        <Input
          label="تکرار رمز عبور"
          type={showConfirm ? 'text' : 'password'}
          placeholder="رمز عبور را تکرار کنید"
          error={errors.confirmPassword?.message}
          rightIcon={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register('confirmPassword')}
        />

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 accent-gold"
            {...register('acceptTerms')}
          />
          <span className="text-sm text-muted">
            <Link href="/terms" className="text-gold hover:text-gold-light">قوانین و مقررات</Link>{' '}
            و{' '}
            <Link href="/privacy" className="text-gold hover:text-gold-light">حریم خصوصی</Link>{' '}
            سام درب را می‌پذیرم.
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-xs text-danger">{errors.acceptTerms.message}</p>
        )}

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
