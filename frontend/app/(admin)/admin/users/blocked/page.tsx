'use client'

import { useEffect, useState } from 'react'
import { UserX, ShieldOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatJalaliDate } from '@/lib/utils'

export default function BlockedUsersPage() {
  const [blocked, setBlocked] = useState<Record<string, unknown>[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    void (async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone, is_active, updated_at')
        .eq('is_active', false)
        .order('updated_at', { ascending: false })
      if (error) {
        setError(error.message)
        return
      }
      setBlocked(data ?? [])
      setError(null)
    })()
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">کاربران مسدود</h1>
          <p className="text-zinc-400 mt-1">مدیریت کاربران مسدودشده و رفع انسداد</p>
        </div>
        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        {blocked.length === 0 ? (
          <div className="bg-zinc-800 rounded-xl p-16 text-center">
            <ShieldOff size={48} className="text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">کاربری مسدود نشده است</p>
          </div>
        ) : (
          <div className="bg-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نام</th>
                  <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">ایمیل</th>
                  <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">دلیل بلاک</th>
                  <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                  <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {blocked.map((u) => (
                  <tr key={String(u.id)} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserX size={16} className="text-red-400" />
                        <span className="text-zinc-100 font-medium">
                          {`${String(u.first_name ?? '')} ${String(u.last_name ?? '')}`.trim() || 'کاربر بدون نام'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{String(u.email ?? '—')}</td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">غیرفعال در جدول کاربران</td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{u.updated_at ? formatJalaliDate(String(u.updated_at)) : '—'}</td>
                    <td className="px-6 py-4 text-zinc-500 text-sm">فقط نمایش</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
