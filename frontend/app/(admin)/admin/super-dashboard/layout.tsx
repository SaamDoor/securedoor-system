import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SuperSidebar } from '@/components/admin/super-sidebar'

export default async function SuperDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/admin/super-dashboard')

  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'super_admin') redirect('/admin/dashboard')

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100" dir="rtl">
      <SuperSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
