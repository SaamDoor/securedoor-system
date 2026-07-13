'use client'

import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { formatJalaliDate, formatPrice, toPersianNumber } from '@/lib/utils'
import { getInvoicesAction } from '../../actions'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const result = await getInvoicesAction()
      if (!result.ok) {
        setError(result.error)
        return
      }
      setInvoices(result.data ?? [])
    })()
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">فاکتورها</h1>
          <p className="mt-1 text-zinc-400">فاکتورهای ثبت‌شده فروش</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

        <div className="overflow-hidden rounded-xl bg-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">شماره</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">مشتری</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">مبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">وضعیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400">تاریخ صدور</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-500">فاکتوری ثبت نشده است</td></tr>
              ) : invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-amber-400">
                    <div className="flex items-center gap-2">
                      <FileText size={14} />
                      <span className="font-mono">{invoice.invoice_number ?? invoice.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-200">{`${invoice.order?.user?.first_name ?? ''} ${invoice.order?.user?.last_name ?? ''}`.trim() || '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-200">{formatPrice(Number(invoice.total_amount ?? invoice.amount ?? 0))}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{invoice.status ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{invoice.issued_at ? formatJalaliDate(invoice.issued_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-zinc-500">{toPersianNumber(invoices.length)} فاکتور</p>
      </div>
    </div>
  )
}
