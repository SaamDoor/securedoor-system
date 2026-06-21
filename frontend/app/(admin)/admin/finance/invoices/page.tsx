import { FileText, Download } from 'lucide-react'

const mockInvoices = [
  { id: 'INV-1042', customer: 'احمد رضایی', amount: '8,500,000 ت', date: '۱۴۰۳/۰۴/۰۲', status: 'پرداخت‌شده' },
  { id: 'INV-1041', customer: 'مریم احمدی', amount: '12,300,000 ت', date: '۱۴۰۳/۰۴/۰۱', status: 'معلق' },
  { id: 'INV-1040', customer: 'علی کریمی', amount: '5,200,000 ت', date: '۱۴۰۳/۰۳/۳۰', status: 'پرداخت‌شده' },
  { id: 'INV-1039', customer: 'فاطمه موسوی', amount: '21,700,000 ت', date: '۱۴۰۳/۰۳/۲۸', status: 'پرداخت‌شده' },
]

const statusStyle: Record<string, string> = {
  'پرداخت‌شده': 'bg-green-900/50 text-green-400',
  'معلق': 'bg-yellow-900/50 text-yellow-400',
}

export default function InvoicesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">فاکتورها</h1>
          <p className="text-zinc-400 mt-1">لیست فاکتورهای صادرشده</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">شماره فاکتور</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">مشتری</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">مبلغ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map(inv => (
                <tr key={inv.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-amber-400" />
                      <span className="text-amber-400 font-mono font-bold">{inv.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-100 font-medium">{inv.customer}</td>
                  <td className="px-6 py-4 text-zinc-100 font-semibold">{inv.amount}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{inv.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[inv.status]}`}>
                      {inv.status}
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
