import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { FloatingContactButton } from '@/components/ui/floating-contact-button'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-20 overflow-x-hidden">{children}</main>
      <Footer />
      <FloatingContactButton />
    </>
  )
}
