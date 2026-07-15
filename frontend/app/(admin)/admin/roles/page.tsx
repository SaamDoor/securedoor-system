'use client'

import { useEffect, useMemo, useState } from 'react'
import { Shield, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'
import { toPersianNumber } from '@/lib/utils'

const roleMeta: Record<UserRole, { label: string; permissions: string[] }> = {
  super_admin: { label: 'سوپر ادمین', permissions: ['مدیریت کامل سیستم', 'تنظیمات پیشرفته', 'مدیریت نقش‌ها'] },
  admin: { label: 'ادمین', permissions: ['مدیریت محصولات', 'مدیریت کاربران', 'مشاهده گزارشات'] },
  manager: { label: 'مدیر', permissions: ['مدیریت سفارشات', 'مدیریت تیکت‌ها', 'مشاهده مالی'] },
  support: { label: 'پشتیبانی', permissions: ['مشاهده تیکت‌ها', 'پاسخ به تیکت‌ها', 'مشاهده کاربران'] },
  customer: { label: 'مشتری', permissions: ['ثبت سفارش', 'مشاهده فاکتور', 'ارسال تیکت'] },
}

export default function RolesPage() {
  const [rows, setRows] = useState<{ name: UserRole; users: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    void (async () => {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('role')

      if (dbError) {
        setError(dbError.message)
        return
      }

      const grouped = new Map<UserRole, number>()
      ;(data ?? []).forEach((item) => {
        const role = String(item.role ?? 'customer') as UserRole
        grouped.set(role, (grouped.get(role) ?? 0) + 1)
      })
      const normalized = (Object.keys(roleMeta) as UserRole[]).map((role) => ({
        name: role,
        users: grouped.get(role) ?? 0,
      }))
      setRows(normalized)
      setError(null)
    })()
  }, [])

  const totalUsers = useMemo(() => rows.reduce((sum, item) => sum + item.users, 0), [rows])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">مدیریت نقش‌ها</h1>
          <p className="text-zinc-400 mt-1">تعریف نقش‌ها و سطوح دسترسی کاربران</p>
          <p className="text-xs text-zinc-500 mt-2">مجموع کاربران: {toPersianNumber(totalUsers)}</p>
        </div>
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام نقش</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تعداد کاربر</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">دسترسی‌ها</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-zinc-500">کاربری برای نمایش وجود ندارد</td>
                </tr>
              ) : rows.map((role) => (
                <tr key={role.name} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-amber-400" />
                      <div>
                        <p className="text-zinc-100 font-medium">{roleMeta[role.name].label}</p>
                        <p className="text-zinc-500 text-xs font-mono">{role.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-zinc-400 text-sm">
                      <Users size={14} /> {toPersianNumber(role.users)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {roleMeta[role.name].permissions.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 bg-zinc-700 text-zinc-300 rounded text-xs">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-xs">نمایش</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
