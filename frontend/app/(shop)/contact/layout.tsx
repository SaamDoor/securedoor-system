import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'
import { generateSeo } from '@/lib/seo'

export const metadata: Metadata = generateSeo({
  title: 'تماس با ما — خرید درب ضد سرقت مازندران',
  description: `تماس با کارخانه ${SITE_NAME} در قائم‌شهر برای خرید درب ضد سرقت، چهارچوب فلزی، درب اتاقی و فروش عمده.`,
  keywords: ['تماس مشعوف', 'خرید درب ضد سرقت مازندران', 'کارخانه درب قائم شهر'],
  path: '/contact',
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
