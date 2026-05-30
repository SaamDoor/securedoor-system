import { UserSidebar } from '@/components/user/user-sidebar'
import { Navbar } from '@/components/layout/navbar'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black">
        <div className="container py-8">
          <div className="flex gap-6">
            <UserSidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </>
  )
}
