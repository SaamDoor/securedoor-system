'use client'
import { useEffect, useState } from 'react'
import { Save, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getContactMessagesAction, getSupportTicketsAction, getSettingsAction, saveSettingsAction } from '../../actions'

export default function LiveChatPage() {
  const [enabled, setEnabled] = useState(false)
  const [form, setForm] = useState({
    supportHours: '',
    welcomeMessage: '',
    widgetColor: '#f59e0b',
  })
  const [tickets, setTickets] = useState<Record<string, unknown>[]>([])
  const [messages, setMessages] = useState<Record<string, unknown>[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      const [settingsResult, ticketsResult, messagesResult] = await Promise.all([
        getSettingsAction(),
        getSupportTicketsAction(),
        getContactMessagesAction(),
      ])
      if (!settingsResult.ok) {
        toast.error(settingsResult.error)
        return
      }
      const map = new Map((settingsResult.data ?? []).map((item: Record<string, unknown>) => [String(item.key), item.value]))
      setEnabled(Boolean(map.get('livechat_enabled') ?? true))
      setForm({
        supportHours: String(map.get('working_hours') ?? '۸ تا ۱۷'),
        welcomeMessage: String(map.get('livechat_welcome_message') ?? 'سلام! چطور می‌توانم کمکتان کنم؟'),
        widgetColor: String(map.get('livechat_widget_color') ?? '#f59e0b'),
      })
      if (ticketsResult.ok) setTickets(ticketsResult.data ?? [])
      if (messagesResult.ok) setMessages(messagesResult.data ?? [])
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const result = await saveSettingsAction([
      { key: 'livechat_enabled', value: enabled, group: 'support' },
      { key: 'working_hours', value: form.supportHours, group: 'contact' },
      { key: 'livechat_welcome_message', value: form.welcomeMessage, group: 'support' },
      { key: 'livechat_widget_color', value: form.widgetColor, group: 'support' },
    ])
    setSaving(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('تنظیمات چت زنده ذخیره شد')
  }

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تنظیمات چت زنده</h1>
          <p className="text-zinc-400 mt-1">پیکربندی پشتیبانی آنلاین و چت با مشتریان</p>
          <p className="mt-2 text-xs text-zinc-500">تیکت باز: {tickets.filter((item) => item.status === 'open').length} | پیام جدید: {messages.filter((item) => !item.is_read).length}</p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between py-3 border-b border-zinc-700">
            <div className="flex items-center gap-3">
              <MessageCircle size={20} className="text-amber-400" />
              <div>
                <p className="text-zinc-100 font-medium">فعال‌سازی چت زنده</p>
                <p className="text-xs text-zinc-500 mt-0.5">ویجت چت را در سایت نمایش دهید</p>
              </div>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-amber-500' : 'bg-zinc-600'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'right-1' : 'right-7'}`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">ساعات پشتیبانی</label>
            <input
              type="text"
              value={form.supportHours}
              onChange={e => setForm({ ...form, supportHours: e.target.value })}
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">پیام خوش‌آمدگویی</label>
            <textarea
              value={form.welcomeMessage}
              onChange={e => setForm({ ...form, welcomeMessage: e.target.value })}
              rows={3}
              className="w-full bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 border border-zinc-600 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">رنگ ویجت</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.widgetColor}
                onChange={e => setForm({ ...form, widgetColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-zinc-600 bg-zinc-700 cursor-pointer"
              />
              <span className="text-zinc-400 text-sm font-mono">{form.widgetColor}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
            >
              <Save size={16} />
              {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </button>
          </div>

          <div className="rounded-lg border border-zinc-700 p-3">
            <p className="mb-2 text-sm text-zinc-300">آخرین گفتگوها</p>
            {messages.length === 0 ? (
              <p className="text-xs text-zinc-500">پیامی ثبت نشده است</p>
            ) : (
              <div className="space-y-2">
                {messages.slice(0, 4).map((item) => (
                  <div key={String(item.id)} className="rounded-md bg-zinc-900/60 p-2 text-xs text-zinc-400">
                    <p className="font-medium text-zinc-200">{String(item.name ?? 'کاربر')}</p>
                    <p className="line-clamp-2">{String(item.message ?? '')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
