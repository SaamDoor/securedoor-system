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
import { isValidIranPhone } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'نام حداقل ۲ کاراکتر باشد').max(50, 'نام خیلی طولانی است'),
    lastName: z.string().min(2, 'نام خانوادگی حداقل ۲ کاراکتر باشد').max(50, 'نام خانوادگی خیلی طولانی است'),
    email: z.string().email('ایمیل معتبر وارد کنید'),
    phone: z.string().refine(isValidIranPhone, 'شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)'),
    password: z
      .string()
      .min(8, 'رمز عبور حداقل ۸ کاراکتر باشد')
      .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
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
  if (message.includes('User already registered') || message.includes('already been registered'))
    return 'این ایمیل قبلاً ثبت شده است. لطفاً وارد شوید'
  if (message.includes('Too many requests'))
    return 'تعداد تلاش‌ها بیش از حد مجاز است. کمی صبر کنید'
  if (message.includes('Password should be at least'))
    return 'رمز عبور باید حداقل ۸ کاراکتر باشد'
  if (message.includes('Unable to validate email'))
    return 'آدرس ایمیل معتبر نیست'
  return 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید'
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

    const { error } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      options: {
        data: {
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          phone: data.phone.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(mapRegisterError(error.message), { duration: 6000 })
      return
    }

    toast.success('ثبت‌نام موفق! لطفاً ایمیل خود را تأیید کنید.', { duration: 5000 })
    router.push('/auth/verify-email')
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
          placeholder="حداقل ۸ کاراکتر"
          error={errors.password?.message}
          hint="رمز عبور باید شامل حروف بزرگ انگلیسی و اعداد باشد"
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
