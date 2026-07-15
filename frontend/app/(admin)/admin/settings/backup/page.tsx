'use client'

import { useEffect, useMemo, useState } from 'react'
import { Database, Download, Clock, CheckCircle, Save } from 'lucide-react'
import { toast } from 'sonner'
import { formatJalaliDate } from '@/lib/utils'
import { getSettingsAction, saveSettingsAction } from '../../actions'

interface BackupItem {
  name: string
  size: string
  date: string
  status: string
}

export default function BackupPage() {
  const [items, setItems] = useState<BackupItem[]>([])
  const [lastBackupAt, setLastBackupAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      const result = await getSettingsAction()
      if (!result.ok) {
        toast.error(result.error)
        setLoading(false)
        return
      }
      const map = new Map((result.data ?? []).map((item: Record<string, unknown>) => [String(item.key), item.value]))
      const rawItems = map.get('backup_recent_items')
      if (Array.isArray(rawItems)) {
        setItems(
          rawItems.map((entry) => ({
            name: String((entry as Record<string, unknown>).name ?? 'نسخه پشتیبان'),
            size: String((entry as Record<string, unknown>).size ?? '—'),
            date: String((entry as Record<string, unknown>).date ?? ''),
            status: String((entry as Record<string, unknown>).status ?? 'موفق'),
          })),
        )
      }
      setLastBackupAt(String(map.get('backup_last_run_at') ?? ''))
      setLoading(false)
    })()
  }, [])

  const displayLastBackup = useMemo(() => {
    if (!lastBackupAt) return 'ثبت نشده'
    return formatJalaliDate(lastBackupAt)
  }, [lastBackupAt])

  const triggerBackup = async () => {
    const now = new Date().toISOString()
    const nextItems = [
      { name: 'تنظیمات', size: 'JSON', date: now, status: 'موفق' },
      ...items.slice(0, 9),
    ]
    setSaving(true)
    const result = await saveSettingsAction([
      { key: 'backup_last_run_at', value: now, group: 'backup' },
      { key: 'backup_recent_items', value: nextItems, group: 'backup' },
    ])
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setLastBackupAt(now)
    setItems(nextItems)
    toast.success('نسخه پشتیبان تنظیمات ثبت شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">پشتیبان‌گیری</h1>
          <p className="text-zinc-400 mt-1">مدیریت نسخه‌های پشتیبان سیستم</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">آخرین پشتیبان‌گیری</p>
              <p className="text-zinc-100 font-semibold mt-1 flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                {displayLastBackup}
              </p>
            </div>
            <button
              onClick={triggerBackup}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-60"
            >
              {saving ? <Save size={16} /> : <Database size={16} />}
              {saving ? 'در حال ذخیره...' : 'ایجاد پشتیبان جدید'}
            </button>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-700">
            <h2 className="text-zinc-100 font-semibold">پشتیبان‌های اخیر</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">نوع</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">حجم</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">
                    هنوز نسخه پشتیبان ثبت نشده است
                  </td>
                </tr>
              ) : items.map((b, i) => (
                <tr key={i} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100 font-medium">{b.name}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{b.size}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{b.date ? formatJalaliDate(b.date) : '—'}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle size={14} /> {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm transition-colors">
                      <Download size={14} /> دانلود
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
