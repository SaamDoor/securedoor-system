'use client'

import { useEffect, useState, useTransition } from 'react'
import { formatJalaliDate } from '@/lib/utils'
import { getSupportTicketsAction, updateTicketStatusAction } from '../../actions'

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const result = await getSupportTicketsAction()
    if (!result.ok) {
      setError(result.error)
      return
    }
    setTickets(result.data ?? [])
    setError(null)
  }

  useEffect(() => { void load() }, [])

  function updateStatus(ticket: Record<string, any>, status: string) {
    startTransition(async () => {
      const result = await updateTicketStatusAction(ticket.id, status)
      if (!result.ok) {
        setError(result.error)
        return
      }
      await load()
    })
  }

  const openCount = tickets.filter((ticket) => ticket.status === 'open').length

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">تیکت‌های پشتیبانی</h1>
          <p className="mt-1 text-zinc-400">{openCount} تیکت باز</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">موضوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">کاربر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">اولویت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">وضعیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">تیکتی وجود ندارد</td></tr>
              ) : tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-200">{ticket.subject ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{`${ticket.user?.first_name ?? ''} ${ticket.user?.last_name ?? ''}`.trim() || ticket.user?.email || '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{ticket.priority ?? 'normal'}</td>
                  <td className="px-6 py-4">
                    <select value={ticket.status ?? ''} onChange={(e) => updateStatus(ticket, e.target.value)} disabled={isPending} className="rounded-lg border border-zinc-600 bg-zinc-900 px-2 py-1 text-xs text-zinc-200">
                      {['open', 'in_progress', 'closed'].map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{ticket.created_at ? formatJalaliDate(ticket.created_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
