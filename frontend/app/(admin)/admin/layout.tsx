import { cookies } from 'next/headers'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminTopbar } from '@/components/admin/admin-topbar'
import type { UserRole } from '@/types'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const role = (cookieStore.get('user_role')?.value ?? 'admin') as UserRole

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
