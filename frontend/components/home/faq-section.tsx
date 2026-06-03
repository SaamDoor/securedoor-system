'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'چگونه می‌توانم سفارش بدهم؟',
    answer:
      'برای ثبت سفارش، محصول مورد نظر را به سبد خرید اضافه کرده و مراحل تسویه حساب را طی کنید. پس از تأیید پرداخت، تیم ما در اسرع وقت با شما تماس می‌گیرد. همچنین می‌توانید از طریق تلفن یا واتساپ سفارش بدهید.',
  },
  {
    question: 'آیا نصب درب توسط تیم گروه مشعوف انجام می‌شود؟',
    answer:
      'بله، تیم متخصص گروه صنعتی مشعوف در استان مازندران و سایر استان‌های کشور خدمات نصب ارائه می‌دهد. هزینه نصب بسته به منطقه جغرافیایی و نوع درب متفاوت است. نصب توسط کارشناسان دارای مجوز و بیمه انجام می‌شود.',
  },
  {
    question: 'ضمانت محصولات گروه مشعوف چند سال است؟',
    answer:
      'تمام محصولات گروه صنعتی مشعوف دارای ضمانت‌نامه رسمی ۱۰ ساله هستند. این ضمانت شامل عیوب ساخت، قفل، یراق‌آلات و سیستم‌های امنیتی می‌شود. خدمات پس از فروش در سراسر کشور از طریق شبکه نمایندگی‌ها ارائه می‌شود.',
  },
  {
    question: 'آیا امکان بازگشت کالا وجود دارد؟',
    answer:
      'بله، در صورت عدم رضایت از محصول، تا ۷ روز پس از تحویل امکان مرجوعی وجود دارد. کالا باید در شرایط اولیه و بدون نصب باشد. هزینه حمل برگشت بر عهده خریدار است مگر در موارد عیب کارخانه‌ای.',
  },
  {
    question: 'درب‌های گروه مشعوف از چه متریالی ساخته شده‌اند؟',
    answer:
      'درب‌های گروه صنعتی مشعوف از فولاد گالوانیزه گرم درجه یک با ضخامت ۱ تا ۳ میلی‌متر ساخته می‌شوند. پوشش خارجی از ورق‌های رنگ‌پودری الکترواستاتیک با مقاومت بالا در برابر خوردگی و تغییرات آب‌وهوایی استفاده می‌شود.',
  },
  {
    question: 'روش‌های پرداخت چیست؟',
    answer:
      'می‌توانید از طریق درگاه آنلاین (زرین‌پال)، کارت به کارت یا انتقال بانکی پرداخت کنید. همچنین امکان پرداخت اقساطی با شرایط ویژه از طریق بانک‌های طرف قرارداد نیز وجود دارد.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="section-padding bg-black relative overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left: Header */}
          <div className="lg:sticky lg:top-32">
            <SectionHeader
              eyebrow="سوالات متداول"
              title="پاسخ سوالات شما"
              description="اگر سوال شما در این لیست نیست، از طریق چت آنلاین یا تلفن با ما در تماس باشید."
              animate={false}
            />

            <div className="mt-8 space-y-4">
              <div className="p-5 rounded-xl bg-surface border border-white/8 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold text-xl">💬</span>
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">چت آنلاین</div>
                  <div className="text-xs text-muted">پاسخ فوری در ساعات اداری</div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface border border-white/8 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold text-xl">📞</span>
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">تلفن پشتیبانی</div>
                  <div className="text-xs text-gold font-medium">۰۲۱-۸۸۰۰۰۰۰۰</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button asChild variant="gold-outline" size="md">
                <a href="/faq">مشاهده همه سوالات</a>
              </Button>
            </div>
          </div>

          {/* Right: FAQ accordion */}
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={cn(
                  'rounded-xl border overflow-hidden transition-all duration-300',
                  openIndex === i
                    ? 'border-gold/30 bg-gold/5'
                    : 'border-white/8 bg-surface hover:border-white/15',
                )}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-right"
                  aria-expanded={openIndex === i}
                >
                  <span
                    className={cn(
                      'font-semibold text-base transition-colors',
                      openIndex === i ? 'text-gold' : 'text-white',
                    )}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 flex-shrink-0 mr-3 transition-transform duration-300 text-muted',
                      openIndex === i && 'rotate-180 text-gold',
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <div className="px-5 pb-5 text-muted text-sm leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
