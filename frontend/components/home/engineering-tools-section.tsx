'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Calculator, Ruler } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { Button } from '@/components/ui/button'

export function EngineeringToolsSection() {
  return (
    <section className="section-padding relative overflow-hidden bg-black">
      <div className="pointer-events-none absolute left-0 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />
      <div className="container relative">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow="ابزارهای مهندسی"
              title="محاسبه آنلاین مصالح ساختمان"
              description="قبل از خرید مصالح، مقدار دقیق موردنیاز پروژه خود را در کمتر از چند دقیقه محاسبه کنید."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href="/tools/materials-calculator">
                  <Calculator className="ml-2 h-5 w-5" />
                  شروع محاسبه
                </Link>
              </Button>
              <Button asChild variant="gold-outline" size="lg">
                <Link href="/tools/materials-calculator">
                  جزئیات ابزار
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15 text-primary">
              <Ruler className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-black text-white">چرا این ابزار؟</h3>
            <ul className="space-y-3 text-sm leading-7 text-zinc-400">
              <li>برآورد سریع برای مالک و سازنده</li>
              <li>حالت حرفه‌ای برای مهندس و پیمانکار</li>
              <li>بدون ذخیره اطلاعات پروژه</li>
              <li>پیشنهاد هوشمند محصولات مشعوف</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
