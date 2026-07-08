import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `تماس با ما — ${SITE_NAME}`,
  description: `راه‌های ارتباط با ${SITE_NAME} — تماس تلفنی، واتساپ و فرم درخواست مشاوره برای خرید درب ضد سرقت و محصولات ساختمانی.`,
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
