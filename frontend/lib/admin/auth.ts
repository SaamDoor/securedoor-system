import { createClient } from '@/lib/supabase/server'
import { ADMIN_ROLES, type UserRole } from '@/types'

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

export async function requirePanelAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('لطفاً دوباره وارد شوید')

  const { data: role, error: roleError } = await supabase.rpc('get_my_role')
  if (roleError) throw roleError
  if (!role || !ADMIN_ROLES.includes(role as UserRole)) {
    throw new Error('دسترسی پنل مدیریت ندارید')
  }

  return { supabase, user, role: role as UserRole }
}

export function actionError(message: string): { ok: false; error: string } {
  return { ok: false, error: message }
}

export function actionOk<T>(data: T): { ok: true; data: T } {
  return { ok: true, data }
}
