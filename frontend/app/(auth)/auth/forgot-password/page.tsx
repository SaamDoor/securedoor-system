'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, ArrowRight, Mail, HeadphonesIcon, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isValidIranPhone, normalizePhone } from '@/lib/utils'
import { requestPasswordReset } from '@/app/actions/auth'

const schema = z.object({
  phone: z.string().refine(isValidIranPhone, 'شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)'),
})
type FormData = z.infer<typeof schema>

type Stage = 'form' | 'email-sent' | 'no-email' | 'error'

export default function ForgotPasswordPage() {
  const [stage, setStage] = useState<Stage>('form')
  const [phone, setPhone] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const normalized = normalizePhone(data.phone)
    setPhone(normalized)
    const result = await requestPasswordReset(normalized)

    if (!result.ok) {
      setStage('error')
      return
    }
    setStage(result.emailSent ? 'email-sent' : 'no-email')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <AnimatePresence mode="wait">

        {/* ── Stage: form ── */}
        {stage === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-white mb-2">فراموشی رمز عبور</h1>
              <p className="text-muted">
                شماره موبایل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.
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
                hint="همان شماره‌ای که با آن ثبت‌نام کرده‌اید"
                {...register('phone')}
              />

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                loading={isSubmitting}
              >
                ارسال لینک بازیابی
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                بازگشت به ورود
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── Stage: email sent ── */}
        {stage === 'email-sent' && (
          <motion.div key="email-sent" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col items-center text-center gap-5">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">لینک ارسال شد</h2>
                <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto">
                  لینک بازیابی رمز عبور به <strong className="text-white">ایمیلی که هنگام ثبت‌نام وارد کردید</strong> ارسال شد.
                  صندوق ورودی خود را بررسی کنید.
                </p>
              </div>

              <div className="w-full rounded-xl bg-gold/5 border border-gold/20 p-4 text-sm text-muted leading-relaxed">
                <div className="flex items-center gap-2 mb-2 text-gold font-semibold">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  نکته مهم
                </div>
                اگر ایمیل را دریافت نکردید، پوشه <strong className="text-white">اسپم</strong> را بررسی کنید.
                لینک تنها <strong className="text-white">یک ساعت</strong> اعتبار دارد.
              </div>

              <Link href="/auth/login" className="text-sm text-gold hover:text-gold-light transition-colors">
                بازگشت به صفحه ورود
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── Stage: no contact email → show support ── */}
        {stage === 'no-email' && (
          <motion.div key="no-email" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col items-center text-center gap-5">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
                <HeadphonesIcon className="h-8 w-8 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">تماس با پشتیبانی</h2>
                <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto">
                  برای حساب شماره <span className="font-bold text-white" dir="ltr">{phone}</span>،
                  ایمیل تماسی ثبت نشده است.{' '}
                  برای بازیابی رمز عبور با پشتیبانی تماس بگیرید.
                </p>
              </div>

              <a
                href="tel:09003286539"
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gold/10 border border-gold/30 hover:bg-gold/15 transition-colors"
              >
                <Phone className="h-5 w-5 text-gold" />
                <span className="text-white font-black text-lg ltr" dir="ltr">0900 328 6539</span>
              </a>

              <p className="text-xs text-muted">
                ساعات پاسخگویی: شنبه تا پنجشنبه ۸ تا ۱۸
              </p>

              <Link href="/auth/login" className="text-sm text-gold hover:text-gold-light transition-colors">
                بازگشت به صفحه ورود
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── Stage: error ── */}
        {stage === 'error' && (
          <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col items-center text-center gap-5">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">خطای موقت</h2>
                <p className="text-muted text-sm">خطایی رخ داد. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.</p>
              </div>
              <Button variant="gold-outline" onClick={() => setStage('form')} className="w-full">
                تلاش مجدد
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}
