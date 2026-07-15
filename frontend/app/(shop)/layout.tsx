import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { FloatingContactButton } from '@/components/ui/floating-contact-button'
import { fetchShopCategories } from '@/lib/shop/catalog.server'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const productCategories = await fetchShopCategories().catch(() => [])

  return (
    <>
      <Navbar productCategories={productCategories} />
      <main className="pt-20 overflow-x-hidden">{children}</main>
      <Footer productCategories={productCategories} />
      <FloatingContactButton />
    </>
  )
}
