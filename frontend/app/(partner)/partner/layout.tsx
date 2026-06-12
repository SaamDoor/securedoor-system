import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/partner/dashboard')

  const { data: role } = await supabase.rpc('get_my_role')
  if (!['manager', 'admin', 'super_admin'].includes(role ?? '')) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" dir="rtl">
      {children}
    </div>
  )
}
