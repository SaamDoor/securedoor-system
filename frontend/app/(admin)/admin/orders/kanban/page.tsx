const columns = [
  {
    id: 'pending', title: 'در انتظار', color: 'border-yellow-500',
    cards: [
      { id: 'ORD-101', customer: 'احمد رضایی', product: 'درب ضد سرقت استاندارد', amount: '8,500,000 ت' },
      { id: 'ORD-102', customer: 'مریم احمدی', product: 'چهارچوب فلزی Z-پروفیل', amount: '3,200,000 ت' },
    ],
  },
  {
    id: 'confirmed', title: 'تأیید شده', color: 'border-blue-500',
    cards: [
      { id: 'ORD-099', customer: 'علی کریمی', product: 'درب دوبل ضد سرقت', amount: '14,200,000 ت' },
    ],
  },
  {
    id: 'processing', title: 'در حال پردازش', color: 'border-purple-500',
    cards: [
      { id: 'ORD-097', customer: 'فاطمه موسوی', product: 'درب اتوماتیک پارکینگ', amount: '22,000,000 ت' },
      { id: 'ORD-096', customer: 'حسن تهرانی', product: 'درب چوبی MDF', amount: '5,800,000 ت' },
    ],
  },
  {
    id: 'delivered', title: 'تحویل داده شده', color: 'border-green-500',
    cards: [
      { id: 'ORD-094', customer: 'رضا کریمی', product: 'درب ضد سرقت استاندارد', amount: '8,500,000 ت' },
    ],
  },
]

export default function KanbanPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">کانبان سفارشات</h1>
        <p className="text-zinc-400 mt-1">مدیریت بصری وضعیت سفارشات</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col.id} className="flex-shrink-0 w-72">
            <div className={`bg-zinc-800 rounded-xl overflow-hidden border-t-4 ${col.color}`}>
              <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-700">
                <h2 className="text-zinc-100 font-semibold">{col.title}</h2>
                <span className="bg-zinc-700 text-zinc-400 text-xs rounded-full px-2 py-0.5">{col.cards.length}</span>
              </div>
              <div className="p-3 space-y-3">
                {col.cards.map(card => (
                  <div key={card.id} className="bg-zinc-700/50 rounded-lg p-3 hover:bg-zinc-700 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-amber-400 font-mono text-xs">{card.id}</span>
                    </div>
                    <p className="text-zinc-100 text-sm font-medium">{card.customer}</p>
                    <p className="text-zinc-400 text-xs mt-1">{card.product}</p>
                    <p className="text-zinc-200 text-sm font-semibold mt-2">{card.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
