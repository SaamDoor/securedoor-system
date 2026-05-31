'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { contactSchema, type ContactFormData } from '@/lib/validations/auth'
import { CONTACT, SOCIAL_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const contactInfo = [
  {
    icon: Phone,
    label: 'تلفن تماس',
    value: CONTACT.phone,
    href: `tel:${CONTACT.phone.replace(/[^0-9]/g, '')}`,
  },
  {
    icon: Mail,
    label: 'ایمیل',
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
  },
  {
    icon: MapPin,
    label: 'آدرس',
    value: CONTACT.address,
    href: 'https://maps.google.com',
  },
  {
    icon: Clock,
    label: 'ساعات کاری',
    value: CONTACT.workingHours,
    href: undefined,
  },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit(_data: ContactFormData) {
    await new Promise((r) => setTimeout(r, 1200))
    setSubmitted(true)
    reset()
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <div
        className="relative pt-28 pb-16 text-center overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(200,168,93,0.08) 0%, transparent 60%), linear-gradient(180deg, #0F0F0F 0%, #0B0B0B 100%)',
        }}
      >
        <div className="container">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#C8A85D]" />
            <span className="text-[#C8A85D] text-sm font-semibold tracking-widest">ارتباط با ما</span>
            <div className="h-px w-10 bg-[#C8A85D]" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4">تماس با سام درب</h1>
          <p className="text-[#A0A0A0] max-w-xl mx-auto">
            کارشناسان ما آماده پاسخگویی به سوالات و مشاوره رایگان شما هستند.
          </p>
        </div>
      </div>

      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-black text-white mb-8">اطلاعات تماس</h2>

            <div className="space-y-4 mb-10">
              {contactInfo.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 p-5 rounded-2xl bg-[#181818] border border-white/8">
                  <div className="w-11 h-11 rounded-xl bg-[#C8A85D]/10 border border-[#C8A85D]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-[#C8A85D]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#A0A0A0] mb-0.5">{label}</div>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="font-medium text-white hover:text-[#C8A85D] transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <div className="font-medium text-white">{value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 h-64 flex items-center justify-center border border-white/8">
              <div className="text-center text-[#A0A0A0]">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-[#C8A85D]" />
                <span className="text-sm">نقشه موقعیت</span>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-2xl font-black text-white mb-8">ارسال پیام</h2>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#1F8A4D]/20 border border-[#1F8A4D]/30 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-[#27AE60]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">پیام شما ارسال شد</h3>
                <p className="text-[#A0A0A0] mb-6">
                  کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت.
                </p>
                <Button variant="gold-outline" size="sm" onClick={() => setSubmitted(false)}>
                  ارسال پیام جدید
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="نام"
                    placeholder="نام شما"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="ایمیل"
                    type="email"
                    placeholder="example@email.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <Input
                  label="شماره موبایل (اختیاری)"
                  type="tel"
                  placeholder="09123456789"
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <Input
                  label="موضوع"
                  placeholder="موضوع پیام"
                  error={errors.subject?.message}
                  {...register('subject')}
                />

                <Textarea
                  label="پیام"
                  placeholder="پیام خود را اینجا بنویسید..."
                  error={errors.message?.message}
                  className="min-h-[160px]"
                  {...register('message')}
                />

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  loading={isSubmitting}
                  leftIcon={<Send className="h-5 w-5" />}
                >
                  ارسال پیام
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
