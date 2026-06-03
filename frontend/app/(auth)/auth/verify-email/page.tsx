'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MailCheck } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="w-20 h-20 bg-gold/10 border border-gold/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <MailCheck className="h-10 w-10 text-gold" />
      </div>

      <h1 className="text-3xl font-black text-white mb-3">ایمیل خود را تأیید کنید</h1>
      <p className="text-muted leading-relaxed mb-8">
        یک ایمیل تأیید به آدرس شما ارسال شد.<br />
        برای فعال‌سازی حساب، روی لینک داخل ایمیل کلیک کنید.
      </p>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-muted mb-6 text-right">
        <p className="mb-1 font-semibold text-white">ایمیل دریافت نکردید؟</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>پوشه اسپم را بررسی کنید</li>
          <li>آدرس ایمیل وارد شده را دوباره چک کنید</li>
          <li>چند دقیقه صبر کنید و صفحه را رفرش کنید</li>
        </ul>
      </div>

      <Link
        href="/auth/login"
        className="text-gold hover:text-gold-light transition-colors text-sm"
      >
        بازگشت به صفحه ورود
      </Link>
    </motion.div>
  )
}
