import type { Metadata } from 'next'
import Link from 'next/link'
import { generateSeo, faqSchema, jsonLdScript } from '@/lib/seo'
import { CONTACT, SITE_NAME } from '@/lib/constants'

const FAQS = [
  {
    question: 'چگونه می‌توانم سفارش بدهم؟',
    answer:
      'محصول را به سبد اضافه کنید یا با شماره تماس کارخانه مشعوف سفارش تلفنی ثبت کنید.',
  },
  {
    question: 'آیا نصب درب ضد سرقت در مازندران انجام می‌شود؟',
    answer:
      'بله؛ تیم نصب گروه صنعتی مشعوف در مازندران و شمال کشور خدمات نصب ارائه می‌دهد.',
  },
  {
    question: 'ضمانت محصولات چند سال است؟',
    answer: 'محصولات مشعوف دارای ضمانت رسمی هستند؛ جزئیات در صفحه ضمانت‌نامه آمده است.',
  },
  {
    question: 'آیا فروش عمده درب ضد سرقت دارید؟',
    answer:
      'بله؛ برای انبوه‌سازان و فروشگاه‌ها قیمت همکاری عمده از طریق واحد فروش اعلام می‌شود.',
  },
  {
    question: 'تفاوت چهارچوب فرانسوی و مکزیکی چیست؟',
    answer:
      'در پروفیل و جزئیات نصب تفاوت دارند. صفحات اختصاصی هر مدل را ببینید یا با کارشناس مشورت کنید.',
  },
  {
    question: 'درب ملامینه بهتر است یا ABS؟',
    answer:
      'ABS معمولاً مقاومت رطوبتی بهتری دارد؛ ملامینه اقتصادی‌تر و متنوع‌تر است.',
  },
]

export const metadata: Metadata = generateSeo({
  title: 'سوالات متداول',
  description: `پاسخ سوالات رایج درباره خرید درب ضد سرقت، چهارچوب فلزی، درب اتاقی و خدمات ${SITE_NAME}.`,
  keywords: ['سوالات متداول درب ضد سرقت', 'FAQ مشعوف'],
  path: '/faq',
})

export default function FaqPage() {
  return (
    <div className="bg-black min-h-screen" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(FAQS))}
      />
      <div className="container px-4 sm:px-6 py-12 max-w-3xl">
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-3">سوالات متداول</h1>
        <p className="text-zinc-400 text-sm mb-10">
          پاسخ‌های کوتاه درباره محصولات و خدمات {SITE_NAME}. برای مشاوره:{' '}
          <a href={`tel:${CONTACT.phone}`} className="text-gold hover:underline">
            {CONTACT.phoneFa}
          </a>
        </p>
        <div className="space-y-6">
          {FAQS.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-white/8 bg-zinc-950 p-5">
              <h2 className="font-bold text-white text-sm sm:text-base mb-2">{faq.question}</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3 text-sm">
          <Link href="/collections" className="text-gold hover:underline">راهنمای محصولات</Link>
          <Link href="/contact" className="text-gold hover:underline">تماس با ما</Link>
          <Link href="/warranty" className="text-gold hover:underline">ضمانت‌نامه</Link>
        </div>
      </div>
    </div>
  )
}
